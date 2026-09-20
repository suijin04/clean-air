import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  Wind,
  Clock,
  Radio,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import StatusBadge from '../components/StatusBadge';
import PollutantCard from '../components/PollutantCard';
import StationMap from '../components/StationMap';
import DataSourceBadge from '../components/DataSourceBadge';
import { formatTimestamp } from '../utils/formatters';
import { fetchTrends } from '../services/api';

const CRITERIA_KEYS = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3'];

export default function CityDetails({ cityData, onBack, onAskAI }) {
  const [selectedPollutant, setSelectedPollutant] = useState('PM2.5');
  const [timeRange, setTimeRange] = useState('24 hours');
  const [trendData, setTrendData] = useState(null);
  const [loadingTrend, setLoadingTrend] = useState(false);

  const cityName = cityData?.city || 'Selected City';
  const countryName = cityData?.country || 'Region';

  useEffect(() => {
    if (!cityData?.city) return;

    let isMounted = true;
    async function loadTrends() {
      setLoadingTrend(true);
      try {
        const res = await fetchTrends(cityData.city, selectedPollutant, timeRange);
        if (isMounted) {
          setTrendData(res);
        }
      } catch (err) {
        console.error("Failed to load trends:", err);
      } finally {
        if (isMounted) setLoadingTrend(false);
      }
    }

    loadTrends();
    return () => { isMounted = false; };
  }, [cityData?.city, selectedPollutant, timeRange]);

  if (!cityData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-sm">No city details available.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Create single station array for map
  const stationItem = cityData.station && cityData.coordinates ? [{
    id: 'current_station',
    name: cityData.station,
    city: cityData.city,
    country: cityData.country,
    coordinates: cityData.coordinates,
    available_pollutants: Object.keys(cityData.pollutants || {}).map(k => k.toUpperCase()),
    latest_measurement: `AQI ${cityData.aqi || 'N/A'}`,
    timestamp: cityData.last_updated,
    source: cityData.source
  }] : [];

  return (
    <div className="space-y-8">
      {/* Back button and breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          onClick={() => onAskAI(`What is the current air quality in ${cityName}? Explain the primary health risks and mitigation steps.`)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask CleanAir AI</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{countryName}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {cityName}
          </h1>
          <p className="text-xs text-slate-500">
            Verified ground station: <strong className="text-slate-700 font-medium">{cityData.station || 'Regional Station'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Air Quality Index
            </div>
            <div className="text-4xl font-extrabold text-slate-900 mt-0.5">
              {cityData.aqi !== null && cityData.aqi !== undefined ? cityData.aqi : "—"}
            </div>
          </div>
          <div className="border-l border-slate-200 pl-4 space-y-1.5">
            <StatusBadge status={cityData.aqi_status} aqi={cityData.aqi} size="large" />
            <div className="text-[11px] text-slate-400">
              Updated: {formatTimestamp(cityData.last_updated)}
            </div>
          </div>
        </div>
      </div>

      {/* Pollutant Cards */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
          Active Pollutant Measurements
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CRITERIA_KEYS.map((k) => (
            <PollutantCard
              key={k}
              pollutantKey={k}
              measurement={cityData.pollutants?.[k]}
            />
          ))}
        </div>
      </section>

      {/* Historical Trend Chart Section */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Air Quality Historical Trend
            </h3>
            <p className="text-xs text-slate-500">
              Measured concentration curve over selected timeline
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Pollutant selector */}
            <select
              value={selectedPollutant}
              onChange={(e) => setSelectedPollutant(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="PM2.5">PM2.5</option>
              <option value="PM10">PM10</option>
              <option value="NO2">NO₂</option>
              <option value="SO2">SO₂</option>
              <option value="CO">CO</option>
              <option value="O3">O₃</option>
            </select>

            {/* Time range selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              {['24 hours', '7 days', '30 days'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded-md transition-all ${timeRange === range ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 w-full">
          {loadingTrend ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Loading trend analytics...
            </div>
          ) : trendData && trendData.data && trendData.data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(val) => [`${val} ${trendData.unit}`, selectedPollutant]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              <Calendar className="w-6 h-6 mb-2 text-slate-300" />
              <span>Historical data is currently unavailable.</span>
            </div>
          )}
        </div>
      </section>

      {/* Monitoring Station & Coordinates Map */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monitoring Station Location
              </h3>
              <p className="text-xs text-slate-500">
                Geographic coordinates recorded by OpenAQ
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {cityData.coordinates ? `${cityData.coordinates.latitude.toFixed(4)}, ${cityData.coordinates.longitude.toFixed(4)}` : 'Coords N/A'}
            </span>
          </div>

          <StationMap
            stations={stationItem}
            center={cityData.coordinates ? [cityData.coordinates.latitude, cityData.coordinates.longitude] : [20.5937, 78.9629]}
            zoom={12}
            height="320px"
          />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs text-slate-600">
            <h4 className="font-bold text-slate-900 text-sm">Station Intelligence</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Radio className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">Station Name:</span>
                  <div className="text-slate-600">{cityData.station || 'Regional Monitor'}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">Latest Sync:</span>
                  <div className="text-slate-600">{formatTimestamp(cityData.last_updated)}</div>
                </div>
              </div>
            </div>
          </div>

          <DataSourceBadge
            source={cityData.source}
            lastUpdated={cityData.last_updated}
            isDemo={cityData.is_demo}
            aqiStandard={cityData.aqi_standard}
          />
        </div>
      </section>
    </div>
  );
}
