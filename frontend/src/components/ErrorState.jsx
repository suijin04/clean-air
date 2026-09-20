import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = "Unable to retrieve air-quality data.", onRetry }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3 text-rose-600">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">
        Air Quality Data Unavailable
      </h3>
      <p className="text-xs text-slate-600 mb-4 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          Retry
        </button>
      )}
    </div>
  );
}
