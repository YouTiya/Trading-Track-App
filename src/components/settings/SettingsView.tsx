import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileJson,
  RotateCcw,
  Smartphone,
  CheckCircle2,
  DollarSign,
  Vibrate,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { AppDataBackup, ChallengePlan, Trade, UserSettings } from '../../types/trade';
import { exportBackupJSON, exportTradesToExcel, importBackupJSON } from '../../services/exportService';
import { triggerHaptic } from '../../services/storage';
import { fireWinCelebration } from '../../utils/confetti';

interface SettingsViewProps {
  settings: UserSettings;
  trades: Trade[];
  activeChallenge: ChallengePlan;
  onUpdateSettings: (settings: UserSettings) => void;
  onRestoreBackup: (backup: AppDataBackup) => void;
  onResetAllData: () => void;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
  { code: 'THB', symbol: '฿' },
  { code: 'INR', symbol: '₹' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'CAD', symbol: 'C$' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  trades,
  activeChallenge,
  onUpdateSettings,
  onRestoreBackup,
  onResetAllData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [showApkGuide, setShowApkGuide] = useState(false);

  const handleExportExcel = () => {
    triggerHaptic();
    try {
      exportTradesToExcel(trades, activeChallenge);
      setExportSuccess('Excel spreadsheet (.xlsx) exported successfully!');
      setTimeout(() => setExportSuccess(null), 4000);
      fireWinCelebration();
    } catch {
      alert('Failed to export Excel file.');
    }
  };

  const handleExportJSON = () => {
    triggerHaptic();
    try {
      exportBackupJSON();
      setExportSuccess('JSON backup file exported successfully!');
      setTimeout(() => setExportSuccess(null), 4000);
      fireWinCelebration();
    } catch {
      alert('Failed to export JSON file.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const backup = await importBackupJSON(file);
      if (
        window.confirm(
          `Found backup from ${backup.exportedAt || 'previous export'} with ${backup.trades?.length || 0} trades. Overwrite current data?`
        )
      ) {
        triggerHaptic();
        onRestoreBackup(backup);
        setExportSuccess('Backup restored successfully!');
        setTimeout(() => setExportSuccess(null), 4000);
        fireWinCelebration();
      }
    } catch {
      alert('Failed to import backup file. Ensure it is a valid JSON backup from Trading Track.');
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCurrencySelect = (code: string, symbol: string) => {
    triggerHaptic();
    onUpdateSettings({ ...settings, currency: code, currencySymbol: symbol });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <span>Data & Settings</span>
        </h2>
        <p className="text-xs text-slate-400">
          Export your trade records to Excel, manage backups, and configure preferences.
        </p>
      </div>

      {/* Success Banner */}
      {exportSuccess && (
        <div className="p-3 rounded-2xl bg-profit/15 border border-profit/40 text-profit-light flex items-center space-x-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* Export / Import Data Card */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
          <Download className="w-4 h-4 text-profit" />
          <span>Export & Local Backup</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Export to Excel */}
          <button
            id="export-excel-btn"
            onClick={handleExportExcel}
            className="flex items-center justify-between p-3.5 rounded-xl bg-dark-950 hover:bg-dark-800 border border-slate-800 hover:border-profit/40 transition-all text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-profit/15 text-profit group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Export to Excel (.xlsx)</div>
                <div className="text-[10px] text-slate-400">Multi-sheet workbook with logs & KPIs</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-profit" />
          </button>

          {/* Export JSON Backup */}
          <button
            id="export-json-btn"
            onClick={handleExportJSON}
            className="flex items-center justify-between p-3.5 rounded-xl bg-dark-950 hover:bg-dark-800 border border-slate-800 hover:border-gold/40 transition-all text-left group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gold/15 text-gold group-hover:scale-110 transition-transform">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Export JSON Backup</div>
                <div className="text-[10px] text-slate-400">Complete raw backup for recovery</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-gold" />
          </button>
        </div>

        {/* Restore from JSON */}
        <div className="pt-2 border-t border-slate-800">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-dark-900 hover:bg-dark-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <Upload className="w-4 h-4 text-brand-500" />
            <span>Import / Restore from JSON Backup</span>
          </button>
        </div>
      </div>

      {/* Currency Selector Card */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
          <DollarSign className="w-4 h-4 text-gold" />
          <span>Display Currency</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => handleCurrencySelect(c.code, c.symbol)}
              className={`p-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                settings.currency === c.code
                  ? 'bg-profit/15 border-profit text-profit-light font-bold'
                  : 'bg-dark-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{c.code}</span>
              <span className="font-mono">{c.symbol}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preferences (Haptic Feedback) */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
          <Vibrate className="w-4 h-4 text-brand-500" />
          <span>Mobile Haptics & Feel</span>
        </h3>

        <div className="flex items-center justify-between p-3 rounded-xl bg-dark-950 border border-slate-800">
          <div>
            <div className="text-xs font-bold text-white">Haptic Vibration Touch</div>
            <div className="text-[10px] text-slate-400">Vibrate on buttons, tabs and goal achievements</div>
          </div>
          <button
            onClick={() => {
              triggerHaptic();
              onUpdateSettings({ ...settings, hapticsEnabled: !settings.hapticsEnabled });
            }}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              settings.hapticsEnabled ? 'bg-profit' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                settings.hapticsEnabled ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Android APK Build Guide Collapsible */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 shadow-xl space-y-2">
        <button
          onClick={() => setShowApkGuide(!showApkGuide)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-profit" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Android APK Build Instructions
            </h3>
          </div>
          {showApkGuide ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showApkGuide && (
          <div className="pt-2 text-xs text-slate-300 space-y-2 leading-relaxed border-t border-slate-800">
            <p>To generate and install the standalone APK on your Android device:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 font-mono text-[11px] bg-dark-950 p-2.5 rounded-xl border border-slate-800">
              <li>1. Run: <code className="text-profit">npm run build</code></li>
              <li>2. Run: <code className="text-profit">npx cap sync android</code></li>
              <li>3. Open Android Studio: <code className="text-profit">npx cap open android</code></li>
              <li>4. Click: <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong></li>
              <li>5. Transfer the output <code className="text-gold">app-debug.apk</code> to your Android phone and install!</li>
            </ol>
            <p className="text-[11px] text-slate-400">
              Note: You can also use this app right in your mobile browser with offline support and "Add to Home Screen" PWA.
            </p>
          </div>
        )}
      </div>

      {/* Reset Data */}
      <div className="pt-2 text-center">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all data and restart with clean templates?')) {
              triggerHaptic();
              onResetAllData();
            }
          }}
          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs text-loss-light hover:bg-loss/10 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Data to Defaults</span>
        </button>
      </div>
    </div>
  );
};
