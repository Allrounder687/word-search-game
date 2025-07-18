import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface DropdownButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  theme: any;
  iconSize: number;
  isFullWidth?: boolean;
  fontSize?: string;
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({
  onClick,
  icon: Icon,
  label,
  theme,
  iconSize,
  isFullWidth = false,
  fontSize = '14px'
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: isFullWidth ? '100%' : 'auto',
        padding: '10px 12px',
        borderRadius: '8px',
        backgroundColor: theme.gridBg,
        color: theme.primary,
        border: `1px solid ${theme.secondary}40`,
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Icon size={iconSize} style={{ color: theme.secondary }} />
        <span>{label}</span>
      </div>
    </button>
  );
};