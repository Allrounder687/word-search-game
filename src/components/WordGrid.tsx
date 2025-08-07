import { useState, useCallback, useEffect, useRef } from 'react';
import type { Position, Cell, WordPlacement, ThemeColors } from '../types/game';
import { checkWordSelection } from '../utils/gameLogic';

interface WordGridProps {
  grid: Cell[][];
  words: WordPlacement[];
  onWordFound: (word: WordPlacement) => void;
  theme: ThemeColors;
  showDescriptions?: boolean;
  kidsMode?: boolean;
  isZoomed?: boolean;
  selectionMode?: 'drag' | 'click-start-end';
  onSelectionModeChange?: (mode: 'drag' | 'click-start-end') => void;
}

export const WordGrid: React.FC<WordGridProps> = ({ 
  grid, 
  words, 
  onWordFound, 
  theme, 
  showDescriptions = true, 
  kidsMode = false, 
  isZoomed = false,
  selectionMode: propSelectionMode
}) => {
  // Detect if we're on a mobile device (moved to top)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const [isSelecting, setIsSelecting] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<Position[]>([]);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState<'drag' | 'click-start-end'>(
    propSelectionMode || (isMobile ? 'click-start-end' : 'drag')
  );
  const [startCell, setStartCell] = useState<Position | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Update selection mode when prop changes
  useEffect(() => {
    if (propSelectionMode) {
      setSelectionMode(propSelectionMode);
    }
  }, [propSelectionMode]);

  const getCellKey = (row: number, col: number) => `${row},${col}`;

  const handleMouseDown = useCallback((row: number, col: number) => {
    setIsSelecting(true);
    setCurrentSelection([{ row, col }]);
    setHighlightedCells(new Set([getCellKey(row, col)]));
    
    // Add tap feedback
    const cell = document.querySelector(`[data-cell="${getCellKey(row, col)}"]`);
    if (cell) {
      cell.classList.add('cell-tap-feedback');
      setTimeout(() => cell.classList.remove('cell-tap-feedback'), 300);
    }
    
    // Provide haptic feedback on mobile
    if (isMobile) {
      provideHapticFeedback(10);
    }
  }, [isMobile]);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (!isSelecting || currentSelection.length === 0) return;

    const start = currentSelection[0];
    const newSelection = getSelectionPath(start, { row, col });
    setCurrentSelection(newSelection);
    setHighlightedCells(new Set(newSelection.map(pos => getCellKey(pos.row, pos.col))));
    
    // Update selection arrow
    setSelectionArrow({
      start: start,
      end: { row, col }
    });
    
    // Add tap feedback for the current cell
    const cell = document.querySelector(`[data-cell="${getCellKey(row, col)}"]`);
    if (cell) {
      cell.classList.add('cell-tap-feedback');
      setTimeout(() => cell.classList.remove('cell-tap-feedback'), 200);
    }
    
    // Provide subtle haptic feedback on mobile
    if (isMobile) {
      provideHapticFeedback(5);
    }
  }, [isSelecting, currentSelection, isMobile]);

  const handleMouseUp = useCallback(() => {
    if (currentSelection.length > 1) {
      const foundWord = checkWordSelection(currentSelection, words);
      if (foundWord) {
        // Only add descriptions if the feature is enabled
        if (showDescriptions) {
          // Check if we should use kids mode description
          if (kidsMode && shouldUseKidsDescription(foundWord.word, kidsMode)) {
            // Use simplified description for kids
            foundWord.description = getKidsDescription(foundWord.word);
            foundWord.descriptionType = 'kidsMode';
          }
          // Otherwise use standard descriptions
          else if (FIVE_PILLARS_DESCRIPTIONS[foundWord.word]) {
            // Add the description to the word
            foundWord.description = FIVE_PILLARS_DESCRIPTIONS[foundWord.word];
            foundWord.descriptionType = 'fivePillars';
          }
          // Check if this word has a description in the Islamic Places list
          else if (ISLAMIC_PLACES_DESCRIPTIONS[foundWord.word]) {
            // Add the description to the word
            const placeInfo = ISLAMIC_PLACES_DESCRIPTIONS[foundWord.word];
            foundWord.description = placeInfo.description;
            foundWord.urduDescription = placeInfo.urduDescription;
            foundWord.descriptionType = 'islamicPlaces';
          }
        }

        onWordFound(foundWord);
        
        // Only show celebration in WordGrid if descriptions are disabled
        // This prevents duplicate popups when WordList also shows descriptions
        if (!showDescriptions) {
          setLastFoundWord(foundWord);
          setShowCelebration(true);
          
          // Hide celebration after a delay
          setTimeout(() => {
            setShowCelebration(false);
            setLastFoundWord(null);
          }, 2000);
        }

        // Show path animation
        const wordCells = getSelectionPath(foundWord.start, foundWord.end);
        setPathAnimationCells(wordCells);
        setPathAnimationColor(foundWord.color);
        setShowPathAnimation(true);
        
        // Provide strong haptic feedback for word found
        if (isMobile) {
          provideHapticFeedback(30);
        }

        // Add celebration effect
        wordCells.forEach((pos, index) => {
          const cell = document.querySelector(`[data-cell="${getCellKey(pos.row, pos.col)}"]`);
          if (cell) {
            // Staggered animation for each cell in the path
            setTimeout(() => {
              cell.classList.add('animate-word-found');
              setTimeout(() => cell.classList.remove('animate-word-found'), 600);
            }, index * 50); // Stagger by 50ms per cell
          }
        });

        // Hide path animation after a delay
        setTimeout(() => {
          setShowPathAnimation(false);
        }, 1500);
      } else {
        // Provide error feedback for incorrect selection
        if (isMobile) {
          provideHapticFeedback(10);
        }
        
        // Visual feedback for incorrect selection
        currentSelection.forEach(pos => {
          const cell = document.querySelector(`[data-cell="${getCellKey(pos.row, pos.col)}"]`);
          if (cell) {
            cell.classList.add('cell-error-feedback');
            setTimeout(() => cell.classList.remove('cell-error-feedback'), 300);
          }
        });
      }
    }

    setIsSelecting(false);
    setCurrentSelection([]);
    setHighlightedCells(new Set());
    setSelectionArrow(null);
  }, [currentSelection, words, onWordFound, kidsMode, showDescriptions, isMobile]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        handleMouseUp();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isSelecting, handleMouseUp]);

  // Enhanced touch support with iPad landscape fixes
  const handleTouchStart = useCallback((row: number, col: number, e: React.TouchEvent) => {
    // Prevent default only for iPad landscape to prevent screen movement
    const isIPad = /iPad/i.test(navigator.userAgent) || 
                  (/Macintosh/i.test(navigator.userAgent) && 'ontouchend' in document);
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isIPad && isLandscape) {
      e.preventDefault();
      e.stopPropagation();
      
      // Add selecting class to prevent screen movement
      if (gridContainerRef.current) {
        gridContainerRef.current.classList.add('selecting');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
      }
    }
    
    // Set state for selection
    setIsSelecting(true);
    setCurrentSelection([{ row, col }]);
    setHighlightedCells(new Set([getCellKey(row, col)]));

    // Add haptic feedback if available - use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      if (navigator.vibrate) {
        navigator.vibrate(10); // Short vibration
      }
    });
    
    // Add visual feedback - use requestAnimationFrame for smoother animation
    requestAnimationFrame(() => {
      const cell = document.querySelector(`[data-cell="${getCellKey(row, col)}"]`);
      if (cell) {
        cell.classList.add('cell-tap-feedback');
        setTimeout(() => {
          if (cell) {
            cell.classList.remove('cell-tap-feedback');
          }
        }, 300);
      }
    });
  }, []);


  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Enhanced touch end handling for iPad landscape
    const isIPad = /iPad/i.test(navigator.userAgent) || 
                  (/Macintosh/i.test(navigator.userAgent) && 'ontouchend' in document);
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isIPad && isLandscape) {
      e.preventDefault();
      e.stopPropagation();
      
      // Remove selecting class and restore body styles
      if (gridContainerRef.current) {
        gridContainerRef.current.classList.remove('selecting');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
      }
    }
    
    // Process the selection
    handleMouseUp();
  }, [handleMouseUp]);

  const getSelectionPath = (start: Position, end: Position): Position[] => {
    const path: Position[] = [];
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;

    // Determine if it's a valid direction (horizontal, vertical, or diagonal)
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    if (absRowDiff === 0 || absColDiff === 0 || absRowDiff === absColDiff) {
      const steps = Math.max(absRowDiff, absColDiff);
      const rowStep = steps === 0 ? 0 : rowDiff / steps;
      const colStep = steps === 0 ? 0 : colDiff / steps;

      for (let i = 0; i <= steps; i++) {
        path.push({
          row: start.row + Math.round(rowStep * i),
          col: start.col + Math.round(colStep * i)
        });
      }
    } else {
      path.push(start);
    }

    return path;
  };

  const getCellStyle = (row: number, col: number) => {
    const cellKey = getCellKey(row, col);
    const isHighlighted = highlightedCells.has(cellKey);

    // Find if this cell is part of a found word
    const foundWord = words.find(w => w.found &&
      getSelectionPath(w.start, w.end).some(pos => pos.row === row && pos.col === col)
    );

    // Check if this cell is part of the path animation
    const isPathAnimationCell = showPathAnimation && 
      pathAnimationCells.some(pos => pos.row === row && pos.col === col);

    let backgroundColor = theme.cellBg;
    let color = theme.primary;
    let borderColor = 'rgba(255, 255, 255, 0.2)';
    let boxShadow = 'none';
    let transform = isHighlighted ? 'scale(1.05)' : 'scale(1)';

    if (foundWord) {
      backgroundColor = foundWord.color + '40'; // Add transparency
      borderColor = foundWord.color;
      color = '#ffffff';

      // If this is part of the last found word, add extra effects
      if (lastFoundWord && lastFoundWord.word === foundWord.word) {
        boxShadow = `0 0 15px ${foundWord.color}80`;
        transform = 'scale(1.05)';
      }
    } else if (isHighlighted) {
      backgroundColor = theme.accent + '60';
      borderColor = theme.accent;
      boxShadow = `0 0 10px ${theme.accent}60`;
    }
    
    // Apply path animation styles
    if (isPathAnimationCell) {
      boxShadow = `0 0 15px ${pathAnimationColor}`;
      borderColor = pathAnimationColor;
      transform = 'scale(1.1)';
    }

    return {
      backgroundColor,
      color,
      borderColor,
      boxShadow,
      transition: 'all 0.2s ease',
      transform,
      fontFamily: theme.font || "'Inter', sans-serif",
    };
  };

  // Dynamic cell sizing based on grid size and screen width
  const getCellSize = () => {
    const gridSize = grid.length;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Calculate available space for the grid
    // For desktop, we want to use the available space more intelligently
    let baseSize;
    
    // Check if device is iPad using the user agent
    const isIPad = /iPad/i.test(navigator.userAgent) || 
                  (/Macintosh/i.test(navigator.userAgent) && 'ontouchend' in document);
    
    // Check orientation
    const isLandscape = screenWidth > screenHeight;
    
    if (screenWidth >= 1024) {
      // Desktop - calculate based on available space
      const availableWidth = Math.min(screenWidth * 0.5, 800); // Limit max width
      const availableHeight = screenHeight * 0.7; // Use 70% of screen height
      
      // Calculate the maximum possible cell size based on available space
      const maxWidthBasedSize = Math.floor(availableWidth / gridSize) - 4; // Subtract for gap
      const maxHeightBasedSize = Math.floor(availableHeight / gridSize) - 4; // Subtract for gap
      
      // Use the smaller of the two to ensure grid fits both dimensions
      baseSize = Math.min(maxWidthBasedSize, maxHeightBasedSize);
      
      // Set reasonable limits
      baseSize = Math.min(Math.max(baseSize, 30), 60);
    } else if (isIPad || (screenWidth >= 768 && screenWidth < 1024)) {
      // iPad-specific sizing
      // Use a higher percentage of available space (95% instead of 80%)
      const availableWidth = isLandscape ? screenWidth * 0.6 : screenWidth * 0.95;
      const availableHeight = isLandscape ? screenHeight * 0.9 : screenHeight * 0.6;
      
      // Calculate the maximum possible cell size based on available space
      const maxWidthBasedSize = Math.floor(availableWidth / gridSize) - 4;
      const maxHeightBasedSize = Math.floor(availableHeight / gridSize) - 4;
      
      // Use the smaller of the two to ensure grid fits both dimensions
      baseSize = Math.min(maxWidthBasedSize, maxHeightBasedSize);
      
      // Ensure the size is reasonable for touch
      baseSize = Math.min(Math.max(baseSize, 28), 50);
      
      // iPad Pro might need different sizing
      if (screenWidth >= 1000 || screenHeight >= 1000) {
        // Likely an iPad Pro
        baseSize = Math.min(Math.max(baseSize, 32), 55);
      }
    } else if (screenWidth >= 480) {
      // Large mobile
      baseSize = Math.min(36, Math.floor((screenWidth * 0.9) / gridSize) - 4);
    } else if (screenWidth >= 360) {
      // Medium mobile
      baseSize = Math.min(30, Math.floor((screenWidth * 0.95) / gridSize) - 2);
    } else {
      // Small mobile
      baseSize = Math.min(26, Math.floor((screenWidth * 0.98) / gridSize) - 2);
    }
    
    // Scale down for larger grids
    if (gridSize > 10) {
      // Calculate scaling factor based on grid size
      // 10x10 grid = 100%, 15x15 grid = 67%, 20x20 grid = 50%
      const scaleFactor = Math.min(1, 10 / gridSize);
      baseSize = Math.max(18, Math.floor(baseSize * scaleFactor));
    }
    
    // Apply zoom factor if isZoomed is true
    if (isZoomed) {
      baseSize = Math.floor(baseSize * 1.2); // 20% larger when zoomed
    }
    
    // Ensure minimum size for touch targets on mobile
    if (isMobile && baseSize < 22) {
      baseSize = 22; // Minimum size for touch targets
    }
    
    return `${baseSize}px`;
  };

  // Dynamic font size based on cell size
  const getCellFontSize = () => {
    const gridSize = grid.length;
    const screenWidth = window.innerWidth;

    // Base font size calculations
    let baseFontSize;
    if (screenWidth >= 768) {
      baseFontSize = 16;
    } else if (screenWidth >= 480) {
      baseFontSize = 14;
    } else {
      baseFontSize = 12;
    }

    // Scale down for larger grids
    if (gridSize > 10) {
      const scaleFactor = Math.min(1, 10 / gridSize);
      baseFontSize = Math.max(10, Math.floor(baseFontSize * scaleFactor));
    }

    return `${baseFontSize}px`;
  };



  // State for pinch-to-zoom
  const [zoomScale, setZoomScale] = useState(1);
  const initialTouchDistance = useRef<number | null>(null);
  const currentZoomScale = useRef(1);

  // Apply touch optimizations when component mounts
  useEffect(() => {
    if (isMobile && gridContainerRef.current) {
      // Set basic touch properties directly
      const gridElement = gridContainerRef.current;

      // Prevent context menu on long press
      const preventContextMenu = (e: Event) => {
        e.preventDefault();
        return false;
      };

      gridElement.addEventListener('contextmenu', preventContextMenu);

      // Add meta viewport tag to prevent zooming on double tap
      const viewportMeta = document.querySelector('meta[name=viewport]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
      
      // iOS-specific fix to prevent screen movement during word selection
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        // Add a specific class for iOS devices
        gridElement.classList.add('ios-touch-fix');
        
        // Add a style element with iOS-specific CSS
        const styleElement = document.createElement('style');
        styleElement.textContent = `
          .ios-touch-fix {
            -webkit-overflow-scrolling: touch;
            touch-action: manipulation;
            position: relative;
          }
          .ios-touch-fix * {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }
        `;
        document.head.appendChild(styleElement);
        
        // Add pinch-to-zoom handlers for iOS
        const handleTouchStartZoom = (e: TouchEvent) => {
          if (e.touches.length === 2) {
            // Only handle pinch gestures (2 fingers)
            e.preventDefault();
            const dist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            initialTouchDistance.current = dist;
          }
        };
        
        const handleTouchMoveZoom = (e: TouchEvent) => {
          if (e.touches.length === 2 && initialTouchDistance.current !== null) {
            e.preventDefault();
            const dist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            
            const scale = Math.max(0.8, Math.min(2.0, currentZoomScale.current * (dist / initialTouchDistance.current)));
            setZoomScale(scale);
          }
        };
        
        const handleTouchEndZoom = () => {
          if (initialTouchDistance.current !== null) {
            currentZoomScale.current = zoomScale;
            initialTouchDistance.current = null;
          }
        };
        
        gridElement.addEventListener('touchstart', handleTouchStartZoom, { passive: false });
        gridElement.addEventListener('touchmove', handleTouchMoveZoom, { passive: false });
        gridElement.addEventListener('touchend', handleTouchEndZoom);
        
        // Return cleanup function for iOS-specific fixes
        return () => {
          gridElement.classList.remove('ios-touch-fix');
          if (styleElement.parentNode) {
            styleElement.parentNode.removeChild(styleElement);
          }
          
          // Clean up event listeners
          gridElement.removeEventListener('contextmenu', preventContextMenu);
          gridElement.removeEventListener('touchstart', handleTouchStartZoom);
          gridElement.removeEventListener('touchmove', handleTouchMoveZoom);
          gridElement.removeEventListener('touchend', handleTouchEndZoom);
          
          // Restore viewport meta when component unmounts
          if (viewportMeta) {
            viewportMeta.setAttribute('content',
              'width=device-width, initial-scale=1.0');
          }
          
          // Remove mini-map
          const miniMap = document.getElementById('grid-mini-map');
          if (miniMap) {
            miniMap.remove();
          }
        };
      }
      
      // Create mini-map for large grids
      if (grid.length > 12 && gridContainerRef.current.parentElement) {
        createGridMiniMap(
          gridContainerRef.current, 
          gridContainerRef.current.parentElement, 
          theme
        );
      }

      return () => {
        // Clean up event listeners
        gridElement.removeEventListener('contextmenu', preventContextMenu);

        // Restore viewport meta when component unmounts
        if (viewportMeta) {
          viewportMeta.setAttribute('content',
            'width=device-width, initial-scale=1.0');
        }
        
        // Remove mini-map
        const miniMap = document.getElementById('grid-mini-map');
        if (miniMap) {
          miniMap.remove();
        }
      };
    }
  }, [isMobile, grid.length, theme, zoomScale]);

  // Handle click-start-end selection mode
  const handleCellClick = useCallback((row: number, col: number) => {
    if (selectionMode === 'click-start-end') {
      if (!startCell) {
        // First click - set start cell
        setStartCell({ row, col });
        setCurrentSelection([{ row, col }]);
        setHighlightedCells(new Set([getCellKey(row, col)]));
        
        // Add visual feedback
        const cell = document.querySelector(`[data-cell="${getCellKey(row, col)}"]`);
        if (cell) {
          cell.classList.add('cell-tap-feedback');
          setTimeout(() => cell.classList.remove('cell-tap-feedback'), 300);
        }
      } else {
        // Second click - set end cell and check for word
        const newSelection = getSelectionPath(startCell, { row, col });
        setCurrentSelection(newSelection);
        
        const foundWord = checkWordSelection(newSelection, words);
        if (foundWord) {
          // Process found word
          if (showDescriptions) {
            if (kidsMode && shouldUseKidsDescription(foundWord.word, kidsMode)) {
              foundWord.description = getKidsDescription(foundWord.word);
              foundWord.descriptionType = 'kidsMode';
            } else if (FIVE_PILLARS_DESCRIPTIONS[foundWord.word]) {
              foundWord.description = FIVE_PILLARS_DESCRIPTIONS[foundWord.word];
              foundWord.descriptionType = 'fivePillars';
            } else if (ISLAMIC_PLACES_DESCRIPTIONS[foundWord.word]) {
              const placeInfo = ISLAMIC_PLACES_DESCRIPTIONS[foundWord.word];
              foundWord.description = placeInfo.description;
              foundWord.urduDescription = placeInfo.urduDescription;
              foundWord.descriptionType = 'islamicPlaces';
            }
          }

          onWordFound(foundWord);
          setLastFoundWord(foundWord);
          setShowCelebration(true);
          
          // Show path animation
          const wordCells = getSelectionPath(foundWord.start, foundWord.end);
          setPathAnimationCells(wordCells);
          setPathAnimationColor(foundWord.color);
          setShowPathAnimation(true);
          
          // Provide haptic feedback
          if (isMobile) {
            provideHapticFeedback(30);
          }

          // Add celebration effect with staggered animation
          wordCells.forEach((pos, index) => {
            const cell = document.querySelector(`[data-cell="${getCellKey(pos.row, pos.col)}"]`);
            if (cell) {
              setTimeout(() => {
                cell.classList.add('animate-word-found');
                setTimeout(() => cell.classList.remove('animate-word-found'), 600);
              }, index * 50);
            }
          });
          
          // Hide path animation after a delay
          setTimeout(() => {
            setShowPathAnimation(false);
          }, 1500);

          // Hide celebration after a delay
          setTimeout(() => {
            setShowCelebration(false);
            setLastFoundWord(null);
          }, foundWord.description ? 5000 : 2000);
        } else {
          // Provide error feedback
          if (isMobile) {
            provideHapticFeedback(10);
          }
          
          // Visual feedback for incorrect selection
          newSelection.forEach(pos => {
            const cell = document.querySelector(`[data-cell="${getCellKey(pos.row, pos.col)}"]`);
            if (cell) {
              cell.classList.add('cell-error-feedback');
              setTimeout(() => cell.classList.remove('cell-error-feedback'), 300);
            }
          });
        }
        
        // Reset for next selection
        setStartCell(null);
        setCurrentSelection([]);
        setHighlightedCells(new Set());
      }
    }
  }, [selectionMode, startCell, words, onWordFound, showDescriptions, kidsMode, isMobile]);

  // Show floating word preview above finger
  const showFloatingWordPreview = useCallback((x: number, y: number, selection: Position[]) => {
    // Remove any existing preview with proper checks
    const existingPreview = document.getElementById('floating-word-preview');
    if (existingPreview && existingPreview.parentNode) {
      existingPreview.parentNode.removeChild(existingPreview);
    }

    // Create word from selection
    const word = selection.map(pos => {
      // Add safety check for grid boundaries
      if (pos.row >= 0 && pos.row < grid.length && 
          pos.col >= 0 && pos.col < grid[pos.row].length) {
        return grid[pos.row][pos.col].letter;
      }
      return '';
    }).join('');
    
    // Create floating preview element
    const preview = document.createElement('div');
    preview.id = 'floating-word-preview';
    preview.textContent = word;
    
    // Apply styles using Object.assign for better performance
    Object.assign(preview.style, {
      position: 'fixed',
      left: `${x - 20}px`,
      top: `${y - 40}px`, // Position higher above finger for better visibility
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: 'bold',
      zIndex: '1000',
      pointerEvents: 'none',
      transform: 'translateX(-50%)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      transition: 'opacity 0.2s ease',
      opacity: '0'
    });
    
    document.body.appendChild(preview);
    
    // Fade in the preview
    requestAnimationFrame(() => {
      if (preview && preview.parentNode) {
        preview.style.opacity = '1';
      }
    });
    
    // Remove preview after a short delay with proper checks
    setTimeout(() => {
      const previewElement = document.getElementById('floating-word-preview');
      if (previewElement && previewElement.parentNode) {
        // Fade out before removing
        previewElement.style.opacity = '0';
        setTimeout(() => {
          if (previewElement && previewElement.parentNode) {
            previewElement.parentNode.removeChild(previewElement);
          }
        }, 200);
      }
    }, 800);
  }, [grid]);

  // Close the word found popup
  const handleClosePopup = useCallback(() => {
    setShowCelebration(false);
    setLastFoundWord(null);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      {/* Selection Mode Toggle (Desktop only) */}
      {!isMobile && (
        <div style={{
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <button
            onClick={() => setSelectionMode('drag')}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: selectionMode === 'drag' ? theme.secondary : theme.cellBg,
              color: selectionMode === 'drag' ? '#ffffff' : theme.primary,
              border: `1px solid ${theme.secondary}40`,
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            Drag Mode
          </button>
          <button
            onClick={() => setSelectionMode('click-start-end')}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: selectionMode === 'click-start-end' ? theme.secondary : theme.cellBg,
              color: selectionMode === 'click-start-end' ? '#ffffff' : theme.primary,
              border: `1px solid ${theme.secondary}40`,
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            Click Mode
          </button>
        </div>
      )}
      
      <style>
        {`
          @keyframes cell-tap {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          .cell-tap-feedback {
            animation: cell-tap 0.3s ease;
          }
          
          @keyframes cell-error {
            0% { background-color: rgba(239, 68, 68, 0.4); }
            100% { background-color: transparent; }
          }
          
          .cell-error-feedback {
            animation: cell-error 0.3s ease;
          }
          
          @keyframes word-found-animation {
            0% { transform: scale(1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); }
          }
          
          .animate-word-found {
            animation: word-found-animation 0.6s ease;
          }
        `}
      </style>
      <div style={{ position: 'relative' }}>
        {/* Zoom indicator */}
        {zoomScale !== 1 && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: `${theme.secondary}80`,
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 10,
            opacity: 0.8,
            pointerEvents: 'none'
          }}>
            {Math.round(zoomScale * 100)}%
          </div>
        )}
        
        <div
          ref={gridContainerRef}
          className="word-grid-container"
          style={{
            display: 'inline-block',
            padding: isMobile ? '10px' : '16px',
            borderRadius: isMobile ? '10px' : '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            backgroundColor: theme.gridBg,
            touchAction: 'auto', // Let the touch events be handled by our handlers
            maxHeight: isMobile ? '55vh' : 'auto', // Reduced from 65vh to 55vh to show more of the grid
            overflowY: isMobile ? 'auto' : 'visible',
            position: 'relative',
            WebkitOverflowScrolling: 'touch',
            width: isMobile ? '100%' : 'auto'
          }}
      >
        <div
          style={{
            display: 'grid',
            gap: window.innerWidth >= 480 ? '4px' : '2px',
            gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`,
            userSelect: 'none',
            transform: `scale(${zoomScale})`,
            transformOrigin: 'center center',
            transition: initialTouchDistance.current ? 'none' : 'transform 0.1s ease',
            position: 'relative'
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const baseStyle = getCellStyle(rowIndex, colIndex, cell);
              return (
                <div
                  key={getCellKey(rowIndex, colIndex)}
                  data-cell={getCellKey(rowIndex, colIndex)}
                  style={{
                    width: getCellSize(),
                    height: getCellSize(),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: window.innerWidth >= 480 ? '2px solid' : '1px solid',
                    borderRadius: window.innerWidth >= 480 ? '8px' : '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: getCellFontSize(),
                    // Apply baseStyle which includes: backgroundColor, color, borderColor, boxShadow, transition, transform, fontFamily
                    ...baseStyle
                  }}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onTouchStart={(e) => handleTouchStart(rowIndex, colIndex, e)}
                  onTouchEnd={handleTouchEnd}
                  onMouseOver={(event) => {
                    if (!isSelecting) {
                      event.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseOut={(event) => {
                    if (!isSelecting && !highlightedCells.has(getCellKey(rowIndex, colIndex))) {
                      event.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {cell.letter}
                </div>
              );
            })
          )}
          
          {/* Selection Arrow Overlay */}
          {selectionArrow && (
            <svg 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 5
              }}
            >
              {(() => {
                // Calculate cell size
                const cellSizeStr = getCellSize();
                const cellSize = parseInt(cellSizeStr.replace('px', ''));
                const gapSize = window.innerWidth >= 480 ? 4 : 2;
                
                // Calculate start and end positions
                const startX = selectionArrow.start.col * (cellSize + gapSize) + cellSize / 2;
                const startY = selectionArrow.start.row * (cellSize + gapSize) + cellSize / 2;
                const endX = selectionArrow.end.col * (cellSize + gapSize) + cellSize / 2;
                const endY = selectionArrow.end.row * (cellSize + gapSize) + cellSize / 2;
                
                // Calculate arrow angle
                const dx = endX - startX;
                const dy = endY - startY;
                const angle = Math.atan2(dy, dx);
                
                // Calculate arrow head points
                const arrowHeadSize = cellSize * 0.4;
                const arrowHead1X = endX - arrowHeadSize * Math.cos(angle - Math.PI / 6);
                const arrowHead1Y = endY - arrowHeadSize * Math.sin(angle - Math.PI / 6);
                const arrowHead2X = endX - arrowHeadSize * Math.cos(angle + Math.PI / 6);
                const arrowHead2Y = endY - arrowHeadSize * Math.sin(angle + Math.PI / 6);
                
                return (
                  <>
                    {/* Line */}
                    <line 
                      x1={startX} 
                      y1={startY} 
                      x2={endX} 
                      y2={endY} 
                      stroke={theme.accent}
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      opacity={0.8}
                    />
                    
                    {/* Arrow Head */}
                    <polygon 
                      points={`${endX},${endY} ${arrowHead1X},${arrowHead1Y} ${arrowHead2X},${arrowHead2Y}`}
                      fill={theme.accent}
                      opacity={0.8}
                    />
                  </>
                );
              })()}
            </svg>
          )}
        </div>
      </div>

      {/* Word found celebration */}
      </div>
      
      {showCelebration && lastFoundWord && (
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          {lastFoundWord.description && showDescriptions ? (
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              borderRadius: '16px',
              padding: window.innerWidth >= 480 ? '20px' : '16px',
              maxWidth: '90%',
              width: window.innerWidth >= 480 ? '400px' : '95%',
              boxShadow: `0 0 30px ${lastFoundWord.color}80, 0 0 10px rgba(0, 0, 0, 0.3)`,
              border: `2px solid ${lastFoundWord.color}`,
              animation: 'bounce-in 0.6s ease-out forwards',
              textAlign: 'center',
              maxHeight: window.innerWidth < 480 ? '80vh' : 'auto',
              overflowY: window.innerWidth < 480 ? 'auto' : 'visible',
              position: 'relative',
              pointerEvents: 'auto'
            }}>
              {/* Close button */}
              <button 
                onClick={handleClosePopup}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  padding: 0,
                  lineHeight: 1
                }}
              >
                ✕
              </button>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                {lastFoundWord.descriptionType === 'islamicPlaces' ? (
                  <MapPin
                    size={24}
                    style={{
                      color: lastFoundWord.color,
                      marginRight: '8px'
                    }}
                  />
                ) : lastFoundWord.descriptionType === 'kidsMode' ? (
                  <BookOpen
                    size={24}
                    style={{
                      color: lastFoundWord.color,
                      marginRight: '8px'
                    }}
                  />
                ) : (
                  <BookOpen
                    size={24}
                    style={{
                      color: lastFoundWord.color,
                      marginRight: '8px'
                    }}
                  />
                )}
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: lastFoundWord.color
                }}>
                  {lastFoundWord.word}
                </div>

                {/* Audio pronunciation for Kids Mode */}
                {kidsMode && (
                  <div style={{ marginLeft: '8px' }}>
                    <AudioPronunciation
                      word={lastFoundWord.word}
                      color={lastFoundWord.color}
                      kidsMode={kidsMode}
                    />
                  </div>
                )}
              </div>

              {/* English description */}
              <div style={{
                color: '#ffffff',
                fontSize: '16px',
                lineHeight: '1.5',
                padding: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                marginBottom: lastFoundWord.urduDescription ? '8px' : '12px',
                textAlign: 'left'
              }}>
                {lastFoundWord.description}
              </div>

              {/* Urdu description (only for Islamic Places) */}
              {lastFoundWord.urduDescription && (
                <div style={{
                  color: '#ffffff',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  padding: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  direction: 'rtl',
                  fontFamily: "'Noto Nastaliq Urdu', serif",
                  textAlign: 'right'
                }}>
                  {lastFoundWord.urduDescription}
                </div>
              )}

              {/* Visual illustration for Kids Mode */}
              {kidsMode && lastFoundWord.descriptionType === 'kidsMode' && (
                <VisualIllustration
                  word={lastFoundWord.word}
                  kidsMode={kidsMode}
                  theme={theme}
                />
              )}

              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontStyle: 'italic',
                marginTop: '12px'
              }}>
                {lastFoundWord.descriptionType === 'islamicPlaces'
                  ? 'Sacred Place in Islam'
                  : lastFoundWord.descriptionType === 'kidsMode'
                    ? 'Islamic Term for Kids'
                    : 'One of the Five Pillars of Islam'}
              </div>

              {/* Decorative elements */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                color: lastFoundWord.color,
                animation: 'pulse-glow 2s ease-in-out infinite'
              }}>
                {lastFoundWord.descriptionType === 'islamicPlaces' ? (
                  <Globe size={24} />
                ) : (
                  <Sparkles size={24} />
                )}
              </div>
              <div style={{
                position: 'absolute',
                bottom: '-10px',
                left: '-10px',
                color: lastFoundWord.color,
                animation: 'pulse-glow 2s ease-in-out infinite',
                animationDelay: '0.5s'
              }}>
                {lastFoundWord.descriptionType === 'islamicPlaces' ? (
                  <MapPin size={24} />
                ) : (
                  <Sparkles size={24} />
                )}
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              animation: 'bounce-in 0.6s ease-out forwards'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: lastFoundWord.color
              }}>
                {lastFoundWord.word}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Sparkles
                  size={24}
                  style={{
                    color: lastFoundWord.color,
                    animation: 'pulse-glow 2s ease-in-out infinite'
                  }}
                />
              </div>
            </div>
          )}

          {/* Particle effects */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: 'float 3s ease-in-out infinite',
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${1 + Math.random() * 1}s`,
                color: lastFoundWord.color,
                opacity: 0.7,
                zIndex: 5
              }}
            >
              <Sparkles size={10 + Math.random() * 10} />
            </div>
          ))}
        </div>
      )}



      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: scale(0.8) translateY(10px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          
          @keyframes bounce-in {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); opacity: 1; }
            70% { transform: scale(0.95); }
            100% { transform: scale(1); }
          }
          
          @keyframes pulse-glow {
            0% { opacity: 0.6; filter: drop-shadow(0 0 2px currentColor); }
            50% { opacity: 1; filter: drop-shadow(0 0 8px currentColor); }
            100% { opacity: 0.6; filter: drop-shadow(0 0 2px currentColor); }
          }
          
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(10deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          
          @keyframes word-trail {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          
          .animate-word-found {
            animation: pulse-glow 0.6s ease-in-out;
          }
          
          .cell-tap-feedback {
            animation: tap-feedback 0.3s ease-out;
          }
          
          .cell-error-feedback {
            animation: error-feedback 0.3s ease-out;
          }
          
          @keyframes tap-feedback {
            0% { transform: scale(1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); }
          }
          
          @keyframes error-feedback {
            0% { background-color: rgba(255, 0, 0, 0.2); }
            100% { background-color: transparent; }
          }
          
          .word-grid-container {
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
          }
          
          .word-grid-container::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          .word-grid-container::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
          }
          
          .word-grid-container::-webkit-scrollbar-track {
            background-color: transparent;
          }
          
          /* Enhanced iPad landscape touch handling */
          @media screen and (min-device-width: 768px) and (max-device-width: 1024px) and (orientation: landscape) {
            .word-grid-container.selecting {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              z-index: 1000 !important;
              background: transparent !important;
              pointer-events: none !important;
            }
            
            .word-grid-container.selecting > * {
              pointer-events: auto !important;
            }
            
            .word-grid-container.selecting .word-grid-cell {
              touch-action: none !important;
              user-select: none !important;
              -webkit-user-select: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};