const API_BASE_URL = '/api';

export async function fetchHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error('Health check failed');
  return response.json();
}

export async function fetchCities() {
  const response = await fetch(`${API_BASE_URL}/cities`);
  if (!response.ok) throw new Error('Failed to fetch cities');
  return response.json();
}

export async function fetchAirQuality(city) {
  const response = await fetch(`${API_BASE_URL}/air-quality/${encodeURIComponent(city)}`);
  if (!response.ok) throw new Error(`Failed to fetch air quality for ${city}`);
  return response.json();
}

export async function fetchAirQualityLatest(city) {
  const response = await fetch(`${API_BASE_URL}/air-quality/${encodeURIComponent(city)}/latest`);
  if (!response.ok) throw new Error(`Failed to fetch latest air quality for ${city}`);
  return response.json();
}

export async function fetchTrends(city, pollutant = 'PM2.5', timeRange = '24 hours') {
  const params = new URLSearchParams({ pollutant, time_range: timeRange });
  const response = await fetch(`${API_BASE_URL}/trends/${encodeURIComponent(city)}?${params}`);
  if (!response.ok) throw new Error(`Failed to fetch trends for ${city}`);
  return response.json();
}

export async function fetchStations() {
  const response = await fetch(`${API_BASE_URL}/stations`);
  if (!response.ok) throw new Error('Failed to fetch stations');
  return response.json();
}

export async function sendChatMessage(message, city = null, currentData = null) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      city,
      current_data: currentData,
    }),
  });
  if (!response.ok) throw new Error('Failed to send message to AI Assistant');
  return response.json();
}
