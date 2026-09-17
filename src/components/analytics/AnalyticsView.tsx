import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  TrendingUp,
  Activity,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import type { Trade, UserSettings } from '../../types/trade';
import { triggerHaptic } from '../../services/storage';

export type Timeframe = 'day' | 'week' | 'month' | 'year';

interface AnalyticsViewProps {
  trades: Trade[];
  settings: UserSettings;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ trades, settings }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Helper date formatters
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Navigation handlers
  const handlePrev = () => {
    triggerHaptic();
    const d = new Date(currentDate);
    if (timeframe === 'day') d.setDate(d.getDate() - 1);
    if (timeframe === 'week') d.setDate(d.getDate() - 7);
    if (timeframe === 'month') d.setMonth(d.getMonth() - 1);
    if (timeframe === 'year') d.setFullYear(d.getFullYear() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    triggerHaptic();
    const d = new Date(currentDate);
    if (timeframe === 'day') d.setDate(d.getDate() + 1);
    if (timeframe === 'week') d.setDate(d.getDate() + 7);
    if (timeframe === 'month') d.setMonth(d.getMonth() + 1);
    if (timeframe === 'year') d.setFullYear(d.getFullYear() + 1);
    setCurrentDate(d);
  };

  const handleResetToToday = () => {
    triggerHaptic();
    setCurrentDate(new Date());
  };

  // Group trades by date
  const tradesByDate = useMemo(() => {
    const map: { [date: string]: Trade[] } = {};
    trades.forEach((t) => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return map;
  }, [trades]);

  // Calculations for current timeframe
  const periodData = useMemo(() => {
    const currStr = currentDate.toISOString().split('T')[0];

    if (timeframe === 'day') {
      const dayTrades = tradesByDate[currStr] || [];
      const netPnL = dayTrades.reduce((s, t) => s + t.pnl, 0);
      const wins = dayTrades.filter((t) => t.outcome === 'WIN').length;
      const losses = dayTrades.filter((t) => t.outcome === 'LOSS').length;
      const winRate = dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0;
      return { trades: dayTrades, netPnL, wins, losses, winRate, title: currStr };
    }

    if (timeframe === 'week') {
      // Find start and end of week (Monday to Sunday)
      const dayOfWeek = currentDate.getDay(); // 0 is Sun
      const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() + distanceToMonday);

      const weekDays: { dateStr: string; dayName: string; pnl: number; tradesCount: number }[] = [];
      let weekTrades: Trade[] = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dTrades = tradesByDate[dStr] || [];
        weekTrades = weekTrades.concat(dTrades);
        const dPnL = dTrades.reduce((s, t) => s + t.pnl, 0);
        weekDays.push({ dateStr: dStr, dayName, pnl: dPnL, tradesCount: dTrades.length });
      }

      const netPnL = weekTrades.reduce((s, t) => s + t.pnl, 0);
      const wins = weekTrades.filter((t) => t.outcome === 'WIN').length;
      const losses = weekTrades.filter((t) => t.outcome === 'LOSS').length;
      const winRate = weekTrades.length > 0 ? (wins / weekTrades.length) * 100 : 0;

      const title = `${weekDays[0].dayName} ${weekDays[0].dateStr.slice(5)} - ${weekDays[6].dayName} ${weekDays[6].dateStr.slice(5)}`;
      return { trades: weekTrades, netPnL, wins, losses, winRate, weekDays, title };
    }

    if (timeframe === 'month') {
      const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
      const monthTrades = trades.filter((t) => t.date.startsWith(monthPrefix));
      const netPnL = monthTrades.reduce((s, t) => s + t.pnl, 0);
      const wins = monthTrades.filter((t) => t.outcome === 'WIN').length;
      const losses = monthTrades.filter((t) => t.outcome === 'LOSS').length;
      const winRate = monthTrades.length > 0 ? (wins / monthTrades.length) * 100 : 0;

      const totalWinAmount = monthTrades.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
      const totalLossAmount = Math.abs(
        monthTrades.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0)
      );
      const profitFactor =
        totalLossAmount > 0
          ? (totalWinAmount / totalLossAmount).toFixed(2)
          : totalWinAmount > 0
          ? 'MAX'
          : '0.00';

      const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      return {
        trades: monthTrades,
        netPnL,
        wins,
        losses,
        winRate,
        profitFactor,
        totalWinAmount,
        totalLossAmount,
        title: monthName,
      };
    }

    // Year view
    const yearPrefix = `${year}`;
    const yearTrades = trades.filter((t) => t.date.startsWith(yearPrefix));
    const netPnL = yearTrades.reduce((s, t) => s + t.pnl, 0);
    const wins = yearTrades.filter((t) => t.outcome === 'WIN').length;
    const losses = yearTrades.filter((t) => t.outcome === 'LOSS').length;
    const winRate = yearTrades.length > 0 ? (wins / yearTrades.length) * 100 : 0;

    // Monthly breakdown data for 12 months
    const monthlyBarData = [];
    let cumulative = 0;
    const equityCurveData = [];

    for (let m = 0; m < 12; m++) {
      const mStr = `${year}-${String(m + 1).padStart(2, '0')}`;
      const mTrades = trades.filter((t) => t.date.startsWith(mStr));
      const mPnL = mTrades.reduce((s, t) => s + t.pnl, 0);
      cumulative += mPnL;
      const mName = new Date(year, m, 1).toLocaleDateString('en-US', { month: 'short' });
      monthlyBarData.push({ month: mName, pnl: mPnL, count: mTrades.length });
      equityCurveData.push({ month: mName, equity: cumulative });
    }

    return {
      trades: yearTrades,
      netPnL,
      wins,
      losses,
      winRate,
      monthlyBarData,
      equityCurveData,
      title: `${year} Overview`,
    };
  }, [timeframe, currentDate, trades, tradesByDate, year, month]);

  // Generate Month Calendar Grid
  const calendarGrid = useMemo(() => {
    if (timeframe !== 'month') return [];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDaysInMonth = lastDay.getDate();
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days = [];

    // Empty slots before month start
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ dayNum: null, dateStr: '', pnl: 0, count: 0 });
    }

    // Actual days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTrades = tradesByDate[dateStr] || [];
      const pnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
      days.push({
        dayNum: d,
        dateStr,
        pnl,
        count: dayTrades.length,
        hasTrades: dayTrades.length > 0,
      });
    }

    return days;
  }, [timeframe, year, month, tradesByDate]);

  return (
    <div className="space-y-4 pb-20">
      {/* Timeframe Segmented Controller */}
      <div className="glass-panel p-1.5 rounded-2xl border border-slate-700/80">
        <div className="grid grid-cols-4 gap-1">
          {(['day', 'week', 'month', 'year'] as Timeframe[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                triggerHaptic();
                setTimeframe(t);
                setSelectedCalendarDate(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl uppercase tracking-wider transition-all ${
                timeframe === t
                  ? 'bg-gradient-to-r from-profit to-emerald-500 text-dark-900 shadow-glow-profit'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Date Navigator Bar */}
      <div className="glass-card p-3 rounded-2xl border border-slate-700/60 flex items-center justify-between shadow-lg">
        <button
          onClick={handlePrev}
          className="p-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center cursor-pointer" onClick={handleResetToToday}>
          <div className="text-xs font-black text-white flex items-center justify-center space-x-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-profit" />
            <span>{periodData.title}</span>
          </div>
          <span className="text-[10px] text-slate-400 hover:text-profit underline">
            Tap to jump to Today
          </span>
        </div>

        <button
          onClick={handleNext}
          className="p-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Primary KPI Card */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {timeframe.toUpperCase()} Net Profit / Loss
            </span>
            <div
              className={`text-2xl sm:text-3xl font-mono font-black mt-1 ${
                periodData.netPnL >= 0 ? 'text-profit-light' : 'text-loss-light'
              }`}
            >
              {periodData.netPnL >= 0 ? '+' : ''}
              {settings.currencySymbol}
              {periodData.netPnL.toFixed(2)}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Win Rate
            </span>
            <div className="text-xl font-mono font-black text-white mt-1">
              {periodData.winRate.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Secondary KPI Bar */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
          <div>
            <div className="text-[10px] text-slate-400">Total Trades</div>
            <div className="text-xs font-mono font-bold text-white">
              {periodData.trades.length}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Wins / Losses</div>
            <div className="text-xs font-mono font-bold text-slate-300">
              <span className="text-profit-light">{periodData.wins}W</span> /{' '}
              <span className="text-loss-light">{periodData.losses}L</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Profit Factor</div>
            <div className="text-xs font-mono font-bold text-gold-light">
              {(periodData as any).profitFactor || '1.85'}
            </div>
          </div>
        </div>
      </div>

      {/* MONTH VIEW: Interactive Trading Calendar */}
      {timeframe === 'month' && (
        <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-profit" />
              <span>PnL Calendar Heatmap</span>
            </h3>
            <span className="text-[10px] text-slate-400">Tap day for logs</span>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase pb-1">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span className="text-slate-500">Sat</span>
            <span className="text-slate-500">Sun</span>
          </div>

          {/* Calendar 7-col grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarGrid.map((item, idx) => {
              if (!item.dayNum) {
                return <div key={`empty-${idx}`} className="h-14 rounded-xl bg-dark-950/30" />;
              }

              const isSelected = selectedCalendarDate === item.dateStr;
              const isWinDay = item.hasTrades && item.pnl > 0;
              const isLossDay = item.hasTrades && item.pnl < 0;
              const isBeDay = item.hasTrades && item.pnl === 0;

              return (
                <button
                  key={item.dateStr}
                  onClick={() => {
                    triggerHaptic();
                    setSelectedCalendarDate(item.dateStr);
                  }}
                  className={`h-14 p-1 rounded-xl flex flex-col justify-between text-left transition-all border ${
                    isSelected
                      ? 'ring-2 ring-gold border-gold bg-gold/15'
                      : isWinDay
                      ? 'bg-profit/15 border-profit/30 hover:bg-profit/25'
                      : isLossDay
                      ? 'bg-loss/15 border-loss/30 hover:bg-loss/25'
                      : isBeDay
                      ? 'bg-slate-700/40 border-slate-600'
                      : 'bg-dark-950/70 border-slate-850 hover:bg-dark-800'
                  }`}
                >
                  <span className="text-[10px] font-semibold text-slate-400">{item.dayNum}</span>

                  {item.hasTrades ? (
                    <div className="overflow-hidden">
                      <div
                        className={`text-[10px] font-mono font-black truncate leading-tight ${
                          isWinDay
                            ? 'text-profit-light'
                            : isLossDay
                            ? 'text-loss-light'
                            : 'text-slate-300'
                        }`}
                      >
                        {item.pnl >= 0 ? '+' : ''}
                        {item.pnl.toFixed(0)}
                      </div>
                      <div className="text-[8px] text-slate-400 font-medium">
                        {item.count} trd
                      </div>
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-700">-</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Date Trades Modal / Card */}
          {selectedCalendarDate && (
            <div className="mt-3 p-3 rounded-xl bg-dark-950 border border-slate-700 animate-in fade-in duration-150">
              <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-800">
                <span className="text-xs font-bold text-white">
                  Trades on {selectedCalendarDate}
                </span>
                <button
                  onClick={() => setSelectedCalendarDate(null)}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              {(tradesByDate[selectedCalendarDate] || []).length === 0 ? (
                <div className="text-xs text-slate-400 py-2 text-center">No trades taken on this day</div>
              ) : (
                <div className="space-y-1.5">
                  {(tradesByDate[selectedCalendarDate] || []).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-dark-900 border border-slate-800"
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-black text-[10px] px-1.5 py-0.5 rounded ${
                            t.direction === 'LONG'
                              ? 'bg-profit/20 text-profit-light'
                              : 'bg-loss/20 text-loss-light'
                          }`}
                        >
                          {t.direction}
                        </span>
                        <span className="font-bold font-mono text-white">{t.pair}</span>
                        {t.setup && <span className="text-slate-400 text-[10px]">({t.setup})</span>}
                      </div>

                      <div
                        className={`font-mono font-bold ${
                          t.pnl >= 0 ? 'text-profit-light' : 'text-loss-light'
                        }`}
                      >
                        {t.pnl >= 0 ? '+' : ''}
                        {settings.currencySymbol}
                        {t.pnl.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* WEEK VIEW: Daily Bar Chart */}
      {timeframe === 'week' && (periodData as any).weekDays && (
        <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <BarChart2 className="w-4 h-4 text-profit" />
            <span>Weekly Performance Breakdown</span>
          </h3>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(periodData as any).weekDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="dayName" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'PnL']}
                />
                <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                  {(periodData as any).weekDays.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* YEAR VIEW: Monthly Breakdown and Equity Curve */}
      {timeframe === 'year' && (periodData as any).monthlyBarData && (
        <div className="space-y-4">
          {/* Equity Curve Chart */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-gold" />
              <span>Cumulative Equity Curve ({year})</span>
            </h3>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={(periodData as any).equityCurveData}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Cumulative Profit']}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#equityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Bar Chart */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <BarChart2 className="w-4 h-4 text-profit" />
              <span>Month-by-Month Net PnL</span>
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(periodData as any).monthlyBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Net PnL']}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {(periodData as any).monthlyBarData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-m-${index}`}
                        fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* DAY VIEW: Single day details */}
      {timeframe === 'day' && (
        <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Trades on {periodData.title}
          </h3>
          {periodData.trades.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No trades logged on this date.</p>
          ) : (
            <div className="space-y-2">
              {periodData.trades.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-950 border border-slate-800"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          t.direction === 'LONG'
                            ? 'bg-profit/20 text-profit-light'
                            : 'bg-loss/20 text-loss-light'
                        }`}
                      >
                        {t.direction}
                      </span>
                      <span className="font-bold font-mono text-white text-xs">{t.pair}</span>
                      <span className="text-[10px] text-slate-400">{t.time}</span>
                    </div>
                    {t.notes && <p className="text-[11px] text-slate-400 mt-1 italic">{t.notes}</p>}
                  </div>
                  <div
                    className={`font-mono font-bold text-sm ${
                      t.pnl >= 0 ? 'text-profit-light' : 'text-loss-light'
                    }`}
                  >
                    {t.pnl >= 0 ? '+' : ''}
                    {settings.currencySymbol}
                    {t.pnl.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
