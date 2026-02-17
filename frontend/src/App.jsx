import React, { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp, TrendingDown, Clock, Shield,
    Activity, BarChart2, Zap, Search, Menu,
    User, Bell, ChevronDown, ListFilter, Cpu
} from 'lucide-react';
import TradingViewChart from './TradingViewChart';
import WhaleTracker from './WhaleTracker';

const formatPrice = (price, symbol = "") => {
    const p = parseFloat(price || 0);
    if (symbol.includes("SHIB") || symbol.includes("PEPE") || p < 1) {
        return p.toFixed(8);
    }
    return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const App = () => {
    const [activeCoin, setActiveCoin] = useState("BTCUSDT");
    const [allData, setAllData] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const [connError, setConnError] = useState(null);
    const [activeTab, setActiveTab] = useState("BUY");
    const [leverage, setLeverage] = useState(20);

    const connectWS = () => {
        setConnError(null);

        // Dynamic Backend Logic:
        // If on localhost, use port 8888. 
        // If online, use the Render Backend URL.
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        // PLACEHOLDER: Replace this URL once you get it from Render.com
        const productionHost = 'trading-backend-suresh.onrender.com'; // Change this after Step 1

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = isLocal ? 'localhost:8888' : productionHost;

        const socket = new WebSocket(`${wsProtocol}//${wsHost}/ws/trading`);

        socket.onopen = () => {
            console.log("RAPID Terminal Connected");
            setIsConnected(true);
            setConnError(null);
        };
        socket.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                setAllData(prev => ({ ...prev, [data.symbol]: data }));
            } catch (err) {
                console.error("WebSocket Parse Error:", err);
            }
        };
        socket.onclose = () => {
            console.log("RAPID Terminal Disconnected");
            setIsConnected(false);
            // Auto-retry after 3 seconds
            setTimeout(connectWS, 3000);
        };
        socket.onerror = (err) => {
            console.error("WebSocket Error:", err);
            setConnError("Link Failure");
            setIsConnected(false);
        };
    };

    useEffect(() => {
        connectWS();
    }, []);

    const dynamicCoins = Object.keys(allData).length > 0 ? Object.keys(allData) : ["BTCUSDT", "ETHUSDT", "BNBUSDT"];

    // Memoize to prevent unnecessary re-renders
    const data = useMemo(() => allData[activeCoin] || {}, [allData, activeCoin]);
    const isUp = useMemo(() => data.trend === "BULLISH", [data.trend]);

    return (
        <div className="binance-container w-screen h-screen overflow-hidden flex flex-col bg-[#050505]">
            {/* HEADER */}
            <header className="flex-shrink-0 h-[72px] flex items-center justify-between px-6 bg-black/50 border-b border-white/5 backdrop-blur-3xl relative z-[100] w-full">
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="w-10 h-10 bg-[#FCD535] rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20 active:scale-95 transition-transform">
                        <Zap className="text-black w-6 h-6 fill-black" />
                    </div>
                    <div>
                        <span className="text-[#FCD535] font-black text-xl tracking-tighter block leading-none">RAPID</span>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Neural Terminal</span>
                    </div>
                </div>

                {/* QUICK COIN SWITCHER (DYNAMIC) */}
                <div className="hidden lg:flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/5 mx-4 overflow-x-auto no-scrollbar max-w-[50%]">
                    {dynamicCoins.map(coin => (
                        <button
                            key={coin}
                            onClick={() => setActiveCoin(coin)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap ${activeCoin === coin ? 'bg-[#FCD535] text-black shadow-lg shadow-yellow-500/20' : 'text-[#848E9C] hover:text-white hover:bg-white/5'}`}
                        >
                            {coin.replace("USDT", "")}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className={`hidden md:flex items-center gap-2 ${isConnected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'} px-3 py-1.5 rounded-full border`}>
                        <div className={`w-1.5 h-1.5 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full ${isConnected ? 'animate-pulse' : ''}`}></div>
                        <span className={`text-[9px] font-black uppercase ${isConnected ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isConnected ? 'Neural Connected' : 'Engine Disconnected'}
                        </span>
                    </div>
                    <User className="w-5 h-5 text-[#848E9C] hover:text-white cursor-pointer transition-colors" />
                    <button className="bg-[#fcd535] text-black px-5 py-2 rounded-xl text-xs font-black uppercase shadow-xl shadow-yellow-500/10 active:scale-95 transition-all">Wallet</button>
                </div>
            </header>

            <div className="main-content flex-1 flex overflow-hidden min-h-0 w-full relative">
                {/* COLUMN 1: STRATEGY & MARKET FEED */}
                <div className="column strategy-col flex-[1.5] overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {/* STRATEGIC DASHBOARD - STABLE LAYOUT */}
                    <div className="flex flex-col gap-2 p-6 rounded-[2rem] border border-white/5 bg-[#0c0e12] shadow-2xl relative overflow-hidden">

                        {/* 1. UPPER RESISTANCE / SHORT ZONE (Always visible) */}
                        <div className={`p-4 rounded-2xl border transition-all duration-300 flex justify-between items-center relative overflow-hidden ${data.ai_prediction?.signal?.includes('SELL')
                            ? 'bg-rose-500/20 border-rose-500 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                            : 'bg-white/5 border-white/5 text-[#848E9C] opacity-60'
                            }`}>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingDown size={14} className={data.ai_prediction?.signal?.includes('SELL') ? 'text-rose-400' : 'text-[#848E9C]'} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Resistance / Short Entry</span>
                                </div>
                                <p className={`text-2xl font-mono font-black ${data.ai_prediction?.signal?.includes('SELL') ? 'text-white' : 'text-[#848E9C]'}`}>
                                    ${formatPrice(data.recommended_sell, activeCoin)}
                                </p>
                            </div>
                            {data.ai_prediction?.signal?.includes('SELL') && (
                                <div className="bg-rose-500 px-3 py-1 rounded-lg text-black text-[10px] font-black uppercase">
                                    Active Target
                                </div>
                            )}
                        </div>

                        {/* 2. MIDDLE STATUS ZONE (Pivot) */}
                        <div className="py-4 flex items-center justify-center relative">
                            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                            <div className={`px-8 py-2 rounded-full border-2 font-black uppercase tracking-[0.2em] text-xs z-10 transition-all ${data.ai_prediction?.signal === 'STRONG BUY' ? 'bg-emerald-500 text-black border-emerald-400' :
                                data.ai_prediction?.signal === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' :
                                    data.ai_prediction?.signal === 'STRONG SELL' ? 'bg-rose-500 text-white border-rose-400' :
                                        data.ai_prediction?.signal === 'SELL' ? 'bg-rose-500/20 text-rose-400 border-rose-500' :
                                            'bg-[#FCD535]/20 text-[#FCD535] border-[#FCD535]'
                                }`}>
                                {data.ai_prediction?.signal || "ANALYZING..."}
                            </div>
                        </div>

                        {/* 3. LOWER SUPPORT / LONG ZONE (Always visible) */}
                        <div className={`p-4 rounded-2xl border transition-all duration-300 flex justify-between items-center relative overflow-hidden ${data.ai_prediction?.signal?.includes('BUY')
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                            : 'bg-white/5 border-white/5 text-[#848E9C] opacity-60'
                            }`}>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp size={14} className={data.ai_prediction?.signal?.includes('BUY') ? 'text-emerald-400' : 'text-[#848E9C]'} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Support / Long Entry</span>
                                </div>
                                <p className={`text-2xl font-mono font-black ${data.ai_prediction?.signal?.includes('BUY') ? 'text-white' : 'text-[#848E9C]'}`}>
                                    ${formatPrice(data.recommended_buy, activeCoin)}
                                </p>
                            </div>
                            {data.ai_prediction?.signal?.includes('BUY') && (
                                <div className="bg-emerald-500 px-3 py-1 rounded-lg text-black text-[10px] font-black uppercase">
                                    Active Target
                                </div>
                            )}
                        </div>

                        {/* INFO FOOTER */}
                        <div className="mt-2 flex justify-between px-2 opacity-50">
                            <span className="text-[9px] text-[#848E9C]">Target: ${formatPrice(data.ai_prediction?.prediction_target, activeCoin)}</span>
                            <span className="text-[9px] text-[#848E9C]">SL Shield: ${formatPrice(data.ai_prediction?.stop_loss, activeCoin)}</span>
                        </div>
                    </div>

                    {/* WHALE ACTIVITY TRACKER - PERMANENT LIST */}
                    <WhaleTracker />

                    {/* MARKET LINE (ENHANCED) */}
                    <div className={`flex-shrink-0 flex flex-wrap items-center gap-6 p-6 rounded-[2rem] border transition-all duration-500 shadow-2xl ${isUp ? 'bg-emerald-500/5 border-emerald-500/20 ring-1 ring-emerald-500/10' : 'bg-rose-500/5 border-rose-500/20 ring-1 ring-rose-500/10'}`}>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-black tracking-tighter text-white inline-flex items-center gap-2">
                                {activeCoin.replace("USDT", "")}
                                <span className={`${isUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'} text-[10px] px-2 py-0.5 rounded-lg border border-white/5`}>PRO</span>
                            </h2>
                        </div>
                        <div className="flex-1">
                            <p className="text-[#848E9C] text-[10px] mb-1 font-black uppercase tracking-[0.2em]">Market Line Live</p>
                            <p className={`text-3xl font-black font-mono tracking-tight transition-all duration-300 ${isUp ? 'text-[#0ecb81] drop-shadow-[0_0_15px_rgba(14,203,129,0.5)]' : 'text-[#f6465d] drop-shadow-[0_0_15px_rgba(246,70,93,0.5)]'}`}>
                                {formatPrice(data.current_price, activeCoin)}
                            </p>
                        </div>
                        <div className="hidden md:block bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                            <p className="text-[#848E9C] text-[9px] mb-0.5 font-black uppercase tracking-widest text-center">RSI (30min)</p>
                            <p className={`text-sm font-black text-center ${data.rsi > 70 ? 'text-rose-400' : data.rsi < 30 ? 'text-emerald-400' : 'text-white'}`}>{parseFloat(data.rsi || 0).toFixed(2)}</p>
                        </div>
                    </div>

                    {/* TRADINGVIEW CHART */}
                    {/* TRADINGVIEW CHART - LIVE FOR SELECTED COIN */}
                    <TradingViewChart
                        key={activeCoin}
                        symbol={activeCoin.replace("USDT", "")}
                        currentPrice={parseFloat(data.current_price) || 95000}
                    />

                    {/* AI PREDICTOR (V3 NEURAL ENGINE) */}
                    <div className="flex-shrink-0 p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-br from-[#0c0e12] to-black border-2 border-white/5 shadow-[0_24px_48px_rgba(0,0,0,0.8)] relative group">
                        {/* Neural Pulsing Background */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_#FCD535_0%,_transparent_50%)] opacity-[0.03] animate-pulse rounded-[2.5rem]"></div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 animate-spin-slow">
                                    <Cpu className="w-6 h-6 text-[#FCD535]" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-black text-white tracking-tight text-shadow-glow">DEEP ALPHA AI</h3>
                                        <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-black">V3.0 NEURAL-ML</span>
                                    </div>
                                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                        Sentiment + Halving Analyzed
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-[#848E9C] font-black uppercase mb-1">Neural Confidence</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden border border-white/10 hidden sm:block">
                                        <div className="h-full bg-gradient-to-r from-emerald-500 to-yellow-500" style={{ width: `${data.ai_prediction?.confidence_score || 0}%` }}></div>
                                    </div>
                                    <span className="text-2xl font-black font-mono text-white leading-none">{data.ai_prediction?.confidence_score || "0.0"}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                            <div className="p-5 bg-white/5 rounded-3xl border border-white/5 text-center group-hover:bg-white/10 transition-all">
                                <p className="text-[10px] text-[#848E9C] font-black uppercase mb-2">30min Target</p>
                                <p className={`text-2xl font-black font-mono ${data.ai_prediction?.bias === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    ${formatPrice(data.ai_prediction?.prediction_target, activeCoin)}
                                </p>
                                <p className="text-[8px] text-[#848E9C] mt-2 font-bold font-mono">STABLE TARGET</p>
                            </div>
                            <div className="p-5 bg-rose-500/10 rounded-3xl border border-rose-500/20 text-center">
                                <p className="text-[10px] text-rose-400 font-black uppercase mb-2">Security SL</p>
                                <p className="text-2xl font-black font-mono text-white">
                                    ${formatPrice(data.ai_prediction?.stop_loss, activeCoin)}
                                </p>
                                <p className="text-[8px] text-rose-400/50 mt-2 font-bold">SHIELD ACTIVE</p>
                            </div>
                            <div className="p-5 bg-white/5 rounded-3xl border border-white/5 text-center">
                                <p className="text-[10px] text-[#848E9C] font-black uppercase mb-2">Signal Strength</p>
                                <div className="flex gap-2 justify-center items-center">
                                    <div className="text-center">
                                        <p className="text-emerald-400 text-lg font-black">{data.ai_prediction?.bullish_score || 0}</p>
                                        <p className="text-[7px] text-emerald-400/50">BULL</p>
                                    </div>
                                    <span className="text-[#848E9C]">vs</span>
                                    <div className="text-center">
                                        <p className="text-rose-400 text-lg font-black">{data.ai_prediction?.bearish_score || 0}</p>
                                        <p className="text-[7px] text-rose-400/50">BEAR</p>
                                    </div>
                                </div>
                            </div>
                            <div className={`p-5 rounded-3xl text-center flex flex-col justify-center border-b-4 transition-all ${data.ai_prediction?.signal === 'STRONG BUY' || data.ai_prediction?.signal === 'BUY' ? 'bg-emerald-500 border-emerald-600 shadow-xl shadow-emerald-500/20' : data.ai_prediction?.signal === 'STRONG SELL' || data.ai_prediction?.signal === 'SELL' ? 'bg-rose-500 border-rose-600 shadow-xl shadow-rose-500/20' : 'bg-[#FCD535] border-yellow-600 shadow-xl shadow-yellow-500/10'}`}>
                                <p className="text-[10px] text-black font-black uppercase opacity-60">Action</p>
                                <p className="text-xl font-black text-black leading-none py-1">
                                    {data.ai_prediction?.signal || "WAIT"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* IRON BUTTERFLY VISUALIZATION (COMPACT) */}
                    <div className={`rounded-[2.5rem] border p-6 md:p-8 min-h-[400px] flex flex-col shadow-2xl relative overflow-hidden mb-6 transition-all duration-700 ${isUp ? 'bg-emerald-500/[0.02] border-emerald-500/10' : 'bg-rose-500/[0.02] border-rose-500/10'}`}>
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#848E9C] flex items-center gap-2">
                                <TrendingUp className={`w-3.5 h-3.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`} />
                                Strategy Hub
                            </h3>
                            <div className={`${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} px-3 py-1 rounded-xl text-[9px] font-black uppercase border border-white/5`}>
                                Market {isUp ? 'Rising' : 'Dropping'}
                            </div>
                        </div>

                        <div className="flex-1 relative flex items-center justify-center z-10 py-4">
                            <div className="w-full max-w-sm space-y-6">
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 group relative overflow-hidden">
                                    <div>
                                        <p className="text-[8px] text-red-500 font-black uppercase mb-0.5 tracking-widest">Upper Call</p>
                                        <p className="text-lg font-black font-mono text-white">${formatPrice(data.iron_fly?.long_call, activeCoin)}</p>
                                    </div>
                                    <ChevronDown className="text-red-500 w-5 h-5 rotate-180" />
                                </div>

                                <div className="flex justify-center -my-4 relative">
                                    <div className="bg-gradient-to-br from-[#FCD535] to-[#f0b90b] p-8 rounded-[3rem] shadow-xl text-center relative z-10 border-2 border-black/5">
                                        <p className="text-[10px] text-black font-black uppercase mb-1 tracking-widest">Pivot</p>
                                        <p className="text-3xl font-black font-mono text-black leading-none">${formatPrice(data.iron_fly?.short_put, activeCoin)}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 group relative overflow-hidden">
                                    <ChevronDown className="text-emerald-500 w-5 h-5" />
                                    <div className="text-right">
                                        <p className="text-[8px] text-emerald-500 font-black uppercase mb-0.5 tracking-widest">Lower Put</p>
                                        <p className="text-lg font-black font-mono text-white">${formatPrice(data.iron_fly?.long_put, activeCoin)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-white/5 text-[11px] text-[#848E9C] leading-relaxed relative z-10 text-center max-w-sm mx-auto">
                        <p className="opacity-60">Buy call at <span className="text-white font-bold">${formatPrice(data.iron_fly?.long_call, activeCoin)}</span> & put at <span className="text-white font-bold">${formatPrice(data.iron_fly?.long_put, activeCoin)}</span>.
                            The goal is for the price to settle at the <span className="text-[#FCD535] font-black uppercase tracking-wider">${formatPrice(data.iron_fly?.short_put, activeCoin)}</span> pivot at expiration.</p>
                    </div>
                </div>


                {/* COLUMN 2: ORDER BOOK */}
                <div className="column orderbook-col custom-scrollbar bg-black/50 overflow-y-auto">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#848E9C]">Order Flow</h3>
                        <ListFilter className="w-4 h-4 text-[#848E9C]" />
                    </div>
                    <div className="p-6 space-y-1.5">
                        <div className="flex justify-between text-[10px] text-[#848E9C] mb-6 uppercase font-black tracking-widest px-2">
                            <span>Strike USDT</span>
                            <span>Depth {activeCoin.replace("USDT", "")}</span>
                        </div>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex justify-between text-[11px] py-1.5 px-3 relative group hover:bg-white/5 rounded-xl cursor-default transition-all">
                                <div className="absolute right-0 top-0 bottom-0 bg-[#f6465d]/5 rounded-r-xl transition-all" style={{ width: `${20 + i * 12}%` }}></div>
                                <span className="text-[#f6465d] font-black font-mono">${(parseFloat(data.current_price || 0) + i * 0.2).toFixed(2)}</span>
                                <span className="text-white font-mono relative z-10">{(Math.random() * 0.4).toFixed(4)}</span>
                            </div>
                        ))}
                        <div className="py-10 text-center border-y border-white/5 my-6 bg-gradient-to-b from-white/5 to-transparent rounded-[2.5rem]">
                            <p className={`text-3xl font-black font-mono tracking-tighter ${isUp ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                {formatPrice(data.current_price, activeCoin)}
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${isUp ? 'bg-[#0ecb81]' : 'bg-[#f6465d]'}`}></div>
                                <p className="text-[#848E9C] text-[10px] font-black uppercase tracking-[0.2em]">Mark Pulse</p>
                            </div>
                        </div>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex justify-between text-[11px] py-1.5 px-3 relative group hover:bg-white/5 rounded-xl cursor-default transition-all">
                                <div className="absolute left-0 top-0 bottom-0 bg-[#0ecb81]/5 rounded-l-xl transition-all" style={{ width: `${15 + i * 14}%` }}></div>
                                <span className="text-[#0ecb81] font-black font-mono">${(parseFloat(data.current_price || 0) - i * 0.2).toFixed(2)}</span>
                                <span className="text-white font-mono relative z-10">{(Math.random() * 0.4).toFixed(4)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLUMN 3: TRADING TERMINAL & NEWS */}
                <div className="column terminal-col custom-scrollbar overflow-y-auto">
                    {/* TWITTER PULSE - MOVED TO TOP */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-black rounded-xl border border-white/10 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-[#1D9BF0]" />
                                </div>
                                <span className="text-[11px] font-black uppercase text-white tracking-[0.3em]">Market Intelligence</span>
                            </div>
                            <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Live Feed</span>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {data.news?.map((tweet, idx) => {
                                const isFed = tweet.title.includes("FED") || tweet.title.includes("Macro");
                                return (
                                    <div key={idx} className={`p-5 rounded-2xl transition-all cursor-pointer relative overflow-hidden group ${isFed ? 'macro-fed-card' : 'news-card-vibrant'}`}>
                                        <div className="flex items-center justify-between mb-3 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <span className={`news-source-tag ${isFed ? 'bg-red-600' : 'bg-[#1D9BF0]'}`}>
                                                    {tweet.source || "News"}
                                                </span>
                                            </div>
                                            <div className={`text-[9px] font-black uppercase ${tweet.sentiment === 'POSITIVE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {tweet.sentiment}
                                            </div>
                                        </div>
                                        <p className={`text-[13px] leading-relaxed font-bold tracking-tight mb-3 relative z-10 ${isFed ? 'text-white' : 'text-[#eaecef]'}`}>
                                            {tweet.title}
                                        </p>
                                        <div className="flex gap-4 text-[9px] font-black text-[#848e9c] uppercase tracking-widest relative z-10 opacity-60">
                                            <span>Live Feed</span>
                                            <span className="text-[#FCD535]">Just Now</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* TRADING TERMINAL */}
                    <div className="bg-white/5 p-1.5 rounded-[2rem] flex mb-8">
                        <button onClick={() => setActiveTab("BUY")} className={`flex-1 py-4 text-[11px] font-black uppercase rounded-[1.5rem] transition-all flex items-center justify-center gap-2 ${activeTab === 'BUY' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-[0_8px_32px_rgba(16,185,129,0.3)]' : 'text-[#848E9C]'}`}>
                            <TrendingUp className="w-4 h-4" /> Buy Long
                        </button>
                        <button onClick={() => setActiveTab("SELL")} className={`flex-1 py-4 text-[11px] font-black uppercase rounded-[1.5rem] transition-all flex items-center justify-center gap-2 ${activeTab === 'SELL' ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_8px_32px_rgba(244,63,94,0.3)]' : 'text-[#848E9C]'}`}>
                            <TrendingDown className="w-4 h-4" /> Sell Short
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* EXECUTION INTEL */}
                        <div className={`p-8 rounded-[3rem] border shadow-2xl relative overflow-hidden group transition-all duration-500 ${isUp ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <Shield className={`w-5 h-5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`} />
                                <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>Execution AI</span>
                            </div>
                            <div className="space-y-6 relative z-10">
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[10px] text-[#848e9c] font-black uppercase mb-2 tracking-widest">Entry Zone</p>
                                        <p className="text-white font-mono text-xl font-black">${formatPrice(data.recommended_buy, activeCoin)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[#848e9c] font-black uppercase mb-2 tracking-widest">Target Exit</p>
                                        <p className="text-emerald-400 font-mono text-xl font-black">${formatPrice(data.ai_prediction?.prediction_target, activeCoin)}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                    <p className="text-[10px] text-rose-400 font-black uppercase mb-2 tracking-widest">Safety Stop Loss</p>
                                    <p className="text-rose-400 font-mono text-xl font-black animate-pulse">${formatPrice(data.ai_prediction?.stop_loss, activeCoin)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white/5 p-5 rounded-2xl flex justify-between items-center text-[10px] font-black uppercase tracking-widest border border-white/5">
                                <span className="text-[#848E9C]">Execution Mode</span>
                                <span className="text-white flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-[#FCD535] rounded-full animate-pulse"></div>
                                    Smart SL/TP
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <input type="text" placeholder="Amount to deploy..." className="w-full bg-[#1e2329] p-5 rounded-2xl outline-none text-white text-sm font-black border-2 border-transparent focus:border-[#fcd535]/30 transition-all font-mono placeholder:text-[#848e9c]/40" />
                                    <span className="absolute right-6 top-5 text-[11px] text-[#FCD535] font-black uppercase tracking-widest">USDT</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <input type="text" placeholder="Take Profit" className="w-full bg-[#1e2329] p-4 rounded-xl outline-none text-white text-xs font-black border border-white/5 focus:border-emerald-500/30 transition-all font-mono" />
                                        <span className="absolute right-4 top-4 text-[8px] text-emerald-500 font-black uppercase">TP</span>
                                    </div>
                                    <div className="relative">
                                        <input type="text" placeholder="Stop Loss" className="w-full bg-[#1e2329] p-4 rounded-xl outline-none text-white text-xs font-black border border-white/5 focus:border-rose-500/30 transition-all font-mono" />
                                        <span className="absolute right-4 top-4 text-[8px] text-rose-500 font-black uppercase">SL</span>
                                    </div>
                                </div>
                            </div>

                            <button className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 group relative overflow-hidden ${activeTab === 'BUY' ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-emerald-500/20' : 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/20'}`}>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                                <span className="relative z-10">Confirm {activeTab} & Set Shields</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
