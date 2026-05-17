import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { LangProvider } from './contexts/LangContext';
import AppShell from './components/AppShell';
import Onboarding from './pages/Onboarding';
import MapPage from './pages/MapPage';
import RewardPage from './pages/RewardPage';
import BotaStudioPage from './pages/BotaStudioPage';
import ShopPage from './pages/ShopPage';
import ParentModePage from './pages/ParentModePage';
import QRUnlockPage from './pages/QRUnlockPage';
import CardsGalleryPage from './pages/CardsGalleryPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import DevModePage from './pages/DevModePage';
import MathGame from './pages/games/MathGame';
import MemoryGame from './pages/games/MemoryGame';
import WordsGame from './pages/games/WordsGame';
import { collectibleByGameId, learningReceiptByGameId } from './data/collectibles';
import { syncSession, trackEvent } from './utils/db';
import {
  loadApprovedCoupons, loadAppState, loadRewardRequests,
  loadScreen, saveApprovedCoupons, saveAppState, saveRewardRequests, saveScreen,
} from './utils/storage';

const defaultAppState = {
  name: '',
  age: '',
  coins: 0,
  completedGames: [],
  unlockedCollectibles: [],
  purchasedRewards: [],
  rewardRequests: [],
  approvedCoupons: [],
  unlockedLocations: [],
  screenTimeMinutes: 18,
  lastReward: null,
  qrTarget: null,
};

const screenAliases = {
  mathGame: 'math', memoryGame: 'memory', wordsGame: 'words',
};

const badgeByGame = {
  memory: 'Мастер памяти', math: 'Юный математик', words: 'Знаток казахских слов',
};
const allGameIds = ['math', 'memory', 'words'];

function normalizeAppState(state) {
  return {
    ...state,
    completedGames: Array.isArray(state.completedGames) ? [...new Set(state.completedGames)] : [],
    unlockedCollectibles: Array.isArray(state.unlockedCollectibles) ? [...new Set(state.unlockedCollectibles)] : [],
    purchasedRewards: Array.isArray(state.purchasedRewards) ? [...new Set(state.purchasedRewards)] : [],
    rewardRequests: Array.isArray(state.rewardRequests) ? state.rewardRequests : [],
    approvedCoupons: Array.isArray(state.approvedCoupons) ? state.approvedCoupons : [],
    unlockedLocations: Array.isArray(state.unlockedLocations) ? state.unlockedLocations : [],
    screenTimeMinutes: Number.isFinite(state.screenTimeMinutes) ? state.screenTimeMinutes : 18,
    lastReward: typeof state.lastReward === 'object' ? state.lastReward : null,
    qrTarget: state.qrTarget || null,
  };
}

function getBadge(completedGames, gameId) {
  const normalized = Array.isArray(completedGames) ? completedGames : [];
  if (allGameIds.every((id) => normalized.includes(id))) return 'Исследователь Казахстана';
  return badgeByGame[gameId] || 'Исследователь Казахстана';
}

