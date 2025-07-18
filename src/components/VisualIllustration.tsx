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
  
  return (
    <div style={{
      marginTop: '12px',
      padding: '12px',
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      textAlign: 'center'
    }}>
      {/* Placeholder for illustration - in a real app, this would load the actual image */}
      <div style={{
        width: '120px',
        height: '120px',
        margin: '0 auto',
        backgroundColor: theme.secondary + '20',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        marginBottom: '8px'
      }}>
        {/* Simple emoji representation based on word */}
        {word === 'SHAHADA' && '☪️'}
        {word === 'SALAT' && '🕌'}
        {word === 'ZAKAT' && '💰'}
        {word === 'SAWM' && '🌙'}
        {word === 'HAJJ' && '🕋'}
        {word === 'MASJID' && '🕌'}
        {word === 'KAABA' && '🕋'}
        {word === 'QURAN' && '📖'}
        {word === 'WUDU' && '💧'}
        {!['SHAHADA', 'SALAT', 'ZAKAT', 'SAWM', 'HAJJ', 'MASJID', 'KAABA', 'QURAN', 'WUDU'].includes(word) && '📚'}
      </div>
      <div style={{
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.7)',
        fontStyle: 'italic'
      }}>
        Visual illustration for {word}
      </div>
    </div>
  );
};