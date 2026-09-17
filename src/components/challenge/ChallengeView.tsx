import React, { useState } from 'react';
import {
  Trophy,
  TrendingUp,
  CheckCircle2,
  Circle,
  Sliders,
  RotateCcw,
  Sparkles,
  Zap,
  Target,
  Clock,
  Layers,
} from 'lucide-react';
import type { ChallengePlan, UserSettings } from '../../types/trade';
import { calculateChallengeStats, generateChallengeDays } from '../../utils/challengeCalculator';
import { fireWinCelebration } from '../../utils/confetti';
import { triggerHaptic } from '../../services/storage';

interface ChallengeViewProps {
  plan: ChallengePlan;
  settings: UserSettings;
  onUpdatePlan: (updatedPlan: ChallengePlan) => void;
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({
  plan,
  settings,
  onUpdatePlan,
}) => {
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [customStartBalance, setCustomStartBalance] = useState(plan.startBalance);
  const [customRiskPercent, setCustomRiskPercent] = useState(plan.riskPercent);
  const [customTargetPercent, setCustomTargetPercent] = useState(plan.targetPercent);
  const [customDays, setCustomDays] = useState(plan.targetDays);

  const stats = calculateChallengeStats(plan);

  const handleToggleDay = (dayIndex: number) => {
    triggerHaptic();
    const updatedDays = [...plan.days];
    const isNowAchieved = !updatedDays[dayIndex].achieved;
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      achieved: isNowAchieved,
      date: isNowAchieved ? new Date().toISOString().split('T')[0] : undefined,
    };

    if (isNowAchieved) {
      fireWinCelebration();
    }

    const updatedPlan: ChallengePlan = {
      ...plan,
      days: updatedDays,
    };
    onUpdatePlan(updatedPlan);
  };

  const handleResetChallenge = () => {
    if (window.confirm('Reset all progress for this challenge?')) {
      triggerHaptic();
      const updatedDays = plan.days.map((d) => ({
        ...d,
        achieved: false,
        date: undefined,
        actualPnL: undefined,
      }));
      onUpdatePlan({ ...plan, days: updatedDays });
    }
  };

  const handleSaveCustomPlan = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    const newDays = generateChallengeDays(
      customStartBalance,
      customRiskPercent,
      customTargetPercent,
      customDays
    );

    const updatedPlan: ChallengePlan = {
      ...plan,
      name: `${settings.currencySymbol}${customStartBalance} TO ${settings.currencySymbol}${newDays[newDays.length - 1]?.afterWinBalance.toLocaleString()} (${customDays}-DAY PLAN)`,
      startBalance: customStartBalance,
      riskPercent: customRiskPercent,
      targetPercent: customTargetPercent,
      targetDays: customDays,
      days: newDays,
    };

