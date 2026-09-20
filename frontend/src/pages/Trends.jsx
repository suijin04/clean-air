import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Activity,
  ArrowDown,
  ArrowUp,
  Clock,
  MapPin
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart
} from 'recharts';
import { MAJOR_CITIES } from '../data/majorCities';
import { fetchTrends } from '../services/api';
import { getPollutantDetails } from '../utils/formatters';

export default function Trends({ initialCity = "Delhi" }) {
  const [city, setCity] = useState(initialCity);
  const [pollutant, setPollutant] = useState("PM2.5");
  const [timeRange, setTimeRange] = useState("24 hours");
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchTrends(city, pollutant, timeRange);
        if (isMounted) {
          setTrendData(res);
        }
      } catch (err) {
        console.error("Failed to load trend data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [city, pollutant, timeRange]);

  const pollutantInfo = getPollutantDetails(pollutant);
  const hasData = trendData && trendData.data && trendData.data.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Air Quality Trends</span>
          </h2>
          <p className="text-xs text-slate-500">
            Historical particulate concentration curves and descriptive statistics
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* City Selector */}
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500 shadow-xs"
          >
            {MAJOR_CITIES.map((c) => (
              <option key={c.name} value={c.name}>{c.name} ({c.country})</option>
            ))}
          </select>

          {/* Pollutant Selector */}
          <select
            value={pollutant}
            onChange={(e) => setPollutant(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500 shadow-xs"
          >
            <option value="PM2.5">PM2.5 (Fine Particles)</option>
            <option value="PM10">PM10 (Inhalable Dust)</option>
            <option value="NO2">NO₂ (Nitrogen Dioxide)</option>
            <option value="SO2">SO₂ (Sulfur Dioxide)</option>
            <option value="CO">CO (Carbon Monoxide)</option>
            <option value="O3">O₃ (Ground Ozone)</option>
          </select>

          {/* Time Range Pills */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            {['24 hours', '7 days', '30 days'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg transition-all ${timeRange === range ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Average</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {hasData && trendData.average !== null ? `${trendData.average} ${trendData.unit}` : "N/A"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Mean {pollutant} over {timeRange}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Minimum</span>
            <ArrowDown className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {hasData && trendData.min_value !== null ? `${trendData.min_value} ${trendData.unit}` : "N/A"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Lowest recorded value</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Maximum</span>
            <ArrowUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {hasData && trendData.max_value !== null ? `${trendData.max_value} ${trendData.unit}` : "N/A"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Peak concentration</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Latest Reading</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {hasData && trendData.latest_value !== null ? `${trendData.latest_value} ${trendData.unit}` : "N/A"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Current telemetry sync</div>
        </div>
      </div>

      {/* Main Historical Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{city} — {pollutant} Timeseries</span>
              {trendData?.is_demo && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                  Demo Historical Telemetry
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Concentrations measured in {trendData?.unit || pollutantInfo.standardThreshold}
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {hasData ? `${trendData.data.length} telemetry points` : "0 points"}
          </span>
        </div>

        <div className="h-80 w-full pt-4">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Fetching historical measurements...
            </div>
          ) : hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPollutant" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(val) => [`${val} ${trendData.unit}`, pollutant]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPollutant)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              <Calendar className="w-8 h-8 mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">Historical data is currently unavailable.</p>
              <p className="text-slate-400 mt-0.5">No continuous sensor records are registered for this city and parameter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
