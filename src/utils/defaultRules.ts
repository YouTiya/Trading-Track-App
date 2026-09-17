import type { TradingRule } from '../types/trade';

export const DEFAULT_RULES: TradingRule[] = [
  {
    id: 'rule-1',
    title: 'Risk Only 10% Per Trade',
    description: 'Calculate your lot size before entering. Never risk more than 10% of current capital.',
    category: 'RULE',
    icon: 'ShieldCheck',
  },
  {
    id: 'rule-2',
    title: 'Target Minimum 2R (20%) Per Win',
    description: 'Ensure your Take Profit offers at least 2x your risk to keep positive mathematical expectancy.',
    category: 'RULE',
    icon: 'Target',
  },
  {
    id: 'rule-3',
    title: 'Never Risk More Than You Can Afford To Lose',
    description: 'Capital preservation is rule #1. Protect your account to stay in the game long term.',
    category: 'WARNING',
    icon: 'AlertTriangle',
  },
  {
    id: 'rule-4',
    title: 'No Revenge Trading',
    description: 'If you take a loss, accept it, step away from the charts, and do not double down in anger.',
    category: 'WARNING',
    icon: 'XOctagon',
  },
  {
    id: 'rule-5',
    title: 'Be Patient, Wait For High Probability Setups',
    description: 'Let the market come to your zones. Quality of setup beats quantity of trades every time.',
    category: 'KEYPOINT',
    icon: 'Clock',
  },
  {
    id: 'rule-6',
    title: 'Discipline + Consistency = Success',
    description: 'Follow your trading plan on every single execution without deviation.',
    category: 'KEYPOINT',
    icon: 'Trophy',
  },
];
