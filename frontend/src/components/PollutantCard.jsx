import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { getPollutantDetails, formatRelativeTime } from '../utils/formatters';

export default function PollutantCard({ pollutantKey, measurement }) {
  const details = getPollutantDetails(pollutantKey);
  const isAvailable = measurement && measurement.value !== null && measurement.value !== undefined;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-800 tracking-tight">
                {details.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {details.name}
            </p>
          </div>

          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
            {details.standardThreshold}
          </span>
        </div>

        <div className="my-4">
          {isAvailable ? (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {measurement.value}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {measurement.unit}
              </span>
            </div>
          ) : (
            <div className="py-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                No current measurement
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 mt-auto flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span>
            {isAvailable ? `Updated ${formatRelativeTime(measurement.timestamp)}` : "Unavailable"}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 truncate max-w-[110px]" title={details.description}>
          Criteria Gas
        </span>
      </div>
    </div>
  );
}
