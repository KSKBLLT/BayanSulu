import React, { useState } from 'react';
import { locations } from '../data/locations';
import Button from '../components/Button';
import Card from '../components/Card';
import Mascot from '../components/Mascot';
import ProgressBar from '../components/ProgressBar';
import { useLang } from '../contexts/LangContext';

const mapStops = [
  { top: '12%', left: '22%', mascotTop: '3%',  mascotLeft: '32%' },
  { top: '30%', left: '48%', mascotTop: '19%', mascotLeft: '58%' },
  { top: '14%', left: '70%', mascotTop: '4%',  mascotLeft: '75%' },
  { top: '46%', left: '74%', mascotTop: '35%', mascotLeft: '79%' },
  { top: '66%', left: '54%', mascotTop: '55%', mascotLeft: '60%' },
  { top: '50%', left: '26%', mascotTop: '39%', mascotLeft: '14%' },
  { top: '32%', left: '63%', mascotTop: '21%', mascotLeft: '69%' },
  { top: '76%', left: '30%', mascotTop: '66%', mascotLeft: '20%' },
];

const pathPoints = '22,12 48,30 70,14 74,46 54,66 26,50 63,32 30,76';

function MapPage({ appState, goToScreen, setQrTarget }) {
  const [activeLocation, setActiveLocation] = useState(null);
  const { t } = useLang();

  const unlockedLocations = Array.isArray(appState.unlockedLocations) ? appState.unlockedLocations : [];

  const isLocationAccessible = (location) => {
    if (location.status !== 'locked') return true;
    return unlockedLocations.includes(location.id);
  };

  const availableLocations = locations.filter((loc) => isLocationAccessible(loc));
  const completedCount = availableLocations.filter((loc) =>
    appState.completedGames.includes(loc.gameId),
  ).length;
  const totalPlayable = availableLocations.filter((loc) => loc.gameId).length;
  const isDailyChestOpened = appState.completedGames.length > 0;
  const nextPlayableLocation =
    availableLocations.find((loc) => !appState.completedGames.includes(loc.gameId)) || null;
  const nextLocationIndex = nextPlayableLocation ? locations.indexOf(nextPlayableLocation) : -1;
  const displayLocation = activeLocation || nextPlayableLocation;

  const handleLocationClick = (location) => {
    if (!isLocationAccessible(location)) {
      if (setQrTarget) setQrTarget(location.id);
      goToScreen('qr');
      return;
    }
    setActiveLocation(location);
  };

  const handlePlay = () => {
    const target = activeLocation || nextPlayableLocation;
    if (target && target.gameId) goToScreen(target.gameId);
  };

  const playBtnLabel = () => {
    if (!displayLocation) return t('ui.playAll');
    const isCompleted = appState.completedGames.includes(displayLocation.gameId);
    return isCompleted
      ? `${t('map.playAgain')}: ${displayLocation.title}`
      : `${t('map.play')}: ${displayLocation.title}`;
  };

  return (
    <section className="screen">

      <div className="map-stats-row">
        <div className="map-stat">
          <span className="map-stat__value">{completedCount}/{totalPlayable}</span>
          <span className="map-stat__label">{t('map.completed')}</span>
        </div>
        <div className="map-stat map-stat--coins">
          <span className="map-stat__value">🪙 {appState.coins}</span>
          <span className="map-stat__label">{t('ui.coins')}</span>
        </div>
        <div className="map-stat">
          <span className="map-stat__value">{locations.length - availableLocations.length}</span>
          <span className="map-stat__label">{t('map.qrLocations')}</span>
        </div>
      </div>

      <Card className="stack adventure-map-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="adventure-map">
          <div className="adventure-map__sky" aria-hidden="true" />
          <div className="adventure-map__hills adventure-map__hills--back" aria-hidden="true" />
          <div className="adventure-map__hills adventure-map__hills--front" aria-hidden="true" />
          <div className="adventure-map__steppe" aria-hidden="true" />

          <svg className="map-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline points={pathPoints} fill="none"
              stroke="rgba(255,255,255,0.45)" strokeWidth="5"
              strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 7" />
            <polyline points={pathPoints} fill="none"
              stroke="rgba(234,146,40,0.85)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 7" />
          </svg>

          {nextPlayableLocation && (
            <div className="map-mascot"
              style={{ top: mapStops[nextLocationIndex]?.mascotTop, left: mapStops[nextLocationIndex]?.mascotLeft }}
              aria-hidden="true">
              <Mascot mood="thinking" size="small" />
            </div>
          )}

          {locations.map((location, index) => {
            const isCompleted = appState.completedGames.includes(location.gameId);
            const isLocked = !isLocationAccessible(location);
            const isActive = nextPlayableLocation?.id === location.id;
            const isSelected = activeLocation?.id === location.id;
            return (
              <button key={location.id} type="button"
                className={`map-node ${isActive ? 'map-node--active' : ''} ${isCompleted ? 'map-node--completed' : ''} ${isLocked ? 'map-node--locked' : ''} ${isSelected ? 'map-node--selected' : ''}`}
                style={{ top: mapStops[index]?.top, left: mapStops[index]?.left }}
                onClick={() => handleLocationClick(location)}>
                <span className="map-node__pin">
                  <span className="map-node__icon">{location.icon}</span>
                  <span className="map-node__status" aria-hidden="true">
                    {isLocked ? '🔒' : isCompleted ? '✓' : isActive ? '▶' : ''}
                  </span>
                </span>
                <span className="map-node__label">{location.title}</span>
              </button>
            );
          })}
        </div>

        {displayLocation && (
          <div className="map-location-strip">
            <span className="map-location-strip__icon">{displayLocation.icon}</span>
            <div className="map-location-strip__copy">
              <strong className="map-location-strip__title">{displayLocation.title}</strong>
              <span className="map-location-strip__sub muted">{displayLocation.subtitle}</span>
            </div>
            {appState.completedGames.includes(displayLocation.gameId) && (
              <span className="badge badge-success">✓</span>
            )}
          </div>
        )}
      </Card>

      <ProgressBar
        value={completedCount}
        max={totalPlayable || 1}
        label={`${t('map.progress')} ${completedCount} ${t('map.progressOf')} ${totalPlayable}`}
      />

      <Card className={`daily-chest-card ${isDailyChestOpened ? 'daily-chest-card--open' : ''}`}>
        <div className="daily-chest-card__icon" aria-hidden="true">
          <span className="daily-chest-card__spark daily-chest-card__spark--1" />
          <span className="daily-chest-card__spark daily-chest-card__spark--2" />
          <span className="daily-chest-card__spark daily-chest-card__spark--3" />
          <span className="daily-chest-card__chest">
            <span className="daily-chest-card__lid" />
            <span className="daily-chest-card__band" />
            <span className="daily-chest-card__lock" />
          </span>
        </div>
        <div className="daily-chest-card__body">
          <h3 className="section-title">{t('map.chest.title')}</h3>
          <p className="muted">{t('map.chest.sub')}</p>
          <span className={`badge ${isDailyChestOpened ? 'badge-success' : 'badge-muted'}`}>
            {isDailyChestOpened ? t('map.chest.open') : t('map.chest.locked')}
          </span>
        </div>
      </Card>

      <Button
        variant="primary"
        className="map-cta"
        onClick={handlePlay}
        disabled={!displayLocation || !displayLocation.gameId}
      >
        {playBtnLabel()}
      </Button>

    </section>
  );
}

export default MapPage;
