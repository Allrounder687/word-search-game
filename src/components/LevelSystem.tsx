import { useState, useEffect } from 'react';
import { Trophy, ArrowRight, Star, Award } from 'lucide-react';
import type { GameSettings } from '../types/game';

// Create a placeholder wordGenerator that will be replaced with the actual one
let wordGenerator = {
  generateWordsForLevel: (_: number) => ['PLACEHOLDER'],
  setCategories: (_: string[]) => {}
};

// Dynamically import the wordGenerator to avoid issues with circular dependencies
import('../utils/wordGenerator').then(module => {
  wordGenerator = module.wordGenerator;
});

interface LevelSystemProps {
  theme: any;
  onStartLevel: (level: number, settings: GameSettings) => void;
  currentSettings: GameSettings;
}

export const LevelSystem: React.FC<LevelSystemProps> = ({ theme, onStartLevel, currentSettings }) => {
  const [currentLevel, _setCurrentLevel] = useState<number>(() => {
    const savedLevel = localStorage.getItem('wordSearchCurrentLevel');
    return savedLevel ? parseInt(savedLevel) : 1;
  });
  
  const [highestLevel, setHighestLevel] = useState<number>(() => {
    const savedHighestLevel = localStorage.getItem('wordSearchHighestLevel');
    return savedHighestLevel ? parseInt(savedHighestLevel) : 1;
  });
  
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  
  // Save level progress to localStorage
  useEffect(() => {
    localStorage.setItem('wordSearchCurrentLevel', currentLevel.toString());
    
    if (currentLevel > highestLevel) {
      setHighestLevel(currentLevel);
      localStorage.setItem('wordSearchHighestLevel', currentLevel.toString());
    }
  }, [currentLevel, highestLevel]);
  
  // Start a level with the appropriate settings
  const startLevel = (level: number) => {
    // Get difficulty based on level
    const difficulty = level < 5 ? 'easy' : level < 10 ? 'medium' : 'hard';
    
    // Generate words for this level
    const words = wordGenerator.generateWordsForLevel(level);
    
    // Create settings for this level
    const levelSettings: GameSettings = {
      ...currentSettings,
      difficulty: difficulty as any,
      customWords: words,
      // Adjust grid size based on level
      gridSize: Math.min(10 + Math.floor(level / 5), 20)
    };
    
    // Start the level
    onStartLevel(level, levelSettings);
    setShowLevelSelector(false);
  };
  
  // Calculate stars for a level (1-3 stars based on completion)
  const getStarsForLevel = (level: number): number => {
    if (level > highestLevel) return 0;
    if (level === highestLevel) return 1;
    if (level <= highestLevel - 5) return 3;
    if (level <= highestLevel - 2) return 2;
    return 1;
  };
  
  // Generate level buttons
  const renderLevelButtons = () => {
    const buttons = [];
    const maxLevelToShow = Math.min(highestLevel + 2, 100);
    
    for (let i = 1; i <= maxLevelToShow; i++) {
      const stars = getStarsForLevel(i);
      const isLocked = i > highestLevel + 1;
      
      buttons.push(
        <button
          key={i}
          onClick={() => !isLocked && startLevel(i)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            backgroundColor: isLocked 
              ? 'rgba(255, 255, 255, 0.1)' 
              : i === currentLevel 
                ? theme.secondary + '40'
                : theme.cellBg,
            border: `2px solid ${i === currentLevel ? theme.secondary : 'transparent'}`,
            color: isLocked ? 'rgba(255, 255, 255, 0.3)' : theme.primary,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isLocked ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            if (!isLocked) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLocked) {
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{i}</div>
          
          {/* Stars indicator */}
          {stars > 0 && (
            <div style={{ 
              display: 'flex', 
              gap: '2px',
              marginTop: '4px'
            }}>
              {[...Array(stars)].map((_, index) => (
                <Star 
                  key={index} 
                  size={10} 
                  fill={theme.secondary} 
                  color={theme.secondary} 
                />
              ))}
            </div>
          )}
          
          {/* Lock indicator */}
          {isLocked && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '6px'
            }}>
              🔒
            </div>
          )}
        </button>
      );
    }
    
    return buttons;
  };
  
  return (
    <>
      {/* Level button */}
      <button
        onClick={() => setShowLevelSelector(true)}
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
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Select Level"
      >
        <Trophy size={20} />
        <span>Level {currentLevel}</span>
      </button>
      
      {/* Level selector modal */}
      {showLevelSelector && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 60,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: `1px solid ${theme.secondary}80`,
            padding: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: theme.primary,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Trophy size={24} style={{ color: theme.secondary }} />
                Select Level
              </h2>
              <button
                onClick={() => setShowLevelSelector(false)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  color: theme.primary,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.cellHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            </div>
            
            {/* Current level info */}
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: theme.cellBg,
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  opacity: 0.7,
                  color: theme.primary
                }}>
                  Current Level
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: theme.primary
                }}>
                  Level {currentLevel}
                </div>
              </div>
              
              <button
                onClick={() => startLevel(currentLevel)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  backgroundColor: theme.secondary,
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span>Play</span>
                <ArrowRight size={16} />
              </button>
            </div>
            
            {/* Next level button */}
            {currentLevel < highestLevel + 1 && (
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: theme.secondary + '20',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: `1px solid ${theme.secondary}40`
              }}>
                <div>
                  <div style={{ 
                    fontSize: '14px', 
                    opacity: 0.7,
                    color: theme.primary
                  }}>
                    Next Challenge
                  </div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold',
                    color: theme.primary
                  }}>
                    Level {currentLevel + 1}
                  </div>
                </div>
                
                <button
                  onClick={() => startLevel(currentLevel + 1)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    backgroundColor: theme.secondary,
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span>Play Next</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
            
            {/* Level grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
              gap: '12px'
            }}>
              {renderLevelButtons()}
            </div>
            
            {/* Level info */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: theme.cellBg,
              fontSize: '14px',
              color: theme.primary,
              opacity: 0.8
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '8px'
              }}>
                <Award size={16} style={{ color: theme.secondary }} />
                <span>Complete levels to unlock new challenges</span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px'
              }}>
                <Star size={16} fill={theme.secondary} color={theme.secondary} />
                <span>Earn stars by completing levels</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};