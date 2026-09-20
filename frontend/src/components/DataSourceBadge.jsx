import React from 'react';
import { Database, Clock, Info } from 'lucide-react';
import { formatTimestamp } from '../utils/formatters';

export default function DataSourceBadge({ source = "OpenAQ", lastUpdated, isDemo, aqiStandard = "US EPA AQI" }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-2.5">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Data Source
        </span>
        {isDemo ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Demo Data Mode
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Live OpenAQ Feed
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-medium text-slate-800">{source}</span>
          <span className="text-slate-400">— Global Open Air Quality Platform</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Last API update: <span className="font-medium text-slate-700">{formatTimestamp(lastUpdated)}</span></span>
        </div>

        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Standard: <span className="font-medium text-slate-700">{aqiStandard}</span></span>
        </div>
      </div>
    </div>
  );
}
