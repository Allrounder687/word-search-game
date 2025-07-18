import { useState, useEffect, useCallback, useMemo } from 'react';
import { WordGrid } from './components/WordGrid';
import { WordList } from './components/WordList';
import { GameHeader } from './components/GameHeader';
import { SettingsModal } from './components/SettingsModal';
import { HintSystem } from './components/HintSystem';
import { AchievementSystem } from './components/AchievementSystem';
import { LeaderboardSystem } from './components/LeaderboardSystem';
import { LevelSystem } from './components/LevelSystem';
import { KidsAchievements } from './components/KidsAchievements';
import { OrientationWarning } from './components/OrientationWarning';
import { QuickSettings } from './components/QuickSettings';
import { WordSearchGenerator, calculateScore } from './utils/gameLogic';
import { initializeMobileOptimizations } from './utils/mobileOptimizations';
import { setupMobileViewport } from './utils/responsiveLayout';
import { useResponsive } from './hooks/useResponsive';
import { getLayoutConfig } from './utils/layoutConfig';
import type { GameState, GameSettings, WordPlacement, Theme } from './types/game';
import { THEMES } from './types/game';
import { Sparkles, Trophy, Info, Clock, X } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    words: [],
    foundWords: new Set(),
    score: 0,
    timeElapsed: 0,
    isComplete: false,
    currentSelection: [],
    settings: {
      difficulty: 'easy',
      theme: 'midnight',
      gridSize: 10,
      wordCategory: 'fivePillars',
      showDescriptions: true // Enable descriptions by default
    }
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  // Use responsive hook for better performance and maintainability
  const breakpoints = useResponsive();

  // Memoize theme and layout calculations
  const currentTheme = useMemo(() =>
    THEMES[gameState.settings.theme as keyof typeof THEMES] || THEMES.midnight,
    [gameState.settings.theme]
  );

  const layoutConfig = useMemo(() =>
    getLayoutConfig(breakpoints, currentTheme),
    [breakpoints, currentTheme]
  );

  // Initialize timer based on settings
  useEffect(() => {
    // Reset game over state
    setGameOver(false);

    // Handle countdown timer initialization
    if (gameState.settings.timerMode === 'countdown' && gameState.settings.timerDuration) {
      setTimeRemaining(gameState.settings.timerDuration);
    } else {
      setTimeRemaining(null);
    }

    // Reset timeElapsed for countup mode or when no timer is set
    if (gameState.settings.timerMode !== 'countdown') {
      setGameState(prev => ({
        ...prev,
        timeElapsed: 0
      }));
    }
  }, [gameState.settings.timerMode, gameState.settings.timerDuration]);

  // Timer effect
  useEffect(() => {
    // Don't run timer if game is complete or game over
    if (gameState.isComplete || gameOver) return;

    // Create timer interval
    const timer = setInterval(() => {
      // Count up timer (default or explicitly set to countup)
      if (gameState.settings.timerMode === 'countup' || gameState.settings.timerMode === undefined || gameState.settings.timerMode === 'none') {
        setGameState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }));
      }
      // Countdown timer
      else if (gameState.settings.timerMode === 'countdown' && timeRemaining !== null) {
        setTimeRemaining(prev => {
          // Handle the case where prev might be null
          const currentTime = prev ?? 0;
          if (currentTime <= 1) {
            // Time's up!
            clearInterval(timer);
            setGameOver(true);
            return 0;
          }
          return currentTime - 1;
        });
      }
    }, 1000);

    // Cleanup timer on unmount or when dependencies change
    return () => clearInterval(timer);
  }, [gameState.isComplete, gameState.settings.timerMode, gameOver]);

  // Initialize game - memoized with proper dependencies
  const initializeGame = useCallback((settings?: GameSettings) => {
    const gameSettings = settings || gameState.settings;
    const gridSize = gameSettings.difficulty === 'custom'
      ? gameSettings.gridSize
      : gameSettings.difficulty === 'easy' ? 10
        : gameSettings.difficulty === 'medium' ? 12 : 15;

    const generator = new WordSearchGenerator(gridSize);
    const { grid, words } = generator.generateGame(gameSettings);

    // Reset game state
    setGameState({
      grid,
      words,
      foundWords: new Set(),
      score: 0,
      timeElapsed: 0,
      isComplete: false,
      currentSelection: [],
      settings: gameSettings
    });

    // Reset game over state
    setGameOver(false);

    // Reset timer based on mode
    if (gameSettings.timerMode === 'countdown' && gameSettings.timerDuration) {
      setTimeRemaining(gameSettings.timerDuration);
    } else {
      setTimeRemaining(null);
    }
  }, [gameState.settings]); // Add dependency to prevent stale closure

  // Initialize game and mobile optimizations on mount
  useEffect(() => {
    // Initialize the game
    initializeGame();

    // Initialize mobile optimizations
    initializeMobileOptimizations();

    // Setup mobile viewport for better mobile experience
    setupMobileViewport();
  }, []);

  const handleWordFound = useCallback((word: WordPlacement) => {
    setGameState(prev => {
      const newFoundWords = new Set(prev.foundWords);
      newFoundWords.add(word.word);

      const updatedWords = prev.words.map(w =>
        w.word === word.word ? { ...w, found: true } : w
      );

      const newScore = calculateScore(
        newFoundWords,
        prev.timeElapsed,
        prev.settings.difficulty
      );

      const isComplete = newFoundWords.size === prev.words.length;

      if (isComplete) {
        // Show celebration animation
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);

        // Unlock achievements
        if (window.achievementSystem) {
          // First win achievement
          window.achievementSystem.unlockAchievement('first_win');

          // Speed demon achievement (complete easy puzzle in under 60 seconds)
          if (prev.settings.difficulty === 'easy' && prev.timeElapsed < 60) {
            window.achievementSystem.unlockAchievement('speed_demon');
          }

          // Word master achievement (complete hard puzzle without hints)
          if (prev.settings.difficulty === 'hard' && hintsUsed === 0) {
            window.achievementSystem.unlockAchievement('word_master');
          }

          // High scorer achievement (score over 1000 points)
          if (newScore > 1000) {
            window.achievementSystem.unlockAchievement('high_scorer');
          }

          // Time challenge achievement (complete countdown mode)
          if (prev.settings.timerMode === 'countdown') {
            window.achievementSystem.unlockAchievement('time_challenge');
          }

          // Update word collector progress
          window.achievementSystem.updateAchievementProgress('word_collector',
            newFoundWords.size);

          // Update theme explorer if this is a different theme
          if (window.localStorage.getItem(`theme_used_${prev.settings.theme}`) !== 'true') {
            window.localStorage.setItem(`theme_used_${prev.settings.theme}`, 'true');
            const themesUsed = Object.keys(window.localStorage)
              .filter(key => key.startsWith('theme_used_')).length;
            window.achievementSystem.updateAchievementProgress('theme_explorer', themesUsed);
          }

          // Update perfect streak
          const currentStreak = parseInt(window.localStorage.getItem('win_streak') || '0');
          window.localStorage.setItem('win_streak', (currentStreak + 1).toString());
          window.achievementSystem.updateAchievementProgress('perfect_streak', currentStreak + 1);
        }

        // Add to leaderboard
        if (window.leaderboardSystem) {
          window.leaderboardSystem.addLeaderboardEntry({
            score: newScore,
            difficulty: prev.settings.difficulty,
            timeElapsed: prev.timeElapsed,
            wordsFound: newFoundWords.size,
            totalWords: prev.words.length,
            hintsUsed: hintsUsed
          });
        }
      }

      return {
        ...prev,
        words: updatedWords,
        foundWords: newFoundWords,
        score: newScore,
        isComplete
      };
    });
  }, [hintsUsed]);

  const handleSettingsChange = useCallback((newSettings: GameSettings) => {
    initializeGame(newSettings);
  }, [initializeGame]);

  const handleReset = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  // Apply theme to body
  useEffect(() => {
    document.body.style.background = currentTheme.background;
  }, [currentTheme]);

  // Handle hint usage
  const handleHintUsed = useCallback((word: WordPlacement) => {
    if (hintsRemaining > 0) {
      setHintsRemaining(prev => prev - 1);

      // Highlight the first letter of the word
      const firstLetterPos = word.start;
      const cellKey = `${firstLetterPos.row},${firstLetterPos.col}`;
      const cell = document.querySelector(`[data-cell="${cellKey}"]`);

      if (cell) {
        cell.classList.add('animate-pulse-glow');
        setTimeout(() => {
          cell.classList.remove('animate-pulse-glow');
        }, 3000);
      }
    }
  }, [hintsRemaining]);

  // Reset hints when starting a new game
  useEffect(() => {
    // If hintsCount is explicitly set in settings, use that value
    if (gameState.settings.hintsCount !== undefined) {
      setHintsRemaining(gameState.settings.hintsCount);
    } else {
      // Otherwise use default values based on difficulty
      const difficultyHints = {
        'easy': 3,
        'medium': 2,
        'hard': 1,
        'custom': 2
      };
      setHintsRemaining(difficultyHints[gameState.settings.difficulty] || 3);
    }
  }, [gameState.settings.difficulty, gameState.settings.hintsCount]);

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '16px',
        fontFamily: currentTheme.font || 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div style={{
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto'
      }}>
        <GameHeader
          score={gameState.score}
          timeElapsed={gameState.timeElapsed}
          foundWords={gameState.foundWords.size}
          totalWords={gameState.words.length}
          onReset={handleReset}
          onSettings={() => setShowSettings(true)}
          onToggleCategory={() => setShowCategoryDropdown(!showCategoryDropdown)}
          onToggleTheme={() => setShowThemeDropdown(!showThemeDropdown)}
          onToggleZoom={() => setIsZoomed(!isZoomed)}
          isZoomed={isZoomed}
          theme={currentTheme}
          isDesktop={breakpoints.isDesktop}
        />

        {/* Quick Settings for Category and Theme Selection - Only show on mobile */}
        {!breakpoints.isDesktop && (
          <QuickSettings
            settings={gameState.settings}
            onSettingsChange={handleSettingsChange}
            theme={currentTheme}
          />
        )}

        {/* Category Dropdown for Desktop */}
        {breakpoints.isDesktop && showCategoryDropdown && (
          <div style={{
            position: 'absolute',
            top: '80px',
            right: '70px',
            width: '200px',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
            zIndex: 100,
            padding: '12px',
            border: `1px solid ${currentTheme.secondary}40`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: `1px solid ${currentTheme.secondary}20`
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px', color: currentTheme.primary }}>
                Categories
              </span>
              <button
                onClick={() => setShowCategoryDropdown(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentTheme.primary
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {[
                { value: 'general', label: 'General' },
                { value: 'animals', label: 'Animals' },
                { value: 'islamicPlaces', label: 'Islamic Places' },
                { value: 'islamicProphets', label: 'Islamic Prophets' },
                { value: 'fivePillars', label: 'Five Pillars' },
                { value: 'islamicTerms', label: 'Islamic Terms' },
                { value: 'custom', label: 'Custom Words' }
              ].map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    handleSettingsChange({
                      ...gameState.settings,
                      wordCategory: category.value as any
                    });
                    setShowCategoryDropdown(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: gameState.settings.wordCategory === category.value
                      ? `${currentTheme.secondary}20`
                      : 'transparent',
                    color: gameState.settings.wordCategory === category.value
                      ? currentTheme.secondary
                      : currentTheme.primary,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Theme Dropdown for Desktop */}
        {breakpoints.isDesktop && showThemeDropdown && (
          <div style={{
            position: 'absolute',
            top: '80px',
            right: '30px',
            width: '200px',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
            zIndex: 100,
            padding: '12px',
            border: `1px solid ${currentTheme.secondary}40`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: `1px solid ${currentTheme.secondary}20`
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px', color: currentTheme.primary }}>
                Themes
              </span>
              <button
                onClick={() => setShowThemeDropdown(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: currentTheme.primary
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {[
                { value: 'midnight', label: 'Midnight' },
                { value: 'royal', label: 'Royal Blue' },
                { value: 'darkRoyal', label: 'Dark Royal' },
                { value: 'pink', label: 'Pink' },
                { value: 'darkPink', label: 'Dark Pink' },
                { value: 'pure', label: 'White' },
                { value: 'ocean', label: 'Ocean' },
                { value: 'sunset', label: 'Sunset' },
                { value: 'neon', label: 'Neon' },
                { value: 'custom', label: 'Custom Theme' }
              ].map((themeOption) => {
                const themeColors = THEMES[themeOption.value as keyof typeof THEMES] || THEMES.midnight;

                return (
                  <button
                    key={themeOption.value}
                    onClick={() => {
                      handleSettingsChange({
                        ...gameState.settings,
                        theme: themeOption.value as Theme
                      });
                      setShowThemeDropdown(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      backgroundColor: gameState.settings.theme === themeOption.value
                        ? `${currentTheme.secondary}20`
                        : 'transparent',
                      color: gameState.settings.theme === themeOption.value
                        ? currentTheme.secondary
                        : currentTheme.primary,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      background: `linear-gradient(135deg, ${themeColors.background} 0%, ${themeColors.gridBg} 100%)`,
                      border: `1px solid ${themeColors.secondary}40`
                    }} />
                    {themeOption.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile WordList - Displayed at the top on mobile devices */}
        {!breakpoints.isDesktop && (
          <div style={{
            width: '100%',
            marginTop: layoutConfig.spacing.marginTop,
            marginBottom: layoutConfig.spacing.marginBottom
          }}>
            <WordList
              words={gameState.words}
              theme={currentTheme}
              showDescriptions={gameState.settings.showDescriptions}
              kidsMode={gameState.settings.kidsMode}
              isMobileLayout={true}
            />
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: breakpoints.isDesktop ? 'row' : 'column',
          gap: layoutConfig.spacing.gap,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: layoutConfig.spacing.marginTop,
          padding: layoutConfig.spacing.padding
        }}>
          <div style={{
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'center',
            ...layoutConfig.wordGrid,
            transform: !breakpoints.isDesktop && isZoomed ? 'scale(1.3)' : 'scale(1)',
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease'
          }}>
            <WordGrid
              grid={gameState.grid}
              words={gameState.words}
              onWordFound={handleWordFound}
              theme={currentTheme}
              showDescriptions={gameState.settings.showDescriptions}
              kidsMode={gameState.settings.kidsMode}
              isZoomed={isZoomed}
            />
          </div>

          <div style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Desktop WordList - Only displayed on desktop */}
            {breakpoints.isDesktop && (
              <WordList
                words={gameState.words}
                theme={currentTheme}
                showDescriptions={gameState.settings.showDescriptions}
                kidsMode={gameState.settings.kidsMode}
                isMobileLayout={false}
              />
            )}

            {/* Game Controls */}
            <div
              style={{
                padding: breakpoints.isTablet || breakpoints.isDesktop ? '16px' : '12px',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexWrap: breakpoints.width >= 480 ? 'nowrap' : 'wrap',
                alignItems: 'center',
                justifyContent: breakpoints.width >= 480 ? 'space-between' : 'center',
                gap: '10px',
                backgroundColor: currentTheme.gridBg
              }}
            >
              {/* Hint System */}
              <HintSystem
                words={gameState.words}
                onHintUsed={(word) => {
                  handleHintUsed(word);
                  setHintsUsed(prev => prev + 1);
                }}
                theme={currentTheme}
                hintsRemaining={hintsRemaining}
              />

              {/* Timer Display (for countdown mode) */}
              {gameState.settings.timerMode === 'countdown' && timeRemaining !== null && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: timeRemaining < 30 ? 'rgba(239, 68, 68, 0.2)' : currentTheme.cellBg,
                  color: timeRemaining < 30 ? '#ef4444' : currentTheme.primary,
                  border: timeRemaining < 30 ? '1px solid #ef4444' : `1px solid ${currentTheme.secondary}40`,
                  animation: timeRemaining < 10 ? 'pulse 1s infinite' : 'none'
                }}>
                  <Clock size={20} style={{
                    color: timeRemaining < 30 ? '#ef4444' : currentTheme.secondary
                  }} />
                  <span style={{
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}

              {/* Achievement System */}
              <AchievementSystem
                theme={currentTheme}
              />

              {/* Kids Achievements System */}
              {gameState.settings.kidsMode && (
                <KidsAchievements
                  theme={currentTheme}
                  foundWords={Array.from(gameState.foundWords)}
                  kidsMode={gameState.settings.kidsMode}
                />
              )}

              {/* Leaderboard System */}
              <LeaderboardSystem
                theme={currentTheme}
              />

              {/* Level System */}
              <LevelSystem
                theme={currentTheme}
                onStartLevel={(currentLevel, settings) => {
                  // Update settings with level-specific words
                  const levelSettings = {
                    ...settings,
                    // Set categories based on current word category
                    wordCategory: gameState.settings.wordCategory,
                    // Keep user preferences
                    theme: gameState.settings.theme,
                    showDescriptions: gameState.settings.showDescriptions,
                    timerMode: gameState.settings.timerMode,
                    timerDuration: gameState.settings.timerDuration
                  };

                  // Log the current level (using the parameter to avoid the warning)
                  console.log(`Starting level ${currentLevel}`);

                  // Initialize game with the level settings
                  initializeGame(levelSettings);
                }}
                currentSettings={gameState.settings}
              />

              {/* Info Button */}
              <button
                onClick={() => setShowInfo(!showInfo)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  border: `1px solid ${currentTheme.secondary}40`,
                  backgroundColor: currentTheme.cellBg,
                  color: currentTheme.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Info size={20} />
              </button>
            </div>

            {/* Game Info Panel */}
            {showInfo && (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  backgroundColor: currentTheme.gridBg
                }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: currentTheme.primary
                }}>
                  How to Play
                </h3>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  color: currentTheme.primary,
                  fontSize: '14px'
                }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ marginTop: '4px' }}>•</span>
                    <span>Find all words hidden in the grid</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ marginTop: '4px' }}>•</span>
                    <span>Click and drag to select letters</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ marginTop: '4px' }}>•</span>
                    <span>Words can be horizontal, vertical, or diagonal</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ marginTop: '4px' }}>•</span>
                    <span>Use hints if you get stuck (limited per game)</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Game Complete Celebration */}
        {gameState.isComplete && (
          <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
            <div className="text-center animate-float p-8 rounded-xl shadow-2xl"
              style={{
                backgroundColor: `${currentTheme.gridBg}CC`,
                backdropFilter: 'blur(8px)',
                border: `2px solid ${currentTheme.accent}40`
              }}
            >
              <div className="text-6xl mb-4 flex justify-center">
                <div className="animate-bounce">🎉</div>
                <div className="animate-float" style={{ animationDelay: '0.2s' }}>🏆</div>
                <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>🎉</div>
              </div>
              <div
                className="text-4xl font-bold mb-2 animate-rainbow bg-clip-text text-transparent"
                style={{
                  background: 'linear-gradient(-45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
                  backgroundSize: '400% 400%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: currentTheme.font
                }}
              >
                Congratulations!
              </div>
              <div className="text-xl opacity-90 mb-2" style={{ color: currentTheme.primary }}>
                All words found in {Math.floor(gameState.timeElapsed / 60)}:{(gameState.timeElapsed % 60).toString().padStart(2, '0')}
              </div>

              {/* Difficulty Badge */}
              <div className="flex justify-center mb-4">
                <div className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor:
                      gameState.settings.difficulty === 'easy' ? '#10b981' :
                        gameState.settings.difficulty === 'medium' ? '#f59e0b' :
                          gameState.settings.difficulty === 'hard' ? '#ef4444' :
                            '#8b5cf6',
                    color: '#ffffff'
                  }}
                >
                  {gameState.settings.difficulty.charAt(0).toUpperCase() + gameState.settings.difficulty.slice(1)} Mode
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2 p-3 rounded-lg"
                  style={{
                    backgroundColor: currentTheme.cellBg,
                    boxShadow: `0 0 20px ${currentTheme.accent}40`
                  }}
                >
                  <Trophy className="animate-pulse" style={{ color: currentTheme.accent }} />
                  <span style={{ color: currentTheme.primary, fontWeight: 'bold', fontSize: '1.25rem' }}>
                    {gameState.score.toLocaleString()} points
                  </span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="mt-6 px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 pointer-events-auto"
                style={{
                  backgroundColor: currentTheme.secondary,
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Celebration Particles */}
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <Sparkles
                  size={16 + Math.random() * 16}
                  style={{ color: currentTheme.accent }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Game Over Modal (for countdown timer) */}
        {gameOver && !gameState.isComplete && (
          <div className="fixed inset-0 flex items-center justify-center z-40">
            <div className="text-center p-8 rounded-xl shadow-2xl"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '2px solid #ef4444',
                maxWidth: '400px',
                width: '90%'
              }}
            >
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                animation: 'shake 0.5s'
              }}>
                ⏱️
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#ef4444',
                marginBottom: '16px'
              }}>
                Time's Up!
              </div>
              <div style={{
                fontSize: '16px',
                marginBottom: '24px',
                color: '#ffffff'
              }}>
                You found {gameState.foundWords.size} out of {gameState.words.length} words.
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px'
              }}>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    backgroundColor: currentTheme.secondary,
                    color: 'white',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Try Again
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    border: `1px solid ${currentTheme.secondary}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Settings
                </button>
              </div>
            </div>
          </div>
        )}

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={gameState.settings}
          onSettingsChange={handleSettingsChange}
          theme={currentTheme}
        />

        {/* CSS Animations */}
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.5; }
              100% { opacity: 1; }
            }
            
            @keyframes shake {
              0% { transform: translateX(0); }
              25% { transform: translateX(-5px); }
              50% { transform: translateX(5px); }
              75% { transform: translateX(-5px); }
              100% { transform: translateX(0); }
            }
            
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
              100% { transform: translateY(0px); }
            }
            
            @keyframes rainbow {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            
            .animate-pulse {
              animation: pulse 1s infinite;
            }
            
            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
            
            .animate-rainbow {
              animation: rainbow 6s linear infinite;
            }
            
            .animate-bounce {
              animation: float 1s ease-in-out infinite;
            }
          `}
        </style>
      </div>

      {/* Orientation Warning for Mobile */}
      <OrientationWarning theme={currentTheme} />
    </div>
  );
}

export default App;
