import React from 'react';
function Card({ children, className = '', onClick }) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`card ${className}`.trim()}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}

export default Card;
