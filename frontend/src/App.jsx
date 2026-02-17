import React, { useState, useEffect, useMemo } from 'react';
// Triggering fresh build for GitHub Actions deployment
import {
    TrendingUp, TrendingDown, Clock, Shield,
    Activity, BarChart2, Zap, Search, Menu,
    User, Bell, ChevronDown, ListFilter, Cpu
} from 'lucide-react';
import TradingViewChart from './TradingViewChart';
import WhaleTracker from './WhaleTracker';

const formatPrice = (price, symbol = "") => {
    if (!price || price === 0) return "---";
    const p = parseFloat(price);
    if (symbol.includes("SHIB") || symbol.includes("PEPE") || p < 0.1) {
        return p.toFixed(8);
    }
    return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const INITIAL_DATA_SEEDS = {
    "BTCUSDT": { current_price: 67605.95, trend: 'UP', neural_talk: "Deep liquidity detected at 67k.", rsi: 52 },
    "ETHUSDT": { current_price: 2498.38, trend: 'UP', neural_talk: "Consolidation above 2.4k support.", rsi: 48 },
    "BNBUSDT": { current_price: 618.12, trend: 'DOWN', neural_talk: "Resistance at 620 holding firm.", rsi: 45 },
    "SOLUSDT": { current_price: 210.45, trend: 'UP', neural_talk: "Bullish divergence on 15m chart.", rsi: 65 },
    "XRPUSDT": { current_price: 1.48, trend: 'DOWN', neural_talk: "Bearish pressure near 1.50 psychological level.", rsi: 38 },
    "DOGEUSDT": { current_price: 0.38, trend: 'UP', neural_talk: "Meme momentum building.", rsi: 55 },
    "SHIBUSDT": { current_price: 0.000025, trend: 'UP', neural_talk: "Whale accumulation in progress.", rsi: 50 },
    "PEPEUSDT": { current_price: 0.000018, trend: 'UP', neural_talk: "High volatility expected.", rsi: 51 }
};

const App = () => {
    const [activeCoin, setActiveCoin] = useState("BTCUSDT");
    const [allData, setAllData] = useState(INITIAL_DATA_SEEDS);
    const [isConnected, setIsConnected] = useState(false);
    const [activeTab, setActiveTab] = useState("BUY");

    useEffect(() => {
        connectWS();
    }, []);

    const connectWS = () => {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const productionHost = 'trading-jv2r.onrender.com';
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = isLocal ? 'localhost:8888' : productionHost;

        const socket = new WebSocket(`${wsProtocol}//${wsHost}/ws/trading`);

        socket.onopen = () => setIsConnected(true);
        socket.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                setAllData(prev => ({ ...prev, [data.symbol]: data }));
            } catch (err) { console.error(err); }
        };
        socket.onclose = () => {
            setIsConnected(false);
            setTimeout(connectWS, 2000);
        };
    };

    const data = allData[activeCoin] || INITIAL_DATA_SEEDS[activeCoin] || {};
    const topCoins = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "DOGEUSDT", "SHIBUSDT", "PEPEUSDT"];

    return (
        <div className="flex flex-col h-screen w-screen bg-[#0b0e11] text-[#eaecef] overflow-hidden font-sans">
            {/* COMPACT HEADER */}
            <header className="h-12 border-b border-[#2b3139] flex items-center justify-between px-4 bg-[#1e2329] z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Zap className="text-[#fcd535] w-5 h-5 fill-current" />
                        <span className="text-sm font-black tracking-tighter">RAPID <span className="text-[#fcd535]">X</span></span>
                    </div>

                    <div className="flex items-center gap-6 border-l border-[#2b3139] pl-6">
                        <div>
                            <p className="text-[10px] text-[#848e9c] font-bold">Pair</p>
                            <p className="text-xs font-bold">{activeCoin}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#848e9c] font-bold">Price</p>
                            <p className={`text-xs font-bold ${data.trend === 'UP' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                {formatPrice(data.current_price, activeCoin)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black border ${isConnected ? 'bg-[#0ecb81]/10 border-[#0ecb81]/20 text-[#0ecb81]' : 'bg-[#f6465d]/10 border-[#f6465d]/20 text-[#f6465d]'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#0ecb81] animate-pulse' : 'bg-[#f6465d]'}`}></div>
                        {isConnected ? 'LIVE' : 'OFFLINE'}
                    </div>
                </div>
            </header>

            {/* DASHBOARD GRID */}
            <main className="flex-1 grid grid-cols-[250px_1fr_300px] overflow-hidden">

                {/* LEFT: PAIRS & FEED */}
                <aside className="border-r border-[#2b3139] bg-[#161a1e] flex flex-col overflow-hidden">
                    <div className="p-2 border-b border-[#2b3139]">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-[#848e9c] w-3 h-3" />
                            <input type="text" placeholder="Pairs" className="w-full bg-[#0b0e11] border border-[#2b3139] rounded py-1.5 pl-7 pr-2 text-[10px] focus:outline-none" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-[10px]">
                            <thead className="text-[#848e9c] sticky top-0 bg-[#161a1e] z-10 border-b border-[#2b3139]">
                                <tr>
                                    <th className="px-3 py-1.5 font-bold uppercase">Sym</th>
                                    <th className="px-3 py-1.5 font-bold uppercase text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topCoins.map(coin => {
                                    const coinData = allData[coin] || INITIAL_DATA_SEEDS[coin] || {};
                                    return (
                                        <tr
                                            key={coin}
                                            onClick={() => setActiveCoin(coin)}
                                            className={`hover:bg-[#2b3139] cursor-pointer ${activeCoin === coin ? 'bg-[#2b3139]' : ''}`}
                                        >
                                            <td className="px-3 py-2 font-bold">{coin.replace("USDT", "")}</td>
                                            <td className={`px-3 py-2 text-right font-mono ${coinData.trend === 'UP' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                                {formatPrice(coinData.current_price, coin)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="h-[200px] border-t border-[#2b3139] p-3 bg-[#0b0e11]">
                        <WhaleTracker compact={true} />
                    </div>
                </aside>

                {/* CENTER: CHART & LOGS */}
                <section className="flex flex-col overflow-hidden">
                    <div className="flex-1 min-h-0 bg-black">
                        <TradingViewChart symbol={activeCoin} currentPrice={data.current_price} />
                    </div>

                    <div className="h-44 border-t border-[#2b3139] bg-[#161a1e] p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="text-[#fcd535] w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#848e9c]">AI Strategy Logs</span>
                        </div>
                        <div className="p-3 rounded bg-black/40 border border-[#2b3139] h-[calc(100%-24px)] overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-black px-1.5 rounded ${data.ai_prediction?.signal === 'BUY' ? 'bg-[#0ecb81] text-black' : 'bg-[#f6465d] text-white'}`}>
                                    {data.ai_prediction?.signal || 'WAITING'}
                                </span>
                                <span className="text-[9px] text-[#848e9c]">{new Date().toLocaleTimeString()}</span>
                            </div>
                            <p className="text-xs text-white/80 italic leading-relaxed">
                                {data.neural_talk || "Initializing neural filters..."}
                            </p>
                        </div>
                    </div>
                </section>

                {/* RIGHT: TERMINAL */}
                <aside className="border-l border-[#2b3139] bg-[#161a1e] flex flex-col overflow-hidden">
                    <div className="p-4 flex-1">
                        <div className="bg-[#0b0e11] p-1 rounded mb-4 flex">
                            <button onClick={() => setActiveTab("BUY")} className={`flex-1 py-1.5 text-[10px] font-black rounded ${activeTab === "BUY" ? 'bg-[#0ecb81] text-black' : 'text-[#848e9c]'}`}>BUY</button>
                            <button onClick={() => setActiveTab("SELL")} className={`flex-1 py-1.5 text-[10px] font-black rounded ${activeTab === "SELL" ? 'bg-[#f6465d] text-white' : 'text-[#848e9c]'}`}>SELL</button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 rounded bg-[#0b0e11] border border-[#2b3139]">
                                <p className="text-[9px] text-[#848e9c] mb-1">Target Price</p>
                                <p className="text-sm font-black text-[#0ecb81]">${formatPrice(data.ai_prediction?.prediction_target, activeCoin)}</p>
                            </div>
                            <div className="p-3 rounded bg-[#0b0e11] border border-[#2b3139]">
                                <p className="text-[9px] text-[#848e9c] mb-1">Stop Loss</p>
                                <p className="text-sm font-black text-[#f6465d]">${formatPrice(data.ai_prediction?.stop_loss, activeCoin)}</p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-[10px] px-1">
                                <span className="text-[#848e9c]">Wallet Balance</span>
                                <span className="font-bold">250.00 USDT</span>
                            </div>
                            <button className={`w-full py-3 rounded font-black text-xs ${activeTab === "BUY" ? 'bg-[#0ecb81] text-black' : 'bg-[#f6465d] text-white'}`}>
                                {activeTab} {activeCoin.replace("USDT", "")}
                            </button>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default App;
