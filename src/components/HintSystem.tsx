import { useState } from 'react';
import { Lightbulb, Eye, Zap } from 'lucide-react';
import type { WordPlacement } from '../types/game';

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

  const unFoundWords = words.filter(w => !w.found);

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

  if (unFoundWords.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowHintMenu(!showHintMenu)}
        disabled={hintsRemaining === 0}
        className={`rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
          hintsRemaining === 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{
          backgroundColor: theme.cellBg,
          color: theme.primary,
          border: `1px solid ${theme.secondary}40`,
          padding: window.innerWidth < 480 ? '6px' : '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: window.innerWidth < 480 ? '32px' : '44px',
          height: window.innerWidth < 480 ? '32px' : '44px'
        }}
        title={`Hints remaining: ${hintsRemaining}`}
      >
        <div className="flex items-center gap-1">
          <Lightbulb size={window.innerWidth < 480 ? 14 : 20} />
          <span className={`${window.innerWidth < 480 ? 'text-xs' : 'text-sm'} font-bold`}>{hintsRemaining}</span>
        </div>
      </button>

      {showHintMenu && (
        <div
          className="absolute top-full right-0 mt-2 p-4 rounded-lg shadow-2xl z-50 min-w-64"
          style={{
            backgroundColor: theme.gridBg,
            border: `1px solid ${theme.secondary}40`
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Eye size={16} style={{ color: theme.secondary }} />
            <span className="text-sm font-semibold" style={{ color: theme.primary }}>
              Choose a word for hint
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {unFoundWords.map((word, index) => (
              <button
                key={`${word.word}-${index}`}
                onClick={() => useHint(word)}
                className="w-full p-3 rounded-lg text-left transition-all duration-200 hover:scale-102"
                style={{
                  backgroundColor: theme.cellBg,
                  color: theme.primary,
                  border: `1px solid transparent`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                }}
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

          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="text-xs opacity-75 text-center">
              Hints will highlight the first letter of the word
            </div>
          </div>
        </div>
      )}
    </div>
  );
};