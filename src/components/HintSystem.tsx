import { useState, useEffect, useRef, useCallback } from 'react';
import { Lightbulb, Eye, Zap, X } from 'lucide-react';
import type { WordPlacement } from '../types/game';
import { useResponsive } from '../hooks/useResponsive';

interface HintSystemProps {
  words: WordPlacement[];
  onHintUsed: (word: WordPlacement) => void;
  theme: any;
  hintsRemaining: number;
}

export const HintSystem: React.FC<HintSystemProps> = ({
  words,
  onHintUsed,
  theme,
  hintsRemaining
}) => {
  const [showHintMenu, setShowHintMenu] = useState(false);
  const [dialogPosition, setDialogPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const hintButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Use responsive hook for better device detection
  const breakpoints = useResponsive();
  const { isMobile, isTablet } = breakpoints;

  const unFoundWords = words.filter(w => !w.found);

  // Calculate optimal dialog position based on available space
  const calculateDialogPosition = useCallback(() => {
    if (!hintButtonRef.current || !dialogRef.current) return;

    const buttonRect = hintButtonRef.current.getBoundingClientRect();
    const dialogRect = dialogRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate available space in each direction
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const spaceRight = viewportWidth - buttonRect.right;
    const spaceLeft = buttonRect.left;

    // Add safety margins
    const safetyMargin = 20;
    const minSpaceNeeded = 100; // Minimum space needed to show dialog in a direction

    // Determine best position based on device type and available space
    if (isMobile) {
      // On mobile, always use bottom sheet for consistency and better UX
      setDialogPosition('bottom');
    } else if (isTablet) {
      // On iPad/tablet, prioritize vertical positioning (top/bottom)
      // This works better for touch interfaces

      // Check if we have enough space below
      if (spaceBelow >= dialogRect.height + safetyMargin ||
        (spaceBelow > spaceAbove && spaceBelow > minSpaceNeeded)) {
        setDialogPosition('bottom');
      }
      // Otherwise check if we have enough space above
      else if (spaceAbove >= dialogRect.height + safetyMargin ||
        spaceAbove > minSpaceNeeded) {
        setDialogPosition('top');
      }
      // If neither above nor below has enough space, use the side with more space
      else if (spaceRight > spaceLeft) {
        setDialogPosition('right');
      } else {
        setDialogPosition('left');
      }
    } else {
      // On desktop, prioritize horizontal positioning (left/right)
      // This is more natural for mouse interaction

      // Check if we have enough space to the right
      if (spaceRight >= dialogRect.width + safetyMargin ||
        (spaceRight > spaceLeft && spaceRight > minSpaceNeeded)) {
        setDialogPosition('right');
      }
      // Otherwise check if we have enough space to the left
      else if (spaceLeft >= dialogRect.width + safetyMargin ||
        spaceLeft > minSpaceNeeded) {
        setDialogPosition('left');
      }
      // If neither left nor right has enough space, use the vertical direction with more space
      else if (spaceBelow > spaceAbove) {
        setDialogPosition('bottom');
      } else {
        setDialogPosition('top');
      }
    }
  }, [isMobile, isTablet]);

  // Handle click outside to close dialog
  useEffect(() => {
    if (!showHintMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node) &&
        hintButtonRef.current &&
        !hintButtonRef.current.contains(event.target as Node)
      ) {
        setShowHintMenu(false);
      }
    };

    // Handle keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close dialog on Escape key
        setShowHintMenu(false);
      } else if (event.key === 'Tab' && dialogRef.current) {
        // Trap focus within dialog
        const focusableElements = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (event.shiftKey && document.activeElement === firstElement) {
            // Shift+Tab on first element should focus last element
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            // Tab on last element should focus first element
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    // Focus first focusable element in dialog when it opens
    if (dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showHintMenu]);

  // Calculate position when dialog opens
  useEffect(() => {
    if (showHintMenu) {
      calculateDialogPosition();
    }
  }, [showHintMenu, calculateDialogPosition]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      if (showHintMenu) {
        calculateDialogPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showHintMenu, calculateDialogPosition]);

  const useHint = (word: WordPlacement) => {
    if (hintsRemaining > 0) {
      onHintUsed(word);
      setShowHintMenu(false);
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'horizontal': return '→';
      case 'vertical': return '↓';
      case 'diagonal-down': return '↘';
      case 'diagonal-up': return '↗';
      default: return '→';
    }
  };

  // Get dialog position styles based on calculated position
  const getDialogPositionStyles = () => {
    switch (dialogPosition) {
      case 'bottom':
        return {
          top: '100%',
          left: isMobile ? '0' : '50%',
          right: isMobile ? '0' : 'auto',
          transform: isMobile ? 'none' : 'translateX(-50%)',
          width: isMobile ? '100%' : 'auto',
          marginTop: '8px',
          maxHeight: isMobile ? 'calc(70vh)' : 'auto'
        };
      case 'top':
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px'
        };
      case 'left':
        return {
          top: '0',
          right: '100%',
          marginRight: '8px'
        };
      case 'right':
      default:
        return {
          top: '0',
          left: '100%',
          marginLeft: '8px'
        };
    }
  };

  // Get dialog size based on device type
  const getDialogSizeStyles = () => {
    if (isMobile) {
      return {
        width: '100%',
        maxHeight: 'calc(70vh)',
        borderRadius: dialogPosition === 'bottom' ? '16px 16px 0 0' : '16px'
      };
    } else if (isTablet) {
      return {
        width: 'auto',
        minWidth: '280px',
        maxWidth: '320px',
        maxHeight: '400px'
      };
    } else {
      return {
        width: 'auto',
        minWidth: '280px',
        maxWidth: '320px',
        maxHeight: '500px'
      };
    }
  };

  if (unFoundWords.length === 0) return null;

  return (
    <div className="relative">
      <button
        ref={hintButtonRef}
        onClick={() => setShowHintMenu(!showHintMenu)}
        disabled={hintsRemaining === 0}
        className={`rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${hintsRemaining === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        style={{
          backgroundColor: theme.cellBg,
          color: theme.primary,
          border: `1px solid ${theme.secondary}40`,
          padding: isMobile ? '6px' : '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: isMobile ? '32px' : '44px',
          height: isMobile ? '32px' : '44px'
        }}
        title={`Hints remaining: ${hintsRemaining}`}
        aria-label={`Hints remaining: ${hintsRemaining}`}
        aria-haspopup="dialog"
        aria-expanded={showHintMenu}
        aria-controls={showHintMenu ? "hint-dialog" : undefined}
      >
        <div className="flex items-center gap-1">
          <Lightbulb size={isMobile ? 14 : 20} />
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold`}>{hintsRemaining}</span>
        </div>
      </button>

      {showHintMenu && (
        <div
          ref={dialogRef}
          className="fixed md:absolute shadow-2xl z-50"
          style={{
            backgroundColor: theme.gridBg,
            border: `1px solid ${theme.secondary}40`,
            ...getDialogPositionStyles(),
            ...getDialogSizeStyles()
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="hint-dialog-title"
          id="hint-dialog"
        >
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Eye size={isMobile ? 18 : 16} style={{ color: theme.secondary }} />
              <span
                id="hint-dialog-title"
                className={`${isMobile ? 'text-base' : 'text-sm'} font-semibold`}
                style={{ color: theme.primary }}
              >
                Choose a word for hint
              </span>
            </div>
            <button
              onClick={() => setShowHintMenu(false)}
              className="p-1 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Close hint dialog"
            >
              <X size={isMobile ? 18 : 16} style={{ color: theme.secondary }} />
            </button>
          </div>

          <div
            className="overflow-y-auto p-2 md:p-3 scroll-smooth"
            style={{
              maxHeight: isMobile ? 'calc(70vh - 60px)' : isTablet ? '300px' : '400px',
              scrollbarWidth: 'thin',
              scrollbarColor: `${theme.secondary}60 ${theme.gridBg}80`,
              WebkitOverflowScrolling: 'touch' // Enable momentum scrolling on iOS
            }}
          >
            <div className="space-y-2">
              {unFoundWords.map((word, index) => (
                <button
                  key={`${word.word}-${index}`}
                  onClick={() => useHint(word)}
                  className="w-full p-3 rounded-lg text-left transition-all duration-200 hover:scale-102 focus:outline-none focus:ring-2 active:scale-98"
                  style={{
                    backgroundColor: theme.cellBg,
                    color: theme.primary,
                    border: `1px solid transparent`,
                    outlineColor: theme.accent,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.secondary;
                    e.currentTarget.style.backgroundColor = `${theme.cellBg}80`;
                    e.currentTarget.style.boxShadow = `0 2px 8px ${theme.secondary}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.backgroundColor = theme.cellBg;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onTouchStart={(e) => {
                    // Create ripple effect for touch devices
                    const button = e.currentTarget;
                    const ripple = document.createElement('span');
                    const rect = button.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.touches[0].clientX - rect.left - size / 2;
                    const y = e.touches[0].clientY - rect.top - size / 2;

                    ripple.style.width = ripple.style.height = `${size}px`;
                    ripple.style.left = `${x}px`;
                    ripple.style.top = `${y}px`;
                    ripple.style.position = 'absolute';
                    ripple.style.borderRadius = '50%';
                    ripple.style.backgroundColor = `${theme.accent}30`;
                    ripple.style.transform = 'scale(0)';
                    ripple.style.animation = 'ripple 0.6s linear';

                    button.appendChild(ripple);

                    setTimeout(() => {
                      if (ripple.parentNode === button) {
                        button.removeChild(ripple);
                      }
                    }, 600);

                    // Add visual feedback
                    button.style.borderColor = theme.accent;
                    button.style.backgroundColor = `${theme.cellBg}90`;
                    button.style.transform = 'scale(0.98)';

                    setTimeout(() => {
                      button.style.borderColor = 'transparent';
                      button.style.backgroundColor = theme.cellBg;
                      button.style.transform = 'scale(1)';
                    }, 300);
                  }}
                  aria-label={`Use hint for word ${word.word}, ${word.word.length} letters, ${word.direction} direction`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium">{word.word}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-75">
                        {getDirectionIcon(word.direction)}
                      </span>
                      <Zap size={12} style={{ color: theme.accent }} />
                    </div>
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    {word.word.length} letters • {word.direction}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 md:p-4 border-t border-gray-700">
            <div className="text-xs opacity-75 text-center">
              Hints will highlight the first letter of the word
            </div>
          </div>
        </div>
      )}
    </div>
  );
};