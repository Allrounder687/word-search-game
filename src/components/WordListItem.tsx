import React, { useMemo, useCallback } from 'react';
import { Check, Star, Sparkles, Info } from 'lucide-react';
import type { WordPlacement } from '../types/game';

interface ThemeColors {
  primary: string;
  secondary: string;
  cellBg: string;
  [key: string]: string;
}

interface WordListItemProps {
  word: WordPlacement;
  index: number;
  isFound: boolean;
  theme: ThemeColors;
  showDescriptions: boolean;
  hasDescription: (word: string) => boolean;
  onWordClick: (word: string) => void;
  isMobile?: boolean;
}

// Static styles to avoid recreation
const STATIC_STYLES = {
  display: 'flex',
  alignItems: 'center',
  borderRadius: '8px',
  transition: 'all 0.3s',
  position: 'relative' as const,
  overflow: 'hidden' as const,
  touchAction: 'manipulation' as const
};

// Custom hook for hover effects
const useHoverEffect = (isFound: boolean) => {
  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFound) {
      e.currentTarget.style.transform = 'scale(1.05)';
    }
  }, [isFound]);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFound) {
      e.currentTarget.style.transform = 'scale(1)';
    }
  }, [isFound]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isFound) {
      e.currentTarget.style.transform = 'scale(1.05)';
    }
  }, [isFound]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isFound) {
      e.currentTarget.style.transform = 'scale(1)';
    }
  }, [isFound]);

  return { handleMouseEnter, handleMouseLeave, handleTouchStart, handleTouchEnd };
};

const WordListItemComponent: React.FC<WordListItemProps> = ({
  word,
  index,
  isFound,
  theme,
  showDescriptions,
  hasDescription,
  onWordClick,
  isMobile = false
}) => {
  // Memoize the icon selection based on word hash for consistency
  const iconType = useMemo(() => {
    const hash = word.word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hash % 2 === 0 ? 'star' : 'sparkles';
  }, [word.word]);

  // Memoize dynamic styles to prevent recreation on every render
  const baseStyles = useMemo(() => ({
    ...STATIC_STYLES,
    gap: isMobile ? '8px' : '12px',
    padding: isMobile ? '8px 12px' : '12px',
    backgroundColor: isFound ? word.color + '20' : theme.cellBg,
    ...(isMobile 
      ? { borderBottom: isFound ? `2px solid ${word.color}` : '2px solid transparent' }
      : { borderLeft: isFound ? `4px solid ${word.color}` : '4px solid transparent' }
    ),
    boxShadow: isFound ? `0 0 10px rgba(255, 255, 255, 0.3)` : 'none',
    minHeight: isMobile ? '36px' : '44px',
    minWidth: isMobile ? 'fit-content' : undefined,
    flexShrink: isMobile ? 0 : undefined,
  }), [isMobile, isFound, word.color, theme.cellBg]);

  // Use the custom hook for hover effects
  const { handleMouseEnter, handleMouseLeave, handleTouchStart, handleTouchEnd } = useHoverEffect(isFound);

  // Memoize keyboard handler for accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isFound && hasDescription(word.word)) {
        onWordClick(word.word);
      }
    }
  }, [isFound, hasDescription, word.word, onWordClick]);

  return (
    <div
      role="listitem"
      aria-label={`Word: ${word.word}, ${isFound ? 'found' : 'not found'}`}
      aria-describedby={showDescriptions && hasDescription(word.word) ? `desc-${word.word}` : undefined}
      tabIndex={0}
      style={baseStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      {/* Animated background for found words */}
      {isFound && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.2,
            background: `linear-gradient(90deg, transparent, ${word.color}60, transparent)`,
            backgroundSize: '200% 100%',
            animation: 'word-trail 2s ease-in-out infinite'
          }}
        />
      )}

      {/* Status indicator */}
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
          backgroundColor: isFound ? word.color : 'rgba(255, 255, 255, 0.1)',
          color: isFound ? '#ffffff' : theme.primary,
          zIndex: 1,
          animation: isFound ? 'word-found 0.6s ease-out' : 'none'
        }}
      >
        {isFound ? (
          <Check size={14} style={{ animation: 'bounce 1s infinite' }} />
        ) : (
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{index + 1}</span>
        )}
      </div>

      {/* Word text and info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 1
      }}>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: '500',
            transition: 'all 0.3s',
            textDecoration: isFound ? 'line-through' : 'none',
            color: isFound ? word.color : theme.primary,
            textShadow: isFound ? `0 0 10px ${word.color}40` : 'none'
          }}
        >
          {word.word}
        </span>
        
        {/* Info icon for words with descriptions */}
        {showDescriptions && hasDescription(word.word) && (
          <div 
            title={isFound ? "Click to view description" : "Find this word to unlock its description"}
            onClick={() => {
              if (isFound) {
                onWordClick(word.word);
              }
            }}
            style={{
              cursor: isFound ? 'pointer' : 'not-allowed'
            }}
          >
            <Info 
              size={14} 
              style={{ 
                color: isFound ? word.color : 'rgba(255, 255, 255, 0.4)',
                opacity: isFound ? 1 : 0.5,
                transition: 'all 0.3s'
              }} 
            />
          </div>
        )}
      </div>

      {/* Decorative elements for found words */}
      {isFound && (
        <div style={{ 
          marginLeft: 'auto', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          {iconType === 'star' ? (
            <Star 
              size={14} 
              style={{ 
                color: word.color,
                animation: 'pulse-glow 2s ease-in-out infinite'
              }} 
            />
          ) : (
            <Sparkles 
              size={14} 
              style={{ 
                color: word.color,
                animation: 'pulse-glow 2s ease-in-out infinite'
              }} 
            />
          )}
          <div
            style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: word.color,
              animation: 'pulse-glow 2s ease-in-out infinite'
            }}
          />
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const WordListItem = React.memo(WordListItemComponent, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return (
    prevProps.word.word === nextProps.word.word &&
    prevProps.word.color === nextProps.word.color &&
    prevProps.isFound === nextProps.isFound &&
    prevProps.index === nextProps.index &&
    prevProps.isMobile === nextProps.isMobile &&
    prevProps.showDescriptions === nextProps.showDescriptions &&
    // Shallow comparison for theme object
    prevProps.theme.primary === nextProps.theme.primary &&
    prevProps.theme.secondary === nextProps.theme.secondary &&
    prevProps.theme.cellBg === nextProps.theme.cellBg
  );
});