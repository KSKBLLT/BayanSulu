import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Mascot from '../components/Mascot';
import { CollectibleVisual } from '../components/world/WorldItems';
import { collectibleByGameId, learningReceiptByGameId } from '../data/collectibles';
import { getCardForGame } from '../data/knowledgeCards';

const allGameIds = ['math', 'memory', 'words'];
const skillLabelByGameId = { memory: 'Память', math: 'Счёт', words: 'Казахский язык' };

function getNextHint(appState) {
  const completedGames = Array.isArray(appState.completedGames) ? appState.completedGames : [];
  const remainingGameId = allGameIds.find((id) => !completedGames.includes(id));
  if (!remainingGameId) return 'Скоро появятся новые локации. Попробуй QR-разблокировку!';
  const collectible = collectibleByGameId[remainingGameId];
  if (!collectible) return 'Продолжай проходить игры!';
  if (remainingGameId === 'memory') return `Пройди игру на память → открой ${collectible.title}`;
  if (remainingGameId === 'math') return `Реши задачи → открой ${collectible.title}`;
  return `Выучи казахские слова → открой ${collectible.title}`;
}

function RewardPage({ appState, goToScreen }) {
  const lastReward = appState.lastReward;
  const collectible = lastReward?.gameId ? collectibleByGameId[lastReward.gameId] : null;
  const receipt = lastReward?.learningReceipt || learningReceiptByGameId[lastReward?.gameId] || null;
  const isRepeat = Boolean(lastReward?.alreadyReceived);
  const nextHint = getNextHint(appState);
  const knowledgeCard = lastReward?.gameId ? getCardForGame(lastReward.gameId) : null;

  const handleOpenStudio = () => {
    if (collectible?.id && !isRepeat) { goToScreen('studio', { newlyUnlocked: collectible.id }); return; }
    goToScreen('studio');
  };

  return (
    <section className="screen reward-screen">
      <Card className={`reward-hero ${isRepeat ? 'reward-hero--repeat' : 'reward-hero--reveal'}`}>
        <div className="reward-hero__top">
          <span className={`badge ${isRepeat ? 'badge-muted' : 'badge-success'}`}>
            {isRepeat ? 'Предмет уже открыт' : 'Новый предмет открыт!'}
          </span>
          <h2 className="reward-title">Жарайсың! 🎉</h2>
        </div>

        <div className="reward-hero__stage">
          <Mascot mood="happy" size="large" speech="Смотри, что ты открыл!" className="reward-mascot" />

          {collectible ? (
            <div className="reward-hero__body">
              <div className="reward-celebration" aria-hidden="true">
                {!isRepeat && (
                  <div className="reward-particles">
                    {[1,2,3,4,5,6].map((n) => <span key={n} className={`reward-particle reward-particle--${n}`} />)}
                  </div>
                )}
                {!isRepeat && <span className="reward-glow" />}
                <div className={`reward-visual-shell ${!isRepeat ? 'reward-visual-shell--active' : ''}`}>
                  <CollectibleVisual visualKey={collectible.visualKey} locked={false} size="large" highlighted={!isRepeat} />
                </div>
              </div>
              <div className="reward-hero__body-copy">
                <span className="badge badge-muted">{collectible.category}</span>
                <h3 className="reward-hero__item-title">{collectible.title}</h3>
                <p className="muted">{collectible.learning}</p>
              </div>
              <div className="reward-coin reward-coin--burst">
                <span className="coin-burst">
                  {[1,2,3].map((n) => <span key={n} className="coin-burst__coin" />)}
                </span>
                <strong>{isRepeat ? 'Награда уже получена' : `+${lastReward.coins} ботакоинов`}</strong>
              </div>
            </div>
          ) : (
            <div className="reward-hero__empty">
              <p className="muted">Пройди первую игру — и предмет откроется.</p>
            </div>
          )}
        </div>
      </Card>

      {/* === КАРТОЧКА ЗНАНИЙ О КАЗАХСТАНЕ === */}
      {knowledgeCard && (
        <Card className="stack" style={{
          border: `2px solid ${knowledgeCard.color}`,
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{ background: knowledgeCard.color, padding: '0.75rem 1rem', margin: '-1rem -1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2rem' }}>{knowledgeCard.emoji}</span>
            <div>
              <div style={{ color: '#fff', fontSize: '0.8rem', opacity: 0.9 }}>🗺️ {knowledgeCard.location}</div>
              <strong style={{ color: '#fff', fontSize: '1rem' }}>{knowledgeCard.title}</strong>
            </div>
            <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '0.2rem 0.6rem', color: '#fff', fontSize: '0.75rem' }}>Карточка знаний</span>
          </div>
          <div style={{ padding: '0.75rem 0 0' }}>
            <p style={{ margin: 0, lineHeight: 1.5 }}>{knowledgeCard.fact}</p>
          </div>
          <div style={{ background: '#F5F5F5', borderRadius: '8px', padding: '0.5rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🪙</span>
            <span className="muted" style={{ fontSize: '0.85rem' }}>Баланс: <strong>{appState.coins} ботакоинов</strong> = {appState.coins * 2}₸ скидки</span>
          </div>
        </Card>
      )}

      {/* Что изучил */}
      {lastReward && receipt && (
        <Card className="stack reward-receipt-card">
          <h3 className="section-title">Что ты изучил</h3>
          <div className="stack">
            <div className="learning-unit">
              <strong>Навык: {skillLabelByGameId[lastReward.gameId]}</strong>
              <p className="muted">{receipt.done}</p>
            </div>
            <div className="learning-unit">
              <strong>Что узнал</strong>
              <p className="muted">{receipt.learned}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="info-card reward-next-card">
        <h3 className="section-title">Следующее открытие</h3>
        <p className="muted">{nextHint}</p>
      </Card>

      <Button variant="primary" onClick={handleOpenStudio}>Добавить в Мир Боты</Button>
      <Button variant="secondary" onClick={() => goToScreen('map')}>Вернуться на карту</Button>
    </section>
  );
}

export default RewardPage;