function App() {
  const [appState, setAppState] = useState(() => {
    const stored = normalizeAppState(loadAppState(defaultAppState));
    return {
      ...stored,
      rewardRequests: stored.rewardRequests.length ? stored.rewardRequests : loadRewardRequests([]),
      approvedCoupons: stored.approvedCoupons.length ? stored.approvedCoupons : loadApprovedCoupons([]),
    };
  });
  const [studioHighlightId, setStudioHighlightId] = useState(null);
  const [currentScreen, setCurrentScreen] = useState(() => {
    const saved = screenAliases[loadScreen('onboarding')] || loadScreen('onboarding');
    const hasProfile = loadAppState(defaultAppState).name;
    if (hasProfile && saved === 'onboarding') return 'map';
    return saved;
  });

  useEffect(() => { saveAppState(appState); syncSession(appState); }, [appState]);
  useEffect(() => { saveRewardRequests(appState.rewardRequests); }, [appState.rewardRequests]);
  useEffect(() => { saveApprovedCoupons(appState.approvedCoupons); }, [appState.approvedCoupons]);
  useEffect(() => { saveScreen(currentScreen); }, [currentScreen]);

  const actions = useMemo(() => ({
    goToScreen: (screen, options = {}) => {
      if (options?.newlyUnlocked) setStudioHighlightId(options.newlyUnlocked);
      setCurrentScreen(screenAliases[screen] || screen);
    },
    completeOnboarding: (values) => {
      setAppState((prev) => ({ ...prev, name: values.name, age: values.age }));
      trackEvent('onboarding_complete', { name: values.name, age: values.age });
      setCurrentScreen('map');
    },
    addCoins: (amount) => {
      setAppState((prev) => ({ ...prev, coins: Math.max(0, prev.coins + amount) }));
    },
    unlockLocation: (locationId) => {
      setAppState((prev) => ({
        ...prev,
        coins: prev.coins + 20,
        unlockedLocations: [...new Set([...(prev.unlockedLocations || []), locationId])],
        qrTarget: null,
      }));
      trackEvent('qr_unlock', { locationId, coinsEarned: 20 });
    },
    setQrTarget: (locationId) => {
      setAppState((prev) => ({ ...prev, qrTarget: locationId }));
    },
    requestFamilyBonus: (reward) => {
      let result = { status: 'blocked', reward, missing: [] };
      setAppState((prev) => {
        const completedGames = Array.isArray(prev.completedGames) ? prev.completedGames : [];
        const unlockedCollectibles = Array.isArray(prev.unlockedCollectibles) ? prev.unlockedCollectibles : [];
        const pendingRequest = prev.rewardRequests.find((r) => r.rewardId === reward.id && r.status === 'pending');
        const approvedRequest = prev.rewardRequests.find((r) => r.rewardId === reward.id && r.status === 'approved');
        const missing = [];
        if (prev.coins < reward.cost) missing.push(`Нужно ещё ${reward.cost - prev.coins} ботакоинов`);
        if (completedGames.length < reward.requiredGames) missing.push(`Пройди ещё ${reward.requiredGames - completedGames.length} игру`);
        if (unlockedCollectibles.length < reward.requiredCollectibles) missing.push(`Открой ещё ${reward.requiredCollectibles - unlockedCollectibles.length} предмет`);
        if (pendingRequest) { result = { status: 'pending', reward, missing: [], message: 'Запрос уже отправлен' }; return prev; }
        if (approvedRequest) { result = { status: 'approved', reward, missing: [], message: 'Бонус уже одобрен' }; return prev; }
        if (missing.length > 0) { result = { status: 'blocked', reward, missing }; return prev; }
        const request = {
          id: `request-${reward.id}-${Date.now()}`,
          rewardId: reward.id, title: reward.title, cost: reward.cost,
          status: 'pending', createdAt: new Date().toISOString(),
          completedGames: completedGames.length, unlockedCollectibles: unlockedCollectibles.length,
          screenTimeMinutes: prev.screenTimeMinutes,
          requiredGames: reward.requiredGames, requiredCollectibles: reward.requiredCollectibles,
          screenTimeLimit: reward.screenTimeLimit,
        };
        result = { status: 'pending', reward, missing: [], message: 'Запрос отправлен родителю', request };
        return { ...prev, rewardRequests: [request, ...prev.rewardRequests] };
      });
      if (result.status === 'pending' && result.request) {
        trackEvent('reward_request', { rewardId: reward.id, rewardTitle: reward.title, cost: reward.cost });
      }
      return result;
    },
    approveRewardRequest: (requestId) => {
      let result = null;
      setAppState((prev) => {
        const request = prev.rewardRequests.find((item) => item.id === requestId);
        if (!request || request.status !== 'pending') { result = null; return prev; }
        const couponCode = `BOTA-${request.cost}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        const approvedAt = new Date().toISOString();
        const approvedCoupon = { requestId, rewardId: request.rewardId, title: request.title, couponCode, status: 'approved', approvedAt };
        result = { requestId, couponCode, status: 'approved', approvedCoupon };
        return {
          ...prev,
          rewardRequests: prev.rewardRequests.map((item) => item.id === requestId ? { ...item, status: 'approved', couponCode, approvedAt } : item),
          approvedCoupons: [approvedCoupon, ...prev.approvedCoupons.filter((item) => item.requestId !== requestId)],
        };
      });
      return result;
    },
    declineRewardRequest: (requestId) => {
      setAppState((prev) => ({
        ...prev,
        rewardRequests: prev.rewardRequests.map((item) => item.id === requestId ? { ...item, status: 'declined', declinedAt: new Date().toISOString() } : item),
      }));
    },
    finishGame: (gameId, coinsAmount) => {
      setAppState((prev) => {
        const alreadyCompleted = prev.completedGames.includes(gameId);
        const collectible = collectibleByGameId[gameId] || null;
        const alreadyUnlocked = collectible ? prev.unlockedCollectibles.includes(collectible.id) : false;
        const nextCompletedGames = alreadyCompleted ? prev.completedGames : [...prev.completedGames, gameId];
        const nextUnlocked = collectible && !alreadyUnlocked ? [...new Set([...prev.unlockedCollectibles, collectible.id])] : prev.unlockedCollectibles;
        const rewardCoins = alreadyCompleted ? 0 : coinsAmount;
        const learningReceipt = {
          ...learningReceiptByGameId[gameId],
          collectibleId: collectible?.id || null,
          collectibleTitle: collectible?.title || null,
          collectibleIcon: collectible?.icon || null,
          collectibleLearning: collectible?.learning || null,
        };
        return {
          ...prev,
          coins: prev.coins + rewardCoins,
          completedGames: nextCompletedGames,
          unlockedCollectibles: nextUnlocked,
          lastReward: {
            gameId, coins: rewardCoins, alreadyReceived: alreadyCompleted,
            badge: getBadge(nextCompletedGames, gameId),
            message: alreadyCompleted ? 'Награда уже получена' : `+${coinsAmount} ботакоинов!`,
            collectibleId: collectible?.id || null, collectibleTitle: collectible?.title || null,
            collectibleIcon: collectible?.icon || null, collectibleLearning: collectible?.learning || null,
            collectibleAlreadyUnlocked: alreadyUnlocked || alreadyCompleted, learningReceipt,
          },
        };
      });
      trackEvent('game_complete', { gameId });
      setCurrentScreen('reward');
    },
    resetProfile: () => {
      setAppState(defaultAppState);
      setStudioHighlightId(null);
      setCurrentScreen('onboarding');
    },
  }), []);

  const screenProps = { appState, currentScreen, ...actions };

  return (
    <LangProvider>
      <AppShell currentScreen={currentScreen} onNavigate={actions.goToScreen} appState={appState}>
        {currentScreen === 'onboarding' && <Onboarding {...screenProps} />}
        {currentScreen === 'map' && <MapPage {...screenProps} />}
        {currentScreen === 'reward' && <RewardPage {...screenProps} />}
        {currentScreen === 'studio' && <BotaStudioPage {...screenProps} newlyUnlockedId={studioHighlightId} />}
        {currentScreen === 'shop' && <ShopPage {...screenProps} />}
        {currentScreen === 'parent' && <ParentModePage {...screenProps} />}
        {currentScreen === 'qr' && <QRUnlockPage {...screenProps} />}
        {currentScreen === 'cards' && <CardsGalleryPage {...screenProps} />}
        {currentScreen === 'analytics' && <AnalyticsDashboard {...screenProps} />}
        {currentScreen === 'math' && <MathGame {...screenProps} />}
        {currentScreen === 'memory' && <MemoryGame {...screenProps} />}
        {currentScreen === 'words' && <WordsGame {...screenProps} />}
        {currentScreen === 'dev' && <DevModePage {...screenProps} />}
      </AppShell>
    </LangProvider>
  );
}

export default App;
