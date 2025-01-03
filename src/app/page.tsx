import SearchBar from '@/components/SearchBar'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'InvestWell - Stock Search',
  description: 'Search stocks by ISIN and view detailed information',
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">InvestWell</h1>
        <p className="text-center text-gray-600 mb-8">
          Search for stocks using ISIN or symbol
        </p>
        <SearchBar />
      </div>
    </main>
  )
}
