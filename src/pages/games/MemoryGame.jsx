import React, { useMemo, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Mascot from '../../components/Mascot';

const wordPairs = [
  { key: 'су',    kazakh: 'Су',      russian: 'Вода'     },
  { key: 'үй',    kazakh: 'Үй',      russian: 'Дом'      },
  { key: 'күн',   kazakh: 'Күн',     russian: 'Солнце'   },
  { key: 'жер',   kazakh: 'Жер',     russian: 'Земля'    },
  { key: 'дос',   kazakh: 'Дос',     russian: 'Друг'     },
  { key: 'ат',    kazakh: 'Ат',      russian: 'Лошадь'   },
  { key: 'нан',   kazakh: 'Нан',     russian: 'Хлеб'     },
  { key: 'тау',   kazakh: 'Тау',     russian: 'Гора'     },
];

function createDeck() {
  return wordPairs
    .flatMap((pair) => [
      { id: `${pair.key}-kz`, pairKey: pair.key, text: pair.kazakh,  type: 'kazakh'  },
      { id: `${pair.key}-ru`, pairKey: pair.key, text: pair.russian, type: 'russian' },
    ])
    .sort(() => Math.random() - 0.5);
}

function MemoryGame({ finishGame, goToScreen }) {
  const deck = useMemo(() => createDeck(), []);
  const [firstCard, setFirstCard]   = useState(null);   // id of first opened card
  const [secondCard, setSecondCard] = useState(null);   // id of second opened card
  const [matchedCards, setMatchedCards] = useState([]);
  const [wrongPair, setWrongPair]   = useState([]);
  const [locked, setLocked]         = useState(false);  // block clicks while checking

  const openCards = [firstCard, secondCard].filter(Boolean);
  const isComplete = matchedCards.length === deck.length;
  const matchedPairs = matchedCards.length / 2;
  const totalPairs = deck.length / 2;

  const handleCardClick = (card) => {
    // Block: already open, already matched, or mid-check
    if (locked) return;
    if (openCards.includes(card.id)) return;
    if (matchedCards.includes(card.id)) return;

    // First card
    if (!firstCard) {
      setFirstCard(card.id);
      return;
    }

    // Second card — lock board immediately
    setSecondCard(card.id);
    setLocked(true);

    const cardA = deck.find((c) => c.id === firstCard);
    const cardB = card;

    if (cardA.pairKey === cardB.pairKey) {
      // Match — unlock quickly
      setTimeout(() => {
        setMatchedCards((prev) => [...prev, firstCard, cardB.id]);
        setFirstCard(null);
        setSecondCard(null);
        setLocked(false);
      }, 400);
    } else {
      // No match — show both open for 1 second then close
      setWrongPair([firstCard, cardB.id]);
      setTimeout(() => {
        setFirstCard(null);
        setSecondCard(null);
        setWrongPair([]);
        setLocked(false);
      }, 1000);
    }
  };

  return (
    <section className="screen">
      <Mascot mood="thinking" size="small" speech="Найди пары: казахское слово и перевод!" />

      <Card className="stack memory-intro-card">
        <div className="memory-header">
          <span className="badge badge-primary">Алматы · Слова</span>
          <span className="memory-progress-chip">{matchedPairs} / {totalPairs} пар</span>
        </div>
        <p className="game-question">Соедини слово с переводом</p>

        <div className="memory-pairs-row">
          {Array.from({ length: totalPairs }, (_, i) => (
            <span key={i} className={`memory-pair-dot ${i < matchedPairs ? 'memory-pair-dot--matched' : ''}`} />
          ))}
        </div>

        <div className="memory-legend">
          <span className="memory-legend-item memory-legend-item--kz">🇰🇿 Казахский</span>
          <span className="memory-legend-sep">↔</span>
          <span className="memory-legend-item memory-legend-item--ru">🇷🇺 Русский</span>
        </div>
      </Card>

      <div className="memory-grid memory-grid--words">
        {deck.map((card) => {
          const isOpen    = openCards.includes(card.id) || matchedCards.includes(card.id);
          const isMatched = matchedCards.includes(card.id);
          const isWrong   = wrongPair.includes(card.id);
          const isKazakh  = card.type === 'kazakh';

          return (
            <button
              key={card.id}
              type="button"
              className={`memory-card memory-word-card
                ${isOpen    ? 'open'    : ''}
                ${isMatched ? 'matched' : ''}
                ${isWrong   ? 'wrong'   : ''}
                ${isKazakh  ? 'memory-word-card--kz' : 'memory-word-card--ru'}`}
              onClick={() => handleCardClick(card)}
              aria-label={isOpen ? card.text : 'Закрытая карточка'}
            >
              <span className="memory-card__inner">
                <span className="memory-card__face memory-card__face--back" aria-hidden="true">
                  <span className="memory-card__ornament" />
                  <span className="memory-card__brand">{isKazakh ? '🇰🇿' : '🇷🇺'}</span>
                </span>
                <span className="memory-card__face memory-card__face--front" aria-hidden="true">
                  <span className="memory-word-card__lang">{isKazakh ? 'Қаз' : 'Рус'}</span>
                  <span className="memory-word-card__text">{card.text}</span>
                  {isMatched && <span className="memory-match-check">✓</span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {isComplete && (
        <>
          <div className="game-finish-confetti" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className={`confetti-piece confetti-piece--${i % 6}`} />
            ))}
          </div>
          <Card className="success-card memory-success-card">
            <div className="game-finish-trophy">🎉</div>
            <h3>Все {totalPairs} пар найдены!</h3>
            <p className="muted">Ты знаешь {totalPairs} казахских слов!</p>
            <div className="reward-coin-big">+10 ботакоинов</div>
          </Card>
          <Button onClick={() => finishGame('memory', 10)}>Забрать монеты! 💰</Button>
        </>
      )}

      <Button variant="secondary" onClick={() => goToScreen('map')}>Назад на карту</Button>
    </section>
  );
}

export default MemoryGame;
