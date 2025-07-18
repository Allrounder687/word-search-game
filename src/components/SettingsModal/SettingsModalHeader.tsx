import React from 'react';
import { X } from 'lucide-react';

interface SettingsModalHeaderProps {
  onClose: () => void;
  theme: any;
  isWhiteTheme: boolean;
}

export const SettingsModalHeader: React.FC<SettingsModalHeaderProps> = ({
  onClose,
  theme,
  isWhiteTheme
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px',
      borderBottom: `1px solid ${isWhiteTheme ? 'rgba(255, 255, 255, 0.2)' : theme.secondary + '40'}`
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: isWhiteTheme ? '#ffffff' : theme.primary,
        margin: 0
      }}>
        Game Settings
      </h2>
      <button
        onClick={onClose}
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
        aria-label="Close settings"
      >
        <X size={24} />
      </button>
    </div>
  );
};