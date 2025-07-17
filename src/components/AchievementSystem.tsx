import { useState, useEffect } from 'react';
import { Trophy, Award, X } from 'lucide-react';
import type { Achievement } from '../types/game';

interface AchievementSystemProps {
  theme: any;
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({ theme }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  
  // Load achievements from localStorage on mount
  useEffect(() => {
    const savedAchievements = localStorage.getItem('wordSearchAchievements');
    if (savedAchievements) {
      try {
        const parsed = JSON.parse(savedAchievements);
        setAchievements(parsed);
      } catch (e) {
        console.error('Failed to parse achievements:', e);
      }
    } else {
      // Initialize with default achievements from game.ts
      import('../types/game').then(({ ACHIEVEMENTS }) => {
        setAchievements(ACHIEVEMENTS);
        localStorage.setItem('wordSearchAchievements', JSON.stringify(ACHIEVEMENTS));
      });
    }
  }, []);

  // Save achievements to localStorage when they change
  useEffect(() => {
    if (achievements.length > 0) {
      localStorage.setItem('wordSearchAchievements', JSON.stringify(achievements));
    }
  }, [achievements]);

  // Show achievement animation when a new one is unlocked
  const unlockAchievement = (id: string) => {
    const achievement = achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
      const updatedAchievements = achievements.map(a => 
        a.id === id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
      );
      setAchievements(updatedAchievements);
      setNewAchievement({ ...achievement, unlocked: true, unlockedAt: Date.now() });
      
      // Hide the notification after 5 seconds
      setTimeout(() => {
        setNewAchievement(null);
      }, 5000);
    }
  };

  // Update achievement progress
  const updateAchievementProgress = (id: string, progress: number) => {
    const achievement = achievements.find(a => a.id === id);
    if (achievement && !achievement.unlocked && achievement.goal) {
      const updatedProgress = Math.min(progress, achievement.goal);
      
      // Check if the achievement should be unlocked
      if (updatedProgress >= achievement.goal) {
        unlockAchievement(id);
      } else {
        // Just update the progress
        const updatedAchievements = achievements.map(a => 
          a.id === id ? { ...a, progress: updatedProgress } : a
        );
        setAchievements(updatedAchievements);
      }
    }
  };

  // Calculate total progress
  const totalProgress = achievements.length > 0 
    ? Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100) 
    : 0;

  // For external components to access these methods
  useEffect(() => {
    // Expose methods globally for other components to use
    window.achievementSystem = {
      unlockAchievement,
      updateAchievementProgress,
      getAchievements: () => achievements
    };
  }, [achievements]);

  const isWhiteTheme = theme.primary === '#000000';

  return (
    <>
      {/* Achievement Button */}
      <button
        onClick={() => setShowAchievements(true)}
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
        title="View Achievements"
      >
        <Trophy size={20} />
        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{totalProgress}%</div>
      </button>

      {/* Achievements Modal */}
      {showAchievements && (
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
            backgroundColor: isWhiteTheme 
              ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(59, 130, 246, 0.85) 100%)' 
              : 'rgba(0, 0, 0, 0.8)',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: `1px solid ${theme.secondary}80`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px',
              borderBottom: `1px solid ${theme.secondary}40`
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: isWhiteTheme ? '#ffffff' : theme.primary,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Trophy size={24} style={{ color: theme.secondary }} />
                Achievements
                <span style={{ 
                  fontSize: '16px', 
                  opacity: 0.8,
                  backgroundColor: theme.secondary + '30',
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}>
                  {achievements.filter(a => a.unlocked).length}/{achievements.length}
                </span>
              </h2>
              <button
                onClick={() => setShowAchievements(false)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  color: isWhiteTheme ? '#ffffff' : theme.primary,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isWhiteTheme ? 'rgba(255, 255, 255, 0.2)' : theme.cellHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth >= 768 ? '1fr 1fr' : '1fr',
                gap: '16px'
              }}>
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: achievement.unlocked 
                        ? theme.secondary + '30' 
                        : theme.cellBg,
                      border: `1px solid ${achievement.unlocked ? theme.secondary : 'transparent'}`,
                      opacity: achievement.unlocked ? 1 : 0.7,
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        fontSize: '32px',
                        filter: achievement.unlocked ? 'none' : 'grayscale(1)'
                      }}>
                        {achievement.icon}
                      </div>
                      <div>
                        <div style={{
                          fontWeight: 'bold',
                          color: isWhiteTheme ? '#ffffff' : theme.primary,
                          fontSize: '16px'
                        }}>
                          {achievement.title}
                        </div>
                        <div style={{
                          color: isWhiteTheme ? 'rgba(255, 255, 255, 0.7)' : theme.primary + '80',
                          fontSize: '14px'
                        }}>
                          {achievement.description}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar for achievements with goals */}
                    {achievement.goal && (
                      <div style={{
                        marginTop: '8px',
                        width: '100%',
                        height: '6px',
                        backgroundColor: theme.cellBg,
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${((achievement.progress || 0) / achievement.goal) * 100}%`,
                          backgroundColor: achievement.unlocked ? theme.secondary : theme.accent,
                          transition: 'width 0.5s ease-out'
                        }} />
                        <div style={{
                          fontSize: '12px',
                          textAlign: 'center',
                          marginTop: '4px',
                          color: isWhiteTheme ? '#ffffff' : theme.primary + '80'
                        }}>
                          {achievement.progress || 0}/{achievement.goal}
                        </div>
                      </div>
                    )}

                    {/* Unlock date */}
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div style={{
                        fontSize: '12px',
                        marginTop: '8px',
                        color: isWhiteTheme ? 'rgba(255, 255, 255, 0.6)' : theme.primary + '60',
                        textAlign: 'right'
                      }}>
                        Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Achievement Animation */}
      {newAchievement && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          border: `2px solid ${theme.secondary}`,
          color: '#ffffff',
          zIndex: 70,
          maxWidth: '300px',
          animation: 'slideIn 0.5s ease-out forwards'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <Award size={24} style={{ color: theme.secondary }} />
            <div style={{ fontWeight: 'bold', color: theme.secondary }}>
              Achievement Unlocked!
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ fontSize: '32px' }}>
              {newAchievement.icon}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {newAchievement.title}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                {newAchievement.description}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  );
};

// Add type definition for the global window object
declare global {
  interface Window {
    achievementSystem: {
      unlockAchievement: (id: string) => void;
      updateAchievementProgress: (id: string, progress: number) => void;
      getAchievements: () => Achievement[];
    };
  }
}