import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

export default function StationMap({ stations = [], center = [20.5937, 78.9629], zoom = 4, height = "450px" }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance before re-initializing
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      // Create map
      const map = L.map(mapContainerRef.current).setView(center, zoom);
      mapInstanceRef.current = map;

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-station-pin',
        html: `<div style="background-color: #059669; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                 <div style="background-color: white; width: 6px; height: 6px; border-radius: 50%;"></div>
               </div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -11]
      });

      // Filter stations with valid coordinates
      const validStations = stations.filter(
        s => s && s.coordinates && typeof s.coordinates.latitude === 'number' && typeof s.coordinates.longitude === 'number'
      );

      validStations.forEach(station => {
        const pollutantsList = station.available_pollutants && station.available_pollutants.length > 0
          ? station.available_pollutants.join(', ')
          : 'Standard criteria parameters';

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 180px; font-size: 12px; color: #1e293b;">
            <div style="font-weight: 700; font-size: 13px; color: #047857; margin-bottom: 2px;">
              ${station.name || 'Monitoring Station'}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
              ${station.city}, ${station.country}
            </div>
            <div style="margin-bottom: 4px;">
              <strong>Latest:</strong> <span style="color: #0f172a;">${station.latest_measurement || 'Active'}</span>
            </div>
            <div style="margin-bottom: 4px;">
              <strong>Pollutants:</strong> <span style="font-family: monospace; font-size: 11px;">${pollutantsList}</span>
            </div>
            <div style="font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 4px; margin-top: 4px;">
              Source: ${station.source || 'OpenAQ'}
            </div>
          </div>
        `;

        L.marker([station.coordinates.latitude, station.coordinates.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);
      });

      // If stations provided and valid, fit bounds
      if (validStations.length > 1) {
        const bounds = L.latLngBounds(validStations.map(s => [s.coordinates.latitude, s.coordinates.longitude]));
        map.fitBounds(bounds, { padding: [30, 30] });
      } else if (validStations.length === 1) {
        map.setView([validStations[0].coordinates.latitude, validStations[0].coordinates.longitude], 11);
      }

    } catch (err) {
      console.error("Error initializing Leaflet map:", err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [stations, center, zoom]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-100" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      {stations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-xs text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            Loading station coordinates...
          </div>
        </div>
      )}
    </div>
  );
}
