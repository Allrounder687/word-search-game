import { useState, useEffect, useCallback } from 'react';
import { Medal, X, ChevronDown, ChevronUp, Clock, Star, Zap } from 'lucide-react';
import type { LeaderboardEntry, Difficulty, ThemeColors } from '../types/game';

interface LeaderboardSystemProps {
  theme: ThemeColors;
}

export const LeaderboardSystem: React.FC<LeaderboardSystemProps> = ({ theme }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [newHighScore, setNewHighScore] = useState<LeaderboardEntry | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'time'>('score');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('wordSearchPlayerName') || 'Player';
  });
  
  // Load leaderboard from localStorage on mount
  useEffect(() => {
    const savedLeaderboard = localStorage.getItem('wordSearchLeaderboard');
    if (savedLeaderboard) {
      try {
        const parsed = JSON.parse(savedLeaderboard);
        setLeaderboard(parsed);
      } catch (e) {
        console.error('Failed to parse leaderboard:', e);
      }
    }
  }, []);

  // Save leaderboard to localStorage when it changes
  useEffect(() => {
    if (leaderboard.length > 0) {
      localStorage.setItem('wordSearchLeaderboard', JSON.stringify(leaderboard));
    }
  }, [leaderboard]);

  // Save player name to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('wordSearchPlayerName', playerName);
  }, [playerName]);

  // Add a new entry to the leaderboard
  const addLeaderboardEntry = useCallback((entry: Omit<LeaderboardEntry, 'id' | 'playerName' | 'date'>) => {
    const newEntry: LeaderboardEntry = {
      id: Date.now().toString(),
      playerName,
      ...entry,
      date: Date.now()
    };

    // Check if this is a high score
    const isHighScore = checkIfHighScore(newEntry);
    
    // Add the new entry
    const updatedLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.score - a.score);
    
    // Limit to top 100 entries
    const limitedLeaderboard = updatedLeaderboard.slice(0, 100);
    
    setLeaderboard(limitedLeaderboard);
    
    // If it's a high score, show the animation
    if (isHighScore) {
      setNewHighScore(newEntry);
      
      // Hide the notification after 5 seconds
      setTimeout(() => {
        setNewHighScore(null);
      }, 5000);
    }
    
    return isHighScore;
  }, [leaderboard, playerName]);

  // Check if an entry is a high score
  const checkIfHighScore = (entry: LeaderboardEntry) => {
    // Filter by same difficulty
    const sameLevel = leaderboard.filter(e => e.difficulty === entry.difficulty);
    
    // If there are less than 10 entries for this difficulty, it's a high score
    if (sameLevel.length < 10) return true;
    
    // Check if the score is higher than the lowest score in the top 10
    const sortedByScore = [...sameLevel].sort((a, b) => b.score - a.score);
    if (sortedByScore.length >= 10) {
      return entry.score > sortedByScore[9].score;
    }
    
    return false;
  };

  // Get filtered and sorted leaderboard
  const getFilteredLeaderboard = () => {
    let filtered = [...leaderboard];
    
    // Apply difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(entry => entry.difficulty === filterDifficulty);
    }
    
    // Apply sorting
    if (sortBy === 'score') {
      filtered.sort((a, b) => b.score - a.score);
    } else {
      filtered.sort((a, b) => a.timeElapsed - b.timeElapsed);
    }
    
    return filtered;
  };

  // For external components to access these methods
  useEffect(() => {
    // Expose methods globally for other components to use
    window.leaderboardSystem = {
      addLeaderboardEntry,
      getLeaderboard: () => leaderboard,
      setPlayerName
    };
  }, [leaderboard, playerName, addLeaderboardEntry]);

  const isWhiteTheme = theme.primary === '#000000';
  const filteredLeaderboard = getFilteredLeaderboard();

  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get medal color based on position
  const getMedalColor = (index: number) => {
    if (index === 0) return '#FFD700'; // Gold
    if (index === 1) return '#C0C0C0'; // Silver
    if (index === 2) return '#CD7F32'; // Bronze
    return 'transparent';
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return '#10b981'; // Green
      case 'medium': return '#f59e0b'; // Yellow
      case 'hard': return '#ef4444'; // Red
      case 'custom': return '#8b5cf6'; // Purple
      default: return '#6b7280'; // Gray
    }
  };

  return (
    <>
      {/* Leaderboard Button */}
      <button
        onClick={() => setShowLeaderboard(true)}
        style={{
          padding: '12px',
          borderRadius: '8px',
          transition: 'all 0.2s',
          cursor: 'pointer',
          border: `1px solid ${theme.secondary}40`,
          backgroundColor: theme.cellBg,
          color: theme.primary
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="View Leaderboard"
      >
        <Medal size={20} />
      </button>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
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
            maxWidth: '800px',
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
                <Medal size={24} style={{ color: theme.secondary }} />
                Leaderboard
              </h2>
              <button
                onClick={() => setShowLeaderboard(false)}
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
              {/* Player Name Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: isWhiteTheme ? '#ffffff' : theme.primary,
                  fontSize: '14px'
                }}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg,
                    color: isWhiteTheme ? '#ffffff' : theme.primary,
                    border: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.3)' : theme.secondary + '40'}`,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Filters */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px'
              }}>
                {/* Difficulty Filter */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    color: isWhiteTheme ? '#ffffff' : theme.primary,
                    fontSize: '14px'
                  }}>
                    Difficulty
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value as Difficulty | 'all')}
                      style={{
                        padding: '8px 12px',
                        paddingRight: '32px', // Space for the dropdown arrow
                        borderRadius: '8px',
                        backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg,
                        color: isWhiteTheme ? '#ffffff' : theme.primary,
                        border: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.3)' : theme.secondary + '40'}`,
                        outline: 'none',
                        appearance: 'none', // Remove default styling
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        cursor: 'pointer'
                      }}
                      className="leaderboard-difficulty-select"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="custom">Custom</option>
                    </select>
                    {/* Custom dropdown arrow */}
                    <div style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      color: isWhiteTheme ? '#ffffff' : theme.secondary
                    }}>
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    color: isWhiteTheme ? '#ffffff' : theme.primary,
                    fontSize: '14px'
                  }}>
                    Sort By
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button
                      onClick={() => setSortBy('score')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: sortBy === 'score' 
                          ? theme.secondary 
                          : (isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg),
                        color: sortBy === 'score' 
                          ? '#ffffff' 
                          : (isWhiteTheme ? '#ffffff' : theme.primary),
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Star size={16} />
                      <span>Score</span>
                      {sortBy === 'score' && <ChevronDown size={16} />}
                    </button>
                    <button
                      onClick={() => setSortBy('time')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: sortBy === 'time' 
                          ? theme.secondary 
                          : (isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg),
                        color: sortBy === 'time' 
                          ? '#ffffff' 
                          : (isWhiteTheme ? '#ffffff' : theme.primary),
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Clock size={16} />
                      <span>Time</span>
                      {sortBy === 'time' && <ChevronUp size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Leaderboard Table */}
              {filteredLeaderboard.length === 0 ? (
                <div style={{
                  padding: '32px',
                  textAlign: 'center',
                  color: isWhiteTheme ? '#ffffff' : theme.primary,
                  backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg,
                  borderRadius: '8px'
                }}>
                  No entries yet. Complete a game to be the first on the leaderboard!
                </div>
              ) : (
                <div style={{
                  overflowX: 'auto'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{
                        backgroundColor: isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.cellBg,
                        color: isWhiteTheme ? '#ffffff' : theme.primary
                      }}>
                        <th style={{ padding: '12px', textAlign: 'left', width: '60px' }}>Rank</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Player</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Score</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Words</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Difficulty</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaderboard.map((entry, index) => (
                        <tr
                          key={entry.id}
                          style={{
                            backgroundColor: index % 2 === 0 
                              ? 'transparent' 
                              : (isWhiteTheme ? 'rgba(255, 255, 255, 0.05)' : theme.cellBg),
                            color: isWhiteTheme ? '#ffffff' : theme.primary,
                            borderBottom: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.1)' : theme.secondary + '20'}`
                          }}
                        >
                          <td style={{ padding: '12px' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: getMedalColor(index),
                              color: index <= 2 ? '#000000' : isWhiteTheme ? '#ffffff' : theme.primary,
                              fontWeight: 'bold'
                            }}>
                              {index + 1}
                            </div>
                          </td>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{entry.playerName}</td>
                          <td style={{ padding: '12px' }}>{entry.score.toLocaleString()}</td>
                          <td style={{ padding: '12px' }}>{formatTime(entry.timeElapsed)}</td>
                          <td style={{ padding: '12px' }}>{entry.wordsFound}/{entry.totalWords}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              backgroundColor: getDifficultyColor(entry.difficulty),
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>{new Date(entry.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New High Score Animation */}
      {newHighScore && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '24px',
          borderRadius: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 100px rgba(255, 215, 0, 0.5)',
          border: '3px solid #FFD700',
          color: '#ffffff',
          zIndex: 70,
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            animation: 'spin 2s infinite'
          }}>
            🏆
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#FFD700',
            marginBottom: '8px'
          }}>
            NEW HIGH SCORE!
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}>
            {newHighScore.score.toLocaleString()} points
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Clock size={20} style={{ color: theme.secondary, marginBottom: '4px' }} />
              <div>{formatTime(newHighScore.timeElapsed)}</div>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Zap size={20} style={{ color: theme.secondary, marginBottom: '4px' }} />
              <div>{newHighScore.difficulty.toUpperCase()}</div>
            </div>
          </div>
          <div style={{
            fontSize: '14px',
            opacity: 0.8
          }}>
            Congratulations, {newHighScore.playerName}!
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.5); }
            50% { box-shadow: 0 0 80px rgba(255, 215, 0, 0.8); }
            100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.5); }
          }
          
          @keyframes spin {
            0% { transform: rotate(-15deg); }
            50% { transform: rotate(15deg); }
            100% { transform: rotate(-15deg); }
          }
          
          /* Dropdown styling for theme consistency */
          .leaderboard-difficulty-select {
            color: ${isWhiteTheme ? '#ffffff' : theme.primary};
          }
          
          .leaderboard-difficulty-select option {
            background-color: ${isWhiteTheme ? '#1e3a8a' : '#1a1a1a'};
            color: ${isWhiteTheme ? '#ffffff' : theme.primary};
            padding: 8px;
          }
          
          /* For Firefox */
          .leaderboard-difficulty-select::-moz-selection {
            background-color: ${theme.secondary};
          }
          
          /* For Chrome/Edge */
          .leaderboard-difficulty-select option:checked,
          .leaderboard-difficulty-select option:hover {
            background-color: ${theme.secondary};
            color: #ffffff;
          }
        `}
      </style>
    </>
  );
};

// Add type definition for the global window object
declare global {
  interface Window {
    leaderboardSystem: {
      addLeaderboardEntry: (entry: Omit<LeaderboardEntry, 'id' | 'playerName' | 'date'>) => boolean;
      getLeaderboard: () => LeaderboardEntry[];
      setPlayerName: (name: string) => void;
    };
  }
}