import React from 'react';
import { Check, Star, Sparkles, Info } from 'lucide-react';
import type { WordPlacement, ThemeColors } from '../types/game';

interface WordListItemProps {
  word: WordPlacement;
  index: number;
  theme: ThemeColors;
  showDescriptions: boolean;
  hasDescription: (word: string) => boolean;
  onSelectWord: (word: string) => void;
  isMobileLayout: boolean;
}

export const WordListItem: React.FC<WordListItemProps> = ({
  word,
  index,
  theme,
  showDescriptions,
  hasDescription,
  onSelectWord,
  isMobileLayout
}) => {
  const isFound = word.found;

  // Handle click on info button
  const handleInfoClick = () => {
    if (isFound) {
      onSelectWord(word.word);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && isFound) {
      onSelectWord(word.word);
    }
  };

  return (
    <div
      key={`${word.word}-${index}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobileLayout ? '4px' : '12px',
        padding: isMobileLayout ? '6px 8px' : '12px',
        borderRadius: '6px',
        transition: 'all 0.3s',
        backgroundColor: isFound ? word.color + '20' : theme.cellBg,
        borderBottom: isFound ? `2px solid ${word.color}` : '2px solid transparent',
        borderLeft: !isMobileLayout && isFound ? `4px solid ${word.color}` : isMobileLayout ? undefined : '4px solid transparent',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isFound ? `0 0 10px rgba(255, 255, 255, 0.3)` : 'none',
        minHeight: isMobileLayout ? '36px' : '44px',
        minWidth: isMobileLayout ? 'fit-content' : undefined,
        maxWidth: isMobileLayout ? '120px' : undefined,
        flexShrink: isMobileLayout ? 0 : undefined,
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent'
      }}
      onMouseEnter={(e) => {
        if (!isFound) {
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isFound) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
      onTouchStart={(e) => {
        if (!isFound) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.backgroundColor = `${theme.cellBg}80`;
        }
      }}
      onTouchEnd={(e) => {
        if (!isFound) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = theme.cellBg;
        }
      }}
      onTouchCancel={(e) => {
        if (!isFound) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = theme.cellBg;
        }
      }}
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

      <div
        style={{
          width: isMobileLayout ? '18px' : '24px',
          height: isMobileLayout ? '18px' : '24px',
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
          <Check size={isMobileLayout ? 10 : 14} style={{ animation: 'bounce 1s infinite' }} />
        ) : (
          <span style={{ fontSize: isMobileLayout ? '10px' : '12px', fontWeight: 'bold' }}>{index + 1}</span>
        )}
      </div>

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
            textShadow: isFound ? `0 0 10px ${word.color}40` : 'none',
            fontSize: isMobileLayout ? '11px' : '14px',
            whiteSpace: isMobileLayout ? 'nowrap' : 'normal',
            overflow: isMobileLayout ? 'hidden' : 'visible',
            textOverflow: isMobileLayout ? 'ellipsis' : 'clip',
            maxWidth: isMobileLayout ? '80px' : 'none'
          }}
        >
          {word.word}
        </span>

        {/* Info icon for words with descriptions */}
        {showDescriptions && hasDescription(word.word) && (
          <button
            title={isFound ? "Click to view description" : "Find this word to unlock its description"}
            onClick={handleInfoClick}
            onKeyDown={handleKeyDown}
            style={{
              cursor: isFound ? 'pointer' : 'not-allowed',
              background: 'transparent',
              border: 'none',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            disabled={!isFound}
            aria-label={isFound ? `View description for ${word.word}` : `Description for ${word.word} locked`}
            tabIndex={isFound ? 0 : -1}
          >
            <Info
              size={14}
              style={{
                color: isFound ? word.color : 'rgba(255, 255, 255, 0.4)',
                opacity: isFound ? 1 : 0.5,
                transition: 'all 0.3s'
              }}
            />
          </button>
        )}
      </div>

      {isFound && (
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {Math.random() > 0.5 ? (
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