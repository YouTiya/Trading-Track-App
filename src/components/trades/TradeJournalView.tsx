import React, { useState } from 'react';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Trash2,
  Edit2,
  Smile,
  Tag,
  Search,
} from 'lucide-react';
import type { Trade, TradeOutcome, UserSettings } from '../../types/trade';
import { triggerHaptic } from '../../services/storage';

interface TradeJournalViewProps {
  trades: Trade[];
  settings: UserSettings;
  onOpenNewTrade: () => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (id: string) => void;
}

export const TradeJournalView: React.FC<TradeJournalViewProps> = ({
  trades,
  settings,
  onOpenNewTrade,
  onEditTrade,
  onDeleteTrade,
}) => {
  const [filterOutcome, setFilterOutcome] = useState<TradeOutcome | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const filteredTrades = trades.filter((t) => {
    if (filterOutcome !== 'ALL' && t.outcome !== filterOutcome) return false;
    if (selectedDate && t.date !== selectedDate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.pair.toLowerCase().includes(q) ||
        (t.setup && t.setup.toLowerCase().includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalPnL = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
  const totalWins = filteredTrades.filter((t) => t.outcome === 'WIN').length;
  const winRate =
    filteredTrades.length > 0
      ? Math.round((totalWins / filteredTrades.length) * 100)
      : 0;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this trade log?')) {
      triggerHaptic();
      onDeleteTrade(id);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Journal Header & Summary Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Trade Journal</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                {filteredTrades.length} trades
              </span>
            </h2>
            <p className="text-xs text-slate-400">Track and review all trade executions</p>
          </div>

          <button
            onClick={onOpenNewTrade}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-profit hover:bg-profit-dark text-dark-900 font-bold text-xs shadow-glow-profit transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Trade</span>
          </button>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center">
          <div className="bg-dark-900/60 p-2 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Net PnL</div>
            <div
              className={`text-sm font-bold font-mono ${
                totalPnL >= 0 ? 'text-profit-light' : 'text-loss-light'
              }`}
            >
              {totalPnL >= 0 ? '+' : ''}
              {settings.currencySymbol}
              {totalPnL.toFixed(2)}
            </div>
          </div>
          <div className="bg-dark-900/60 p-2 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Win Rate</div>
            <div className="text-sm font-bold font-mono text-white">{winRate}%</div>
          </div>
          <div className="bg-dark-900/60 p-2 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Total Trades</div>
            <div className="text-sm font-bold font-mono text-gold-light">
              {filteredTrades.length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-2">
        <div className="flex gap-2">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search pair, setup, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-dark-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-profit"
            />
          </div>

          {/* Date Filter */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2 py-1.5 rounded-xl bg-dark-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-profit"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="px-2 py-1 text-xs text-slate-400 hover:text-white bg-dark-800 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>

        {/* Outcome Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {(['ALL', 'WIN', 'LOSS', 'BE'] as const).map((o) => (
            <button
              key={o}
              onClick={() => {
                triggerHaptic();
                setFilterOutcome(o);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                filterOutcome === o
                  ? o === 'WIN'
                    ? 'bg-profit text-dark-900 shadow-glow-profit'
                    : o === 'LOSS'
                    ? 'bg-loss text-white shadow-glow-loss'
                    : 'bg-slate-200 text-dark-900'
                  : 'bg-dark-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {o === 'ALL' ? 'All' : o === 'WIN' ? 'Wins 🏆' : o === 'LOSS' ? 'Losses ❌' : 'BE ⚖️'}
            </button>
          ))}
        </div>
      </div>

      {/* Trades List */}
      <div className="space-y-2.5">
        {filteredTrades.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
              <Filter className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No trades found</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Start recording your trades to build discipline and analyze your performance.
            </p>
            <button
              onClick={onOpenNewTrade}
              className="px-4 py-2 rounded-xl bg-profit text-dark-900 font-bold text-xs shadow-glow-profit"
            >
              Log First Trade
            </button>
          </div>
        ) : (
          filteredTrades.map((t) => {
            const isWin = t.outcome === 'WIN';
            const isLoss = t.outcome === 'LOSS';

            return (
              <div
                key={t.id}
                onClick={() => onEditTrade(t)}
                className="glass-card glass-card-hover p-3.5 rounded-2xl border border-slate-800 hover:border-slate-700 cursor-pointer relative group"
              >
                {/* Top Row: Date/Time + Outcome + PnL */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 ${
                        t.direction === 'LONG'
                          ? 'bg-profit/15 text-profit-light border border-profit/30'
                          : 'bg-loss/15 text-loss-light border border-loss/30'
                      }`}
                    >
                      {t.direction === 'LONG' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{t.direction}</span>
                    </span>

                    <span className="font-mono font-bold text-sm text-white">{t.pair}</span>

                    {t.challengeDay && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/15 text-gold-light border border-gold/30 font-medium">
                        Day {t.challengeDay}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-base font-mono font-black ${
                        isWin
                          ? 'text-profit-light'
                          : isLoss
                          ? 'text-loss-light'
                          : 'text-slate-300'
                      }`}
                    >
                      {t.pnl >= 0 ? '+' : ''}
                      {settings.currencySymbol}
                      {t.pnl.toFixed(2)}
                    </div>
                    {t.riskReward && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        RR: 1:{t.riskReward}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags row: Setup, Emotion, Session */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
                  {t.setup && (
                    <span className="px-2 py-0.5 rounded-md bg-dark-950 border border-slate-800 text-slate-300 flex items-center space-x-1">
                      <Tag className="w-2.5 h-2.5 text-profit" />
                      <span>{t.setup}</span>
                    </span>
                  )}
                  {t.session && (
                    <span className="px-2 py-0.5 rounded-md bg-dark-950 border border-slate-800 text-slate-400">
                      {t.session} Session
                    </span>
                  )}
                  {t.emotion && (
                    <span
                      className={`px-2 py-0.5 rounded-md border flex items-center space-x-1 ${
                        t.emotion === 'Disciplined' || t.emotion === 'Patient'
                          ? 'bg-profit/10 border-profit/30 text-profit-light'
                          : 'bg-gold/10 border-gold/30 text-gold-light'
                      }`}
                    >
                      <Smile className="w-2.5 h-2.5" />
                      <span>{t.emotion}</span>
                    </span>
                  )}
                </div>

                {/* Notes if present */}
                {t.notes && (
                  <p className="mt-2 text-xs text-slate-400 bg-dark-950/60 p-2 rounded-xl border border-slate-850 italic">
                    "{t.notes}"
                  </p>
                )}

                {/* Footer timestamp & action buttons */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>{t.date}</span>
                    <span>•</span>
                    <span>{t.time}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTrade(t);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(t.id, e)}
                      className="p-1 rounded text-slate-500 hover:text-loss-light"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
