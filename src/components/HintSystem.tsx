import { useState, useEffect } from 'react';
import { Lightbulb, Eye, X, Target } from 'lucide-react';
import type { WordPlacement } from '../types/game';
import { useResponsive } from '../hooks/useResponsive';

import type { ThemeColors } from '../types/game';

interface HintSystemProps {
  words: WordPlacement[];
  onHintUsed: (word: WordPlacement) => void;
  theme: ThemeColors;
  hintsRemaining: number;
}

export const HintSystem: React.FC<HintSystemProps> = ({
  words,
  onHintUsed,
  theme,
  hintsRemaining
}) => {
  const [currentHintWord, setCurrentHintWord] = useState<WordPlacement | null>(null);
  const [showHintMessage, setShowHintMessage] = useState(false);
  const [hintMessageTimeout, setHintMessageTimeout] = useState<number | null>(null);
  
  // Use responsive hook for better device detection
  const breakpoints = useResponsive();
  const { isMobile } = breakpoints;

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const unFoundWords = words.filter(w => !w.found);

  const useHint = () => {
    if (hintsRemaining > 0 && unFoundWords.length > 0) {
      // Get a random unfound word
      const randomIndex = Math.floor(Math.random() * unFoundWords.length);
      const selectedWord = unFoundWords[randomIndex];
      
      setCurrentHintWord(selectedWord);
      onHintUsed(selectedWord);
      
      // Show prominent hint message
      setShowHintMessage(true);
      
      // Clear previous timeout
      if (hintMessageTimeout) {
        clearTimeout(hintMessageTimeout);
      }
      
      // Auto-hide hint message after 4 seconds
      const timeout = setTimeout(() => {
        setShowHintMessage(false);
        setCurrentHintWord(null);
      }, 4000);
      
      setHintMessageTimeout(timeout);
      
      // Add haptic feedback for hint usage
      if (isTouchDevice && navigator.vibrate) {
        navigator.vibrate([50, 50, 100]);
      }
    }
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hintMessageTimeout) {
        clearTimeout(hintMessageTimeout);
      }
    };
  }, [hintMessageTimeout]);

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'horizontal': return '→';
      case 'vertical': return '↓';
      case 'diagonal-down': return '↘';
      case 'diagonal-up': return '↗';
      default: return '→';
    }
  };

  if (unFoundWords.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={useHint}
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
        title={`Get hint - ${hintsRemaining} hints remaining`}
        aria-label={`Get hint - ${hintsRemaining} hints remaining`}
      >
        <div className="flex items-center gap-1">
          <Lightbulb size={isMobile ? 16 : 20} />
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold`}>
            {hintsRemaining}
          </span>
        </div>
      </button>

      {/* Prominent Hint Message Overlay */}
      {showHintMessage && currentHintWord && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            style={{
              animation: 'fadeIn 0.3s ease-out'
            }}
          />
          
          {/* Hint Message */}
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            style={{
              backgroundColor: `${theme.gridBg}F8`,
              border: `2px solid ${theme.accent}`,
              borderRadius: '20px',
              padding: isMobile ? '24px' : '32px',
              maxWidth: isMobile ? '90vw' : '400px',
              width: isMobile ? '90vw' : 'auto',
              boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px ${theme.accent}40`,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              animation: 'hintPulse 0.5s ease-out'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => {
                setShowHintMessage(false);
                setCurrentHintWord(null);
                if (hintMessageTimeout) {
                  clearTimeout(hintMessageTimeout);
                }
              }}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-700 transition-colors"
              style={{ 
                minWidth: '36px', 
                minHeight: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.secondary
              }}
              aria-label="Close hint"
            >
              <X size={20} />
            </button>

            {/* Hint Content */}
            <div className="text-center">
              {/* Hint Icon */}
              <div 
                className="flex items-center justify-center mb-4"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: `${theme.accent}20`,
                  margin: '0 auto'
                }}
              >
                <Target size={32} style={{ color: theme.accent }} />
              </div>

              {/* Hint Title */}
              <h3 
                className="text-xl font-bold mb-3"
                style={{ color: theme.primary }}
              >
                💡 Hint Revealed!
              </h3>

              {/* Word Information */}
              <div 
                className="bg-opacity-20 rounded-xl p-4 mb-4"
                style={{ backgroundColor: theme.accent }}
              >
                <div className="text-lg font-mono font-bold mb-2" style={{ color: theme.accent }}>
                  {currentHintWord.word}
                </div>
                <div className="text-sm opacity-80 mb-2" style={{ color: theme.primary }}>
                  {currentHintWord.word.length} letters • {currentHintWord.direction.replace('-', ' ')}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">
                    {getDirectionIcon(currentHintWord.direction)}
                  </span>
                  <span className="text-sm" style={{ color: theme.secondary }}>
                    Look for the first letter highlighted in the grid!
                  </span>
                </div>
              </div>

              {/* Encouragement */}
              <div className="flex items-center justify-center gap-2 text-sm" style={{ color: theme.secondary }}>
                <Eye size={16} />
                <span>The first letter is now highlighted in the grid</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes hintPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.05);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};