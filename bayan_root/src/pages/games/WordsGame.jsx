import React, { useEffect, useRef, useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Mascot from '../../components/Mascot';
import { getWordsByAge, getKamBotSpeech } from '../../data/wordsData';

function WordsGame({ appState, finishGame, goToScreen }) {
  const age = appState?.age || '9';
  const [questions] = useState(() => getWordsByAge(age));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState('idle');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [finishedQuiz, setFinishedQuiz] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const advanceTimerRef = useRef(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressLabel = `Слово ${currentIndex + 1} из ${questions.length}`;

  useEffect(() => () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
  }, []);

  const handleAnswer = (answer) => {
    if (status === 'success') return;
    setSelectedAnswer(answer);

    if (answer === currentQuestion.answer) {
      setCorrectCount((c) => c + 1);
      setStatus('success');
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);

      if (isLastQuestion) {
        setFinishedQuiz(true);
        return;
      }

      advanceTimerRef.current = setTimeout(() => {
        setCurrentIndex((v) => v + 1);
        setStatus('idle');
        setSelectedAnswer(null);
      }, 900);
    } else {
      setStatus('hint');
    }
  };

  const handleNext = () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    setCurrentIndex((v) => v + 1);
    setStatus('idle');
    setSelectedAnswer(null);
  };

  const handleFinish = () => {
    finishGame('words', Math.max(5, correctCount * 2 + 5));
  };

  if (finishedQuiz) {
    return (
      <section className="screen">
        <Mascot mood="happy" size="large" speech="КамБот гордится тобой! 🎉" />
        <Card className="success-card stack" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '3rem' }}>🇰🇿</div>
          <h2>Ты выучил {questions.length} слов на казахском!</h2>
          <p className="muted">{correctCount} из {questions.length} — с первого раза</p>
          <div className="reward-coin" style={{ marginTop: '0.5rem' }}>
            <strong>+{Math.max(5, correctCount * 2 + 5)} ботакоинов</strong>
          </div>
        </Card>
        <Button onClick={handleFinish}>Получить монеты!</Button>
        <Button variant="secondary" onClick={() => goToScreen('map')}>Назад на карту</Button>
      </section>
    );
  }

  return (
    <section className="screen">
      <Mascot
        mood={status === 'success' ? 'happy' : 'thinking'}
        size="small"
        speech={status === 'success' ? 'Дұрыс! ✓' : status === 'hint' ? 'Подумай ещё раз...' : getKamBotSpeech(age)}
      />

      <Card className="stack words-hero-card">
        <span className="badge badge-muted">Казахские слова</span>
        <div className="words-progress-row">
          <span className="words-progress">{progressLabel}</span>
          <span className="words-progress words-progress--accent">{questions.length} слов</span>
        </div>

        {/* Прогресс-точки */}
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
          {questions.map((_, i) => (
            <span
              key={i}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i < currentIndex ? '#4DB6AC' : i === currentIndex ? '#EA9228' : '#e0e0e0',
              }}
            />
          ))}
        </div>

        <div className="words-question-card">
          <div className="words-question-card__body">
            <span className="words-question-card__label">Что значит слово</span>
            <h2 className="game-question">"{currentQuestion.kazakh}"</h2>
          </div>
        </div>
      </Card>

      <Card className="words-hint-card">
        <p className="words-hint-card__text">{currentQuestion.hintText}</p>
      </Card>

      <div className="game-options words-options">
        {currentQuestion.options.map((answer) => (
          <button
            key={answer}
            type="button"
            className={`answer-option words-answer-option ${selectedAnswer === answer && status === 'success' ? 'correct' : ''} ${selectedAnswer === answer && status === 'hint' ? 'soft-wrong' : ''}`}
            onClick={() => handleAnswer(answer)}
          >
            <span className="words-answer-option__text">{answer}</span>
          </button>
        ))}
      </div>

      {status === 'hint' && <Card className="info-card words-hint-feedback">Неверно. Попробуй ещё раз!</Card>}
      {status === 'success' && !finishedQuiz && (
        <Card className="success-card words-success-card">
          <h3>Дұрыс! ✓</h3>
          <p>{isLastQuestion ? 'Последнее слово!' : 'Следующее слово...'}</p>
        </Card>
      )}
      {status === 'success' && !finishedQuiz && !isLastQuestion && (
        <Button onClick={handleNext}>Дальше →</Button>
      )}
      {!finishedQuiz && (
        <Button variant="secondary" onClick={() => goToScreen('map')}>Назад на карту</Button>
      )}
    </section>
  );
}

export default WordsGame;
