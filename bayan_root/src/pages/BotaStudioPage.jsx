import React, { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Mascot from '../components/Mascot';
import ProgressBar from '../components/ProgressBar';
import { collectibles } from '../data/collectibles';

const unlockLabelByGameId = {
  math: 'Счёт с КамБотом',
  memory: 'Казахские пары',
  words: 'Казахские слова',
};

const gameEmoji = {
  math: '🔢',
  memory: '🃏',
  words: '🈳',
};

function isUnlocked(collectible, appState) {
  const completedGames = Array.isArray(appState.completedGames) ? appState.completedGames : [];
  const unlockedCollectibles = Array.isArray(appState.unlockedCollectibles)
    ? appState.unlockedCollectibles : [];
  return (
    unlockedCollectibles.includes(collectible.id) ||
    (collectible.unlockGameId && completedGames.includes(collectible.unlockGameId))
  );
}

function BotaStudioPage({ appState, goToScreen, newlyUnlockedId }) {
  const orderedCollectibles = useMemo(
    () => [...collectibles].sort((a, b) => a.layer - b.layer || a.sceneY - b.sceneY),
    [],
  );
  const unlockedCount = orderedCollectibles.filter((c) => isUnlocked(c, appState)).length;
  const totalCount = orderedCollectibles.length;
  const worldProgress = Math.round((unlockedCount / totalCount) * 100);
  const [activeHighlightId, setActiveHighlightId] = useState(newlyUnlockedId || null);

  useEffect(() => {
    if (newlyUnlockedId) setActiveHighlightId(newlyUnlockedId);
  }, [newlyUnlockedId]);

  useEffect(() => {
    if (!activeHighlightId) return undefined;
    const t = window.setTimeout(() => setActiveHighlightId(null), 2600);
    return () => window.clearTimeout(t);
  }, [activeHighlightId]);

  const mascotSpeech =
    unlockedCount === 0
      ? 'Пройди первую игру — и твой Мир Боты оживёт!'
      : unlockedCount === totalCount
        ? 'Мир Боты собран полностью! Ты — знаток Казахстана 🏆'
        : `Открыто ${unlockedCount} из ${totalCount}. Продолжай!`;

  return (
    <section className="screen bota-studio-screen">

      {/* Hero */}
      <Card className="stack bota-studio-hero">
        <div className="bota-studio-hero__copy">
          <span className="badge badge-muted">Казахстан</span>
          <h2 className="hero-title">Мир Боты</h2>
          <p className="muted">Проходи игры и собирай предметы!</p>
        </div>
        <Mascot mood={unlockedCount > 0 ? 'happy' : 'thinking'} size="medium" speech={mascotSpeech} />
        <div className="studio-stat-row">
          <div className="studio-stat">
            <span className="studio-stat__value">{unlockedCount}</span>
            <span className="studio-stat__label">Открыто</span>
          </div>
          <div className="studio-stat studio-stat--muted">
            <span className="studio-stat__value">{totalCount - unlockedCount}</span>
            <span className="studio-stat__label">Ещё осталось</span>
          </div>
          <div className="studio-stat studio-stat--accent">
            <span className="studio-stat__value">{worldProgress}%</span>
            <span className="studio-stat__label">Собрано</span>
          </div>
        </div>
        <ProgressBar value={unlockedCount} max={totalCount} label={`Мир собран на ${worldProgress}%`} />
      </Card>

      {/* Collection list */}
      <Card className="stack">
        <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>Коллекция предметов</h3>
        <div className="studio-list">
          {orderedCollectibles.map((collectible) => {
            const unlocked = isUnlocked(collectible, appState);
            const isNew = collectible.id === activeHighlightId;
            const gameLabel = collectible.unlockGameId
              ? unlockLabelByGameId[collectible.unlockGameId] : 'Особое задание';
            const emoji = collectible.unlockGameId ? (gameEmoji[collectible.unlockGameId] || '⭐') : '⭐';

            return (
              <div
                key={collectible.id}
                className={`studio-item ${unlocked ? 'studio-item--unlocked' : 'studio-item--locked'} ${isNew ? 'studio-item--new' : ''}`}
              >
                <div className="studio-item__icon-wrap" aria-hidden="true">
                  {unlocked ? (
                    <span className="studio-item__icon">{collectible.icon || emoji}</span>
                  ) : (
                    <span className="studio-item__lock">🔒</span>
                  )}
                </div>
                <div className="studio-item__body">
                  <div className="studio-item__name">
                    {unlocked ? collectible.title : '???'}
                    {isNew && <span className="studio-item__new-badge">Новое!</span>}
                  </div>
                  <div className="studio-item__sub">
                    {unlocked
                      ? (collectible.learning || collectible.category)
                      : `Пройди: ${gameLabel}`}
                  </div>
                </div>
                <div className="studio-item__status" aria-hidden="true">
                  {unlocked ? (
                    <span className="studio-item__check">✓</span>
                  ) : (
                    <span className="studio-item__game-tag">{emoji}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="bottom-actions">
        <Button variant="primary" onClick={() => goToScreen('map')}>
          Играть дальше
        </Button>
        <Button variant="ghost" onClick={() => goToScreen('cards')}>
          Карточки знаний
        </Button>
      </div>
    </section>
  );
}

export default BotaStudioPage;
