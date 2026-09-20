import React from 'react';
import { ShieldCheck, Wind, AlertCircle, Clock } from 'lucide-react';
import { getAQILevel } from '../utils/aqiColors';
import { formatTimestamp } from '../utils/formatters';
import StatusBadge from './StatusBadge';

export default function AQICard({ data, onAskAI }) {
  if (!data) return null;

  const aqi = data.aqi;
  const status = data.aqi_status || "Unavailable";
  const level = getAQILevel(status);
  const isAvailable = aqi !== null && aqi !== undefined;

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${level.border} ${level.bg} p-6 lg:p-8 shadow-sm transition-all`}>
      {/* Decorative subtle ambient circle */}
      <div
        className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full opacity-10 blur-2xl pointer-events-none"
        style={{ backgroundColor: level.hex }}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left column: City & Large AQI Number */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Current Air Quality Index
            </span>
            {data.dominant_pollutant && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-white/80 text-slate-600 font-medium border border-slate-200">
                Primary: {data.dominant_pollutant}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-4">
            {isAvailable ? (
              <div className="flex items-baseline gap-2">
                <span className="text-6xl sm:text-7xl font-extrabold tracking-tight text-slate-900">
                  {aqi}
                </span>
                <span className="text-sm font-medium text-slate-500">AQI</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-3xl font-bold text-slate-700">AQI Unavailable</div>
                <p className="text-xs text-slate-500">
                  Insufficient pollutant readings to calculate official AQI.
                </p>
              </div>
            )}

            <div className="pt-2">
              <StatusBadge status={status} size="large" />
            </div>
          </div>

          <p className="text-sm text-slate-600 max-w-lg leading-relaxed">
            {level.healthAdvice}
          </p>
        </div>

        {/* Right column: Station & metadata summary */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 md:items-end justify-center bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 text-xs text-slate-600">
          <div className="flex items-center gap-2 text-slate-700">
            <Wind className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[220px]" title={data.station || "Regional Station"}>
              {data.station || "Standard Station"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Last updated: <strong className="text-slate-700 font-medium">{formatTimestamp(data.last_updated)}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Standard: <strong className="text-slate-700 font-medium">{data.aqi_standard || "US EPA AQI"}</strong></span>
          </div>

          {onAskAI && (
            <button
              onClick={onAskAI}
              className="mt-1 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-colors"
            >
              Ask CleanAir AI about this
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
