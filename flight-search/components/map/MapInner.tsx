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

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

function markerDimensions(zoom: number): { size: number; fontSize: number; showPrice: boolean } {
  const rawSize = Math.round(Math.max(16, Math.min(68, zoom * 5.5 - 4)));
  const showPrice = rawSize >= 17;
  const fontSize = Math.round(Math.max(11, Math.min(16, zoom * 1.6 - 2)));
  const size = showPrice ? Math.max(rawSize, Math.round(fontSize * 3)) : rawSize;
  return { size, fontSize, showPrice };
}

type LeafletType = typeof import('leaflet');
type LeafletMap = ReturnType<LeafletType['map']>;
type LeafletMarker = ReturnType<LeafletType['marker']>;
type MarkerEntry = { marker: LeafletMarker; color: string; priceLabel: string };

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

function renderMarkers(
  L: LeafletType,
  map: LeafletMap,
  results: SearchResult[],
  markersRef: React.MutableRefObject<MarkerEntry[]>
) {
  // Clear existing destination markers
  for (const { marker } of markersRef.current) marker.remove();
  markersRef.current = [];

  // Cheapest price per city
  const cheapestByCity = new Map<string, SearchResult>();
  for (const result of results) {
    const cityKey = (result.destinationCity || result.destination).toLowerCase();
    const existing = cheapestByCity.get(cityKey);
    if (!existing || result.price < existing.price) cheapestByCity.set(cityKey, result);
  }

  const destPoints: [number, number][] = [];
  const zoom = map.getZoom();

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

    const marker = L.marker(destCoords, { icon: makeIcon(L, color, priceLabel, zoom) })
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

    markersRef.current.push({ marker, color, priceLabel });
  }

  if (destPoints.length > 1) {
    map.fitBounds(L.latLngBounds(destPoints), { padding: [50, 50], animate: false });
  } else if (destPoints.length === 1) {
    map.setView(destPoints[0], 6, { animate: false });
  }
}

export default function MapInner({ results, origin }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<LeafletType | null>(null);
  const destMarkersRef = useRef<MarkerEntry[]>([]);
  // Always holds the latest results so the init effect can use them after async load
  const resultsRef = useRef(results);
  resultsRef.current = results;

  // Initialize map once
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

      // Origin marker (fixed, set once)
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

      // Resize destination markers on zoom
      map.on('zoomend', () => {
        const zoom = map.getZoom();
        for (const { marker, color, priceLabel } of destMarkersRef.current) {
          marker.setIcon(makeIcon(L, color, priceLabel, zoom));
        }
      });

      leafletRef.current = L;
      mapInstanceRef.current = map;

      // Render whatever results have already arrived (handles race where all
      // results stream in before Leaflet finishes loading)
      if (resultsRef.current.length > 0) {
        renderMarkers(L, map, resultsRef.current, destMarkersRef);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
        leafletRef.current = null;
        destMarkersRef.current = [];
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers whenever results change
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return; // map not ready yet — init effect handles this case via resultsRef
    renderMarkers(L, map, results, destMarkersRef);
  }, [results]);

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
