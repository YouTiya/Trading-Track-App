import React from 'react';
import { Target, BookOpen, BarChart3, ShieldCheck, Settings } from 'lucide-react';
import { triggerHaptic } from '../../services/storage';

export type NavTab = 'challenge' | 'journal' | 'analytics' | 'rules' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'challenge' as NavTab, label: '30D Plan', icon: Target, badge: 'Target' },
    { id: 'journal' as NavTab, label: 'Journal', icon: BookOpen },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'rules' as NavTab, label: 'Rules', icon: ShieldCheck },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (tabId: NavTab) => {
    triggerHaptic();
    onSelectTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-800 pb-[env(safe-area-inset-bottom,0.5rem)] pt-1.5 px-2">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-profit-light font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-profit/15 text-profit-light shadow-glow-profit scale-110'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
