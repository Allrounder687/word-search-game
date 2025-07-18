import { Clock, Trophy, Zap, Settings, RotateCcw, ZoomIn, MousePointer } from 'lucide-react';
import { getResponsiveIconSize, getCompactMobilePadding } from '../utils/responsiveLayout';

interface GameHeaderProps {
  score: number;
  timeElapsed: number;
  foundWords: number;
  totalWords: number;
  onReset: () => void;
  onSettings: () => void;
  onToggleZoom?: () => void;
  onToggleClickMode?: () => void;
  isZoomed?: boolean;
  isClickMode?: boolean;
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
  onToggleZoom,
  onToggleClickMode,
  isZoomed,
  isClickMode,
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
  
  // Get responsive sizes for mobile
  const iconSize = getResponsiveIconSize(20);
  const padding = getCompactMobilePadding(24);
  const isMobile = !isDesktop;

  return (
    <div 
      style={{ 
        width: '100%',
        padding: isMobile ? padding : '24px',
        paddingRight: isMobile ? '8px' : '24px', // Ensure enough padding on the right side
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        marginBottom: isMobile ? '12px' : '24px',
        backgroundColor: theme.gridBg,
        boxSizing: 'border-box' // Ensure padding is included in width calculation
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '8px' : '16px',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        {/* Title */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '8px' : '12px',
          flexShrink: 0
        }}>
          <div className="animate-float">
            <Zap size={isMobile ? 24 : 32} style={{ color: theme.secondary }} />
          </div>
          <div>
            <h1 
              style={{ 
                fontSize: isMobile ? '20px' : '30px',
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
            {!isMobile && (
              <div style={{
                fontSize: '12px',
                opacity: 0.7,
                color: theme.primary,
                marginTop: '2px'
              }}>
                by FaiXal SD
              </div>
            )}
          </div>
        </div>

        {/* Stats - Compact for mobile */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '12px' : '24px', 
          flexWrap: 'nowrap',
          justifyContent: 'center',
          flexGrow: 1
        }}>
          {/* Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px' }}>
            <Trophy size={iconSize} style={{ color: theme.accent }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: isMobile ? '10px' : '12px', 
                opacity: 0.75, 
                color: theme.primary 
              }}>Score</div>
              <div 
                style={{ 
                  fontSize: isMobile ? '14px' : '18px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px' }}>
            <Clock size={iconSize} style={{ color: theme.secondary }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: isMobile ? '10px' : '12px', 
                opacity: 0.75, 
                color: theme.primary 
              }}>
                {timeRemaining !== null ? 'Time' : 'Time'}
              </div>
              <div 
                style={{ 
                  fontSize: isMobile ? '14px' : '18px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px' }}>
            <div 
              style={{ 
                width: isMobile ? '24px' : '32px',
                height: isMobile ? '24px' : '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: 'bold',
                backgroundColor: theme.accent + '20',
                color: theme.accent,
                border: `2px solid ${theme.accent}`
              }}
            >
              {Math.round(completionPercentage)}%
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: isMobile ? '10px' : '12px', 
                opacity: 0.75, 
                color: theme.primary 
              }}>Found</div>
              <div 
                style={{ 
                  fontSize: isMobile ? '14px' : '18px',
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

        {/* Controls - Single row for mobile */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '2px' : '8px', 
          flexWrap: 'nowrap',
          flexShrink: 0,
          marginLeft: isMobile ? '0' : 0,
          marginRight: isMobile ? '0' : 0,
          position: isMobile ? 'relative' : 'static',
          right: isMobile ? '0' : 'auto'
        }}>
          {/* Click Mode Button (Mobile only) */}
          {isMobile && onToggleClickMode && (
            <button
              onClick={onToggleClickMode}
              style={{ 
                padding: '6px',
                borderRadius: '6px',
                transition: 'all 0.2s',
                cursor: 'pointer',
                border: `1px solid ${theme.secondary}40`,
                backgroundColor: isClickMode ? `${theme.secondary}40` : theme.cellBg,
                color: isClickMode ? theme.secondary : theme.primary,
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={isClickMode ? "Drag Mode" : "Click Mode"}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <MousePointer size={14} />
            </button>
          )}

          {/* Zoom Button (Mobile only) */}
          {isMobile && onToggleZoom && (
            <button
              onClick={onToggleZoom}
              style={{ 
                padding: '6px',
                borderRadius: '6px',
                transition: 'all 0.2s',
                cursor: 'pointer',
                border: `1px solid ${theme.secondary}40`,
                backgroundColor: isZoomed ? `${theme.secondary}40` : theme.cellBg,
                color: isZoomed ? theme.secondary : theme.primary,
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={isZoomed ? "Zoom Out" : "Zoom In"}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <ZoomIn size={14} />
            </button>
          )}
          
          {/* Reset Button */}
          <button
            onClick={onReset}
            style={{ 
              padding: isMobile ? '6px' : '12px',
              borderRadius: isMobile ? '6px' : '8px',
              transition: 'all 0.2s',
              cursor: 'pointer',
              border: `1px solid ${theme.secondary}40`,
              backgroundColor: theme.cellBg,
              color: theme.primary,
              width: isMobile ? '32px' : '44px',
              height: isMobile ? '32px' : '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="New Game"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <RotateCcw size={isMobile ? 14 : iconSize} />
          </button>
          
          {/* Settings Button */}
          <button
            onClick={onSettings}
            style={{ 
              padding: isMobile ? '6px' : '12px',
              borderRadius: isMobile ? '6px' : '8px',
              transition: 'all 0.2s',
              cursor: 'pointer',
              border: `1px solid ${theme.secondary}40`,
              backgroundColor: theme.cellBg,
              color: theme.primary,
              width: isMobile ? '32px' : '44px',
              height: isMobile ? '32px' : '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Settings"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Settings size={isMobile ? 14 : iconSize} />
          </button>
        </div>
      </div>

      {/* Progress Bar - More vibrant for mobile */}
      <div style={{ marginTop: isMobile ? '12px' : '16px' }}>
        <div 
          style={{ 
            width: '100%',
            height: isMobile ? '6px' : '8px',
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
              width: `${completionPercentage}%`,
              boxShadow: isMobile ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};