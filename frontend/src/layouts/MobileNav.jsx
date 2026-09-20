import React, { useState } from 'react';
import {
  Menu,
  X,
  Wind,
  LayoutDashboard,
  Building2,
  GitCompare,
  TrendingUp,
  Sparkles,
  Info
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cities', label: 'Cities', icon: Building2 },
  { id: 'compare', label: 'Compare', icon: GitCompare },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
  { id: 'about', label: 'About & Ethics', icon: Info },
];

export default function MobileNav({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white">
          <Wind className="w-4 h-4" />
        </div>
        <div className="text-sm font-bold tracking-tight">
          CleanAir <span className="text-emerald-400">AI</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 top-[53px] bg-slate-900/95 backdrop-blur-md z-50 flex flex-col p-6 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
