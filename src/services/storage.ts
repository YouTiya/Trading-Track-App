import { Haptics, ImpactStyle } from '@capacitor/haptics';
import type { AppDataBackup, ChallengePlan, Trade, TradingRule, UserSettings } from '../types/trade';
import { createDefaultChallengePlan } from '../utils/challengeCalculator';
import { DEFAULT_RULES } from '../utils/defaultRules';

const STORAGE_KEYS = {
  TRADES: 'trading_track_trades_v1',
  CHALLENGES: 'trading_track_challenges_v1',
  ACTIVE_CHALLENGE_ID: 'trading_track_active_challenge_id',
  RULES: 'trading_track_rules_v1',
  SETTINGS: 'trading_track_settings_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  currency: 'USD',
  currencySymbol: '$',
  defaultStartingBalance: 20,
  hapticsEnabled: true,
  soundEnabled: true,
  traderName: 'Personal Trader',
};

// Safe Haptic helper
export async function triggerHaptic(style: ImpactStyle = ImpactStyle.Medium) {
  try {
    const settings = getSettings();
    if (settings.hapticsEnabled) {
      await Haptics.impact({ style });
    }
  } catch {
    // Graceful fallback for non-native browsers
  }
}

export function getSettings(): UserSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getRules(): TradingRule[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RULES);
    return data ? JSON.parse(data) : DEFAULT_RULES;
  } catch {
    return DEFAULT_RULES;
  }
}

export function saveRules(rules: TradingRule[]): void {
  localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
}

export function getChallenges(): ChallengePlan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
    if (!data) {
      const defaultPlan = createDefaultChallengePlan();
      saveChallenges([defaultPlan]);
      return [defaultPlan];
    }
    return JSON.parse(data);
  } catch {
    const defaultPlan = createDefaultChallengePlan();
    return [defaultPlan];
  }
}

export function saveChallenges(challenges: ChallengePlan[]): void {
  localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
}

export function getActiveChallenge(): ChallengePlan {
  const challenges = getChallenges();
  const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_CHALLENGE_ID);
  const found = challenges.find((c) => c.id === activeId && c.isActive);
  if (found) return found;
  return challenges[0] || createDefaultChallengePlan();
}

export function saveActiveChallenge(plan: ChallengePlan): void {
  const challenges = getChallenges();
  const index = challenges.findIndex((c) => c.id === plan.id);
  if (index >= 0) {
    challenges[index] = plan;
  } else {
    challenges.push(plan);
  }
  saveChallenges(challenges);
  localStorage.setItem(STORAGE_KEYS.ACTIVE_CHALLENGE_ID, plan.id);
}

export function getTrades(): Trade[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRADES);
    if (!data) {
      // Seed a few sample trades for initial nice visualization
      const sampleTrades = generateInitialSampleTrades();
      saveTrades(sampleTrades);
      return sampleTrades;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveTrades(trades: Trade[]): void {
  localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
}

export function addTrade(trade: Trade): Trade[] {
  const trades = [trade, ...getTrades()];
  saveTrades(trades);
  return trades;
}

export function deleteTrade(id: string): Trade[] {
  const trades = getTrades().filter((t) => t.id !== id);
  saveTrades(trades);
  return trades;
}

export function updateTrade(trade: Trade): Trade[] {
  const trades = getTrades().map((t) => (t.id === trade.id ? trade : t));
  saveTrades(trades);
  return trades;
}

export function getFullAppData(): AppDataBackup {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    trades: getTrades(),
    challenges: getChallenges(),
    settings: getSettings(),
    rules: getRules(),
  };
}

export function restoreFullAppData(backup: AppDataBackup): boolean {
  try {
    if (backup.trades) saveTrades(backup.trades);
    if (backup.challenges) saveChallenges(backup.challenges);
    if (backup.settings) saveSettings(backup.settings);
    if (backup.rules) saveRules(backup.rules);
    return true;
  } catch (err) {
    console.error('Failed to restore data:', err);
    return false;
  }
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.TRADES);
  localStorage.removeItem(STORAGE_KEYS.CHALLENGES);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHALLENGE_ID);
  localStorage.removeItem(STORAGE_KEYS.RULES);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}

function generateInitialSampleTrades(): Trade[] {
  const now = new Date();
  const formatD = (d: Date) => d.toISOString().split('T')[0];

  const d1 = new Date(now);
  d1.setDate(d1.getDate() - 2);
  const d2 = new Date(now);
  d2.setDate(d2.getDate() - 1);
  const d3 = new Date(now);

  return [
    {
      id: 'trade-demo-1',
      date: formatD(d1),
      time: '09:30',
      pair: 'XAUUSD',
      direction: 'LONG',
      entryPrice: 2650.5,
      exitPrice: 2654.5,
      lots: 0.01,
      pnl: 4.0,
      pnlPercent: 20.0,
      riskReward: 2.0,
      session: 'London',
      setup: 'Break & Retest',
      outcome: 'WIN',
      emotion: 'Disciplined',
      notes: 'Clean bounce off support during London open.',
      challengeDay: 1,
      createdAt: d1.getTime(),
    },
    {
      id: 'trade-demo-2',
      date: formatD(d2),
      time: '14:15',
      pair: 'EURUSD',
      direction: 'SHORT',
      entryPrice: 1.085,
      exitPrice: 1.0825,
      lots: 0.02,
      pnl: 4.8,
      pnlPercent: 20.0,
      riskReward: 2.1,
      session: 'New York',
      setup: 'Order Block Rejection',
      outcome: 'WIN',
      emotion: 'Patient',
      notes: 'Waited for FVG fill before taking the short.',
      challengeDay: 2,
      createdAt: d2.getTime(),
    },
    {
      id: 'trade-demo-3',
      date: formatD(d3),
      time: '10:00',
      pair: 'BTCUSDT',
      direction: 'LONG',
      entryPrice: 64200,
      exitPrice: 63900,
      lots: 0.01,
      pnl: -2.88,
      pnlPercent: -10.0,
      riskReward: 2.0,
      session: 'Asian',
      setup: 'Trend Following',
      outcome: 'LOSS',
      emotion: 'Disciplined',
      notes: 'Hit stop loss cleanly. Followed 10% risk management.',
      challengeDay: 3,
      createdAt: d3.getTime(),
    },
  ];
}
