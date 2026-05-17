import React from 'react';
function CoinBadge({ coins }) {
  return (
    <div className="coin-badge" aria-label={`${coins} ботакоинов`}>
      <span className="coin-badge__coin" aria-hidden="true">
        <span className="coin-badge__coin-shine" />
      </span>
      <strong>{coins}</strong>
    </div>
  );
}

export default CoinBadge;
