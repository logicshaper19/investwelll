import { NextResponse } from 'next/server'
import { spawn } from 'child_process'

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const symbol = params.symbol

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
  }

  const pythonScript = `
import yfinance as yf
import json
import sys
import pandas as pd

def get_stock_data(symbol):
    try:
        print(f"Fetching data for symbol: {symbol}", file=sys.stderr)
        ticker = yf.Ticker(symbol)
        
        # Get basic info
        info = ticker.info
        
        # Helper function to clean NaN values
        def clean_value(v):
            if pd.isna(v):
                return None
            if isinstance(v, (int, float)):
                return float(v)
            return v

        # Get quote type
        quote_type = info.get('quoteType', '').upper()
        
        result = {
            'info': {
                'symbol': info.get('symbol'),
                'shortName': info.get('shortName', ''),
                'longName': info.get('longName', info.get('shortName')),
                'currency': info.get('currency', ''),
                'exchange': info.get('exchange', ''),
                'quoteType': quote_type,
                
                # Price information
                'lastPrice': clean_value(info.get('regularMarketPrice')),
                'previousClose': clean_value(info.get('regularMarketPreviousClose')),
                'dayChange': clean_value(info.get('regularMarketChange')),
                'dayChangePercent': clean_value(info.get('regularMarketChangePercent')),
                'fiftyTwoWeekHigh': clean_value(info.get('fiftyTwoWeekHigh')),
                'fiftyTwoWeekLow': clean_value(info.get('fiftyTwoWeekLow')),
                'fiftyDayAverage': clean_value(info.get('fiftyDayAverage')),
                'twoHundredDayAverage': clean_value(info.get('twoHundredDayAverage')),
                
                # Fund specific information (only included for funds)
                **(
                    {
                        'ytdReturn': clean_value(info.get('ytdReturn')),
                        'fundFamily': info.get('fundFamily'),
                        'fundInceptionDate': clean_value(info.get('fundInceptionDate')),
                        'annualHoldingsTurnover': clean_value(info.get('annualHoldingsTurnover')),
                    } if quote_type in ['MUTUALFUND', 'ETF'] else {}
                )
            },
            'metadata': {
                'quoteType': quote_type,
                'dataCompleteness': {
                    'hasPrice': 'regularMarketPrice' in info and not pd.isna(info.get('regularMarketPrice')),
                    **(
                        {
                            'hasYtdReturn': 'ytdReturn' in info and not pd.isna(info.get('ytdReturn')),
                            'hasFundFamily': 'fundFamily' in info and info.get('fundFamily') is not None,
                            'hasInceptionDate': 'fundInceptionDate' in info and not pd.isna(info.get('fundInceptionDate')),
                            'hasHoldingsTurnover': 'annualHoldingsTurnover' in info and not pd.isna(info.get('annualHoldingsTurnover')),
                        } if quote_type in ['MUTUALFUND', 'ETF'] else {}
                    )
                }
            }
        }
        
        return result

    except Exception as e:
        print(f"Fatal error: {str(e)}", file=sys.stderr)
        return None

result = get_stock_data("${symbol}")
if result:
    print(json.dumps(result))
else:
    print(json.dumps({"error": "Failed to fetch stock data"}))
`

  return new Promise((resolve) => {
    const process = spawn('python3', ['-c', pythonScript])
    let result = ''
    let error = ''

    process.stdout.on('data', (data) => {
      result += data.toString()
    })

    process.stderr.on('data', (data) => {
      console.error('Python stderr:', data.toString())
      error += data.toString()
    })

    process.on('close', (code) => {
      if (code !== 0) {
        resolve(NextResponse.json({ error: error || 'Failed to fetch stock data' }, { status: 500 }))
        return
      }

      try {
        const data = JSON.parse(result)
        if ('error' in data) {
          resolve(NextResponse.json(data, { status: 404 }))
        } else {
          resolve(NextResponse.json(data))
        }
      } catch (e) {
        resolve(NextResponse.json({ error: 'Invalid response format' }, { status: 500 }))
      }
    })
  })
}
