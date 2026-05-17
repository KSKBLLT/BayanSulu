import React, { useCallback, useEffect, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Mascot from '../../components/Mascot';
import { getAgeGroup, getQuestions, ageTitles } from '../../data/mathQuestions';

const TOTAL_ROUNDS = 5;

function StarRow({ total, filled }) {
  return (
    <div className="math-star-row" aria-label={`${filled} из ${total} верно`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`math-star ${i < filled ? 'math-star--filled' : ''}`}>
          {i < filled ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
}

function MathGame({ appState, finishGame, goToScreen }) {
  const age = appState?.age || '9';
  const ageGroup = getAgeGroup(age);
  const [questions] = useState(() => getQuestions(age, TOTAL_ROUNDS));
  const [round, setRound] = useState(0);
  const [status, setStatus] = useState('idle');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentQ = questions[round];
  const progress = Math.round((round / TOTAL_ROUNDS) * 100);

  const kamBotSpeech = useCallback(() => {
    if (status === 'success') {
      const phrases = ['Дұрыс! 🎉', 'Молодец!', 'Жарайсың!', 'Отлично!', 'Супер! 🌟'];
      return phrases[Math.floor(Math.random() * phrases.length)];
    }
    if (status === 'hint') {
      if (ageGroup === 'young') return 'Посчитай на пальцах!';
      if (ageGroup === 'middle') return 'Подумай ещё раз...';
      return 'Неверно. Попробуй снова.';
    }
    if (ageGroup === 'senior') return `${ageTitles.senior} — задача ${round + 1}/${TOTAL_ROUNDS}`;
    if (ageGroup === 'middle') return `Задача ${round + 1} из ${TOTAL_ROUNDS}. Решай!`;
    return `Помоги КамБоту посчитать! (${round + 1}/${TOTAL_ROUNDS})`;
  }, [status, ageGroup, round]);

  const handleAnswer = (answer) => {
    if (status === 'success') return;
    setSelectedAnswer(answer);
    if (answer === currentQ.answer) {
      setScore((s) => s + 1);
      setStatus('success');
    } else {
      setStatus('hint');
    }
  };

  const handleNext = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      setShowCelebration(true);
    } else {
      setRound((r) => r + 1);
      setStatus('idle');
      setSelectedAnswer(null);
    }
  };

  const handleFinish = () => {
    const coins = Math.max(5, score * 4 + 5);
    finishGame('math', coins);
  };

  if (showCelebration) {
    const perfect = score === TOTAL_ROUNDS;
    const great = score >= TOTAL_ROUNDS - 1;
    return (
      <section className="screen game-finish-screen">
        <div className="game-finish-confetti" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className={`confetti-piece confetti-piece--${i % 6}`} />
          ))}
        </div>
        <Mascot
          mood="happy"
          size="large"
          speech={perfect ? 'Жарайсың! Всё верно! 🏆' : `Молодец! ${score} из ${TOTAL_ROUNDS} верно!`}
        />
        <Card className="success-card stack game-finish-card">
          <div className="game-finish-trophy">{perfect ? '🏆' : great ? '🥈' : '⭐'}</div>
          <h2 className="game-finish-title">{perfect ? 'Идеальный счёт!' : 'Хорошая работа!'}</h2>
          <StarRow total={TOTAL_ROUNDS} filled={score} />
          <p className="muted">{score} из {TOTAL_ROUNDS} задач решено верно</p>
          <div className="reward-coin-big">+{Math.max(5, score * 4 + 5)} ботакоинов</div>
        </Card>
        <Button onClick={handleFinish}>Забрать монеты! 💰</Button>
        <Button variant="secondary" onClick={() => goToScreen('map')}>Назад на карту</Button>
      </section>
    );
  }

  return (
    <section className="screen">
      <Mascot mood={status === 'success' ? 'happy' : 'thinking'} size="small" speech={kamBotSpeech()} />

      <Card className="stack math-game-card">
        <div className="math-game-header">
          <span className="badge badge-primary">Астана · Счёт</span>
          <span className="badge badge-muted">{ageTitles[ageGroup]}</span>
        </div>

        {/* Прогресс-полоска */}
        <div className="math-progress-wrap">
          <div className="math-progress-bar">
            <div className="math-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="math-progress-label">{round + 1} / {TOTAL_ROUNDS}</span>
        </div>

        <div className="math-equation" aria-label={`${currentQ.a} ${currentQ.op} ${currentQ.b} = ?`}>
          <div className="math-eq-part">
            <span className="math-eq-number">{currentQ.a}</span>
          </div>
          <span className="math-eq-op">{currentQ.op}</span>
          <div className="math-eq-part">
            <span className="math-eq-number">{currentQ.b}</span>
          </div>
          <span className="math-eq-op math-eq-op--equals">=</span>
          <div className="math-eq-result">?</div>
        </div>
      </Card>

      <div className="game-options math-options">
        {currentQ.options.map((answer) => (
          <button
            key={answer}
            type="button"
            className={`answer-option math-answer-option
              ${selectedAnswer === answer && status === 'success' ? 'correct' : ''}
              ${selectedAnswer === answer && status === 'hint' ? 'soft-wrong' : ''}`}
            onClick={() => handleAnswer(answer)}
            disabled={status === 'success'}
          >
            <span className="math-answer-option__value">{answer}</span>
          </button>
        ))}
      </div>

      {status === 'hint' && (
        <Card className="info-card math-hint-card">
          {ageGroup === 'young' ? '🤔 Посчитай ещё раз!' : '❌ Неверно. Попробуй снова!'}
        </Card>
      )}

      {status === 'success' && (
        <>
          <Card className="success-card math-success-card">
            <span className="math-correct-icon">✓</span>
            <p>{round + 1 < TOTAL_ROUNDS ? 'Следующий вопрос!' : 'Последний вопрос решён!'}</p>
          </Card>
          <Button onClick={handleNext}>
            {round + 1 < TOTAL_ROUNDS ? 'Дальше →' : 'Посмотреть результат 🏆'}
          </Button>
        </>
      )}

      <Button variant="secondary" onClick={() => goToScreen('map')}>Назад на карту</Button>
    </section>
  );
}

export default MathGame;
