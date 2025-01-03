export interface StockSearchResult {
  symbol: string
  shortName: string
  longName: string
  exchange: string
  isin: string
  currency: string
}

export interface SearchResponse {
  results: StockSearchResult[]
}

export interface HistoricalData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface StockInfo {
  symbol: string
  shortName: string
  longName: string
  currency: string
  exchange: string
  marketCap: number | null
  isin: string
  sector: string
  industry: string
  website: string
  description: string
  previousClose: number | null
  open: number | null
  dayHigh: number | null
  dayLow: number | null
  volume: number | null
  averageVolume: number | null
  fiftyTwoWeekHigh: number | null
  fiftyTwoWeekLow: number | null
}

export interface StockDetailsResponse {
  info: StockInfo
  historical_data: HistoricalData[]
}

export interface ApiError {
  error: string
}
