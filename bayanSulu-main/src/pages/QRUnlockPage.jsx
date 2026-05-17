import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Mascot from '../components/Mascot';

const locationInfo = {
  charyn: {
    title: 'Чарын',
    icon: '🏜️',
    subtitle: 'Каньон возрастом 12 миллионов лет',
    unlockMessage: 'Ты открыл Чарынский каньон! 🏜️',
    fact: 'Чарынский каньон старше Большого каньона в США. Глубина — 300 метров!',
  },
  turkestan: {
    title: 'Туркестан',
    icon: '🕌',
    subtitle: 'Древний город Казахстана',
    unlockMessage: 'Ты открыл Туркестан! 🕌',
    fact: 'Мавзолей Яссауи — объект ЮНЕСКО. Ему более 600 лет!',
  },
};

function QRUnlockPage({ appState, unlockLocation, goToScreen }) {
  const locationId = appState?.qrTarget || 'charyn';
  const info = locationInfo[locationId] || locationInfo.charyn;
  const [phase, setPhase] = useState('prompt'); // prompt → scanning → unlocked

  const handleScan = () => {
    setPhase('scanning');
    setTimeout(() => setPhase('unlocked'), 2000);
  };

  const handleContinue = () => {
    unlockLocation(locationId);
    goToScreen('map');
  };

  if (phase === 'scanning') {
    return (
      <section className="screen" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'pulse 0.8s infinite' }}>📱</div>
        <h2>Сканирую...</h2>
        <p className="muted">Ищу QR-код на упаковке Боты</p>
        <div style={{
          marginTop: '2rem',
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
        }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              width: 12, height: 12, borderRadius: '50%',
              background: '#EA9228',
              animation: `bounce 0.8s ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </section>
    );
  }

  if (phase === 'unlocked') {
    return (
      <section className="screen">
        <Mascot mood="happy" size="large" speech={info.unlockMessage} />
        <Card className="success-card stack" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '4rem' }}>{info.icon}</div>
          <h2 style={{ color: '#EA9228' }}>{info.title} разблокирован!</h2>
          <p className="muted">{info.subtitle}</p>
          <div style={{
            background: '#FFF8E1',
            borderRadius: '12px',
            padding: '1rem',
            marginTop: '0.5rem',
            borderLeft: '4px solid #EA9228',
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>🗺️ <strong>Факт:</strong> {info.fact}</p>
          </div>
          <div className="reward-coin" style={{ marginTop: '1rem' }}>
            <strong>+20 ботакоинов за разблокировку!</strong>
          </div>
        </Card>
        <Button onClick={handleContinue}>Отправиться в {info.title}! →</Button>
      </section>
    );
  }

  // phase === 'prompt'
  return (
    <section className="screen">
      <Mascot
        mood="thinking"
        size="small"
        speech={`${info.title} заперт! Найди QR на упаковке Боты 📦`}
      />

      <Card className="stack" style={{ textAlign: 'center', padding: '1.5rem' }}>
        <div style={{ fontSize: '3rem' }}>{info.icon}</div>
        <h2>{info.title}</h2>
        <p className="muted">{info.subtitle}</p>
        <div style={{
          background: '#F5F5F5',
          borderRadius: '16px',
          padding: '2rem',
          margin: '1rem 0',
          border: '2px dashed #EA9228',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
          <p style={{ margin: 0, fontWeight: 600 }}>Найди QR-код</p>
          <p className="muted" style={{ margin: '0.25rem 0 0' }}>на упаковке любой продукции «Бота»</p>
        </div>
        <Button onClick={handleScan}>Симулировать сканирование 📷</Button>
        <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          * В реальном приложении здесь открывается камера
        </p>
      </Card>

      <Button variant="secondary" onClick={() => goToScreen('map')}>← Назад на карту</Button>
    </section>
  );
}

export default QRUnlockPage;
