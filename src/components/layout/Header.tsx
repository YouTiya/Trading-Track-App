import React from 'react';
import { Plus, TrendingUp, Sparkles } from 'lucide-react';
import type { UserSettings } from '../../types/trade';

interface HeaderProps {
  settings: UserSettings;
  todayPnL: number;
  onOpenNewTrade: () => void;
  activeChallengeProgress?: {
    currentBalance: number;
    completedCount: number;
    totalDays: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  todayPnL,
  onOpenNewTrade,
  activeChallengeProgress,
}) => {
  const isPositive = todayPnL >= 0;

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand & App Title */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-profit-dark via-profit to-emerald-300 flex items-center justify-center shadow-glow-profit">
            <TrendingUp className="w-5 h-5 text-dark-900 font-bold stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                TRADING<span className="text-profit">TRACK</span>
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-profit/10 text-profit font-semibold border border-profit/20">
                PRO
              </span>
            </div>
            {activeChallengeProgress && (
              <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                <Sparkles className="w-3 h-3 text-gold" />
                <span>Day {activeChallengeProgress.completedCount}/{activeChallengeProgress.totalDays} Challenge</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Today's PnL & Add Trade Action */}
        <div className="flex items-center space-x-2.5">
          {/* Today's PnL Pill */}
          <div className="text-right px-2.5 py-1 rounded-lg bg-dark-800/90 border border-slate-700/60 shadow-inner">
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Today</div>
            <div
              className={`text-xs font-mono font-bold ${
                isPositive ? 'text-profit-light' : 'text-loss-light'
              }`}
            >
              {isPositive ? '+' : ''}
              {settings.currencySymbol}
              {todayPnL.toFixed(2)}
            </div>
          </div>

          {/* Quick Add Trade FAB/Button */}
          <button
            id="quick-log-btn"
            onClick={onOpenNewTrade}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-gradient-to-r from-profit to-emerald-500 hover:from-emerald-400 hover:to-teal-500 text-dark-900 font-bold text-xs shadow-glow-profit transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Log Trade</span>
          </button>
        </div>
      </div>
    </header>
  );
};
