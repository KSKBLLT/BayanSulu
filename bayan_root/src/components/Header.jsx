import React, { useRef, useState } from 'react';
import CoinBadge from './CoinBadge';
import Button from './Button';
import { useLang } from '../contexts/LangContext';

const screenTitleKeys = {
  onboarding: 'screen.onboarding',
  map:        'screen.map',
  reward:     'screen.reward',
  studio:     'screen.studio',
  shop:       'screen.shop',
  parent:     'screen.parent',
  cards:      'screen.cards',
  math:       'screen.math',
  memory:     'screen.memory',
  words:      'screen.words',
  qr:         'screen.qr',
  analytics:  'screen.analytics',
  dev:        'screen.dev',
};

const backTargets = {
  reward:    'map',
  studio:    'map',
  math:      'map',
  memory:    'map',
  words:     'map',
  qr:        'map',
  analytics: 'dev',
};

const bottomNavScreens = ['map', 'studio', 'cards', 'shop', 'parent'];

function LangToggle({ lang, setLang }) {
  return (
    <div className="lang-toggle" role="group" aria-label="Язык / Тіл">
      <button
        type="button"
        className={`lang-toggle__btn ${lang === 'ru' ? 'lang-toggle__btn--active' : ''}`}
        onClick={() => setLang('ru')}
        aria-pressed={lang === 'ru'}
      >
        РУ
      </button>
      <button
        type="button"
        className={`lang-toggle__btn ${lang === 'kz' ? 'lang-toggle__btn--active' : ''}`}
        onClick={() => setLang('kz')}
        aria-pressed={lang === 'kz'}
      >
        ҚАЗ
      </button>
    </div>
  );
}

function Header({ currentScreen, onNavigate, appState }) {
  const { lang, setLang, t } = useLang();
  const titleKey = screenTitleKeys[currentScreen];
  const title = titleKey ? t(titleKey) : t('app.name');
  const backTarget = backTargets[currentScreen];
  const showBack = backTarget && !bottomNavScreens.includes(currentScreen);

  // Secret: tap logo 7 times within 3s → dev mode
  const tapCount = useRef(0);
  const tapTimer = useRef(null);
  const [tapHint, setTapHint] = useState(false);

  const handleLogoTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);

    if (tapCount.current >= 7) {
      tapCount.current = 0;
      setTapHint(false);
      onNavigate('dev');
      return;
    }

    if (tapCount.current >= 4) setTapHint(true);

    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
      setTapHint(false);
    }, 3000);
  };

  // Dev screen: full custom header
  if (currentScreen === 'dev') return null;

  return (
    <header className="header">
      {showBack ? (
        <Button variant="ghost" className="header-back" onClick={() => onNavigate(backTarget)}>
          ←
        </Button>
      ) : (
        <div
          className="header-logo"
          aria-hidden="true"
          onClick={handleLogoTap}
          style={{ cursor: 'pointer', userSelect: 'none', position: 'relative' }}
        >
          🌟
          {tapHint && (
            <span style={{
              position: 'absolute', top: '-6px', right: '-6px',
              background: '#5ab4ff', color: '#fff',
              fontSize: '9px', fontWeight: 700,
              borderRadius: '50%', width: '14px', height: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}>
              {tapCount.current}
            </span>
          )}
        </div>
      )}

      <div className="header-title-group">
        <span className="header-kicker">{t('app.name')}</span>
        <h1 className="header__title">{title}</h1>
      </div>

      <div className="header-right">
        <LangToggle lang={lang} setLang={setLang} />
        <CoinBadge coins={appState.coins} />
      </div>
    </header>
  );
}

export default Header;
