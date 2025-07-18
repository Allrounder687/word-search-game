import { useState, useCallback, useEffect, useRef } from 'react';
import type { Position, Cell, WordPlacement } from '../types/game';
import { checkWordSelection } from '../utils/gameLogic';
import { Sparkles, BookOpen, MapPin, Globe } from 'lucide-react';
import { FIVE_PILLARS_DESCRIPTIONS } from '../types/islamicDescriptions';
import { ISLAMIC_PLACES_DESCRIPTIONS } from '../types/islamicPlacesDescriptions';
import { shouldUseKidsDescription, getKidsDescription } from '../types/kidsMode';
// No need to import configureWordGridTouchBehavior as we're handling touch directly
import { AudioPronunciation } from './AudioPronunciation';
import { VisualIllustration } from './VisualIllustration';

interface WordGridProps {
  grid: Cell[][];
  words: WordPlacement[];
  onWordFound: (word: WordPlacement) => void;
  theme: any;
  showDescriptions?: boolean;
  kidsMode?: boolean;
  isZoomed?: boolean;
}

export const WordGrid: React.FC<WordGridProps> = ({ grid, words, onWordFound, theme, showDescriptions = true, kidsMode = false, isZoomed = false }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<Position[]>([]);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [lastFoundWord, setLastFoundWord] = useState<WordPlacement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'drag' | 'click-start-end' | 'keyboard'>('drag');
  const [startCell, setStartCell] = useState<Position | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [keyboardFocusPosition, setKeyboardFocusPosition] = useState<Position | null>(null);

  // Detect if we're on a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const getCellKey = (row: number, col: number) => `${row},${col}`;

  const handleMouseDown = useCallback((row: number, col: number) => {
    setIsSelecting(true);
    setCurrentSelection([{ row, col }]);
    setHighlightedCells(new Set([getCellKey(row, col)]));
  }, []);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (!isSelecting || currentSelection.length === 0) return;

    const start = currentSelection[0];
    const newSelection = getSelectionPath(start, { row, col });
    setCurrentSelection(newSelection);
    setHighlightedCells(new Set(newSelection.map(pos => getCellKey(pos.row, pos.col))));
  }, [isSelecting, currentSelection]);

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
        setLastFoundWord(foundWord);
        setShowCelebration(true);

        // Add celebration effect
        const wordCells = getSelectionPath(foundWord.start, foundWord.end);
        wordCells.forEach(pos => {
          const cell = document.querySelector(`[data-cell="${getCellKey(pos.row, pos.col)}"]`);
          if (cell) {
            cell.classList.add('animate-word-found');
            setTimeout(() => cell.classList.remove('animate-word-found'), 600);
          }
        });

        // Hide celebration after a longer delay if we have a description
        setTimeout(() => {
          setShowCelebration(false);
          setLastFoundWord(null);
        }, foundWord.description ? 5000 : 2000);
      }
    }

    setIsSelecting(false);
    setCurrentSelection([]);
    setHighlightedCells(new Set());
  }, [currentSelection, words, onWordFound, kidsMode]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting) {
        handleMouseUp();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isSelecting, handleMouseUp]);

  // Touch support
  const handleTouchStart = useCallback((row: number, col: number, _e: React.TouchEvent) => {
    // Don't prevent default here to allow the touch event to be registered

    setIsSelecting(true);
    setCurrentSelection([{ row, col }]);
    setHighlightedCells(new Set([getCellKey(row, col)]));

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10); // Short vibration
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSelecting || currentSelection.length === 0) return;

    // Prevent default to stop screen dragging but only during selection
    e.preventDefault();

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.hasAttribute('data-cell')) {
      const cellKey = element.getAttribute('data-cell');
      if (cellKey) {
        const [row, col] = cellKey.split(',').map(Number);

        // Only update if we're on a different cell
        if (!highlightedCells.has(cellKey)) {
          const start = currentSelection[0];
          const newSelection = getSelectionPath(start, { row, col });
          setCurrentSelection(newSelection);
          setHighlightedCells(new Set(newSelection.map(pos => getCellKey(pos.row, pos.col))));

          // Add haptic feedback for iOS and Android if available
          if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10); // Short vibration
          }
        }
      }
    }
  }, [isSelecting, currentSelection, highlightedCells]);

  const handleTouchEnd = useCallback((_e: React.TouchEvent) => {
    // Don't prevent default here to allow the touch event to complete normally

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

  const getCellStyle = (row: number, col: number, _cell: Cell) => {
    const cellKey = getCellKey(row, col);
    const isHighlighted = highlightedCells.has(cellKey);

    // Find if this cell is part of a found word
    const foundWord = words.find(w => w.found &&
      getSelectionPath(w.start, w.end).some(pos => pos.row === row && pos.col === col)
    );

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
    } else if (screenWidth >= 768) {
      // Tablet
      baseSize = 36;
    } else if (screenWidth >= 480) {
      // Large mobile
      baseSize = 32;
    } else if (screenWidth >= 360) {
      // Medium mobile
      baseSize = 28;
    } else {
      // Small mobile
      baseSize = 24;
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

      return () => {
        // Clean up event listeners
        gridElement.removeEventListener('contextmenu', preventContextMenu);

        // Restore viewport meta when component unmounts
        if (viewportMeta) {
          viewportMeta.setAttribute('content',
            'width=device-width, initial-scale=1.0');
        }
      };
    }
  }, [isMobile]);

  // Handle click-start-end selection mode
  const handleCellClick = useCallback((row: number, col: number) => {
    if (selectionMode === 'click-start-end') {
      if (!startCell) {
        // First click - set start cell
        setStartCell({ row, col });
        setCurrentSelection([{ row, col }]);
        setHighlightedCells(new Set([getCellKey(row, col)]));
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

          // Add celebration effect
          const wordCells = getSelectionPath(foundWord.start, foundWord.end);
          wordCells.forEach(pos => {
            const cell = document.querySelector(`[data-cell="${getCellKey(pos.row, pos.col)}"]`);
            if (cell) {
              cell.classList.add('animate-word-found');
              setTimeout(() => cell.classList.remove('animate-word-found'), 600);
            }
          });

          // Hide celebration after a delay
          setTimeout(() => {
            setShowCelebration(false);
            setLastFoundWord(null);
          }, foundWord.description ? 5000 : 2000);
        }
        
        // Reset for next selection
        setStartCell(null);
        setCurrentSelection([]);
        setHighlightedCells(new Set());
      }
    }
  }, [selectionMode, startCell, words, onWordFound, showDescriptions, kidsMode]);

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
      
      <div
        ref={gridContainerRef}
        className={isMobile ? 'word-grid-container' : ''}
        style={{
          display: 'inline-block',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backgroundColor: theme.gridBg,
          touchAction: 'auto' // Let the touch events be handled by our handlers
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '4px',
            gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`,
            userSelect: 'none'
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
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onTouchStart={(e) => handleTouchStart(rowIndex, colIndex, e)}
                  onTouchMove={handleTouchMove}
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
        </div>
      </div>

      {/* Word found celebration */}
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
          
          .animate-word-found {
            animation: pulse-glow 0.6s ease-in-out;
          }
        `}
      </style>
    </div>
  );
};