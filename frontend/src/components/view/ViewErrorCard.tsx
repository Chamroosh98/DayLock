import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Language } from '../../types';

export interface ViewErrorCardProps {
  isDarkMode: boolean;
  language: Language;
  t: any;
  viewError: any;
}

export const ViewErrorCard: React.FC<ViewErrorCardProps> = ({
  isDarkMode,
  language,
  t,
  viewError,
}) => {
  if (!viewError) return null;

  return (
    <div className={`p-6 sm:p-8 rounded-[32px] border ${isDarkMode ? 'bg-red-950/20 border-red-500/30' : 'bg-red-50 border-red-200'} space-y-4`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-red-500">
            {typeof viewError === 'string' ? viewError : viewError.message || t.errorAccessingSecret}
          </h3>
          {viewError.details && (
            <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'} mt-1`}>
              {viewError.details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
