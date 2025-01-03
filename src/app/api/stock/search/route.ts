import { NextResponse } from 'next/server'
import { spawn } from 'child_process'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  console.log('Search query:', query)

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  const pythonScript = `
import yfinance as yf
import json
import sys
import time

def search_stock(query):
    # For European stocks with ISIN, try different exchange suffixes
    suffixes = ['', '.PA', '.F', '.L', '.MI', '.MC', '.AS', '.BR', '.ST', '.CO', '.HE', '.LS', '.SW']
    
    for suffix in suffixes:
        try:
            symbol = query + suffix
            print(f"Trying symbol: {symbol}", file=sys.stderr)
            
            # Add a small delay between requests
            time.sleep(0.5)
            
            ticker = yf.Ticker(symbol)
            try:
                info = ticker.info
                if info and 'symbol' in info:
                    return {
                        'symbol': info.get('symbol', ''),
                        'shortName': info.get('shortName', ''),
                        'longName': info.get('longName', ''),
                        'exchange': info.get('exchange', ''),
                        'isin': info.get('isin', ''),
                        'currency': info.get('currency', '')
                    }
            except (KeyError, TypeError) as e:
                print(f"Error getting info for {symbol}: {str(e)}", file=sys.stderr)
                continue
                
        except Exception as e:
            print(f"Error with symbol {symbol}: {str(e)}", file=sys.stderr)
            continue
    
    return None

try:
    query = "${query}"
    print(f"Starting search for: {query}", file=sys.stderr)
    
    result = search_stock(query)
    if result:
        print(json.dumps([result]))
    else:
        print(json.dumps([]))
        
except Exception as e:
    print(f"Fatal error: {str(e)}", file=sys.stderr)
    print(json.dumps([]))
`

  console.log('Executing Python script...')

  return new Promise((resolve) => {
    const process = spawn('python3', ['-c', pythonScript])
    let result = ''
    let error = ''

    process.stdout.on('data', (data) => {
      console.log('Python stdout:', data.toString())
      result += data.toString()
    })

    process.stderr.on('data', (data) => {
      console.log('Python stderr:', data.toString())
      error += data.toString()
    })

    process.on('close', (code) => {
      console.log('Python process exited with code:', code)
      console.log('Final result:', result)
      console.log('Error output:', error)

      if (code !== 0) {
        resolve(NextResponse.json({ error: error || 'Failed to fetch stock data' }, { status: 500 }))
        return
      }

      try {
        const data = JSON.parse(result)
        console.log('Parsed data:', data)
        resolve(NextResponse.json({ results: data }))
      } catch (e) {
        console.error('JSON parse error:', e)
        resolve(NextResponse.json({ error: 'Invalid response format' }, { status: 500 }))
      }
    })
  })
}
