import React from 'react';
import {
  LayoutDashboard,
  Building2,
  GitCompare,
  TrendingUp,
  Sparkles,
  Info,
  Wind
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cities', label: 'Cities', icon: Building2 },
  { id: 'compare', label: 'Compare', icon: GitCompare },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
  { id: 'about', label: 'About & AI Ethics', icon: Info },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 min-h-screen p-5 shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
          <Wind className="w-6 h-6" />
        </div>
        <div>
          <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
            CleanAir <span className="text-emerald-400 text-xs px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 font-semibold">AI</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide">
            Air Quality Intelligence
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1.5 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.id === 'assistant' && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-mono">
                  Groq
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-6 border-t border-slate-800/80 px-2 space-y-2 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <span>Standard</span>
          <span className="font-semibold text-slate-400">US EPA AQI</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Data Provider</span>
          <span className="font-semibold text-slate-400">OpenAQ v3</span>
        </div>
        <div className="flex items-center gap-1.5 pt-2 text-[10px] text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Environmental Feed</span>
        </div>
      </div>
    </aside>
  );
}
