import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-32 bg-slate-200/80 rounded-2xl w-full" />

      {/* Pollutant cards grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-36 bg-slate-200/70 rounded-xl p-5" />
        ))}
      </div>

      {/* Info footer skeleton */}
      <div className="h-20 bg-slate-200/60 rounded-xl w-full" />
    </div>
  );
}
