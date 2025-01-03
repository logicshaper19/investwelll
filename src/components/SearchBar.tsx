'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StockSearchResult } from '@/types/stock'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setResults([])

    try {
      const response = await fetch(`/api/stock/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stock data')
      }

      const data = await response.json()
      console.log('Search response:', data)

      if (data.error) {
        setError(data.error)
      } else if (data.results && data.results.length > 0) {
        setResults(data.results)
      } else {
        setError('No results found. Try a different search term.')
      }
    } catch (error) {
      console.error('Search error:', error)
      setError('Failed to search stocks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (symbol: string) => {
    router.push(`/stock/${encodeURIComponent(symbol)}`)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter stock symbol or ISIN..."
            className="w-full px-4 py-3 text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center text-gray-600">
          Searching for stock information...
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Search Results</h2>
          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.symbol}
                onClick={() => handleResultClick(result.symbol)}
                className="p-3 hover:bg-gray-100 rounded cursor-pointer transition-colors"
              >
                <div className="font-medium">{result.longName || result.shortName}</div>
                <div className="text-sm text-gray-600">
                  {result.symbol} • {result.exchange}
                  {result.isin && ` • ISIN: ${result.isin}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
