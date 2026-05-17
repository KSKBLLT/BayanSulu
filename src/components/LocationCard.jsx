import React from 'react';
function LocationCard({
  title,
  subtitle,
  icon,
  fact,
  reward,
  status = 'available',
  completed = false,
  onClick,
}) {
  const isLocked = status === 'locked';
  const statusLabel = completed ? '✓ Пройдено' : isLocked ? 'Закрыто' : 'Открыто';

  return (
    <button
      type="button"
      className={`location-card ${completed ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
      onClick={onClick}
    >
      <span className="location-card-icon">{icon}</span>
      <span className="location-card-body">
        <span className="location-card-title">{title}</span>
        <span className="location-card-subtitle">{subtitle}</span>
        {fact && <span className="location-card-meta">{fact}</span>}
        {reward && <span className="location-card-meta">Награда: {reward}</span>}
        <span className={`badge ${completed ? 'badge-success' : isLocked ? 'badge-muted' : 'badge-success'}`}>
          {statusLabel}
        </span>
      </span>
    </button>
  );
}

export default LocationCard;
