// This file is currently not being used in the application
// Keeping it for reference, but it's causing issues with the build
// If you need to use memoized components, import React.memo directly in the component files

/*
import React from 'react';
import { WordGrid } from './WordGrid';
import { WordList } from './WordList';
import { GameHeader } from './GameHeader';
import { HintSystem } from './HintSystem';

// Memoized components to prevent unnecessary re-renders
export const MemoizedWordGrid = React.memo(WordGrid);
export const MemoizedWordList = React.memo(WordList);
export const MemoizedGameHeader = React.memo(GameHeader);
export const MemoizedHintSystem = React.memo(HintSystem);

// Custom comparison function for WordList to prevent re-renders when only order changes
export const MemoizedWordListWithCustomComparison = React.memo(WordList, (prevProps, nextProps) => {
  // Only re-render if words found status actually changed
  const prevFoundWords = prevProps.words.filter(w => w.found).map(w => w.word).sort();
  const nextFoundWords = nextProps.words.filter(w => w.found).map(w => w.word).sort();
  
  return (
    prevFoundWords.length === nextFoundWords.length &&
    prevFoundWords.every((word, index) => word === nextFoundWords[index]) &&
    prevProps.theme === nextProps.theme &&
    prevProps.showDescriptions === nextProps.showDescriptions &&
    prevProps.kidsMode === nextProps.kidsMode &&
    prevProps.isMobileLayout === nextProps.isMobileLayout
  );
});
*/

// Export empty object to avoid import errors
export {};