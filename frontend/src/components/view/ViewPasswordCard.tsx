import React from 'react';
import { Lock, Eye, EyeOff, Fingerprint, RefreshCw } from 'lucide-react';
import { Language } from '../../types';

export interface ViewPasswordCardProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  viewPassword: string;
  setViewPassword: (val: string) => void;
  showViewPwd: boolean;
  setShowViewPwd: (val: boolean) => void;
  disabledInputs: Record<string, boolean>;
  handlePasswordChange: (value: string, setter: (val: string) => void, id: string) => void;
  handlePasswordKeyDown: (e: React.KeyboardEvent, id: string) => void;
  viewData: any;
  performDecryption: (data: any, pwd?: string, isFile?: boolean) => void;
  isDecrypting: boolean;
  biometricsSupported: boolean;
  hasBiometricsForCurrent: boolean;
  handleBiometricUnlock: () => void;
  rememberWithBiometrics: boolean;
  setRememberWithBiometrics: (val: boolean) => void;
}

export const ViewPasswordCard: React.FC<ViewPasswordCardProps> = ({
  isDarkMode,
  language,
  t,
  viewPassword,
  setViewPassword,
  showViewPwd,
  setShowViewPwd,
  disabledInputs,
  handlePasswordChange,
  handlePasswordKeyDown,
  viewData,
  performDecryption,
  isDecrypting,
  biometricsSupported,
  hasBiometricsForCurrent,
  handleBiometricUnlock,
  rememberWithBiometrics,
  setRememberWithBiometrics,
}) => {
  return (
    <div className={`p-6 sm:p-8 rounded-[32px] border ${isDarkMode ? 'bg-zinc-950/40 border-white/10' : 'bg-white border-zinc-200'} space-y-6`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h3 className={`text-sm font-bold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>{t.passwordProtectedSecret}</h3>
          <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>{t.enterPasswordToDecrypt}</p>
        </div>
      </div>

      {biometricsSupported && hasBiometricsForCurrent && (
        <button
          type="button"
          onClick={handleBiometricUnlock}
          className="w-full py-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          <Fingerprint className="w-4 h-4" />
          {t.unlockWithBiometrics}
        </button>
      )}

      <div className="space-y-4">
        <div className="relative">
          <input
            type={showViewPwd ? 'text' : 'password'}
            value={viewPassword}
            disabled={disabledInputs['viewPwd']}
            onChange={(e) => handlePasswordChange(e.target.value, setViewPassword, 'viewPwd')}
            onKeyDown={(e) => {
              handlePasswordKeyDown(e, 'viewPwd');
              if (e.key === 'Enter') {
                e.preventDefault();
                performDecryption(viewData, viewPassword);
              }
            }}
            placeholder={t.enterSecretPassword}
            className={`w-full px-4 py-3.5 rounded-2xl border ${
              isDarkMode ? 'bg-zinc-950/60 border-white/10 text-zinc-100 placeholder-zinc-700' : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400'
            } outline-none text-xs font-mono`}
          />
          <button
            type="button"
            onClick={() => setShowViewPwd(!showViewPwd)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            {showViewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {biometricsSupported && !hasBiometricsForCurrent && (
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={rememberWithBiometrics}
              onChange={(e) => setRememberWithBiometrics(e.target.checked)}
              className="rounded border-zinc-700 text-indigo-500 focus:ring-indigo-500 bg-zinc-900"
            />
            <span className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>{t.rememberWithBiometrics}</span>
          </label>
        )}

        <button
          type="button"
          onClick={() => performDecryption(viewData, viewPassword)}
          disabled={isDecrypting || !viewPassword}
          className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
        >
          {isDecrypting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {t.decryptPayload}
        </button>
      </div>
    </div>
  );
};
