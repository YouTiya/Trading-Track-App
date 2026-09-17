import { useState, useEffect, useMemo } from 'react';
import type {
  AppDataBackup,
  ChallengePlan,
  Trade,
  TradingRule,
  UserSettings,
} from './types/trade';
import {
  addTrade,
  clearAllData,
  deleteTrade,
  getActiveChallenge,
  getRules,
  getSettings,
  getTrades,
  restoreFullAppData,
  saveActiveChallenge,
  saveSettings,
  updateTrade,
} from './services/storage';
import { calculateChallengeStats } from './utils/challengeCalculator';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import type { NavTab } from './components/layout/BottomNav';
import { ChallengeView } from './components/challenge/ChallengeView';
import { TradeJournalView } from './components/trades/TradeJournalView';
import { TradeModal } from './components/trades/TradeModal';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { RulesView } from './components/rules/RulesView';
import { SettingsView } from './components/settings/SettingsView';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('challenge');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<ChallengePlan | null>(null);
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [rules, setRules] = useState<TradingRule[]>(getRules());

  // Trade Modal state
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  // Load initial data
  useEffect(() => {
    setTrades(getTrades());
    setActiveChallenge(getActiveChallenge());
    setSettings(getSettings());
    setRules(getRules());
  }, []);

  // Compute Today's PnL
  const todayPnL = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return trades
      .filter((t) => t.date === todayStr)
      .reduce((sum, t) => sum + t.pnl, 0);
  }, [trades]);

  // Challenge progress stats
  const challengeStats = useMemo(() => {
    if (!activeChallenge) return undefined;
    const stats = calculateChallengeStats(activeChallenge);
    return {
      currentBalance: stats.currentBalance,
      completedCount: stats.completedCount,
      totalDays: stats.totalDays,
    };
  }, [activeChallenge]);

  // Handlers
  const handleSaveTrade = (trade: Trade) => {
    let updated: Trade[];
    if (editingTrade) {
      updated = updateTrade(trade);
    } else {
      updated = addTrade(trade);

      // If linked to challenge day, auto-check it if not checked
      if (trade.challengeDay && activeChallenge) {
        const dayIdx = activeChallenge.days.findIndex((d) => d.day === trade.challengeDay);
        if (dayIdx >= 0 && trade.outcome === 'WIN') {
          const updatedDays = [...activeChallenge.days];
          updatedDays[dayIdx] = {
            ...updatedDays[dayIdx],
            achieved: true,
            actualPnL: trade.pnl,
            date: trade.date,
          };
          const updatedPlan = { ...activeChallenge, days: updatedDays };
          setActiveChallenge(updatedPlan);
          saveActiveChallenge(updatedPlan);
        }
      }
    }
    setTrades(updated);
    setEditingTrade(null);
  };

  const handleDeleteTrade = (id: string) => {
    const updated = deleteTrade(id);
    setTrades(updated);
  };

  const handleOpenNewTrade = () => {
    setEditingTrade(null);
    setIsTradeModalOpen(true);
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsTradeModalOpen(true);
  };

  const handleUpdatePlan = (updatedPlan: ChallengePlan) => {
    setActiveChallenge(updatedPlan);
    saveActiveChallenge(updatedPlan);
  };

  const handleUpdateSettings = (updatedSettings: UserSettings) => {
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  const handleRestoreBackup = (backup: AppDataBackup) => {
    if (restoreFullAppData(backup)) {
      setTrades(getTrades());
      setActiveChallenge(getActiveChallenge());
      setSettings(getSettings());
      setRules(getRules());
    }
  };

  const handleResetAllData = () => {
    clearAllData();
    setTrades(getTrades());
    setActiveChallenge(getActiveChallenge());
    setSettings(getSettings());
    setRules(getRules());
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col selection:bg-profit selection:text-dark-900">
      {/* Top Header */}
      <Header
        settings={settings}
        todayPnL={todayPnL}
        onOpenNewTrade={handleOpenNewTrade}
        activeChallengeProgress={challengeStats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-3.5 pt-3.5">
        {activeTab === 'challenge' && activeChallenge && (
          <ChallengeView
            plan={activeChallenge}
            settings={settings}
            onUpdatePlan={handleUpdatePlan}
          />
        )}

        {activeTab === 'journal' && (
          <TradeJournalView
            trades={trades}
            settings={settings}
            onOpenNewTrade={handleOpenNewTrade}
            onEditTrade={handleEditTrade}
            onDeleteTrade={handleDeleteTrade}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView trades={trades} settings={settings} />
        )}

        {activeTab === 'rules' && (
          <RulesView rules={rules} settings={settings} />
        )}

        {activeTab === 'settings' && activeChallenge && (
          <SettingsView
            settings={settings}
            trades={trades}
            activeChallenge={activeChallenge}
            onUpdateSettings={handleUpdateSettings}
            onRestoreBackup={handleRestoreBackup}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Trade Log/Edit Modal */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        onSaveTrade={handleSaveTrade}
        editingTrade={editingTrade}
        settings={settings}
        activeChallengeDay={
          activeChallenge?.days.find((d) => !d.achieved)?.day || 1
        }
      />

      {/* Bottom Tab Bar */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}

export default App;
