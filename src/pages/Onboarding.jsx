import React, { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Mascot from '../components/Mascot';
import { useLang } from '../contexts/LangContext';

const ages = ['7', '8', '9', '10', '11'];

const avatars = [
  { id: 'bear',   emoji: '🐻', ru: 'Медведь', kz: 'Аю'     },
  { id: 'eagle',  emoji: '🦅', ru: 'Беркут',  kz: 'Бүркіт'  },
  { id: 'horse',  emoji: '🐎', ru: 'Конь',    kz: 'Жылқы'  },
  { id: 'fox',    emoji: '🦊', ru: 'Лиса',    kz: 'Түлкі'   },
  { id: 'wolf',   emoji: '🐺', ru: 'Волк',    kz: 'Қасқыр' },
  { id: 'rabbit', emoji: '🐇', ru: 'Зайчик',  kz: 'Қоян'   },
];

function Onboarding({ completeOnboarding }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('9');
  const [avatar, setAvatar] = useState('bear');
  const { lang, t } = useLang();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 2) { setStep(3); return; }
  };

  const handleFinish = () => {
    completeOnboarding({ name: name.trim() || 'Дос', age, avatar });
  };

  const backLabel = lang === 'kz' ? '← Артқа' : '← Назад';

  /* ── Step 1: Welcome ── */
  if (step === 1) {
    return (
      <section className="screen onboarding-screen onboarding-screen--welcome">
        <div className="onboarding-scene" aria-hidden="true">
          <span className="onboarding-sun" />
          <span className="onboarding-cloud onboarding-cloud--1" />
          <span className="onboarding-cloud onboarding-cloud--2" />
          <span className="onboarding-hill onboarding-hill--back" />
          <span className="onboarding-hill onboarding-hill--front" />
        </div>

        <Card className="stack onboarding-hero">
          <div className="onboarding-welcome-badge">{t('onb.badge')}</div>
          <Mascot mood="main" size="large" speech={t('onb.greeting')} />
          <h2 className="hero-title onboarding-title">{t('onb.title')}</h2>
          <p className="muted onboarding-sub">{t('onb.sub')}</p>

          <div className="onboarding-features">
            <div className="onboarding-feature">
              <span className="onboarding-feature__ico">🗺️</span>
              <span className="onboarding-feature__txt">{t('onb.feat.locations')}</span>
            </div>
            <div className="onboarding-feature">
              <span className="onboarding-feature__ico">🎮</span>
              <span className="onboarding-feature__txt">{t('onb.feat.games')}</span>
            </div>
            <div className="onboarding-feature">
              <span className="onboarding-feature__ico">🪙</span>
              <span className="onboarding-feature__txt">{t('onb.feat.coins')}</span>
            </div>
          </div>
        </Card>

        <Button onClick={() => setStep(2)}>{t('onb.start')}</Button>
      </section>
    );
  }

  /* ── Step 2: Name + Age ── */
  if (step === 2) {
    return (
      <section className="screen onboarding-screen">
        <div className="onboarding-step-indicator">
          <span className="onboarding-step onboarding-step--done">1</span>
          <span className="onboarding-step-line" />
          <span className="onboarding-step onboarding-step--active">2</span>
          <span className="onboarding-step-line" />
          <span className="onboarding-step">3</span>
        </div>

        <Mascot mood="thinking" size="small" speech={t('onb.thinking')} />

        <form className="stack" onSubmit={handleSubmit}>
          <Card className="stack onboarding-form-card">
            <h3 className="section-title">{t('onb.step.about')}</h3>

            <label className="onboarding-field">
              <span className="field-label">{t('onb.name')}</span>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('onb.namePlaceholder')}
                aria-label={t('onb.name')}
                autoFocus
              />
            </label>

            <div>
              <span className="field-label">{t('onb.age')}</span>
              <div className="age-grid onboarding-age-grid">
                {ages.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`age-chip ${age === item ? 'active' : ''}`}
                    onClick={() => setAge(item)}
                    aria-pressed={age === item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Button type="submit">{t('ui.next')}</Button>
          <Button variant="ghost" type="button" onClick={() => setStep(1)}>{backLabel}</Button>
        </form>
      </section>
    );
  }

  /* ── Step 3: Avatar ── */
  return (
    <section className="screen onboarding-screen">
      <div className="onboarding-step-indicator">
        <span className="onboarding-step onboarding-step--done">1</span>
        <span className="onboarding-step-line onboarding-step-line--done" />
        <span className="onboarding-step onboarding-step--done">2</span>
        <span className="onboarding-step-line" />
        <span className="onboarding-step onboarding-step--active">3</span>
      </div>

      <Mascot mood="happy" size="small" speech={
        lang === 'kz'
          ? `${name || 'Дос'}, серігіңді таңда!`
          : `${name || 'Дос'}, выбери своего друга!`
      } />

      <Card className="stack onboarding-form-card">
        <h3 className="section-title">{t('onb.companion')}</h3>
        <p className="muted">{t('onb.companionSub')}</p>

        <div className="avatar-grid">
          {avatars.map((av) => (
            <button
              key={av.id}
              type="button"
              className={`avatar-chip ${avatar === av.id ? 'active' : ''}`}
              onClick={() => setAvatar(av.id)}
              aria-pressed={avatar === av.id}
            >
              <span className="avatar-chip__emoji">{av.emoji}</span>
              <span className="avatar-chip__label">{lang === 'kz' ? av.kz : av.ru}</span>
            </button>
          ))}
        </div>
      </Card>

      <Button onClick={handleFinish}>
        {t('onb.goBtn')}, {name || 'Дос'}! 🚀
      </Button>
      <Button variant="ghost" onClick={() => setStep(2)}>{backLabel}</Button>
    </section>
  );
}

export default Onboarding;
