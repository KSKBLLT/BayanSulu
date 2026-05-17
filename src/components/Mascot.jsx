import React, { useEffect, useState } from 'react';

const imageMap = {
  main: '/assets/kambot/kambot-main.png',
  happy: '/assets/kambot/kambot-happy.png',
  thinking: '/assets/kambot/kambot-thinking.png',
  parent: '/assets/kambot/kambot-parent.png',
};

function Mascot({ mood = 'main', size = 'medium', speech, className = '' }) {
  const [hasImageError, setHasImageError] = useState(false);
  const src = imageMap[mood] || imageMap.main;

  useEffect(() => {
    setHasImageError(false);
  }, [src]);

  return (
    <div className={`mascot mascot-${size} mascot--${mood} ${className}`.trim()}>
      <div className="mascot-figure" aria-hidden="true">
        {hasImageError ? (
          <div className={`mascot-fallback mascot-fallback--${mood}`}>
            <span className="mascot-fallback__shadow" />
            <span className="mascot-fallback__body" />
            <span className="mascot-fallback__neck" />
            <span className="mascot-fallback__head">
              <span className="mascot-fallback__ear mascot-fallback__ear--left" />
              <span className="mascot-fallback__ear mascot-fallback__ear--right" />
              <span className="mascot-fallback__eye mascot-fallback__eye--left" />
              <span className="mascot-fallback__eye mascot-fallback__eye--right" />
              <span className="mascot-fallback__brow mascot-fallback__brow--left" />
              <span className="mascot-fallback__brow mascot-fallback__brow--right" />
              <span className="mascot-fallback__mouth" />
              <span className="mascot-fallback__cheek mascot-fallback__cheek--left" />
              <span className="mascot-fallback__cheek mascot-fallback__cheek--right" />
            </span>
            <span className="mascot-fallback__scarf" />
          </div>
        ) : (
          <img src={src} alt="" onError={() => setHasImageError(true)} />
        )}
      </div>
      {speech && <div className="speech-bubble">{speech}</div>}
    </div>
  );
}

export default Mascot;
