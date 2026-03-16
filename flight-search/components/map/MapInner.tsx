'use client';

import { useEffect, useRef } from 'react';
import { SearchResult } from '@/types/search';
import { getAirportCoords } from '@/lib/geo/airport-lookup';

interface Props {
  results: SearchResult[];
  origin: string;
}

const DEAL_COLORS: Record<string, string> = {
  great: '#10b981',
  good:  '#14b8a6',
  fair:  '#f59e0b',
  high:  '#ef4444',
};

function dealColor(rating: string | null | undefined): string {
  return DEAL_COLORS[rating ?? ''] ?? '#6b7280';
}


export default function MapInner({ results, origin }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Fix default marker icons
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([20, 0], 2);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap ©CartoDB',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      const originCoords = getAirportCoords(origin);
      const destPoints: [number, number][] = [];

      // Draw destination markers
      for (const result of results) {
        const destCoords = getAirportCoords(result.destination);
        if (!destCoords) continue;

        destPoints.push(destCoords);

        // Destination marker
        const color = dealColor(result.dealRating);
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:28px;height:28px;border-radius:50%;
            background:${color};
            border:2px solid rgba(255,255,255,0.8);
            display:flex;align-items:center;justify-content:center;
            font-size:9px;font-weight:700;color:#000;
            box-shadow:0 2px 8px rgba(0,0,0,0.5);
            cursor:pointer;
          ">$${result.price >= 1000 ? Math.round(result.price / 1000) + 'k' : result.price}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const depDate = result.departureDate
          ? new Date(result.departureDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '';
        const retDate = result.returnDate
          ? new Date(result.returnDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '';

        const dealLabel = result.dealRating
          ? `<span style="background:${color};color:#000;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;">${result.dealRating} deal</span>`
          : '';

        L.marker(destCoords, { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:system-ui,sans-serif;min-width:160px;">
              <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${result.destinationCity ?? result.destination}</div>
              <div style="font-size:12px;color:#aaa;margin-bottom:6px;">${result.destinationCountry ?? ''}</div>
              <div style="font-size:20px;font-weight:800;color:${color};margin-bottom:4px;">$${result.price}</div>
              ${dealLabel ? `<div style="margin-bottom:6px;">${dealLabel}</div>` : ''}
              <div style="font-size:11px;color:#ccc;">${result.airline}</div>
              ${depDate ? `<div style="font-size:11px;color:#999;margin-top:2px;">${depDate}${retDate ? ' → ' + retDate : ''}</div>` : ''}
              ${result.stops === 0 ? '<div style="font-size:10px;color:#10b981;margin-top:2px;">Nonstop</div>' : `<div style="font-size:10px;color:#aaa;margin-top:2px;">${result.stops} stop${result.stops !== 1 ? 's' : ''}</div>`}
            </div>
          `, { maxWidth: 220 });
      }

      // Origin marker
      if (originCoords) {
        const originIcon = L.divIcon({
          className: '',
          html: `<div style="
            width:14px;height:14px;border-radius:50%;
            background:#fff;
            border:3px solid #14b8a6;
            box-shadow:0 0 0 3px rgba(20,184,166,0.3),0 2px 8px rgba(0,0,0,0.5);
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker(originCoords, { icon: originIcon })
          .addTo(map)
          .bindPopup(`<div style="font-family:system-ui,sans-serif;font-weight:700;">${origin} — Origin</div>`);
      }

      // Fit map to destination points only (not origin)
      if (destPoints.length > 1) {
        map.fitBounds(L.latLngBounds(destPoints), { padding: [50, 50] });
      } else if (destPoints.length === 1) {
        map.setView(destPoints[0], 6);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: '#1a1a2e' }}>
      <div ref={mapRef} className="h-72 w-full" />
      <div className="flex items-center gap-4 px-4 py-2 border-t border-white/10 text-xs text-white/40">
        <span className="flex items-center gap-1.5"><span style={{ background: '#10b981', borderRadius: '50%', display: 'inline-block', width: 8, height: 8 }} /> Great deal</span>
        <span className="flex items-center gap-1.5"><span style={{ background: '#14b8a6', borderRadius: '50%', display: 'inline-block', width: 8, height: 8 }} /> Good</span>
        <span className="flex items-center gap-1.5"><span style={{ background: '#f59e0b', borderRadius: '50%', display: 'inline-block', width: 8, height: 8 }} /> Fair</span>
        <span className="flex items-center gap-1.5"><span style={{ background: '#ef4444', borderRadius: '50%', display: 'inline-block', width: 8, height: 8 }} /> High</span>
      </div>
    </div>
  );
}
