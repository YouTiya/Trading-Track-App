export type TradeOutcome = 'WIN' | 'LOSS' | 'BE';
export type TradeDirection = 'LONG' | 'SHORT';
export type TradingSession = 'Asian' | 'London' | 'New York' | 'Overlap' | 'Crypto 24/7' | 'Other';
export type TradingEmotion = 'Disciplined' | 'Patient' | 'FOMO' | 'Revenge' | 'Greedy' | 'Fearful' | 'Confident' | 'Neutral';

export interface Trade {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  pair: string; // e.g. "XAUUSD", "EURUSD", "BTCUSDT"
  direction: TradeDirection;
  entryPrice?: number;
  exitPrice?: number;
  lots?: number;
  pnl: number; // in currency, e.g. 4.00 or -2.00
  pnlPercent?: number; // % gain or loss
  riskReward?: number; // e.g. 2.0
  session?: TradingSession;
  setup?: string; // e.g. "Support/Resistance", "Order Block", "Breakout"
  outcome: TradeOutcome;
  emotion?: TradingEmotion;
  notes?: string;
  challengeDay?: number; // Optional link to a specific challenge day
  createdAt: number;
}

export interface ChallengeDay {
  day: number;
  startBalance: number;
  riskAmount: number; // 10%
  targetProfit: number; // 20%
  afterWinBalance: number;
  achieved: boolean;
  actualPnL?: number;
  date?: string; // YYYY-MM-DD when completed
  notes?: string;
}

export interface ChallengePlan {
  id: string;
  name: string;
  startBalance: number;
  riskPercent: number;
  targetPercent: number;
  targetDays: number;
  startDate: string;
  isActive: boolean;
  days: ChallengeDay[];
}

export interface TradingRule {
  id: string;
  title: string;
  description: string;
  category: 'RULE' | 'WARNING' | 'KEYPOINT';
  icon: string;
}

export interface UserSettings {
  currency: string;
  currencySymbol: string;
  defaultStartingBalance: number;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  traderName: string;
}

export interface DayPnLSummary {
  date: string; // YYYY-MM-DD
  netPnL: number;
  tradesCount: number;
  wins: number;
  losses: number;
  breakevens: number;
  winRate: number;
  trades: Trade[];
}

export interface AppDataBackup {
  version: string;
  exportedAt: string;
  trades: Trade[];
  challenges: ChallengePlan[];
  settings: UserSettings;
  rules: TradingRule[];
}
