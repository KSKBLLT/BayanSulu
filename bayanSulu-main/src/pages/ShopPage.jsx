import React, { useMemo, useState } from 'react';
import { rewards } from '../data/rewards';
import Button from '../components/Button';
import Card from '../components/Card';
import Mascot from '../components/Mascot';

function getRequestState(appState, rewardId) {
  return appState.rewardRequests.find((r) => r.rewardId === rewardId) || null;
}

function pluralize(count, forms) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

function ShopPage({ appState, goToScreen, requestFamilyBonus }) {
  const [notice, setNotice] = useState('');
  const completedGamesCount = Array.isArray(appState.completedGames) ? appState.completedGames.length : 0;
  const openStudioCount = Array.isArray(appState.unlockedCollectibles) ? appState.unlockedCollectibles.length : 0;

  const rewardCards = useMemo(
    () => rewards.map((reward) => {
      const request = getRequestState(appState, reward.id);
      const missing = [];
      if (appState.coins < reward.cost) missing.push(`Нужно ещё ${reward.cost - appState.coins} ботакоинов`);
      if (completedGamesCount < reward.requiredGames) {
        const diff = reward.requiredGames - completedGamesCount;
        missing.push(`Пройди ещё ${diff} ${pluralize(diff, ['игру', 'игры', 'игр'])}`);
      }
      if (openStudioCount < reward.requiredCollectibles) {
        const diff = reward.requiredCollectibles - openStudioCount;
        missing.push(`Открой ещё ${diff} ${pluralize(diff, ['предмет', 'предмета', 'предметов'])}`);
      }
      return { reward, request, missing };
    }),
    [appState.coins, appState.rewardRequests, completedGamesCount, openStudioCount],
  );

  const handleRequest = (reward) => {
    const result = requestFamilyBonus(reward);
    setNotice(result.missing?.[0] || result.message || '');
  };

  return (
    <section className="screen shop-screen">
      <Mascot mood="main" size="medium" speech="Зарабатывай ботакоины — получай скидки на Боту!" />

      {/* Курс обмена — ключевая информация */}
      <Card className="stack" style={{ background: '#FFF8E1', border: '2px solid #EA9228' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>🪙</span>
          <div>
            <h3 style={{ margin: 0, color: '#EA9228' }}>1 ботакоин = 2 тенге</h3>
            <p className="muted" style={{ margin: '0.25rem 0 0' }}>
              Зарабатывай в играх, трать на скидки в магазинах «Бота»
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <span className="badge badge-muted">🎮 Игра = +10 монет = 20₸</span>
          <span className="badge badge-muted">📦 QR-код = +20 монет = 40₸</span>
          <span className="badge badge-muted">📅 Вход = +5 монет = 10₸</span>
        </div>
        <div style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '0.75rem',
          marginTop: '0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span className="muted">Твой баланс:</span>
          <strong style={{ fontSize: '1.2rem', color: '#EA9228' }}>{appState.coins} монет = {appState.coins * 2}₸</strong>
        </div>
      </Card>

      {notice && <Card className="info-card warning-card">{notice}</Card>}

      <div className="shop-grid">
        {rewardCards.map(({ reward, request, missing }) => {
          const isPending = request?.status === 'pending';
          const isApproved = request?.status === 'approved';
          const isLocked = missing.length > 0 && !isPending && !isApproved;
          const buttonState = isApproved ? 'approved' : isPending ? 'pending' : isLocked ? 'locked' : 'available';
          const buttonLabel = { available: 'Попросить родителя', pending: 'Ожидает решения', approved: 'Купон одобрен ✓', locked: 'Пока закрыто' }[buttonState];

          return (
            <Card key={reward.id} className={`family-reward-card ${isApproved ? 'family-reward-card--approved' : ''}`}>
              <div className="reward-main">
                <span className="shop-card-icon">{reward.icon}</span>
                <h3 className="shop-card-title">{reward.title}</h3>
                {/* Явная стоимость в тенге */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
                  <span className="shop-card__cost">{reward.cost} ботакоинов</span>
                  <span style={{ color: '#4DB6AC', fontWeight: 700 }}>≈ {reward.tenge}₸ скидки</span>
                </div>
                <p className="muted">{reward.description}</p>
              </div>

              {/* Прогресс-бар монет */}
              <div style={{ margin: '0.5rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span className="muted" style={{ fontSize: '0.8rem' }}>Прогресс монет</span>
                  <span className="muted" style={{ fontSize: '0.8rem' }}>{Math.min(appState.coins, reward.cost)}/{reward.cost}</span>
                </div>
                <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (appState.coins / reward.cost) * 100)}%`,
                    height: '100%',
                    background: appState.coins >= reward.cost ? '#4DB6AC' : '#EA9228',
                    borderRadius: '4px',
                    transition: 'width 0.5s',
                  }} />
                </div>
              </div>

              {missing.length > 0 && !isPending && !isApproved && (
                <div className="shop-missing-list">
                  {missing.map((item) => <span key={item}>⚠️ {item}</span>)}
                </div>
              )}

              <Button
                type="button"
                variant={buttonState === 'available' ? 'primary' : 'secondary'}
                disabled={buttonState !== 'available'}
                onClick={() => handleRequest(reward)}
              >
                {buttonLabel}
              </Button>
            </Card>
          );
        })}
      </div>

      <div style={{ padding: '0.5rem 1rem', background: '#F5F5F5', borderRadius: '12px', margin: '0 0 1rem' }}>
        <p className="muted" style={{ margin: 0, fontSize: '0.85rem', textAlign: 'center' }}>
          💡 Купоны активируются в Parent Mode — мама подтверждает PIN-кодом
        </p>
      </div>

      <div className="bottom-actions">
        <Button variant="secondary" onClick={() => goToScreen('map')}>← Карта</Button>
        <Button variant="ghost" onClick={() => goToScreen('studio')}>Мир Боты</Button>
      </div>
    </section>
  );
}

export default ShopPage;
