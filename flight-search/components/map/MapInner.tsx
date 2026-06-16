'use client';

import { useEffect, useRef } from 'react';
import { SearchResult } from '@/types/search';
import { getAirportCoords } from '@/lib/geo/airport-lookup';

interface Props {
  results: SearchResult[];
  origin: string;
}

const DEAL_COLORS: Record<string, string> = {
  great: '#34d399',
  good:  '#a3a3a3',
  fair:  '#d97706',
  high:  '#dc2626',
};

function dealColor(rating: string | null | undefined): string {
  return DEAL_COLORS[rating ?? ''] ?? '#6b7280';
}

const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

// Returns pixel size and font size for a given zoom level
function markerDimensions(zoom: number): { size: number; fontSize: number; showPrice: boolean } {
  const rawSize = Math.round(Math.max(16, Math.min(68, zoom * 5.5 - 4)));
  const showPrice = rawSize >= 17;
  const fontSize = Math.round(Math.max(11, Math.min(16, zoom * 1.6 - 2)));
  // When showing price, enforce a minimum diameter so the text fits inside the circle
  const size = showPrice ? Math.max(rawSize, Math.round(fontSize * 3)) : rawSize;
  return { size, fontSize, showPrice };
}

type LeafletType = typeof import('leaflet');

function makeIcon(L: LeafletType, color: string, priceLabel: string, zoom: number) {
  const { size, fontSize, showPrice } = markerDimensions(zoom);
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};
      border:2px solid rgba(255,255,255,0.9);
      display:flex;align-items:center;justify-content:center;
      font-size:${fontSize}px;font-weight:800;color:#000;
      box-shadow:0 2px 8px rgba(0,0,0,0.45);
      cursor:pointer;text-align:center;line-height:1;
    ">${showPrice ? priceLabel : ''}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function MapInner({ results, origin }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

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

      L.tileLayer(TILE_LIGHT, {
        attribution: '©OpenStreetMap ©CartoDB',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Deduplicate by city — one marker per city, cheapest price
      const cheapestByCity = new Map<string, typeof results[number]>();
      for (const result of results) {
        const cityKey = (result.destinationCity || result.destination).toLowerCase();
        const existing = cheapestByCity.get(cityKey);
        if (!existing || result.price < existing.price) {
          cheapestByCity.set(cityKey, result);
        }
      }

      // Build marker data — store marker refs so we can resize on zoom
      type MarkerEntry = { marker: ReturnType<LeafletType['marker']>; color: string; priceLabel: string };
      const markerEntries: MarkerEntry[] = [];
      const destPoints: [number, number][] = [];

      for (const result of cheapestByCity.values()) {
        const destCoords = getAirportCoords(result.destination);
        if (!destCoords) continue;

        destPoints.push(destCoords);

        const color = dealColor(result.dealRating);
        const priceLabel = result.price >= 1000
          ? '$' + (result.price / 1000).toFixed(result.price % 1000 === 0 ? 0 : 1) + 'k'
          : '$' + result.price;

        const depDate = result.departureDate
          ? new Date(result.departureDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '';
        const retDate = result.returnDate
          ? new Date(result.returnDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '';
        const dealLabel = result.dealRating
          ? `<span style="background:${color};color:#000;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;">${result.dealRating} deal</span>`
          : '';

        const marker = L.marker(destCoords, { icon: makeIcon(L, color, priceLabel, 2) })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:system-ui,sans-serif;min-width:160px;">
              <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${result.destinationCity ?? result.destination}</div>
              <div style="font-size:12px;color:#888;margin-bottom:6px;">${result.destinationCountry ?? ''}</div>
              <div style="font-size:20px;font-weight:800;color:${color};margin-bottom:4px;">$${result.price}</div>
              ${dealLabel ? `<div style="margin-bottom:6px;">${dealLabel}</div>` : ''}
              <div style="font-size:11px;color:#666;">${result.airline}</div>
              ${depDate ? `<div style="font-size:11px;color:#888;margin-top:2px;">${depDate}${retDate ? ' → ' + retDate : ''}</div>` : ''}
              ${result.stops === 0 ? '<div style="font-size:10px;color:#34d399;margin-top:2px;">Nonstop</div>' : `<div style="font-size:10px;color:#888;margin-top:2px;">${result.stops} stop${result.stops !== 1 ? 's' : ''}</div>`}
            </div>
          `, { maxWidth: 220 });

        markerEntries.push({ marker, color, priceLabel });
      }

      // Resize all markers when zoom changes
      function updateMarkerSizes() {
        const zoom = map.getZoom();
        for (const { marker, color, priceLabel } of markerEntries) {
          marker.setIcon(makeIcon(L, color, priceLabel, zoom));
        }
      }

      map.on('zoomend', updateMarkerSizes);

      // Origin marker (fixed small dot)
      const originCoords = getAirportCoords(origin);
      if (originCoords) {
        const originIcon = L.divIcon({
          className: '',
          html: `<div style="
            width:14px;height:14px;border-radius:50%;
            background:#fff;
            box-shadow:0 0 0 3px rgba(0,0,0,0.2),0 2px 8px rgba(0,0,0,0.5);
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker(originCoords, { icon: originIcon })
          .addTo(map)
          .bindPopup(`<div style="font-family:system-ui,sans-serif;font-weight:700;">${origin} — Origin</div>`);
      }

      // Fit bounds, then set initial marker sizes based on resulting zoom
      if (destPoints.length > 1) {
        map.fitBounds(L.latLngBounds(destPoints), { padding: [50, 50], animate: false });
      } else if (destPoints.length === 1) {
        map.setView(destPoints[0], 6, { animate: false });
      }
      updateMarkerSizes();

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
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
      <div ref={mapRef} className="h-72 w-full" />
      <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-200 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span style={{ background: '#34d399', borderRadius: '50%', display: 'inline-block', width: 8, height: 8 }} /> Great deal</span>
        <span className="flex items-center gap-1.5"><span style={{ background: '#a3a3a3', borderRadius: '50%', display: 'inline-block', width: 8, height: 8 }} /> Good</span>
        <span className="flex items-center gap-1.5"><span style={{ background: '#d97706', borderRadius: '50%', display: 'inline-block', width: 8, height: 8 }} /> Fair</span>
        <span className="flex items-center gap-1.5"><span style={{ background: '#dc2626', borderRadius: '50%', display: 'inline-block', width: 8, height: 8 }} /> High</span>
      </div>
    </div>
  );
}
