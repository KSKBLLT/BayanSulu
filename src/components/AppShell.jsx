import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

const bottomNavScreens = ['map', 'studio', 'cards', 'shop', 'parent'];

function AppShell({ currentScreen, onNavigate, appState, children }) {
  const showBottomNav = bottomNavScreens.includes(currentScreen);
  const isDevScreen = currentScreen === 'dev';

  if (isDevScreen) {
    return (
      <div className="app-shell" style={{ background: 'transparent' }}>
        <div style={{ minHeight: '100vh' }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-bg-decoration" aria-hidden="true" />
      <Header currentScreen={currentScreen} onNavigate={onNavigate} appState={appState} />
      <main className={`screen-content ${showBottomNav ? 'screen-content--with-nav' : ''}`}>
        {children}
      </main>
      {showBottomNav && (
        <BottomNav currentScreen={currentScreen} onNavigate={onNavigate} />
      )}
    </div>
  );
}

export default AppShell;
