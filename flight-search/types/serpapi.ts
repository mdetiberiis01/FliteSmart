export interface SerpApiPriceHistoryPoint {
  date: string; // timestamp or date string
  price: number;
}

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
