import React from 'react';
import { useLang } from '../contexts/LangContext';

function MapIcon({ active }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M13 3C9.13 3 6 6.13 6 10c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill={active ? '#EA9228' : 'none'}
        stroke={active ? '#C97212' : '#9B8470'}
        strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="13" cy="10" r="2.5"
        fill={active ? '#fff' : '#9B8470'}
        stroke={active ? '#C97212' : 'none'} strokeWidth="1"/>
    </svg>
  );
}

function StudioIcon({ active }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="9"
        fill={active ? '#C8EDE8' : 'none'}
        stroke={active ? '#2DB8AF' : '#9B8470'} strokeWidth="2"/>
      <path d="M7 15 Q10 11 13 13 Q16 15 19 11"
        stroke={active ? '#2DB8AF' : '#9B8470'} strokeWidth="1.8"
        strokeLinecap="round" fill="none"/>
      <circle cx="10" cy="9" r="1.5" fill={active ? '#EA9228' : '#9B8470'}/>
      <circle cx="17" cy="16" r="1.2" fill={active ? '#EA9228' : '#9B8470'}/>
    </svg>
  );
}

function CardsIcon({ active }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect x="4" y="7" width="14" height="15" rx="3"
        fill={active ? '#4FB6AD' : 'none'}
        stroke={active ? '#3B9F97' : '#9B8470'} strokeWidth="2"/>
      <rect x="8" y="4" width="14" height="15" rx="3"
        fill={active ? '#E8F9F8' : 'none'}
        stroke={active ? '#3B9F97' : '#9B8470'} strokeWidth="2"/>
      <line x1="11" y1="10" x2="18" y2="10" stroke={active ? '#3B9F97' : '#9B8470'} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="11" y1="13" x2="16" y2="13" stroke={active ? '#3B9F97' : '#9B8470'} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function ShopIcon({ active }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect x="3" y="10" width="20" height="3" rx="1.5"
        fill={active ? '#EA9228' : 'none'}
        stroke={active ? '#C97212' : '#9B8470'} strokeWidth="2"/>
      <rect x="5" y="13" width="16" height="9" rx="2"
        fill={active ? '#FFF3DC' : 'none'}
        stroke={active ? '#C97212' : '#9B8470'} strokeWidth="2"/>
      <path d="M13 10 C13 10 9 7 9 5.5C9 4.5 10 4 11 4.5C12 5 13 7 13 7C13 7 14 5 15 4.5C16 4 17 4.5 17 5.5C17 7 13 10 13 10Z"
        fill={active ? '#EA9228' : '#9B8470'}/>
      <line x1="13" y1="10" x2="13" y2="22" stroke={active ? '#C97212' : '#9B8470'} strokeWidth="1.5"/>
    </svg>
  );
}

function ParentIcon({ active }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="10" cy="8" r="3"
        fill={active ? '#DF6C7F' : 'none'}
        stroke={active ? '#C45570' : '#9B8470'} strokeWidth="2"/>
      <path d="M4 22c0-4 2.5-6 6-6s6 2 6 6"
        stroke={active ? '#C45570' : '#9B8470'} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="18" cy="10" r="2.5"
        fill={active ? '#DF6C7F' : 'none'}
        stroke={active ? '#C45570' : '#9B8470'} strokeWidth="1.8"/>
      <path d="M16 22c0-3 1.5-5 4-5"
        stroke={active ? '#C45570' : '#9B8470'} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

const navItems = [
  { screen: 'map',    labelKey: 'nav.map',    Icon: MapIcon    },
  { screen: 'studio', labelKey: 'nav.studio', Icon: StudioIcon },
  { screen: 'cards',  labelKey: 'nav.cards',  Icon: CardsIcon  },
  { screen: 'shop',   labelKey: 'nav.shop',   Icon: ShopIcon   },
  { screen: 'parent', labelKey: 'nav.parent', Icon: ParentIcon },
];

const mainScreens = ['map', 'studio', 'cards', 'shop', 'parent'];

function BottomNav({ currentScreen, onNavigate }) {
  const { t } = useLang();
  if (!mainScreens.includes(currentScreen)) return null;

  return (
    <nav className="bottom-nav" aria-label="Навигация">
      {navItems.map(({ screen, labelKey, Icon }) => {
        const active = currentScreen === screen;
        return (
          <button
            key={screen}
            type="button"
            className={`bottom-nav__item ${active ? 'bottom-nav__item--active' : ''}`}
            onClick={() => onNavigate(screen)}
            aria-current={active ? 'page' : undefined}
          >
            <span className="bottom-nav__icon"><Icon active={active} /></span>
            <span className="bottom-nav__label">{t(labelKey)}</span>
            {active && <span className="bottom-nav__dot" />}
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
