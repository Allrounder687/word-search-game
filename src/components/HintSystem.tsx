import { useState, useEffect, useRef, useCallback } from 'react';
import { Lightbulb, Eye, Zap, X } from 'lucide-react';
import type { WordPlacement } from '../types/game';
import { useResponsive } from '../hooks/useResponsive';
import { getViewportDimensions } from '../utils/viewportHelper';

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
  const [selectedHintType] = useState<'letter' | 'direction' | 'highlight'>('letter');
  const hintButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const breakpoints = useResponsive();
  const { isMobile, isTablet } = breakpoints;
  const viewport = getViewportDimensions();

  const unFoundWords = words.filter(w => !w.found);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target) &&
          hintButtonRef.current && !hintButtonRef.current.contains(target)) {
        setShowHintMenu(false);
      }
    };

    if (showHintMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showHintMenu]);

  const getRandomUnfoundWord = useCallback(() => {
    if (unFoundWords.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * unFoundWords.length);
    return unFoundWords[randomIndex];
  }, [unFoundWords]);

  const useHint = useCallback((type: 'letter' | 'direction' | 'highlight') => {
    if (hintsRemaining <= 0) return;
    
    const word = getRandomUnfoundWord();
    if (!word) return;

    // Create a hint-specific word object
    const hintWord = {
      ...word,
      hintType: type,
      hintUsed: true
    };

    onHintUsed(hintWord);
    setShowHintMenu(false);
  }, [hintsRemaining, getRandomUnfoundWord, onHintUsed]);

  // Render hint button
  const renderHintButton = () => (
    <button
      ref={hintButtonRef}
      onClick={() => setShowHintMenu(!showHintMenu)}
      disabled={hintsRemaining <= 0 || unFoundWords.length === 0}
      style={{
        position: 'relative',
        padding: isMobile ? '12px' : '10px',
        borderRadius: '50%',
        backgroundColor: hintsRemaining > 0 ? theme.secondary : theme.cellBg,
        color: hintsRemaining > 0 ? 'white' : theme.primary + '60',
        border: 'none',
        cursor: hintsRemaining > 0 ? 'pointer' : 'not-allowed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        boxShadow: hintsRemaining > 0 ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none',
        width: isMobile ? '48px' : '44px',
        height: isMobile ? '48px' : '44px',
        zIndex: 1000
      }}
      onMouseEnter={(e) => {
        if (hintsRemaining > 0) {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.backgroundColor = theme.accent;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = hintsRemaining > 0 ? theme.secondary : theme.cellBg;
      }}
    >
      <Lightbulb size={isMobile ? 24 : 20} />
      {hintsRemaining > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: theme.accent,
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            border: '2px solid ' + theme.gridBg
          }}
        >
          {hintsRemaining}
        </div>
      )}
    </button>
  );

  // Render hint menu based on device type
  const renderHintMenu = () => {
    if (!showHintMenu) return null;

    const menuStyle: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1001,
      backgroundColor: theme.cellBg,
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      border: `1px solid ${theme.secondary}40`,
      minWidth: '280px',
      maxWidth: isMobile ? '90vw' : '400px'
    };

    // Position menu based on device type and available space
    if (isMobile) {
      // Bottom sheet for mobile
      Object.assign(menuStyle, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100vw - 40px)',
        maxWidth: '360px',
        borderRadius: '16px'
      });
    } else if (isTablet && viewport.isLandscape) {
      // Side menu for tablet landscape
      Object.assign(menuStyle, {
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '280px'
      });
    } else {
      // Floating menu for tablet portrait and desktop
      Object.assign(menuStyle, {
        position: 'absolute',
        top: '60px',
        right: '0px',
        width: '300px'
      });
    }

    return (
      <div ref={menuRef} style={menuStyle}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h3 style={{
            margin: 0,
            color: theme.primary,
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            Hint Options
          </h3>
          <button
            onClick={() => setShowHintMenu(false)}
            style={{
              background: 'none',
              border: 'none',
              color: theme.primary,
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Hint options */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Letter hint */}
          <button
            onClick={() => useHint('letter')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: selectedHintType === 'letter' ? theme.secondary + '20' : 'transparent',
              border: `1px solid ${theme.secondary}40`,
              borderRadius: '8px',
              color: theme.primary,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.secondary + '30';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = selectedHintType === 'letter' ? theme.secondary + '20' : 'transparent';
            }}
          >
            <div style={{
              backgroundColor: theme.secondary,
              borderRadius: '50%',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>A</span>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>First Letter</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Reveals the first letter of a word</div>
            </div>
          </button>

          {/* Direction hint */}
          <button
            onClick={() => useHint('direction')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: selectedHintType === 'direction' ? theme.secondary + '20' : 'transparent',
              border: `1px solid ${theme.secondary}40`,
              borderRadius: '8px',
              color: theme.primary,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.secondary + '30';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = selectedHintType === 'direction' ? theme.secondary + '20' : 'transparent';
            }}
          >
            <div style={{
              backgroundColor: theme.accent,
              borderRadius: '50%',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Direction</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Shows the direction of a word</div>
            </div>
          </button>

          {/* Highlight hint */}
          <button
            onClick={() => useHint('highlight')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: selectedHintType === 'highlight' ? theme.secondary + '20' : 'transparent',
              border: `1px solid ${theme.secondary}40`,
              borderRadius: '8px',
              color: theme.primary,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.secondary + '30';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = selectedHintType === 'highlight' ? theme.secondary + '20' : 'transparent';
            }}
          >
            <div style={{
              backgroundColor: theme.primary,
              borderRadius: '50%',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Eye size={16} color={theme.gridBg} />
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Highlight</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>Temporarily highlights a word</div>
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: theme.secondary + '10',
          borderRadius: '8px',
          fontSize: '12px',
          color: theme.primary,
          opacity: 0.8,
          textAlign: 'center'
        }}>
          {hintsRemaining} hint{hintsRemaining !== 1 ? 's' : ''} remaining
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      {renderHintButton()}
      {renderHintMenu()}
    </div>
  );
};