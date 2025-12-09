import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`glass-card ${className} ${onClick ? 'cursor-pointer hover:scale-[1.01]' : ''}`}
    >
      {children}
    </div>
  );
};