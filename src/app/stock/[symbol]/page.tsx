'use client'

import { useEffect, useState } from 'react'
import StockChart from '@/components/StockChart'

interface StockData {
  info: {
    symbol: string
    shortName: string
    longName: string
    sector: string
    industry: string
    website: string
    description: string
    marketCap: number
    trailingPE: number
    forwardPE: number
    dividendYield: number
    fiftyTwoWeekHigh: number
    fiftyTwoWeekLow: number
    currency: string
    exchange: string
    isin: string
    lastPrice: number
    previousClose: number
    dayChange: number
    dayChangePercent: number
    ytdReturn: number
    expenseRatio: number
    category: string
    netAssets: number
    beta: number
    creationDate: string
    volume: number
    averageVolume: number
  }
  history: {
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
  }[]
  recommendations: any[]
  news: any[]
}

export default function StockPage({ params }: { params: { symbol: string } }) {
  const [data, setData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/stock/${params.symbol}`)
        if (!response.ok) {
          throw new Error('Failed to fetch stock data')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError('Failed to load stock data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.symbol])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error || 'Failed to load stock data'}</div>
      </div>
    )
  }

  const formatLargeNumber = (num: number | null) => {
    if (num === null || isNaN(num)) return 'N/A'
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    return num.toLocaleString()
  }

  const formatPercent = (num: number | null) => {
    if (num === null || isNaN(num)) return 'N/A'
    return num.toFixed(2) + '%'
  }

  const formatPrice = (num: number | null) => {
    if (num === null || isNaN(num)) return 'N/A'
    return num.toFixed(2)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Current Price */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{data.info.longName}</h1>
          <div className="text-gray-600 mb-4">
            {data.info.symbol} • {data.info.exchange}
            {data.info.isin && ` • ISIN: ${data.info.isin}`}
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-bold">{formatPrice(data.info.lastPrice)}</span>
            <span className={`text-xl ${data.info.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPrice(data.info.dayChange)} ({formatPercent(data.info.dayChangePercent)})
            </span>
          </div>
          <div className="text-sm text-gray-600">
            As of {new Date().toLocaleString()}
          </div>
        </div>

        {/* Price Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Price History</h2>
          <div className="h-[400px]">
            <StockChart data={data.history} height={400} />
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Fund Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Net Assets</p>
                <p className="font-medium">{formatLargeNumber(data.info.netAssets)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">YTD Return</p>
                <p className="font-medium">{formatPercent(data.info.ytdReturn)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expense Ratio</p>
                <p className="font-medium">{formatPercent(data.info.expenseRatio)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-medium">{data.info.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Creation Date</p>
                <p className="font-medium">{data.info.creationDate ? new Date(data.info.creationDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Beta (5Y Monthly)</p>
                <p className="font-medium">{data.info.beta?.toFixed(2) || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Trading Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Previous Close</p>
                <p className="font-medium">{formatPrice(data.info.previousClose)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Volume</p>
                <p className="font-medium">{formatLargeNumber(data.info.volume)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Volume</p>
                <p className="font-medium">{formatLargeNumber(data.info.averageVolume)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">52 Week Range</p>
                <p className="font-medium">{formatPrice(data.info.fiftyTwoWeekLow)} - {formatPrice(data.info.fiftyTwoWeekHigh)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {data.info.description && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-gray-700 whitespace-pre-line">{data.info.description}</p>
          </div>
        )}

        {/* News */}
        {data.news && data.news.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Latest News</h2>
            <div className="space-y-4">
              {data.news.map((item: any, index: number) => (
                <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{new Date(item.providerPublishTime * 1000).toLocaleDateString()}</p>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
