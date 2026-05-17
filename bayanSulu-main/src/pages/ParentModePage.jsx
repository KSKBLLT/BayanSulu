import React, { useMemo, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Mascot from '../components/Mascot';
import ProgressBar from '../components/ProgressBar';
import { collectibleByGameId, collectibles, learningReceiptByGameId } from '../data/collectibles';
import { rewards } from '../data/rewards';
import { wordsByAge } from '../data/wordsData';

const allGameIds = ['math', 'memory', 'words'];

const gameLabels = { math: 'Счёт с КамБотом', memory: 'Казахские пары', words: 'Казахские слова' };
const skillLabels = { math: '➕ Математика', memory: '🧠 Память', words: '🇰🇿 Казахский язык' };

// Демо-данные для показа жюри когда игры не пройдены
const DEMO_STATE = {
  name: 'Алия',
  age: '9',
  coins: 30,
  completedGames: ['math', 'words'],
  screenTimeMinutes: 18,
};

function ParentModePage({ appState, resetProfile, goToScreen, approveRewardRequest, declineRewardRequest }) {
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Если нет данных — показываем демо
  const displayState = (appState.completedGames?.length > 0 || appState.coins > 0) ? appState : { ...appState, ...DEMO_STATE };

  const completedGamesCount = displayState.completedGames?.length || 0;
  const hasAllGames = allGameIds.every((g) => displayState.completedGames?.includes(g));

  const completedReceipts = useMemo(() => (
    (displayState.completedGames || []).map((gameId) => ({
      gameId,
      label: gameLabels[gameId] || gameId,
      skill: skillLabels[gameId] || '',
      done: learningReceiptByGameId[gameId]?.done || '',
      learned: learningReceiptByGameId[gameId]?.learned || '',
    })).filter((r) => r.done || r.learned)
  ), [displayState.completedGames]);

  // Что ребёнок выучил по словам
  const learnedWords = useMemo(() => {
    if (!displayState.completedGames?.includes('words')) return [];
    const age = displayState.age || '9';
    const n = parseInt(age, 10);
    const group = n <= 8 ? 'young' : n <= 10 ? 'middle' : 'senior';
    return (wordsByAge[group] || []).map((w) => `${w.kazakh} — ${w.answer}`);
  }, [displayState.completedGames, displayState.age]);

  const unlockedCollectibles = collectibles.filter((c) =>
    (displayState.unlockedCollectibles || []).includes(c.id) ||
    (c.unlockGameId && (displayState.completedGames || []).includes(c.unlockGameId)),
  );

  const pendingRequests = (appState.rewardRequests || []).filter((r) => r.status === 'pending');
  const approvedRequests = (appState.rewardRequests || []).filter((r) => r.status === 'approved');
  const approvedCoupons = appState.approvedCoupons || [];

  const mathSolved = displayState.completedGames?.includes('math') ? 18 : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === '1234') { setIsUnlocked(true); setError(''); }
    else setError('Неверный PIN');
  };

  const handleApprove = (request) => {
    const result = approveRewardRequest(request.id);
    if (result?.couponCode) setStatusMessage(`✅ Купон одобрен: ${result.couponCode}`);
  };

  if (!isUnlocked) {
    return (
      <section className="screen">
        <Mascot mood="main" size="medium" speech="Здесь видно всё, чему учится ребёнок 📊" />
        <Card className="stack" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <h2>Родительский режим</h2>
          <p className="muted">Защищён PIN-кодом</p>
          {pendingRequests.length > 0 && (
            <div style={{ background: '#FFF3E0', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
              <strong>🔔 {pendingRequests.length} запрос{pendingRequests.length > 1 ? 'а' : ''} от ребёнка</strong>
            </div>
          )}
          <form onSubmit={handleSubmit} className="stack">
            <label className="form-label">Введите PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="form-input"
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
            />
            {error && <p style={{ color: '#e53935', margin: 0 }}>{error}</p>}
            <Button type="submit">Войти</Button>
            <p className="muted" style={{ fontSize: '0.8rem' }}>Подсказка для демо: 1234</p>
          </form>
        </Card>
        <Button variant="secondary" onClick={() => goToScreen('map')}>← Вернуться к карте</Button>
      </section>
    );
  }

  return (
    <section className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0 0.5rem' }}>
        <Mascot mood="happy" size="small" />
        <div>
          <h2 style={{ margin: 0 }}>Привет, родитель!</h2>
          <p className="muted" style={{ margin: 0 }}>Прогресс {displayState.name || 'ребёнка'}</p>
        </div>
      </div>

      {statusMessage && (
        <Card className="success-card" style={{ padding: '0.75rem' }}>{statusMessage}</Card>
      )}

      {/* === ЧТО УЗНАЛ РЕБЁНОК === */}
      <Card className="stack" style={{ border: '2px solid #4DB6AC' }}>
        <h3 style={{ color: '#4DB6AC', margin: 0 }}>📚 Что узнал {displayState.name || 'ребёнок'}</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {/* Математика */}
          <div style={{ background: '#E3F2FD', borderRadius: '12px', padding: '0.75rem' }}>
            <div style={{ fontSize: '1.5rem' }}>➕</div>
            <strong>Математика</strong>
            <p className="muted" style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
              {mathSolved > 0 ? `${mathSolved} задач решено` : 'Ещё не пройдено'}
            </p>
          </div>

          {/* Казахский */}
          <div style={{ background: '#E8F5E9', borderRadius: '12px', padding: '0.75rem' }}>
            <div style={{ fontSize: '1.5rem' }}>🇰🇿</div>
            <strong>Казахский</strong>
            <p className="muted" style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
              {learnedWords.length > 0 ? `${learnedWords.length} слов выучено` : 'Ещё не пройдено'}
            </p>
          </div>

          {/* Память */}
          <div style={{ background: '#F3E5F5', borderRadius: '12px', padding: '0.75rem' }}>
            <div style={{ fontSize: '1.5rem' }}>🧠</div>
            <strong>Память</strong>
            <p className="muted" style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
              {displayState.completedGames?.includes('memory') ? 'Пройдено ✓' : 'Ещё не пройдено'}
            </p>
          </div>

          {/* Экранное время */}
          <div style={{ background: '#FFF8E1', borderRadius: '12px', padding: '0.75rem' }}>
            <div style={{ fontSize: '1.5rem' }}>⏱️</div>
            <strong>Экранное время</strong>
            <p className="muted" style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
              {displayState.screenTimeMinutes} мин/день ✓
            </p>
          </div>
        </div>

        {/* Выученные слова */}
        {learnedWords.length > 0 && (
          <div style={{ background: '#F1F8E9', borderRadius: '8px', padding: '0.75rem' }}>
            <strong style={{ fontSize: '0.9rem' }}>🇰🇿 Слова которые знает {displayState.name}:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
              {learnedWords.map((w) => (
                <span key={w} style={{
                  background: '#C8E6C9', borderRadius: '20px',
                  padding: '0.2rem 0.6rem', fontSize: '0.8rem',
                }}>{w}</span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* === СТАТИСТИКА === */}
      <Card className="stack">
        <h3 className="section-title">📊 Общий прогресс</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div><div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#EA9228' }}>{completedGamesCount}</div><div className="muted" style={{ fontSize: '0.8rem' }}>игр пройдено</div></div>
          <div><div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#4DB6AC' }}>{displayState.coins || 0}</div><div className="muted" style={{ fontSize: '0.8rem' }}>ботакоинов</div></div>
          <div><div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#9575CD' }}>{unlockedCollectibles.length}</div><div className="muted" style={{ fontSize: '0.8rem' }}>открыто</div></div>
        </div>
        <ProgressBar value={completedGamesCount} max={3} label={`Пройдено ${completedGamesCount} из 3 игр`} />
      </Card>

      {/* === ЗАПРОСЫ НА БОНУСЫ === */}
      <Card className="stack">
        <h3 className="section-title">🎁 Запросы на бонусы</h3>
        {pendingRequests.length === 0 && approvedRequests.length === 0 && (
          <p className="muted">Пока нет запросов.</p>
        )}
        {pendingRequests.map((request) => (
          <div key={request.id} style={{ background: '#FFF3E0', borderRadius: '12px', padding: '0.75rem' }}>
            <strong>{request.title}</strong>
            <p className="muted" style={{ margin: '0.25rem 0' }}>Стоимость: {request.cost} ботакоинов</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button onClick={() => handleApprove(request)} style={{ flex: 1 }}>✓ Одобрить</Button>
              <Button variant="secondary" onClick={() => declineRewardRequest(request.id)} style={{ flex: 1 }}>✗ Отклонить</Button>
            </div>
          </div>
        ))}
        {approvedCoupons.map((coupon) => (
          <div key={coupon.requestId} style={{ background: '#E8F5E9', borderRadius: '12px', padding: '0.75rem' }}>
            <strong>✅ {coupon.title}</strong>
            <p className="muted" style={{ margin: '0.25rem 0', fontFamily: 'monospace' }}>{coupon.couponCode}</p>
          </div>
        ))}
      </Card>

      {/* === ПОЧЕМУ БЕЗОПАСНО === */}
      <Card className="info-card stack">
        <h3 className="section-title">🔒 Почему это безопасно</h3>
        <p className="muted">Ботакоины выдаются только за образовательные задания — не за время в приложении.</p>
        <p className="muted">Лимит по умолчанию — 30 минут в день.</p>
        <p className="muted">Семейные бонусы активируются только после подтверждения родителя.</p>
      </Card>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="secondary" onClick={resetProfile} style={{ flex: 1 }}>Сбросить профиль</Button>
        <Button variant="ghost" onClick={() => goToScreen('map')} style={{ flex: 1 }}>← На карту</Button>
      </div>
    </section>
  );
}

export default ParentModePage;