    onUpdatePlan(updatedPlan);
    setIsEditingConfig(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Reference Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-800 via-dark-900 to-slate-900 border border-slate-700/70 p-4 shadow-xl">
        {/* Ambient Glows */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-profit/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Top Bull Icon & Title Banner */}
          <div className="flex items-center space-x-2 text-gold font-bold text-xs uppercase tracking-widest bg-gold/10 px-3 py-1 rounded-full border border-gold/30 mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>30 Day Trading Plan</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center space-x-2">
            <span>
              {settings.currencySymbol}
              {plan.startBalance} TO {settings.currencySymbol}
              {plan.days[plan.days.length - 1]?.afterWinBalance.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
            <TrendingUp className="w-6 h-6 text-profit inline-block" />
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-md bg-dark-700/80 border border-slate-600/60 text-[11px] font-semibold text-slate-300">
              {plan.riskPercent}% RISK PER TRADE
            </span>
            <span className="text-slate-500">•</span>
            <span className="px-2.5 py-0.5 rounded-md bg-profit/15 border border-profit/30 text-[11px] font-bold text-profit-light">
              {plan.targetPercent}% TARGET (2R)
            </span>
          </div>

          <p className="text-[11px] font-semibold text-gold/90 mt-2 uppercase tracking-wider">
            "Discipline Today, Freedom Tomorrow"
          </p>

          {/* Progress Bar & Summary Pill */}
          <div className="w-full mt-4 bg-dark-950/80 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="text-slate-400">
                Progress: <strong className="text-white">{stats.completedCount}/{stats.totalDays} Days</strong>
              </span>
              <span className="font-bold text-profit-light">{stats.progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-profit via-emerald-400 to-gold h-full rounded-full transition-all duration-500 shadow-glow-profit"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Current Balance</div>
                <div className="text-sm font-bold font-mono text-profit-light">
                  {settings.currencySymbol}
                  {stats.currentBalance.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Target Final</div>
                <div className="text-sm font-bold font-mono text-gold-light">
                  {settings.currencySymbol}
                  {stats.targetFinalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Next Target</div>
                <div className="text-sm font-bold font-mono text-white">
                  {stats.nextDay
                    ? `${settings.currencySymbol}${stats.nextDay.targetProfit.toFixed(2)}`
                    : 'Done! 🎉'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-end w-full space-x-2 mt-3">
            <button
              onClick={() => setIsEditingConfig(!isEditingConfig)}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded-lg bg-dark-700/80 hover:bg-dark-600 text-slate-300 font-medium border border-slate-600/50 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customize Plan</span>
            </button>
            <button
              onClick={handleResetChallenge}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded-lg bg-dark-700/80 hover:bg-loss/20 hover:text-loss-light text-slate-400 font-medium border border-slate-600/50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Customizer Modal/Form */}
      {isEditingConfig && (
        <form
          onSubmit={handleSaveCustomPlan}
          className="glass-panel p-4 rounded-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-profit" />
              <span>Customize Challenge Rules</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditingConfig(false)}
              className="text-slate-400 text-xs hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Start Balance ({settings.currencySymbol})
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={customStartBalance}
                onChange={(e) => setCustomStartBalance(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-profit"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Total Days</label>
              <input
                type="number"
                min="5"
                max="100"
                value={customDays}
                onChange={(e) => setCustomDays(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-profit"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Risk Per Trade (%)</label>
              <input
                type="number"
                min="1"
                max="50"
                step="any"
                value={customRiskPercent}
                onChange={(e) => setCustomRiskPercent(parseFloat(e.target.value) || 10)}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-profit"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Profit Target (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                step="any"
                value={customTargetPercent}
                onChange={(e) => setCustomTargetPercent(parseFloat(e.target.value) || 20)}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-profit"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={() => setIsEditingConfig(false)}
              className="px-3 py-1.5 rounded-xl bg-dark-800 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-profit hover:bg-profit-dark text-dark-900 font-bold text-xs shadow-glow-profit"
            >
              Apply New Plan
            </button>
          </div>
        </form>
      )}

      {/* 30-Day Table (Matching the reference layout precisely) */}
      <div className="overflow-hidden rounded-2xl bg-dark-900/90 border border-slate-800 shadow-xl">
        <div className="p-3 bg-dark-800/90 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-profit" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Compounding Checklist
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Tap row or circle to toggle</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-dark-950 text-slate-400 border-b border-slate-800 font-bold text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3 text-center">Day</th>
                <th className="py-2.5 px-2.5">Start</th>
                <th className="py-2.5 px-2 text-loss-light">Risk ({plan.riskPercent}%)</th>
                <th className="py-2.5 px-2 text-profit-light">Target ({plan.targetPercent}%)</th>
                <th className="py-2.5 px-2.5">After Win</th>
                <th className="py-2.5 px-3 text-center">Done</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {plan.days.map((day, idx) => {
                const isNext = !day.achieved && (idx === 0 || plan.days[idx - 1].achieved);
                return (
                  <tr
                    key={day.day}
                    onClick={() => handleToggleDay(idx)}
                    className={`cursor-pointer transition-colors ${
                      day.achieved
                        ? 'bg-profit/10 hover:bg-profit/15 text-slate-200'
                        : isNext
                        ? 'bg-gold/10 hover:bg-gold/15 text-white font-bold ring-1 ring-inset ring-gold/40'
                        : 'hover:bg-dark-800/60 text-slate-300'
                    }`}
                  >
                    {/* Day Number */}
                    <td className="py-2.5 px-3 text-center font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] ${
                          day.achieved
                            ? 'bg-profit text-dark-900 font-black'
                            : isNext
                            ? 'bg-gold text-dark-900 font-black animate-pulse'
                            : 'bg-dark-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {day.day}
                      </span>
                    </td>

                    {/* Start Balance */}
                    <td className="py-2.5 px-2.5 text-slate-300">
                      {settings.currencySymbol}
                      {day.startBalance.toFixed(2)}
                    </td>

                    {/* Risk 10% (Max Loss) */}
                    <td className="py-2.5 px-2 text-loss-light font-medium">
                      -${day.riskAmount.toFixed(2)}
                    </td>

                    {/* Target 20% (2R) */}
                    <td className="py-2.5 px-2 text-profit-light font-bold">
                      +${day.targetProfit.toFixed(2)}
                    </td>

                    {/* After Win Balance */}
                    <td className="py-2.5 px-2.5 font-bold text-white">
                      {settings.currencySymbol}
                      {day.afterWinBalance.toFixed(2)}
                    </td>

                    {/* Achieved Toggle Button */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        aria-label={`Mark Day ${day.day} as ${day.achieved ? 'incomplete' : 'complete'}`}
                        className="p-1 rounded-lg transition-transform active:scale-90"
                      >
                        {day.achieved ? (
                          <CheckCircle2 className="w-5 h-5 text-profit fill-profit/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reference Bottom Cards (Exact copy of reference image footer) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Example Day 1 Card */}
        <div className="glass-card p-3.5 rounded-2xl border border-slate-700/60">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-profit-light uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4 text-profit" />
            <span>Example (Day 1 Execution)</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Starting Balance:</span>
              <strong className="font-mono text-white">${plan.startBalance.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-loss-light">
              <span>Risk 10% (Stop Loss):</span>
              <strong className="font-mono">-${(plan.startBalance * 0.1).toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-profit-light">
              <span>Take Profit (20% / 2R):</span>
              <strong className="font-mono">+${(plan.startBalance * 0.2).toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-gold-light pt-1 border-t border-slate-700 font-bold">
              <span>After Win (New Balance):</span>
              <strong className="font-mono">${(plan.startBalance * 1.2).toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Key Point Card */}
        <div className="glass-card p-3.5 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-gold uppercase tracking-wider mb-2">
            <Target className="w-4 h-4 text-gold" />
            <span>Core Discipline Keys</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-profit" />
              <span>Start Small</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <TrendingUp className="w-3.5 h-3.5 text-profit" />
              <span>Stay Consistent</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-gold" />
              <span>Focus On Process</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Trophy className="w-3.5 h-3.5 text-gold" />
              <span className="font-bold text-gold-light">Finish Big!</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-700/60 text-center">
            <span className="text-[11px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-profit via-gold to-emerald-400 tracking-wide uppercase">
              🎯 Start Small, Stay Consistent, Finish Big! 👑
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
