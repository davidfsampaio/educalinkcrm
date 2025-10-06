import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-slate-200/80 shadow-sm p-6 transition-shadow duration-300 hover:shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;