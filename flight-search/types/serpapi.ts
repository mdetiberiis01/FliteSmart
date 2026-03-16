export interface SerpApiPriceInsights {
  lowest_price: number;
  price_history: Array<[number, number]>; // [timestamp_ms, price]
  typical_range_low?: number;
  typical_range_high?: number;
}

export interface SerpApiResponse {
  price_insights?: SerpApiPriceInsights;
  error?: string;
}

export interface SerpApiFlightLeg {
  departure_airport: { name: string; id: string; time: string };
  arrival_airport: { name: string; id: string; time: string };
  duration: number; // minutes
  airline: string;
  airline_logo: string;
  flight_number: string;
  travel_class: string;
}

export interface SerpApiFlightItinerary {
  flights: SerpApiFlightLeg[];
  layovers?: Array<{ duration: number; name: string; id: string }>;
  total_duration: number; // minutes
  price: number;
  type: string;
  airline_logo: string;
  departure_token?: string;
  booking_token?: string;
}

export interface SerpApiFlightsResponse {
  search_metadata?: { google_flights_url?: string };
  best_flights?: SerpApiFlightItinerary[];
  other_flights?: SerpApiFlightItinerary[];
  price_insights?: SerpApiPriceInsights;
  error?: string;
}

export interface SerpApiBookingResponse {
  booking_options?: Array<{
    book_with: string;
    price?: number;
    booking_request?: {
      url: string;
      method: string;
      payload?: Record<string, string>;
    };
  }>;
  error?: string;
}
