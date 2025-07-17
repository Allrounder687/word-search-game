import React from 'react';
import { Sparkles } from 'lucide-react';

interface WordListCompletionProps {
  foundCount: number;
  totalCount: number;
}

export const WordListCompletion: React.FC<WordListCompletionProps> = ({
  foundCount,
  totalCount
}) => {
  // Only show completion message when all words are found
  if (foundCount !== totalCount) return null;

  return (
    <div style={{ 
      marginTop: '16px', 
      padding: '16px', 
      borderRadius: '8px', 
      textAlign: 'center',
      background: 'linear-gradient(-45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
      backgroundSize: '400% 400%',
      animation: 'rainbow-shift 3s ease infinite'
    }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
        🎉 Congratulations! 🎉
      </div>
      <div style={{ fontSize: '14px', opacity: 0.9 }}>
        All words found!
      </div>
      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
        <Sparkles 
          size={20} 
          style={{ animation: 'float 3s ease-in-out infinite' }} 
        />
      </div>
    </div>
  );
};