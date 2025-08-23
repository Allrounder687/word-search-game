import React from 'react';
import { WordGrid } from './WordGrid';
import { WordList } from './WordList';
import { GameHeader } from './GameHeader';
import { HintSystem } from './HintSystem';
import { SettingsModal } from './SettingsModal';
import { AchievementSystem } from './AchievementSystem';
import { LeaderboardSystem } from './LeaderboardSystem';

// Memoized components to prevent unnecessary re-renders
export const MemoizedWordGrid = React.memo(WordGrid);

export const MemoizedWordList = React.memo(WordList);

export const MemoizedGameHeader = React.memo(GameHeader);

export const MemoizedHintSystem = React.memo(HintSystem);

export const MemoizedSettingsModal = React.memo(SettingsModal);

export const MemoizedAchievementSystem = React.memo(AchievementSystem);

export const MemoizedLeaderboardSystem = React.memo(LeaderboardSystem);