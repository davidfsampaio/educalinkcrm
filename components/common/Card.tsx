import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  // FIX: Added onClick prop to allow the card to be clickable.
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div onClick={onClick} className={`bg-white rounded-lg border border-slate-200/80 shadow-sm p-6 transition-shadow duration-300 hover:shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;
