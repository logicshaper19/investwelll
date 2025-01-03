'use client'

import { useEffect, useState } from 'react'
import { StockDetailsResponse, ApiError } from '@/types/stock'

interface StockInfoProps {
  symbol: string
}

export default function StockInfo({ symbol }: StockInfoProps) {
  const [stockData, setStockData] = useState<StockDetailsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch(`/api/stock/${encodeURIComponent(symbol)}`)
        const data = await response.json() as StockDetailsResponse | ApiError

        if ('error' in data) {
          setError(data.error)
          setStockData(null)
        } else {
          setStockData(data)
          setError(null)
        }
      } catch (error) {
        console.error('Error fetching stock data:', error)
        setError('Failed to fetch stock data')
        setStockData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStockData()
  }, [symbol])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-700 bg-red-100 rounded-lg">
        {error}
      </div>
    )
  }

  if (!stockData) {
    return null
  }

  const { info } = stockData

  const formatNumber = (num: number | null) => {
    if (num === null) return 'N/A'
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatCurrency = (num: number | null) => {
    if (num === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: info.currency || 'USD'
    }).format(num)
  }

  const formatMarketCap = (num: number | null) => {
    if (num === null) return 'N/A'
    const billion = 1000000000
    const million = 1000000
    if (num >= billion) {
      return `${(num / billion).toFixed(2)}B`
    }
    return `${(num / million).toFixed(2)}M`
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{info.longName || info.shortName}</h1>
        <div className="text-gray-600">
          {info.symbol} • {info.exchange}
          {info.isin && ` • ISIN: ${info.isin}`}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Overview</h2>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Market Cap:</span>{' '}
              {formatMarketCap(info.marketCap)}
            </div>
            <div>
              <span className="font-medium">Sector:</span> {info.sector || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Industry:</span>{' '}
              {info.industry || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Website:</span>{' '}
              {info.website ? (
                <a
                  href={info.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {info.website}
                </a>
              ) : (
                'N/A'
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Trading Information</h2>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Previous Close:</span>{' '}
              {formatCurrency(info.previousClose)}
            </div>
            <div>
              <span className="font-medium">Open:</span>{' '}
              {formatCurrency(info.open)}
            </div>
            <div>
              <span className="font-medium">Day Range:</span>{' '}
              {formatCurrency(info.dayLow)} - {formatCurrency(info.dayHigh)}
            </div>
            <div>
              <span className="font-medium">52 Week Range:</span>{' '}
              {formatCurrency(info.fiftyTwoWeekLow)} -{' '}
              {formatCurrency(info.fiftyTwoWeekHigh)}
            </div>
            <div>
              <span className="font-medium">Volume:</span>{' '}
              {formatNumber(info.volume)}
            </div>
            <div>
              <span className="font-medium">Avg. Volume:</span>{' '}
              {formatNumber(info.averageVolume)}
            </div>
          </div>
        </div>
      </div>

      {info.description && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{info.description}</p>
        </div>
      )}
    </div>
  )
}
