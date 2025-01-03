'use client'

import { useEffect, useRef } from 'react'
import { createChart, ColorType, LineStyle } from 'lightweight-charts'

interface ChartData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface StockChartProps {
  data: ChartData[]
  height?: number
}

export default function StockChart({ data, height = 400 }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return

    // Filter out any invalid data points
    const validData = data.filter(item => 
      item.open > 0 && 
      item.high > 0 && 
      item.low > 0 && 
      item.close > 0 && 
      item.high >= item.low
    )

    if (validData.length === 0) {
      // If no valid data, show a message
      const div = document.createElement('div')
      div.className = 'text-center text-gray-500 py-8'
      div.textContent = 'No valid price data available'
      chartContainerRef.current.appendChild(div)
      return
    }

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    })

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })

    // Create volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Set as an overlay
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    })

    // Format data for the chart
    const chartData = validData.map(item => ({
      time: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }))

    const volumeData = validData.map(item => ({
      time: item.date,
      value: item.volume,
      color: item.close >= item.open ? '#26a69a80' : '#ef535080',
    }))

    // Set the data
    candlestickSeries.setData(chartData)
    volumeSeries.setData(volumeData)

    // Fit content
    chart.timeScale().fitContent()

    // Store chart reference for cleanup
    chartRef.current = chart

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, height])

  return <div ref={chartContainerRef} className="w-full" style={{ minHeight: height }} />
}
