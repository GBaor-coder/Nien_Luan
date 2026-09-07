import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false, hover = false }) => {
  return (
    <div className={`card ${noPadding ? '' : 'p-5'} ${hover ? 'card-hover' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
