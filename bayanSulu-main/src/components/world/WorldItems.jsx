import React from 'react';

function WorldSvg({ children, className = '', viewBox = '0 0 160 160' }) {
  return (
    <svg className={`world-item-svg ${className}`.trim()} viewBox={viewBox} role="img" aria-hidden="true">
      {children}
    </svg>
  );
}

export function AlmatyMountainsVisual() {
  const uid = React.useId().replace(/:/g, '');
  return (
    <WorldSvg className="world-item-svg--mountains">
      <defs>
        <linearGradient id={`mountainSky-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff6e8" />
          <stop offset="100%" stopColor="#dfefff" />
        </linearGradient>
        <linearGradient id={`mountainRock-${uid}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#6f8fa4" />
          <stop offset="100%" stopColor="#385267" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" fill={`url(#mountainSky-${uid})`} rx="24" />
      <path d="M0 126L30 92L56 108L88 68L118 96L160 62V160H0Z" fill="#b7d0db" opacity=".7" />
      <path d="M0 132L28 88L60 104L88 58L124 88L160 54V160H0Z" fill={`url(#mountainRock-${uid})`} />
      <path d="M48 104L63 83L78 103L67 100L60 113Z" fill="#f7fbff" />
      <path d="M92 74L105 56L119 74L109 71L105 80Z" fill="#f7fbff" />
      <path d="M123 92L137 74L150 96L140 92L137 101Z" fill="#f7fbff" />
      <path d="M0 141C18 133 31 129 48 128C66 126 84 129 102 135C121 141 140 145 160 144V160H0Z" fill="#83b36b" />
      <circle cx="32" cy="32" r="14" fill="#fff4c8" opacity=".85" />
    </WorldSvg>
  );
}

export function BaiterekVisual() {
  const uid = React.useId().replace(/:/g, '');
  return (
    <WorldSvg className="world-item-svg--baiterek">
      <defs>
        <linearGradient id={`baiterekGlow-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff1c7" />
          <stop offset="100%" stopColor="#f2c858" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" fill="#eff7ff" rx="24" />
      <path d="M74 146L86 146L92 64C93 54 98 46 106 40L102 34C90 41 82 52 81 64L74 146Z" fill="#8ea3af" />
      <path d="M66 146L78 146L72 64C71 52 63 41 51 34L47 40C55 46 60 54 61 64L66 146Z" fill="#6f8490" />
      <path d="M58 98H102L108 112H52Z" fill="#d9e7ef" />
      <circle cx="80" cy="38" r="22" fill={`url(#baiterekGlow-${uid})`} />
      <circle cx="80" cy="38" r="10" fill="#fff9d9" />
      <path d="M18 146H142" stroke="#b3c9d6" strokeWidth="8" strokeLinecap="round" />
      <path d="M22 146C36 136 54 132 80 132C106 132 124 136 138 146" fill="#93c37b" />
    </WorldSvg>
  );
}

export function YurtVisual() {
  return (
    <WorldSvg className="world-item-svg--yurt">
      <rect width="160" height="160" fill="#fff6ef" rx="24" />
      <path d="M34 110C34 79 54 54 80 54C106 54 126 79 126 110Z" fill="#f3dfc1" />
      <path d="M42 108C42 80 58 62 80 62C102 62 118 80 118 108Z" fill="#fffaf5" />
      <path d="M56 109H104V132H56Z" fill="#a56b39" />
      <path d="M62 102H98" stroke="#d68f54" strokeWidth="4" strokeLinecap="round" />
      <path d="M68 71C74 67 86 67 92 71" stroke="#c68c46" strokeWidth="4" strokeLinecap="round" />
      <path d="M48 96C63 87 97 87 112 96" stroke="#d6b17f" strokeWidth="4" strokeLinecap="round" />
      <circle cx="80" cy="56" r="10" fill="#efc26d" />
      <circle cx="80" cy="56" r="4" fill="#fff7e9" />
    </WorldSvg>
  );
}

export function CharynVisual() {
  return (
    <WorldSvg className="world-item-svg--charyn">
      <rect width="160" height="160" fill="#ffe6cf" rx="24" />
      <path d="M0 122L18 94L36 104L52 76L70 90L90 58L108 82L128 54L160 88V160H0Z" fill="#b45f3a" />
      <path d="M12 126L26 104L40 112L54 88L72 98L90 72L112 96L132 66L160 100V160H0Z" fill="#7f3f28" opacity=".92" />
      <path d="M0 148C20 140 39 137 60 136C80 135 102 138 121 143C136 147 149 151 160 154V160H0Z" fill="#d48b4c" />
      <path d="M50 104L60 82L74 104Z" fill="#efc18d" />
      <path d="M94 82L102 66L114 84Z" fill="#f4d0a8" />
    </WorldSvg>
  );
}

export function DombraVisual() {
  return (
    <WorldSvg className="world-item-svg--dombra">
      <rect width="160" height="160" fill="#fff8ed" rx="24" />
      <path d="M83 38C72 42 63 54 60 66L54 103C52 112 45 120 34 123L36 130C49 127 60 117 63 104L68 76C71 64 79 54 89 50Z" fill="#b37a41" />
      <path d="M79 40C96 34 113 46 118 63C122 77 116 92 103 99C91 106 74 103 65 91C56 79 56 63 63 52C67 45 73 42 79 40Z" fill="#8b562d" />
      <circle cx="96" cy="74" r="8" fill="#efcf9d" />
      <rect x="100" y="31" width="9" height="48" rx="4.5" fill="#7c4a25" transform="rotate(22 104 55)" />
      <path d="M104 41L120 24" stroke="#7c4a25" strokeWidth="5" strokeLinecap="round" />
      <path d="M63 96C74 90 88 90 99 96" stroke="#e9c997" strokeWidth="3" strokeLinecap="round" />
      <path d="M66 107C77 102 88 102 99 107" stroke="#e9c997" strokeWidth="3" strokeLinecap="round" />
    </WorldSvg>
  );
}

export function AppleTreeVisual() {
  return (
    <WorldSvg className="world-item-svg--apple-tree">
      <rect width="160" height="160" fill="#f1fff2" rx="24" />
      <path d="M78 138V96" stroke="#8a5a34" strokeWidth="16" strokeLinecap="round" />
      <path d="M82 96C68 76 54 64 42 58C52 50 67 50 78 60C81 44 93 36 108 36C122 36 133 44 140 56C127 60 113 71 101 92Z" fill="#78b65f" />
      <path d="M78 62C64 48 46 44 34 52C25 58 22 70 25 80C35 74 48 72 60 76C65 68 71 64 78 62Z" fill="#8bcf6a" />
      <circle cx="56" cy="70" r="8" fill="#e54e3f" />
      <circle cx="74" cy="58" r="8" fill="#e54e3f" />
      <circle cx="96" cy="66" r="8" fill="#e54e3f" />
      <circle cx="114" cy="58" r="8" fill="#e54e3f" />
      <path d="M57 138H103" stroke="#6f4526" strokeWidth="8" strokeLinecap="round" />
    </WorldSvg>
  );
}

export function KazakhOrnamentVisual() {
  return (
    <WorldSvg className="world-item-svg--ornament">
      <rect width="160" height="160" fill="#fff5e4" rx="24" />
      <rect x="22" y="22" width="116" height="116" rx="20" fill="#fffdf7" stroke="#ddb86b" strokeWidth="6" />
      <path d="M48 48L64 64L48 80L32 64Z" fill="#ce9d39" />
      <path d="M112 48L128 64L112 80L96 64Z" fill="#ce9d39" />
      <path d="M48 112L64 128L48 144L32 128Z" fill="#ce9d39" />
      <path d="M112 112L128 128L112 144L96 128Z" fill="#ce9d39" />
      <path d="M80 38L88 54L104 62L88 70L80 86L72 70L56 62L72 54Z" fill="#b35d2e" />
      <path d="M80 74L88 90L104 98L88 106L80 122L72 106L56 98L72 90Z" fill="#6f9e63" />
      <path d="M38 80H122" stroke="#c98f2e" strokeWidth="5" strokeLinecap="round" />
    </WorldSvg>
  );
}

export function KambotBackpackVisual() {
  return (
    <WorldSvg className="world-item-svg--backpack">
      <rect width="160" height="160" fill="#eef8ff" rx="24" />
      <path d="M62 52C62 42 70 34 80 34C90 34 98 42 98 52V60H62Z" fill="#6d96ba" />
      <rect x="48" y="56" width="64" height="72" rx="18" fill="#4d6f90" />
      <rect x="56" y="66" width="48" height="20" rx="10" fill="#f5fbff" opacity=".85" />
      <rect x="60" y="90" width="40" height="18" rx="9" fill="#7fc2a2" />
      <path d="M48 72C38 76 32 86 30 98" stroke="#4d6f90" strokeWidth="8" strokeLinecap="round" />
      <path d="M112 72C122 76 128 86 130 98" stroke="#4d6f90" strokeWidth="8" strokeLinecap="round" />
      <path d="M66 52C70 45 75 42 80 42C85 42 90 45 94 52" stroke="#dcefff" strokeWidth="4" strokeLinecap="round" />
    </WorldSvg>
  );
}

const visualMap = {
  almatyMountains: AlmatyMountainsVisual,
  baiterek: BaiterekVisual,
  yurt: YurtVisual,
  charyn: CharynVisual,
  dombra: DombraVisual,
  appleTree: AppleTreeVisual,
  kazakhOrnament: KazakhOrnamentVisual,
  kambotBackpack: KambotBackpackVisual,
};

export function CollectibleVisual({
  visualKey,
  locked = false,
  size = 'medium',
  highlighted = false,
  className = '',
  unlockHint = '',
}) {
  const Visual = visualMap[visualKey] || AlmatyMountainsVisual;

  return (
    <div
      className={[
        'world-item-visual',
        `world-item-visual--${size}`,
        locked ? 'is-locked' : '',
        highlighted ? 'is-highlighted' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {locked && <span className="world-item-mist" aria-hidden="true" />}
      {highlighted && <span className="world-item-glow" aria-hidden="true" />}
      <Visual />
      {locked && (
        <div className="world-item-silhouette" aria-hidden="true">
          <span className="world-item-silhouette__shape" />
          {unlockHint && <span className="world-item-silhouette__text">{unlockHint}</span>}
        </div>
      )}
      {locked && <span className="world-item-lock">Закрыто</span>}
      {highlighted && <span className="world-item-spark world-item-spark--1" aria-hidden="true" />}
      {highlighted && <span className="world-item-spark world-item-spark--2" aria-hidden="true" />}
      {highlighted && <span className="world-item-spark world-item-spark--3" aria-hidden="true" />}
    </div>
  );
}

export const WorldItemVisual = CollectibleVisual;
