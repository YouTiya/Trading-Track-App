import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Smile,
} from 'lucide-react';
import type { Trade, TradeDirection, TradeOutcome, TradingEmotion, TradingSession, UserSettings } from '../../types/trade';
import { triggerHaptic } from '../../services/storage';
import { fireWinCelebration } from '../../utils/confetti';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrade: (trade: Trade) => void;
  editingTrade?: Trade | null;
  settings: UserSettings;
  activeChallengeDay?: number;
}

const COMMON_PAIRS = ['XAUUSD', 'EURUSD', 'BTCUSDT', 'GBPUSD', 'US30', 'NAS100', 'ETHUSDT', 'USDJPY'];
const COMMON_SETUPS = ['Break & Retest', 'Order Block', 'Liquidity Sweep', 'Fair Value Gap (FVG)', 'Trend Follow', 'Scalp', 'Supply & Demand'];
const SESSIONS: TradingSession[] = ['London', 'New York', 'Asian', 'Overlap', 'Crypto 24/7'];
const EMOTIONS: TradingEmotion[] = ['Disciplined', 'Patient', 'Confident', 'FOMO', 'Revenge', 'Greedy', 'Fearful', 'Neutral'];

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  onSaveTrade,
  editingTrade,
  settings,
  activeChallengeDay,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(
    new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
  const [pair, setPair] = useState('XAUUSD');
  const [direction, setDirection] = useState<TradeDirection>('LONG');
  const [outcome, setOutcome] = useState<TradeOutcome>('WIN');
  const [pnl, setPnl] = useState<string>('4.00');
  const [pnlPercent, setPnlPercent] = useState<string>('20.0');
  const [riskReward, setRiskReward] = useState<string>('2.0');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [exitPrice, setExitPrice] = useState<string>('');
  const [lots, setLots] = useState<string>('0.01');
  const [session, setSession] = useState<TradingSession>('London');
  const [setup, setSetup] = useState<string>('Break & Retest');
  const [emotion, setEmotion] = useState<TradingEmotion>('Disciplined');
  const [challengeDay, setChallengeDay] = useState<string>(
    activeChallengeDay ? String(activeChallengeDay) : ''
  );
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingTrade) {
      setDate(editingTrade.date);
      setTime(editingTrade.time);
      setPair(editingTrade.pair);
      setDirection(editingTrade.direction);
      setOutcome(editingTrade.outcome);
      setPnl(String(editingTrade.pnl));
      setPnlPercent(editingTrade.pnlPercent ? String(editingTrade.pnlPercent) : '');
      setRiskReward(editingTrade.riskReward ? String(editingTrade.riskReward) : '');
      setEntryPrice(editingTrade.entryPrice ? String(editingTrade.entryPrice) : '');
      setExitPrice(editingTrade.exitPrice ? String(editingTrade.exitPrice) : '');
      setLots(editingTrade.lots ? String(editingTrade.lots) : '');
      setSession(editingTrade.session || 'London');
      setSetup(editingTrade.setup || 'Break & Retest');
      setEmotion(editingTrade.emotion || 'Disciplined');
      setChallengeDay(editingTrade.challengeDay ? String(editingTrade.challengeDay) : '');
      setNotes(editingTrade.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
      setPnl('4.00');
      setOutcome('WIN');
    }
  }, [editingTrade, isOpen]);

  if (!isOpen) return null;

  const handleOutcomeChange = (newOutcome: TradeOutcome) => {
    setOutcome(newOutcome);
    const numericPnl = Math.abs(parseFloat(pnl) || 0);
    if (newOutcome === 'WIN') {
      setPnl(String(numericPnl > 0 ? numericPnl : 4.0));
    } else if (newOutcome === 'LOSS') {
      setPnl(String(numericPnl > 0 ? -numericPnl : -2.0));
    } else {
      setPnl('0.00');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();

    let finalPnL = parseFloat(pnl) || 0;
    if (outcome === 'LOSS' && finalPnL > 0) finalPnL = -finalPnL;
    if (outcome === 'WIN' && finalPnL < 0) finalPnL = Math.abs(finalPnL);
    if (outcome === 'BE') finalPnL = 0;

    const trade: Trade = {
      id: editingTrade ? editingTrade.id : `trade-${Date.now()}`,
      date,
      time,
      pair: pair.trim().toUpperCase(),
      direction,
      outcome,
      pnl: Number(finalPnL.toFixed(2)),
      pnlPercent: pnlPercent ? parseFloat(pnlPercent) : undefined,
      riskReward: riskReward ? parseFloat(riskReward) : undefined,
      entryPrice: entryPrice ? parseFloat(entryPrice) : undefined,
      exitPrice: exitPrice ? parseFloat(exitPrice) : undefined,
      lots: lots ? parseFloat(lots) : undefined,
      session,
      setup,
      emotion,
      challengeDay: challengeDay ? parseInt(challengeDay) : undefined,
      notes: notes.trim(),
      createdAt: editingTrade ? editingTrade.createdAt : Date.now(),
    };

    if (trade.outcome === 'WIN') {
      fireWinCelebration();
    }

    onSaveTrade(trade);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col bg-dark-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-dark-950/80">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-profit/15 text-profit">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingTrade ? 'Edit Trade Log' : 'Log New Trade'}
              </h3>
              <p className="text-xs text-slate-400">Record your PnL and execution details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Outcome & Direction Selectors */}
          <div className="grid grid-cols-2 gap-3">
            {/* Outcome */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Outcome</label>
              <div className="grid grid-cols-3 gap-1 bg-dark-950 p-1 rounded-xl border border-slate-800">
                {(['WIN', 'LOSS', 'BE'] as TradeOutcome[]).map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => handleOutcomeChange(o)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      outcome === o
                        ? o === 'WIN'
                          ? 'bg-profit text-dark-900 shadow-glow-profit'
                          : o === 'LOSS'
                          ? 'bg-loss text-white shadow-glow-loss'
                          : 'bg-slate-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {o === 'WIN' ? 'WIN 🏆' : o === 'LOSS' ? 'LOSS ❌' : 'BE ⚖️'}
                  </button>
                ))}
              </div>
            </div>

            {/* Direction */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Direction</label>
              <div className="grid grid-cols-2 gap-1 bg-dark-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDirection('LONG')}
                  className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 transition-all ${
                    direction === 'LONG'
                      ? 'bg-profit/20 text-profit-light border border-profit/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>LONG</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SHORT')}
                  className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 transition-all ${
                    direction === 'SHORT'
                      ? 'bg-loss/20 text-loss-light border border-loss/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>SHORT</span>
                </button>
              </div>
            </div>
          </div>

          {/* PnL Amount & Return % */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Net PnL ({settings.currencySymbol}) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-sm">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  value={pnl}
                  onChange={(e) => setPnl(e.target.value)}
                  className={`w-full pl-7 pr-3 py-2 rounded-xl bg-dark-950 border font-mono font-bold text-base focus:outline-none ${
                    outcome === 'WIN'
                      ? 'border-profit/40 text-profit-light focus:border-profit'
                      : outcome === 'LOSS'
                      ? 'border-loss/40 text-loss-light focus:border-loss'
                      : 'border-slate-700 text-white focus:border-slate-500'
                  }`}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Risk : Reward (RR)
              </label>
              <input
                type="number"
                step="0.1"
                value={riskReward}
                onChange={(e) => setRiskReward(e.target.value)}
                placeholder="2.0"
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 font-mono text-white text-sm focus:outline-none focus:border-profit"
              />
            </div>
          </div>

          {/* Pair / Asset quick selection */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Asset / Pair *</label>
            <input
              type="text"
              required
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              placeholder="e.g. XAUUSD, BTCUSDT"
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 font-mono uppercase font-bold text-white text-sm focus:outline-none focus:border-profit mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PAIRS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPair(p)}
                  className={`px-2 py-1 text-[11px] font-mono rounded-lg border transition-all ${
                    pair === p
                      ? 'bg-profit/20 border-profit text-profit-light font-bold'
                      : 'bg-dark-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Date, Time & Session */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2 py-2 rounded-xl bg-dark-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-profit"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-2 py-2 rounded-xl bg-dark-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-profit"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as TradingSession)}
                className="w-full px-2 py-2 rounded-xl bg-dark-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-profit"
              >
                {SESSIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Setup / Strategy & Emotion */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Setup / Strategy</label>
              <input
                type="text"
                value={setup}
                onChange={(e) => setSetup(e.target.value)}
                placeholder="e.g. Order Block"
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-profit mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                {COMMON_SETUPS.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSetup(s)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-dark-800 text-slate-400 hover:text-white border border-slate-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Discipline State</label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value as TradingEmotion)}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-profit"
              >
                {EMOTIONS.map((em) => (
                  <option key={em} value={em}>
                    {em}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center space-x-1">
                <Smile className="w-3.5 h-3.5 text-profit" />
                <span>Track discipline vs emotions</span>
              </div>
            </div>
          </div>

          {/* Optional Challenge Day Link */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Link To 30-Day Challenge Day # (Optional)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={challengeDay}
              onChange={(e) => setChallengeDay(e.target.value)}
              placeholder="e.g. 1"
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-profit"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Trade Notes / Reflections</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What went well? Did you stick to the 10% risk plan?"
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-profit resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="submit-trade-btn"
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-profit to-emerald-500 hover:from-emerald-400 hover:to-teal-500 text-dark-900 font-extrabold text-sm shadow-glow-profit transition-all active:scale-95"
            >
              {editingTrade ? 'Update Trade Log' : 'Save Trade to Journal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
