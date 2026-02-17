import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Clock } from 'lucide-react';

const TradingViewChart = ({ symbol, currentPrice }) => {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const candleSeriesRef = useRef();
    const [timeframe, setTimeframe] = useState('30m');

    const timeframes = [
        { label: '1m', value: '1m' },
        { label: '5m', value: '5m' },
        { label: '15m', value: '15m' },
        { label: '30m', value: '30m' },
        { label: '1H', value: '1h' },
        { label: '4H', value: '4h' },
        { label: '1D', value: '1d' },
    ];

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Create chart
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: {
                background: { color: '#050505' },
                textColor: '#848E9C',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: '#FCD535',
                    width: 1,
                    style: 2,
                },
                horzLine: {
                    color: '#FCD535',
                    width: 1,
                    style: 2,
                },
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                textColor: '#848E9C',
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                textColor: '#848E9C',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        // Add candlestick series
        const candleSeries = chart.addCandlestickSeries({
            upColor: '#0ECB81',
            downColor: '#F6465D',
            borderUpColor: '#0ECB81',
            borderDownColor: '#F6465D',
            wickUpColor: '#0ECB81',
            wickDownColor: '#F6465D',
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;

        // Generate initial data with default price
        const initialPrice = currentPrice || 95000;
        candleSeries.setData(generateHistoricalData(initialPrice, timeframe));

        // Handle resize
        const handleResize = () => {
            chart.applyOptions({
                width: chartContainerRef.current.clientWidth,
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // Initialize chart data only on timeframe/symbol change
    useEffect(() => {
        if (candleSeriesRef.current) {
            const price = currentPrice || 95000;
            // Generate historical data
            const initialData = generateHistoricalData(price, timeframe);
            candleSeriesRef.current.setData(initialData);

            // Store last candle for smooth updates
            lastCandleRef.current = initialData[initialData.length - 1];
        }
    }, [timeframe, symbol]);

    // Handle real-time price updates smoothly
    const lastCandleRef = useRef(null);
    useEffect(() => {
        if (candleSeriesRef.current && currentPrice && lastCandleRef.current) {
            const newPrice = parseFloat(currentPrice);
            const candle = lastCandleRef.current;

            // Update the latest candle with the new price
            const updatedCandle = {
                ...candle,
                close: newPrice,
                high: Math.max(candle.high, newPrice),
                low: Math.min(candle.low, newPrice),
            };

            candleSeriesRef.current.update(updatedCandle);
            lastCandleRef.current = updatedCandle;
        }
    }, [currentPrice]);

    const generateHistoricalData = (basePrice, tf) => {
        const price = parseFloat(basePrice) || 95000;
        const data = [];
        const now = Math.floor(Date.now() / 1000);
        const intervals = { '1m': 60, '5m': 300, '15m': 900, '30m': 1800, '1h': 3600, '4h': 14400, '1d': 86400 };
        const interval = intervals[tf];
        const numCandles = 60;

        let curP = price;
        for (let i = numCandles; i >= 0; i--) {
            const time = now - (i * interval);
            const open = curP;
            const change = (Math.random() - 0.5) * (price * 0.005);
            const close = open + change;
            data.push({
                time,
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(Math.max(open, close, open + Math.abs(change) * 1.2).toFixed(2)),
                low: parseFloat(Math.min(open, close, open - Math.abs(change) * 1.2).toFixed(2)),
                close: parseFloat(close.toFixed(2)),
            });
            curP = close;
        }
        return data;
    };

    return (
        <div className="bg-gradient-to-b from-black/80 to-black/50 rounded-[2rem] border border-white/5 p-6 shadow-2xl">
            {/* Header with Timeframe Selector */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FCD535]/10 rounded-xl flex items-center justify-center border border-[#FCD535]/20">
                        <Clock className="w-5 h-5 text-[#FCD535]" />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-lg tracking-tight">{symbol} Chart</h3>
                        <p className="text-[#848E9C] text-[10px] font-bold uppercase tracking-widest">TradingView Style</p>
                    </div>
                </div>

                {/* Timeframe Buttons */}
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                    {timeframes.map((tf) => (
                        <button
                            key={tf.value}
                            onClick={() => setTimeframe(tf.value)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${timeframe === tf.value
                                ? 'bg-[#FCD535] text-black shadow-lg shadow-yellow-500/20'
                                : 'text-[#848E9C] hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div
                ref={chartContainerRef}
                className="rounded-xl overflow-hidden border border-white/5"
                style={{ width: '100%', height: '400px' }}
            />

            {/* Chart Info */}
            <div className="mt-4 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#0ECB81] rounded"></div>
                        <span className="text-[#848E9C] font-bold">Bullish Candle</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#F6465D] rounded"></div>
                        <span className="text-[#848E9C] font-bold">Bearish Candle</span>
                    </div>
                </div>
                <span className="text-[#848E9C] font-bold uppercase tracking-widest">Timeframe: {timeframe}</span>
            </div>
        </div>
    );
};

export default TradingViewChart;
