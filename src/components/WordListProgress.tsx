import React from 'react';
import { Search } from 'lucide-react';

interface WordListProgressProps {
  foundCount: number;
  totalCount: number;
  completionPercentage: number;
  theme: any;
  isMobile?: boolean;
}

export const WordListProgress: React.FC<WordListProgressProps> = ({
  foundCount,
  totalCount,
  completionPercentage,
  theme,
  isMobile = false
}) => {
  if (isMobile) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px'
        }}>
          <Search size={16} style={{ color: theme.secondary }} />
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            margin: 0,
            color: theme.primary 
          }}>
            Words: {foundCount}/{totalCount}
          </h3>
        </div>
        
        {/* Progress bar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          flexGrow: 1,
          marginLeft: '12px',
          maxWidth: '120px'
        }}>
          <div
            style={{ 
              flexGrow: 1, 
              height: '6px', 
              borderRadius: '3px', 
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.1)' 
            }}
          >
            <div
              className="animate-rainbow"
              style={{
                height: '100%',
                width: `${completionPercentage}%`,
                transition: 'all 0.5s ease-out'
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '16px' 
      }}>
        <Search size={20} style={{ color: theme.secondary }} />
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          margin: 0,
          color: theme.primary 
        }}>
          Words to Find
        </h3>
      </div>

      <div style={{ 
        marginBottom: '16px', 
        padding: '12px', 
        borderRadius: '8px', 
        backgroundColor: theme.cellBg 
      }}>
        <div style={{ 
          fontSize: '14px', 
          opacity: 0.75, 
          marginBottom: '4px',
          color: theme.primary 
        }}>
          Progress
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{ 
              flexGrow: 1, 
              height: '8px', 
              borderRadius: '4px', 
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.1)' 
            }}
          >
            <div
              className="animate-rainbow"
              style={{
                height: '100%',
                width: `${completionPercentage}%`,
                transition: 'all 0.5s ease-out'
              }}
            />
          </div>
          <span style={{ 
            fontSize: '14px', 
            fontFamily: 'JetBrains Mono, monospace', 
            fontWeight: '600',
            color: theme.primary 
          }}>
            {foundCount}/{totalCount}
          </span>
        </div>
      </div>
    </>
  );
};