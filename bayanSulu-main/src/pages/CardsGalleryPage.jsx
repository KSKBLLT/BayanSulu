import React, { useState } from 'react';
import { knowledgeCards } from '../data/knowledgeCards';
import Button from '../components/Button';

// Keep [gameId, card] pairs so we can match against completedGames
const allCardEntries = Object.entries(knowledgeCards);

function CardFlip({ card, isUnlocked }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      className={`kcard ${isUnlocked ? 'kcard--unlocked' : 'kcard--locked'} ${flipped ? 'kcard--flipped' : ''}`}
      onClick={() => isUnlocked && setFlipped((f) => !f)}
      aria-label={isUnlocked ? `${card.title} — нажми чтобы узнать факт` : 'Карточка закрыта'}
    >
      <div className="kcard__inner">
        {/* Front */}
        <div className="kcard__face kcard__face--front" style={{ '--card-color': card.color }}>
          {isUnlocked ? (
            <>
              <div className="kcard__emoji">{card.emoji}</div>
              <div className="kcard__location">{card.location}</div>
              <div className="kcard__title">{card.title}</div>
              <div className="kcard__hint">Нажми ▶</div>
            </>
          ) : (
            <>
              <div className="kcard__lock">🔒</div>
              <div className="kcard__location kcard__location--locked">???</div>
              <div className="kcard__title kcard__title--locked">Пройди игру</div>
            </>
          )}
        </div>
        {/* Back */}
        <div className="kcard__face kcard__face--back" style={{ '--card-color': card.color }}>
          <div className="kcard__back-emoji">{card.emoji}</div>
          <div className="kcard__fact">{card.fact}</div>
          <div className="kcard__back-location">📍 {card.location}</div>
        </div>
      </div>
    </button>
  );
}

function CardsGalleryPage({ appState, goToScreen }) {
  const completedGames = Array.isArray(appState.completedGames) ? appState.completedGames : [];
  const unlockedLocations = Array.isArray(appState.unlockedLocations) ? appState.unlockedLocations : [];

  // gameId (e.g. 'math') is what completedGames tracks
  const isCardUnlocked = (gameId, card) => {
    if (completedGames.includes(gameId)) return true;
    if (unlockedLocations.includes(card.id)) return true;
    // bonus card — always visible after any game
    if (card.id === 'kazakhstan' && completedGames.length > 0) return true;
    return false;
  };

  const unlockedCount = allCardEntries.filter(([gameId, card]) => isCardUnlocked(gameId, card)).length;

  return (
    <section className="screen cards-screen">
      <div className="cards-hero">
        <div className="cards-hero__inner">
          <span className="cards-badge">🗺️ Казахстан</span>
          <h2 className="cards-title">Карточки знаний</h2>
          <p className="cards-subtitle">Собери все факты о стране!</p>
        </div>
        <div className="cards-progress-row">
          <span className="cards-count">{unlockedCount}/{allCardEntries.length}</span>
          <div className="cards-progress-track">
            <div
              className="cards-progress-fill"
              style={{ width: `${(unlockedCount / allCardEntries.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="kcard-grid">
        {allCardEntries.map(([gameId, card]) => (
          <CardFlip key={card.id} card={card} isUnlocked={isCardUnlocked(gameId, card)} />
        ))}
      </div>

      {unlockedCount === 0 && (
        <div className="cards-empty">
          <div className="cards-empty__emoji">🎯</div>
          <p>Пройди первую игру — и карточка откроется!</p>
          <Button variant="primary" onClick={() => goToScreen('map')}>
            Начать путешествие
          </Button>
        </div>
      )}

      {unlockedCount === allCardEntries.length && (
        <div className="cards-complete">
          <span>🏆</span>
          <p>Ты собрал все карточки! Ты — настоящий знаток Казахстана!</p>
        </div>
      )}
    </section>
  );
}

export default CardsGalleryPage;
