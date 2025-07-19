import { useState, useEffect, useRef, useCallback } from 'react';
import { Lightbulb, Eye, Zap, X, Target } from 'lucide-react';
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
  const [dialogPosition, setDialogPosition] = useState<'top' | 'bottom' | 'left' | 'right' | 'center'>('center');
  const hintButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Use responsive hook for better device detection
  const breakpoints = useResponsive();
  const { isMobile, isTablet, isDesktop } = breakpoints;

  // Improved device detection
  const isIPad = /iPad/i.test(navigator.userAgent) || 
                (/Macintosh/i.test(navigator.userAgent) && 'ontouchend' in document);
  const isLandscape = window.innerWidth > window.innerHeight;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const unFoundWords = words.filter(w => !w.found);

  // Calculate optimal dialog position with improved logic for iPad
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

    const safetyMargin = 20;
    const minSpaceNeeded = 200;

    // For iPad in landscape mode, use center modal to prevent touch issues
    if (isIPad && isLandscape) {
      setDialogPosition('center');
      return;
    }

    // For mobile phones, always use bottom sheet
    if (isMobile && !isTablet) {
      setDialogPosition('bottom');
      return;
    }

    // For tablets (including iPad in portrait), use smart positioning
    if (isTablet || isIPad) {
      // Prefer bottom positioning for touch accessibility
      if (spaceBelow >= Math.max(dialogRect.height + safetyMargin, minSpaceNeeded)) {
        setDialogPosition('bottom');
      } else if (spaceAbove >= Math.max(dialogRect.height + safetyMargin, minSpaceNeeded)) {
        setDialogPosition('top');
      } else {
        // Use center modal if insufficient vertical space
        setDialogPosition('center');
      }
      return;
    }

    // For desktop, use horizontal positioning
    if (isDesktop) {
      if (spaceRight >= Math.max(dialogRect.width + safetyMargin, minSpaceNeeded)) {
        setDialogPosition('right');
      } else if (spaceLeft >= Math.max(dialogRect.width + safetyMargin, minSpaceNeeded)) {
        setDialogPosition('left');
      } else if (spaceBelow > spaceAbove) {
        setDialogPosition('bottom');
      } else {
        setDialogPosition('top');
      }
    }
  }, [isMobile, isTablet, isDesktop, isIPad, isLandscape]);

  // Handle click outside to close dialog with better touch handling
  useEffect(() => {
    if (!showHintMenu) return;

    const handleOutsideInteraction = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      
      if (
        dialogRef.current &&
        !dialogRef.current.contains(target) &&
        hintButtonRef.current &&
        !hintButtonRef.current.contains(target)
      ) {
        setShowHintMenu(false);
      }
    };

    // Handle keyboard navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowHintMenu(false);
      } else if (event.key === 'Tab' && dialogRef.current) {
        // Improved focus trapping
        const focusableElements = dialogRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        );

        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    // Use both mouse and touch events for better compatibility
    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('touchstart', handleOutsideInteraction, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    // Auto-focus first element with delay for better UX
    if (dialogRef.current) {
      setTimeout(() => {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        );
        if (focusableElements && focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('touchstart', handleOutsideInteraction);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showHintMenu]);

  // Calculate position when dialog opens
  useEffect(() => {
    if (showHintMenu) {
      // Use requestAnimationFrame for smoother positioning
      requestAnimationFrame(() => {
        calculateDialogPosition();
      });
    }
  }, [showHintMenu, calculateDialogPosition]);

  // Recalculate on window resize with debouncing
  useEffect(() => {
    let resizeTimer: number;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (showHintMenu) {
          calculateDialogPosition();
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [showHintMenu, calculateDialogPosition]);

  const useHint = (word: WordPlacement) => {
    if (hintsRemaining > 0) {
      onHintUsed(word);
      setShowHintMenu(false);
      
      // Add haptic feedback for hint usage
      if (isTouchDevice && navigator.vibrate) {
        navigator.vibrate([50, 50, 100]);
      }
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

  // Get dialog position styles with center modal support
  const getDialogPositionStyles = () => {
    const baseStyles = {
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${theme.secondary}40`,
    };

    switch (dialogPosition) {
      case 'center':
        return {
          ...baseStyles,
          position: 'fixed' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isMobile ? '90vw' : isTablet ? '400px' : '450px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          zIndex: 1000
        };
      case 'bottom':
        return {
          ...baseStyles,
          top: isMobile ? 'auto' : '100%',
          bottom: isMobile ? '0' : 'auto',
          left: isMobile ? '0' : '50%',
          right: isMobile ? '0' : 'auto',
          transform: isMobile ? 'none' : 'translateX(-50%)',
          width: isMobile ? '100%' : 'auto',
          marginTop: isMobile ? '0' : '8px',
          borderRadius: isMobile ? '16px 16px 0 0' : '16px',
          maxHeight: isMobile ? '75vh' : '500px'
        };
      case 'top':
        return {
          ...baseStyles,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          maxHeight: '400px'
        };
      case 'left':
        return {
          ...baseStyles,
          top: '0',
          right: '100%',
          marginRight: '8px',
          maxHeight: '500px',
          maxWidth: '380px'
        };
      case 'right':
      default:
        return {
          ...baseStyles,
          top: '0',
          left: '100%',
          marginLeft: '8px',
          maxHeight: '500px',
          maxWidth: '380px'
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
        className={`rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
          hintsRemaining === 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{
          backgroundColor: theme.cellBg,
          color: theme.primary,
          border: `1px solid ${theme.secondary}40`,
          padding: isMobile ? '8px' : '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: isMobile ? '36px' : '48px',
          height: isMobile ? '36px' : '48px',
          minWidth: '44px', // Minimum touch target
          minHeight: '44px'
        }}
        title={`Hints remaining: ${hintsRemaining}`}
        aria-label={`Use hint - ${hintsRemaining} hints remaining`}
        aria-haspopup="dialog"
        aria-expanded={showHintMenu}
        aria-controls={showHintMenu ? "hint-dialog" : undefined}
      >
        <div className="flex items-center gap-1">
          <Lightbulb size={isMobile ? 16 : 20} />
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold`}>
            {hintsRemaining}
          </span>
        </div>
      </button>

      {showHintMenu && (
        <>
          {/* Overlay for center modal and mobile */}
          {(dialogPosition === 'center' || isMobile) && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowHintMenu(false)}
              aria-hidden="true"
              style={{
                background: isIPad && isLandscape 
                  ? 'rgba(0, 0, 0, 0.7)' 
                  : 'rgba(0, 0, 0, 0.5)'
              }}
            />
          )}
          
          <div
            ref={dialogRef}
            className={dialogPosition === 'center' ? 'fixed' : 'absolute'}
            style={{
              backgroundColor: `${theme.gridBg}F5`,
              ...getDialogPositionStyles(),
              zIndex: dialogPosition === 'center' ? 1000 : 50
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="hint-dialog-title"
            id="hint-dialog"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Target size={20} style={{ color: theme.secondary }} />
                <span
                  id="hint-dialog-title"
                  className="text-lg font-semibold"
                  style={{ color: theme.primary }}
                >
                  Choose Word for Hint
                </span>
              </div>
              <button
                onClick={() => setShowHintMenu(false)}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                style={{ 
                  minWidth: '44px', 
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Close hint dialog"
              >
                <X size={20} style={{ color: theme.secondary }} />
              </button>
            </div>

            {/* Content */}
            <div
              className="overflow-y-auto p-4 scroll-smooth"
              style={{
                maxHeight: isMobile 
                  ? 'calc(70vh - 120px)' 
                  : isTablet 
                    ? '350px' 
                    : '400px',
                scrollbarWidth: 'thin',
                scrollbarColor: `${theme.secondary}60 ${theme.gridBg}80`,
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="space-y-3">
                {unFoundWords.map((word, index) => (
                  <button
                    key={`${word.word}-${index}`}
                    onClick={() => useHint(word)}
                    className="w-full p-4 rounded-xl text-left transition-all duration-200 hover:scale-102 focus:outline-none focus:ring-2 active:scale-98"
                    style={{
                      backgroundColor: theme.cellBg,
                      color: theme.primary,
                      border: `1px solid transparent`,
                      outlineColor: theme.accent,
                      position: 'relative',
                      overflow: 'hidden',
                      minHeight: '44px', // Touch target
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = theme.secondary;
                      e.currentTarget.style.backgroundColor = `${theme.cellBg}90`;
                      e.currentTarget.style.boxShadow = `0 4px 12px ${theme.secondary}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.backgroundColor = theme.cellBg;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onTouchStart={(e) => {
                      // Enhanced touch feedback
                      const button = e.currentTarget;
                      button.style.borderColor = theme.accent;
                      button.style.backgroundColor = `${theme.cellBg}95`;
                      button.style.transform = 'scale(0.98)';
                      
                      // Haptic feedback
                      if (navigator.vibrate) {
                        navigator.vibrate(10);
                      }
                    }}
                    onTouchEnd={(e) => {
                      const button = e.currentTarget;
                      setTimeout(() => {
                        button.style.borderColor = 'transparent';
                        button.style.backgroundColor = theme.cellBg;
                        button.style.transform = 'scale(1)';
                      }, 150);
                    }}
                    aria-label={`Use hint for word ${word.word}, ${word.word.length} letters, ${word.direction} direction`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-medium text-lg">
                        {word.word}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm opacity-75">
                          {getDirectionIcon(word.direction)}
                        </span>
                        <Zap size={16} style={{ color: theme.accent }} />
                      </div>
                    </div>
                    <div className="text-sm opacity-70">
                      {word.word.length} letters • {word.direction.replace('-', ' ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 text-center">
              <div className="flex items-center justify-center gap-2 text-sm opacity-75">
                <Eye size={16} style={{ color: theme.secondary }} />
                <span>Hints highlight the first letter of the word</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.7;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};