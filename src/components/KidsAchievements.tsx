import { useState, useEffect } from 'react';
import { Award, Star, Medal } from 'lucide-react';
import type { KidsAchievement } from '../types/kidsMode';
import { KIDS_ACHIEVEMENTS, checkForAchievements } from '../types/kidsMode';

interface KidsAchievementsProps {
  theme: any;
  foundWords: string[];
  kidsMode: boolean;
}

export const KidsAchievements: React.FC<KidsAchievementsProps> = ({ theme, foundWords, kidsMode }) => {
  const [achievements, setAchievements] = useState<KidsAchievement[]>(KIDS_ACHIEVEMENTS);
  const [showAchievements, setShowAchievements] = useState(false);
  const [newAchievement, setNewAchievement] = useState<KidsAchievement | null>(null);
  
  // Check for new achievements when foundWords changes
  useEffect(() => {
    if (!kidsMode) return;
    
    const updatedAchievements = checkForAchievements(foundWords);
    
    // Find newly unlocked achievements
    const newlyUnlocked = updatedAchievements.find(
      (achievement, index) => achievement.unlocked && !achievements[index].unlocked
    );
    
    if (newlyUnlocked) {
      setNewAchievement(newlyUnlocked);
      
      // Save achievements to localStorage
      localStorage.setItem('kidsAchievements', JSON.stringify(updatedAchievements));
      
      // Show celebration and hide after 5 seconds
      setTimeout(() => {
        setNewAchievement(null);
      }, 5000);
    }
    
    setAchievements(updatedAchievements);
  }, [foundWords, kidsMode, achievements]);
  
  // Load achievements from localStorage on mount
  useEffect(() => {
    const savedAchievements = localStorage.getItem('kidsAchievements');
    if (savedAchievements) {
      try {
        setAchievements(JSON.parse(savedAchievements));
      } catch (e) {
        console.error('Failed to parse saved achievements:', e);
      }
    }
  }, []);
  
  // Don't render if kids mode is disabled
  if (!kidsMode) return null;
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  
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
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="View Achievements"
      >
        <Award size={20} />
        
        {/* Badge count */}
        {unlockedCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: theme.accent,
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {unlockedCount}
          </div>
        )}
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
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            maxWidth: '500px',
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
                <Award size={24} style={{ color: theme.secondary }} />
                My Achievements
              </h2>
              <button
                onClick={() => setShowAchievements(false)}
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
            
            {/* Achievement List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: achievement.unlocked 
                      ? `${theme.secondary}20` 
                      : theme.cellBg,
                    border: achievement.unlocked 
                      ? `2px solid ${theme.secondary}` 
                      : `1px solid ${theme.secondary}40`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    opacity: achievement.unlocked ? 1 : 0.6
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: achievement.unlocked 
                      ? theme.secondary 
                      : 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    {achievement.unlocked ? achievement.icon : '🔒'}
                  </div>
                  
                  <div>
                    <div style={{
                      fontWeight: 'bold',
                      fontSize: '18px',
                      color: theme.primary,
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {achievement.title}
                      {achievement.unlocked && (
                        <Star size={16} fill={theme.secondary} color={theme.secondary} />
                      )}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: theme.primary,
                      opacity: 0.8
                    }}>
                      {achievement.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Progress Summary */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: theme.cellBg,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '14px',
                color: theme.primary,
                opacity: 0.8,
                marginBottom: '8px'
              }}>
                You've earned {unlockedCount} out of {achievements.length} badges!
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '4px'
              }}>
                {[...Array(achievements.length)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '16px',
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: i < unlockedCount 
                        ? theme.secondary 
                        : 'rgba(255, 255, 255, 0.2)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* New Achievement Celebration */}
      {newAchievement && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 70,
          pointerEvents: 'none'
        }}>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '320px',
            textAlign: 'center',
            animation: 'bounce-in 0.6s ease-out forwards',
            border: `3px solid ${theme.secondary}`,
            boxShadow: `0 0 30px ${theme.secondary}80`
          }}>
            <div style={{
              fontSize: '24px',
              marginBottom: '16px',
              animation: 'pulse-glow 2s ease-in-out infinite'
            }}>
              🎉 New Achievement! 🎉
            </div>
            
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: theme.secondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              margin: '0 auto 16px',
              animation: 'pulse-glow 2s ease-in-out infinite'
            }}>
              {newAchievement.icon}
            </div>
            
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: theme.secondary,
              marginBottom: '8px'
            }}>
              {newAchievement.title}
            </div>
            
            <div style={{
              fontSize: '16px',
              color: theme.primary,
              marginBottom: '16px'
            }}>
              {newAchievement.description}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <Medal size={20} style={{ color: theme.secondary }} />
              <Star size={20} style={{ color: theme.secondary }} />
              <Medal size={20} style={{ color: theme.secondary }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};