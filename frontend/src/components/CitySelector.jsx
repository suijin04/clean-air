import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, ChevronDown, Check } from 'lucide-react';
import { MAJOR_CITIES } from '../data/majorCities';

export default function CitySelector({ selectedCity, onSelectCity }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = MAJOR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indiaCities = filteredCities.filter(c => c.region === 'India');
  const intlCities = filteredCities.filter(c => c.region === 'International');

  return (
    <div className="relative w-full max-w-sm" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-left"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 truncate">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-800 truncate">
            {selectedCity ? `${selectedCity}` : "Select a city..."}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden max-h-80 flex flex-col">
          {/* Search box inside dropdown */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city or country..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-800 placeholder-slate-400"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto p-1.5 divide-y divide-slate-100">
            {filteredCities.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching cities found.
              </div>
            ) : (
              <>
                {indiaCities.length > 0 && (
                  <div className="py-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      India
                    </div>
                    {indiaCities.map((c) => {
                      const isSelected = selectedCity?.toLowerCase() === c.name.toLowerCase();
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            onSelectCity(c.name);
                            setIsOpen(false);
                            setSearchQuery('');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-800 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({c.country})</span>
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {intlCities.length > 0 && (
                  <div className="py-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      International
                    </div>
                    {intlCities.map((c) => {
                      const isSelected = selectedCity?.toLowerCase() === c.name.toLowerCase();
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            onSelectCity(c.name);
                            setIsOpen(false);
                            setSearchQuery('');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-800 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({c.country})</span>
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
