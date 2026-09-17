import saveAs from 'file-saver';
import * as XLSX from 'xlsx';
import type { AppDataBackup, ChallengePlan, Trade } from '../types/trade';
import { getFullAppData, getSettings } from './storage';

export function exportTradesToExcel(trades: Trade[], challenge: ChallengePlan): void {
  const settings = getSettings();
  const wb = XLSX.utils.book_new();

  // 1. Overview Sheet
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.outcome === 'WIN').length;
  const losses = trades.filter((t) => t.outcome === 'LOSS').length;
  const netPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) + '%' : '0%';
  const totalWinAmount = trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
  const totalLossAmount = Math.abs(trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = totalLossAmount > 0 ? (totalWinAmount / totalLossAmount).toFixed(2) : totalWinAmount > 0 ? 'MAX' : '0.00';

  const overviewData = [
    { Metric: 'Trader Name', Value: settings.traderName },
    { Metric: 'Export Date', Value: new Date().toLocaleString() },
    { Metric: 'Currency', Value: settings.currencySymbol + ' (' + settings.currency + ')' },
    { Metric: 'Total Trades Logged', Value: totalTrades },
    { Metric: 'Winning Trades', Value: wins },
    { Metric: 'Losing Trades', Value: losses },
    { Metric: 'Win Rate', Value: winRate },
    { Metric: 'Total Net PnL', Value: `${settings.currencySymbol}${netPnL.toFixed(2)}` },
    { Metric: 'Profit Factor', Value: profitFactor },
    { Metric: 'Active Challenge Plan', Value: challenge.name },
    { Metric: 'Challenge Starting Capital', Value: `${settings.currencySymbol}${challenge.startBalance}` },
    { Metric: 'Challenge Days Completed', Value: `${challenge.days.filter((d) => d.achieved).length} / ${challenge.days.length}` },
  ];
  const wsOverview = XLSX.utils.json_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Summary');

  // 2. 30-Day Challenge Sheet (Matching Reference Table)
  const challengeData = challenge.days.map((d) => ({
    'Day #': d.day,
    'Starting Balance': d.startBalance,
    'Risk 10% (Max Loss)': d.riskAmount,
    'Profit Target 20% (2R)': d.targetProfit,
    'After Win (New Balance)': d.afterWinBalance,
    'Achieved (YES/NO)': d.achieved ? 'YES' : 'NO',
    'Actual PnL Recorded': d.actualPnL !== undefined ? d.actualPnL : '',
    'Date Completed': d.date || '',
    Notes: d.notes || '',
  }));
  const wsChallenge = XLSX.utils.json_to_sheet(challengeData);
  XLSX.utils.book_append_sheet(wb, wsChallenge, '30-Day Plan');

  // 3. Trade Logs Sheet
  const tradesData = trades.map((t, idx) => ({
    '#': idx + 1,
    Date: t.date,
    Time: t.time,
    Pair: t.pair,
    Direction: t.direction,
    'PnL ($)': t.pnl,
    'PnL (%)': t.pnlPercent || '',
    Outcome: t.outcome,
    'Risk:Reward (RR)': t.riskReward || '',
    'Entry Price': t.entryPrice || '',
    'Exit Price': t.exitPrice || '',
    Lots: t.lots || '',
    Session: t.session || '',
    Setup: t.setup || '',
    Emotion: t.emotion || '',
    'Challenge Day #': t.challengeDay || '',
    Notes: t.notes || '',
  }));
  const wsTrades = XLSX.utils.json_to_sheet(tradesData);
  XLSX.utils.book_append_sheet(wb, wsTrades, 'Trade Logs');

  // Generate buffer and trigger download
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  });
  const filename = `Trading_Track_${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(blob, filename);
}

export function exportBackupJSON(): void {
  const data = getFullAppData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const filename = `Trading_Track_Backup_${new Date().toISOString().split('T')[0]}.json`;
  saveAs(blob, filename);
}

export function importBackupJSON(file: File): Promise<AppDataBackup> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content) as AppDataBackup;
        if (!parsed || (!parsed.trades && !parsed.challenges)) {
          throw new Error('Invalid backup file format');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
