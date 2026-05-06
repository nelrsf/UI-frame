export interface MockWeatherMetric {
  city: string;
  condition: string;
  temperatureC: number;
  humidityPct: number;
}

export interface MockMarketTicker {
  symbol: string;
  price: number;
  changePct: number;
}

export const MOCK_WEATHER_METRICS: MockWeatherMetric[] = [
  { city: 'Madrid', condition: 'Sunny', temperatureC: 27, humidityPct: 34 },
  { city: 'Bogota', condition: 'Cloudy', temperatureC: 18, humidityPct: 66 },
  { city: 'Buenos Aires', condition: 'Rain', temperatureC: 15, humidityPct: 81 },
];

export const MOCK_MARKET_TICKERS: MockMarketTicker[] = [
  { symbol: 'UIF', price: 124.1, changePct: 1.9 },
  { symbol: 'SHEL', price: 88.45, changePct: -0.7 },
  { symbol: 'MOCK', price: 42.0, changePct: 0.3 },
];
