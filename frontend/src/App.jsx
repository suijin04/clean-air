import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Cities from './pages/Cities';
import CityDetails from './pages/CityDetails';
import Compare from './pages/Compare';
import Trends from './pages/Trends';
import AIAssistant from './pages/AIAssistant';
import About from './pages/About';
import { fetchAirQuality, fetchCities, fetchStations } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [detailedCity, setDetailedCity] = useState(null);
  const [cityData, setCityData] = useState(null);
  const [citiesList, setCitiesList] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);

  // Load active city data
  const loadActiveCityData = useCallback(async (cityName) => {
    try {
      const data = await fetchAirQuality(cityName);
      setCityData(data);
      setError(null);
    } catch (err) {
      console.error(`Failed to load air quality for ${cityName}:`, err);
      setError(`Live air-quality data is currently unavailable for ${cityName}.`);
    }
  }, []);

  // Full refresh of all environmental feeds
  const refreshAllData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const [citiesRes, stationsRes] = await Promise.all([
        fetchCities().catch(() => []),
        fetchStations().catch(() => [])
      ]);
      setCitiesList(citiesRes);
      setStations(stationsRes);
      await loadActiveCityData(selectedCity);
      setLastRefreshTime(new Date());
    } catch (err) {
      console.error("Data refresh failed:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCity, loadActiveCityData]);

  // Initial load
  useEffect(() => {
    refreshAllData();
  }, []);

  // When selectedCity changes, reload city data
  useEffect(() => {
    if (selectedCity) {
      loadActiveCityData(selectedCity);
    }
  }, [selectedCity, loadActiveCityData]);

  // Auto-refresh interval every 5 minutes (300,000 ms)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAllData(true);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  // Handler to navigate to City Details
  const handleOpenCityDetail = (cityName) => {
    setSelectedCity(cityName);
    setActiveTab('city_details');
  };

  // Handler to navigate to AI Assistant with context
  const handleAskAI = (prompt) => {
    setActiveTab('assistant');
  };

  return (
    <MainLayout
      activeTab={activeTab === 'city_details' ? 'cities' : activeTab}
      setActiveTab={(tab) => {
        setActiveTab(tab);
      }}
      lastRefreshTime={lastRefreshTime}
      isRefreshing={isRefreshing}
      onManualRefresh={() => refreshAllData(false)}
    >
      {activeTab === 'dashboard' && (
        <Dashboard
          cityData={cityData}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          stations={stations}
          loading={loading}
          error={error}
          onRetry={() => refreshAllData(false)}
          onOpenCityDetail={handleOpenCityDetail}
          onAskAI={handleAskAI}
        />
      )}

      {activeTab === 'cities' && (
        <Cities
          citiesList={citiesList}
          onSelectCity={(city) => {
            setSelectedCity(city);
          }}
          onOpenCityDetail={handleOpenCityDetail}
        />
      )}

      {activeTab === 'city_details' && (
        <CityDetails
          cityData={cityData}
          onBack={() => setActiveTab('cities')}
          onAskAI={handleAskAI}
        />
      )}

      {activeTab === 'compare' && (
        <Compare />
      )}

      {activeTab === 'trends' && (
        <Trends initialCity={selectedCity} />
      )}

      {activeTab === 'assistant' && (
        <AIAssistant
          activeCity={selectedCity}
          cityData={cityData}
        />
      )}

      {activeTab === 'about' && (
        <About />
      )}
    </MainLayout>
  );
}
