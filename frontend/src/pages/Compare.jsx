import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Plus,
  X,
  MapPin,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import StatusBadge from '../components/StatusBadge';
import { MAJOR_CITIES } from '../data/majorCities';
import { fetchAirQuality } from '../services/api';
import { formatTimestamp } from '../utils/formatters';

const DEFAULT_CITIES = ['Delhi', 'Mumbai', 'London', 'New York'];

export default function Compare() {
  const [selectedCities, setSelectedCities] = useState(DEFAULT_CITIES);
  const [compareData, setCompareData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cityToAdd, setCityToAdd] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const promises = selectedCities.map((city) => fetchAirQuality(city));
        const results = await Promise.all(promises);
        if (isMounted) {
          setCompareData(results);
        }
      } catch (err) {
        console.error("Error loading comparison data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (selectedCities.length > 0) {
      loadData();
    } else {
      setCompareData([]);
    }

    return () => { isMounted = false; };
  }, [selectedCities]);

  const handleAddCity = (e) => {
    e.preventDefault();
    if (!cityToAdd) return;
    if (selectedCities.length >= 5) {
      alert("You can compare up to 5 cities simultaneously.");
      return;
    }
    if (!selectedCities.includes(cityToAdd)) {
      setSelectedCities([...selectedCities, cityToAdd]);
      setCityToAdd('');
    }
  };

  const handleRemoveCity = (city) => {
    setSelectedCities(selectedCities.filter(c => c !== city));
  };

  // Prepare chart dataset (only including cities with available data)
  const chartData = compareData.map((d) => ({
    city: d.city,
    AQI: d.aqi !== null && d.aqi !== undefined ? d.aqi : null,
    "PM2.5 (µg/m³)": d.pollutants?.pm25?.value ?? null,
    "PM10 (µg/m³)": d.pollutants?.pm10?.value ?? null,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-emerald-600" />
            <span>Cross-City Comparison</span>
          </h2>
          <p className="text-xs text-slate-500">
            Side-by-side analysis of air quality and critical particulates (up to 5 cities)
          </p>
        </div>

        {/* Add City Control */}
        <form onSubmit={handleAddCity} className="flex items-center gap-2">
          <select
            value={cityToAdd}
            onChange={(e) => setCityToAdd(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-emerald-500 shadow-xs"
          >
            <option value="">+ Add a city to compare...</option>
            {MAJOR_CITIES.filter(c => !selectedCities.includes(c.name)).map(c => (
              <option key={c.name} value={c.name}>{c.name} ({c.country})</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!cityToAdd || selectedCities.length >= 5}
            className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 shadow-xs transition-colors"
          >
            Add
          </button>
        </form>
      </div>

      {/* Selected City Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold mr-1">Active Cities ({selectedCities.length}/5):</span>
        {selectedCities.map((city) => (
          <span
            key={city}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            {city}
            <button
              onClick={() => handleRemoveCity(city)}
              className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 ml-1"
              title="Remove city"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Comparison Visual Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Comparative Metrics Chart
            </h3>
            <p className="text-xs text-slate-500">
              Direct visual comparison of AQI, PM2.5, and PM10 concentrations
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            US EPA AQI Standard
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Synchronizing city comparison data...
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="city" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(val, name) => [val !== null ? val : 'N/A', name]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="AQI" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="PM2.5 (µg/m³)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="PM10 (µg/m³)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No cities selected for comparison.
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Tabular Comparison Matrix
          </h3>
          <span className="text-[11px] text-slate-400">
            * Missing parameters marked as N/A
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4">City</th>
                <th className="p-4">Status</th>
                <th className="p-4">AQI</th>
                <th className="p-4">PM2.5 (µg/m³)</th>
                <th className="p-4">PM10 (µg/m³)</th>
                <th className="p-4">NO₂ (µg/m³)</th>
                <th className="p-4">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {compareData.map((row) => (
                <tr key={row.city} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{row.city}</span>
                      <span className="text-slate-400 font-normal">({row.country})</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={row.aqi_status} aqi={row.aqi} />
                  </td>
                  <td className="p-4 font-extrabold text-sm text-slate-900">
                    {row.aqi !== null && row.aqi !== undefined ? row.aqi : <span className="text-slate-400 font-normal">N/A</span>}
                  </td>
                  <td className="p-4 font-medium text-slate-700">
                    {row.pollutants?.pm25?.value !== undefined && row.pollutants?.pm25?.value !== null
                      ? row.pollutants.pm25.value
                      : <span className="text-slate-400">N/A</span>}
                  </td>
                  <td className="p-4 font-medium text-slate-700">
                    {row.pollutants?.pm10?.value !== undefined && row.pollutants?.pm10?.value !== null
                      ? row.pollutants.pm10.value
                      : <span className="text-slate-400">N/A</span>}
                  </td>
                  <td className="p-4 font-medium text-slate-700">
                    {row.pollutants?.no2?.value !== undefined && row.pollutants?.no2?.value !== null
                      ? row.pollutants.no2.value
                      : <span className="text-slate-400">N/A</span>}
                  </td>
                  <td className="p-4 text-slate-500">
                    {formatTimestamp(row.last_updated)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
