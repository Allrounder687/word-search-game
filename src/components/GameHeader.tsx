
import { Clock, Trophy, Zap, Settings, RotateCcw, Palette, Sparkles, ZoomIn } from 'lucide-react';

interface GameHeaderProps {
  score: number;
  timeElapsed: number;
  foundWords: number;
  totalWords: number;
  onReset: () => void;
  onSettings: () => void;
  onToggleCategory?: () => void;
  onToggleTheme?: () => void;
  onToggleZoom?: () => void;
  isZoomed?: boolean;
  theme: any;
  isDesktop: boolean;
  timeRemaining?: number | null;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  timeElapsed,
  foundWords,
  totalWords,
  onReset,
  onSettings,
  onToggleCategory,
  onToggleTheme,
  onToggleZoom,
  isZoomed,
  theme,
  isDesktop = false,
  timeRemaining = null
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completionPercentage = (foundWords / totalWords) * 100;

  return (
    <div 
      style={{ 
        width: '100%',
        padding: window.innerWidth >= 768 ? '24px' : '16px',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        marginBottom: window.innerWidth >= 768 ? '24px' : '16px',
        backgroundColor: theme.gridBg 
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: window.innerWidth >= 768 ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="animate-float">
            <Zap size={32} style={{ color: theme.secondary }} />
          </div>
          <div>
            <h1 
              style={{ 
                fontSize: window.innerWidth >= 768 ? '30px' : '24px',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #ffffff, #d1d5db)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'Inter, sans-serif',
                margin: 0
              }}
            >
              WordZilla
            </h1>
            <div style={{
              fontSize: '12px',
              opacity: 0.7,
              color: theme.primary,
              marginTop: '2px'
            }}>
              by FaiXal SD
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={20} style={{ color: theme.accent }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', opacity: 0.75, color: theme.primary }}>Score</div>
              <div 
                style={{ 
                  fontSize: '18px',
                  fontWeight: 'bold',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: theme.primary 
                }}
              >
                {score.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} style={{ color: theme.secondary }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', opacity: 0.75, color: theme.primary }}>
                {timeRemaining !== null ? 'Countdown' : 'Time'}
              </div>
              <div 
                style={{ 
                  fontSize: '18px',
                  fontWeight: 'bold',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: timeRemaining !== null && timeRemaining < 30 ? '#ef4444' : theme.primary,
                  animation: timeRemaining !== null && timeRemaining < 10 ? 'pulse 1s infinite' : 'none'
                }}
              >
                {timeRemaining !== null ? formatTime(timeRemaining) : formatTime(timeElapsed)}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{ 
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: theme.accent + '20',
                color: theme.accent,
                border: `2px solid ${theme.accent}`
              }}
            >
              {Math.round(completionPercentage)}%
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', opacity: 0.75, color: theme.primary }}>Found</div>
              <div 
                style={{ 
                  fontSize: '18px',
                  fontWeight: 'bold',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: theme.primary 
                }}
              >
                {foundWords}/{totalWords}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Timer Mode Button */}
          <button
            onClick={() => onSettings()}
            style={{ 
              padding: '12px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              cursor: 'pointer',
              border: `1px solid ${theme.secondary}40`,
              backgroundColor: theme.cellBg,
              color: theme.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px'
            }}
            title="Timer Mode"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Clock size={20} />
          </button>
          
          {/* Kids Mode Button */}
          <button
            onClick={() => onSettings()}
            style={{ 
              padding: '12px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              cursor: 'pointer',
              border: `1px solid ${theme.secondary}40`,
              backgroundColor: theme.cellBg,
              color: theme.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px'
            }}
            title="Kids Mode"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{ fontSize: '20px' }}>👶</span>
          </button>
          
          {/* Category Button (Desktop only) */}
          {isDesktop && onToggleCategory && (
            <button
              onClick={onToggleCategory}
              style={{ 
                padding: '12px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                cursor: 'pointer',
                border: `1px solid ${theme.secondary}40`,
                backgroundColor: theme.cellBg,
                color: theme.primary
              }}
              title="Categories"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Sparkles size={20} />
            </button>
          )}
          
          {/* Theme Button (Desktop only) */}
          {isDesktop && onToggleTheme && (
            <button
              onClick={onToggleTheme}
              style={{ 
                padding: '12px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                cursor: 'pointer',
                border: `1px solid ${theme.secondary}40`,
                backgroundColor: theme.cellBg,
                color: theme.primary
              }}
              title="Themes"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Palette size={20} />
            </button>
          )}
          
          {/* Zoom Button (Mobile only) */}
          {!isDesktop && onToggleZoom && (
            <button
              onClick={onToggleZoom}
              style={{ 
                padding: '12px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                cursor: 'pointer',
                border: `1px solid ${theme.secondary}40`,
                backgroundColor: isZoomed ? `${theme.secondary}40` : theme.cellBg,
                color: isZoomed ? theme.secondary : theme.primary
              }}
              title={isZoomed ? "Zoom Out" : "Zoom In"}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <ZoomIn size={20} />
            </button>
          )}
          
          {/* Reset Button */}
          <button
            onClick={onReset}
            style={{ 
              padding: '12px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              cursor: 'pointer',
              border: `1px solid ${theme.secondary}40`,
              backgroundColor: theme.cellBg,
              color: theme.primary
            }}
            title="New Game"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <RotateCcw size={20} />
          </button>
          
          {/* Settings Button */}
          <button
            onClick={onSettings}
            style={{ 
              padding: '12px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              cursor: 'pointer',
              border: `1px solid ${theme.secondary}40`,
              backgroundColor: theme.cellBg,
              color: theme.primary
            }}
            title="Settings"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginTop: '16px' }}>
        <div 
          style={{ 
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.1)' 
          }}
        >
          <div
            className="animate-rainbow"
            style={{ 
              height: '100%',
              transition: 'all 0.5s ease-out',
              width: `${completionPercentage}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};