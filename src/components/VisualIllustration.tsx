import React from 'react';
import { getIllustration } from '../types/kidsMode';

interface VisualIllustrationProps {
  word: string;
  kidsMode: boolean;
  theme: any;
}

export const VisualIllustration: React.FC<VisualIllustrationProps> = ({ 
  word, 
  kidsMode, 
  theme 
}) => {
  // Don't render if kids mode is disabled or no illustration exists
  if (!kidsMode || !getIllustration(word)) return null;
  
  const illustrationPath = getIllustration(word);
  
  return (
    <div style={{
      marginTop: '12px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      border: `1px solid ${theme.secondary}40`
    }}>
      {/* Placeholder for illustration - in a real app, this would load the actual image */}
      <div style={{
        width: '120px',
        height: '120px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.secondary,
        fontSize: '48px',
        border: `2px dashed ${theme.secondary}40`
      }}>
        {/* This would be replaced with an actual image in production */}
        🖼️
      </div>
      
      {/* Image caption */}
      <div style={{
        marginLeft: '16px',
        color: theme.primary,
        fontSize: '14px',
        opacity: 0.8,
        fontStyle: 'italic'
      }}>
        Visual illustration for {word}
        <br />
        <span style={{ fontSize: '12px', opacity: 0.6 }}>
          Image: {illustrationPath}
        </span>
      </div>
    </div>
  );
};