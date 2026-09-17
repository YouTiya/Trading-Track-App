import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Target,
  Clock,
  Trophy,
  XOctagon,
  Calculator,
  Flame,
} from 'lucide-react';
import type { TradingRule, UserSettings } from '../../types/trade';
import { triggerHaptic } from '../../services/storage';
import { fireWinCelebration } from '../../utils/confetti';

interface RulesViewProps {
  rules: TradingRule[];
  settings: UserSettings;
}

export const RulesView: React.FC<RulesViewProps> = ({ rules, settings }) => {
  // Daily pledge checklist state
  const [pledgedRules, setPledgedRules] = useState<{ [id: string]: boolean }>({});

  // Quick Risk / Lot Size Calculator state
  const [accountSize, setAccountSize] = useState<number>(settings.defaultStartingBalance || 100);
  const [riskPercent, setRiskPercent] = useState<number>(10);
  const [stopLossPips, setStopLossPips] = useState<number>(20);
  const [pipValuePerLot, setPipValuePerLot] = useState<number>(10); // Standard forex $10/pip per standard lot

  const maxDollarRisk = (accountSize * (riskPercent / 100));
  const calculatedLotSize =
    stopLossPips > 0 && pipValuePerLot > 0
      ? (maxDollarRisk / (stopLossPips * pipValuePerLot)).toFixed(2)
      : '0.00';
  const targetProfitDollar = (maxDollarRisk * 2).toFixed(2); // 2R target

  const handleTogglePledge = (id: string) => {
    triggerHaptic();
    const updated = { ...pledgedRules, [id]: !pledgedRules[id] };
    setPledgedRules(updated);

    // If all pledged, fire celebration
    const allPledged = rules.every((r) => updated[r.id]);
    if (allPledged) {
      fireWinCelebration();
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-profit-light" />;
      case 'Target':
        return <Target className="w-5 h-5 text-profit-light" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-gold" />;
      case 'XOctagon':
        return <XOctagon className="w-5 h-5 text-loss-light" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-brand-500" />;
      case 'Trophy':
      default:
        return <Trophy className="w-5 h-5 text-gold-light" />;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-xl text-center relative overflow-hidden">
        <div className="flex items-center justify-center space-x-2 text-gold font-bold text-xs uppercase tracking-wider mb-1">
          <Flame className="w-4 h-4 text-gold fill-gold" />
          <span>The Golden Trading Rules</span>
        </div>
        <h2 className="text-xl font-black text-white">Discipline & Risk Management</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          "Discipline Today, Freedom Tomorrow. Stick to these rules unconditionally."
        </p>
      </div>

      {/* Interactive Risk & Lot Size Calculator Card */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-profit/15 text-profit">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              10% Risk & Lot Size Calculator
            </h3>
          </div>
          <span className="text-[10px] text-profit font-semibold">2R Target Helper</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">
              Account Balance ({settings.currencySymbol})
            </label>
            <input
              type="number"
              value={accountSize}
              onChange={(e) => setAccountSize(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-xl bg-dark-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-profit"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">
              Risk Percentage (%)
            </label>
            <input
              type="number"
              value={riskPercent}
              onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-xl bg-dark-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-profit"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">
              Stop Loss (Pips / Points)
            </label>
            <input
              type="number"
              value={stopLossPips}
              onChange={(e) => setStopLossPips(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 rounded-xl bg-dark-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-profit"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">
              Pip Value / Standard Lot
            </label>
            <input
              type="number"
              value={pipValuePerLot}
              onChange={(e) => setPipValuePerLot(parseFloat(e.target.value) || 10)}
              className="w-full px-3 py-1.5 rounded-xl bg-dark-950 border border-slate-700 font-mono text-sm text-white focus:outline-none focus:border-profit"
            />
          </div>
        </div>

        {/* Calculated Results Box */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-dark-950 border border-slate-800 text-center">
          <div>
            <div className="text-[10px] text-slate-400">Max Dollar Loss</div>
            <div className="text-sm font-mono font-bold text-loss-light">
              -${maxDollarRisk.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Calculated Lot</div>
            <div className="text-sm font-mono font-black text-profit-light">
              {calculatedLotSize}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">2R Profit Target</div>
            <div className="text-sm font-mono font-bold text-emerald-400">
              +${targetProfitDollar}
            </div>
          </div>
        </div>
      </div>

      {/* Rules List with Pledge Checkboxes */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Daily Discipline Pledge
          </span>
          <span className="text-[11px] text-slate-400">Tap rule to pledge</span>
        </div>

        {rules.map((rule) => {
          const isPledged = pledgedRules[rule.id];

          return (
            <div
              key={rule.id}
              onClick={() => handleTogglePledge(rule.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                isPledged
                  ? 'bg-profit/10 border-profit/40 shadow-glow-profit'
                  : 'glass-card border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="p-2 rounded-xl bg-dark-900 border border-slate-800 flex-shrink-0 mt-0.5">
                {getIcon(rule.icon)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{rule.title}</h4>
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                      isPledged
                        ? 'bg-profit border-profit text-dark-900 font-bold'
                        : 'border-slate-600'
                    }`}
                  >
                    {isPledged ? '✓' : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {rule.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
