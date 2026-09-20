import React, { useState } from 'react';
import { Search, MapPin, ArrowRight, Wind } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { formatTimestamp } from '../utils/formatters';

export default function Cities({ citiesList, onSelectCity, onOpenCityDetail }) {
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('ALL');

  const filtered = (citiesList || []).filter((c) => {
    const matchesSearch =
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase());

    if (filterRegion === 'INDIA') return matchesSearch && c.country === 'India';
    if (filterRegion === 'INTL') return matchesSearch && c.country !== 'India';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Major Global Cities
          </h2>
          <p className="text-xs text-slate-500">
            Real-time environmental monitoring across key metropolitan regions
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterRegion('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${filterRegion === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRegion('INDIA')}
              className={`px-3 py-1 rounded-lg transition-all ${filterRegion === 'INDIA' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              India
            </button>
            <button
              onClick={() => setFilterRegion('INTL')}
              className={`px-3 py-1 rounded-lg transition-all ${filterRegion === 'INTL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              International
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city or country..."
              className="pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 w-full sm:w-64 text-slate-800 placeholder-slate-400 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Grid of Cities */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Wind className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">No cities matched your search.</p>
          <p className="text-xs text-slate-400">Try searching for Delhi, Paris, Tokyo, or New York.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const hasAQI = item.aqi !== null && item.aqi !== undefined;
            return (
              <div
                key={item.city}
                onClick={() => {
                  onSelectCity(item.city);
                  if (onOpenCityDetail) onOpenCityDetail(item.city);
                }}
                className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.city}</span>
                      </div>
                      <div className="text-xs text-slate-400 font-medium pl-5">
                        {item.country}
                      </div>
                    </div>

                    <StatusBadge status={item.aqi_status} aqi={item.aqi} />
                  </div>

                  <div className="my-4 flex items-baseline justify-between border-t border-b border-slate-100 py-3">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                        Air Quality Index
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-3xl font-extrabold text-slate-900">
                          {hasAQI ? item.aqi : "—"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">AQI</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                        PM2.5 Level
                      </div>
                      <div className="text-sm font-bold text-slate-700 mt-1">
                        {item.pm25 !== null && item.pm25 !== undefined ? `${item.pm25} µg/m³` : "Unavailable"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Updated: {formatTimestamp(item.last_updated)}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Explore
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
