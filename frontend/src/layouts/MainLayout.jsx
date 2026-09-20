import React from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function MainLayout({
  children,
  activeTab,
  setActiveTab,
  lastRefreshTime,
  isRefreshing,
  onManualRefresh
}) {
  const formattedTime = lastRefreshTime
    ? lastRefreshTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Connecting...';

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-4 sticky top-0 md:relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              CleanAir AI
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              Real-Time Air Quality Intelligence
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last updated:</span>
              <span className="font-semibold text-slate-700">{formattedTime}</span>
            </div>

            <button
              type="button"
              onClick={onManualRefresh}
              disabled={isRefreshing}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-all ${
                isRefreshing ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              title="Click to refresh live air quality measurements"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
