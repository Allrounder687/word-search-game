import React, { useMemo } from 'react';
import { Check, Star, Sparkles, Info } from 'lucide-react';
import type { WordPlacement } from '../types/game';

interface WordListItemProps {
  word: WordPlacement;
  index: number;
  isFound: boolean;
  theme: any;
  showDescriptions: boolean;
  hasDescription: (word: string) => boolean;
  onWordClick: (word: string) => void;
  isMobile?: boolean;
}

export const WordListItem: React.FC<WordListItemProps> = ({
  word,
  index,
  isFound,
  theme,
  showDescriptions,
  hasDescription,
  onWordClick,
  isMobile = false
}) => {
  // Memoize the random icon selection to prevent re-renders
  const iconType = useMemo(() => Math.random() > 0.5 ? 'star' : 'sparkles', [word.word]);

  const baseStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '8px' : '12px',
    padding: isMobile ? '8px 12px' : '12px',
    borderRadius: '8px',
    transition: 'all 0.3s',
    backgroundColor: isFound ? word.color + '20' : theme.cellBg,
    borderLeft: !isMobile && isFound ? `4px solid ${word.color}` : undefined,
    borderBottom: isMobile && isFound ? `2px solid ${word.color}` : '2px solid transparent',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    boxShadow: isFound ? `0 0 10px rgba(255, 255, 255, 0.3)` : 'none',
    minHeight: isMobile ? '36px' : '44px',
    minWidth: isMobile ? 'fit-content' : undefined,
    flexShrink: isMobile ? 0 : undefined,
    touchAction: 'manipulation' as const
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFound) {
      e.currentTarget.style.transform = 'scale(1.05)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFound) {
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isFound) {
      e.currentTarget.style.transform = 'scale(1.05)';
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isFound) {
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  return (
    <div
      style={baseStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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