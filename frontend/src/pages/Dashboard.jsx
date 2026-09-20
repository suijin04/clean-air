import React from 'react';
import CitySelector from '../components/CitySelector';
import AQICard from '../components/AQICard';
import PollutantCard from '../components/PollutantCard';
import DataSourceBadge from '../components/DataSourceBadge';
import StationMap from '../components/StationMap';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import { MapPin, ArrowRight } from 'lucide-react';

const CRITERIA_POLLUTANTS = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3'];

export default function Dashboard({
  cityData,
  selectedCity,
  setSelectedCity,
  stations,
  loading,
  error,
  onRetry,
  onOpenCityDetail,
  onAskAI
}) {
  if (loading && !cityData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          Fetching latest air-quality data...
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error && !cityData) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  return (
    <div className="space-y-8">
      {/* Top Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Selected City
          </div>
          <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>{cityData?.city || selectedCity}, {cityData?.country || 'Region'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CitySelector
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
          />
          {onOpenCityDetail && (
            <button
              onClick={() => onOpenCityDetail(selectedCity)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
              title="View full analytics for this city"
            >
              <span>Full Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main AQI Card */}
      <AQICard
        data={cityData}
        onAskAI={() => onAskAI(`What is the current air quality in ${selectedCity}?`)}
      />

      {/* Criteria Pollutant Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Criteria Pollutants
            </h2>
            <p className="text-xs text-slate-500">
              Atmospheric concentrations verified against US EPA standards
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            6 Monitored Parameters
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CRITERIA_POLLUTANTS.map((key) => {
            const measurement = cityData?.pollutants?.[key];
            return (
              <PollutantCard
                key={key}
                pollutantKey={key}
                measurement={measurement}
              />
            );
          })}
        </div>
      </section>

      {/* Monitoring Station Map & Data Source Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Monitoring Stations
              </h3>
              <p className="text-xs text-slate-500">
                Official ground-level sensor coordinates from OpenAQ
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              {stations.length} Active Stations
            </span>
          </div>

          <StationMap
            stations={stations}
            center={
              cityData?.coordinates
                ? [cityData.coordinates.latitude, cityData.coordinates.longitude]
                : [20.5937, 78.9629]
            }
            zoom={cityData?.coordinates ? 10 : 4}
            height="320px"
          />
        </div>

        <div className="space-y-4">
          <DataSourceBadge
            source={cityData?.source || "OpenAQ"}
            lastUpdated={cityData?.last_updated}
            isDemo={cityData?.is_demo}
            aqiStandard={cityData?.aqi_standard}
          />

          <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl p-5 text-white shadow-sm space-y-3">
            <div className="text-xs font-semibold tracking-wider text-emerald-300 uppercase">
              CleanAir AI Assistant
            </div>
            <h4 className="text-sm font-bold leading-snug">
              Need advice on outdoor activity in {selectedCity}?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ask our environmental assistant to analyze today's dominant pollutants and get evidence-based health guidance.
            </p>
            <button
              type="button"
              onClick={() => onAskAI(`Explain today's air quality in ${selectedCity} in simple terms.`)}
              className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-xs"
            >
              Analyze with AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
