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

const App = () => {
    const [activeCoin, setActiveCoin] = useState("BTCUSDT");
    const [allData, setAllData] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const [activeTab, setActiveTab] = useState("BUY");

    const connectWS = () => {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const productionHost = 'trading-jv2r.onrender.com';
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = isLocal ? 'localhost:8888' : productionHost;

        const socket = new WebSocket(`${wsProtocol}//${wsHost}/ws/trading`);

        socket.onopen = () => {
            console.log("RAPID X Connected");
            setIsConnected(true);
        };
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

    useEffect(() => {
        connectWS();
    }, []);

    const data = allData[activeCoin] || {};
    const topCoins = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"];

    return (
        <div className="w-screen h-screen overflow-hidden flex flex-col bg-[#0b0e11] text-[#eaecef] font-sans">
            {/* ULTRA SLIM HEADER */}
            <header className="h-14 flex items-center justify-between px-6 bg-[#181a20] border-b border-white/5 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#FCD535] rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/10">
                            <Zap className="text-black w-5 h-5 fill-black" />
                        </div>
                        <span className="font-black text-lg tracking-tighter text-[#FCD535]">RAPID X</span>
                    </div>

                    {/* MINI TICKER BOXES */}
                    <div className="hidden xl:flex items-center gap-4 border-l border-white/10 pl-6 h-8">
                        {topCoins.map(coin => {
                            const coinData = allData[coin] || {};
                            return (
                                <div key={coin} onClick={() => setActiveCoin(coin)} className="cursor-pointer group">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-[#848e9c] group-hover:text-white">{coin.replace("USDT", "")}</span>
                                        <span className={`text-[11px] font-mono font-bold ${coinData.trend === 'UP' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                            {formatPrice(coinData.current_price, coin)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isConnected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#848e9c]">
                            {isConnected ? 'Live Sync' : 'Reconnecting...'}
                        </span>
                    </div>
                    <button className="bg-[#fcd535] text-black px-4 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-yellow-500/10 hover:brightness-110 active:scale-95 transition-all">Connect Wallet</button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* LEFT SIDEBAR: COIN LIST & WHALES */}
                <aside className="w-64 border-r border-white/5 bg-[#181a20] flex flex-col hidden lg:flex">
                    <div className="p-4 border-b border-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#848e9c]" />
                            <input type="text" placeholder="Search Market" className="w-full bg-white/5 pl-9 pr-4 py-2 rounded-lg text-xs outline-none border border-transparent focus:border-[#fcd535]/30" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="p-2 space-y-1">
                            {topCoins.map(coin => (
                                <button
                                    key={coin}
                                    onClick={() => setActiveCoin(coin)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeCoin === coin ? 'bg-[#2b2f36] shadow-xl' : 'hover:bg-white/5'}`}
                                >
                                    <span className="text-xs font-black">{coin.replace("USDT", "")}</span>
                                    <div className="text-right">
                                        <p className={`text-[11px] font-mono font-bold ${allData[coin]?.trend === 'UP' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                            {formatPrice(allData[coin]?.current_price, coin)}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="p-4 pt-10 border-t border-white/5">
                            <h3 className="text-[9px] font-black text-[#848e9c] uppercase tracking-widest mb-4">Deep Activity</h3>
                            <WhaleTracker compact={true} />
                        </div>
                    </div>
                </aside>

                {/* CENTER AREA: CHART & AI TERMINAL */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#0b0e11]">
                    {/* CHART SECTION */}
                    <div className="flex-1 relative border-b border-white/5">
                        <div className="absolute top-4 left-6 z-10 flex items-center gap-6 bg-[#181a20]/80 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl">
                            <div>
                                <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
                                    {activeCoin.replace("USDT", "")}
                                    <span className="bg-emerald-500/10 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded border border-emerald-500/20">LIVE</span>
                                </h1>
                                <p className={`text-2xl font-black font-mono leading-none ${data.trend === 'UP' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                                    {formatPrice(data.current_price, activeCoin)}
                                </p>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="hidden sm:block">
                                <p className="text-[9px] font-black text-[#848e9c] uppercase tracking-widest mb-1">RSI (30M)</p>
                                <p className={`text-sm font-black ${data.rsi > 60 ? 'text-rose-400' : data.rsi < 40 ? 'text-emerald-400' : 'text-white'}`}>
                                    {parseFloat(data.rsi || 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                        <TradingViewChart key={activeCoin} symbol={activeCoin.replace("USDT", "")} currentPrice={parseFloat(data.current_price)} />
                    </div>

                    {/* AI COMMANDS SECTION - CLEANER */}
                    <div className="h-64 bg-[#181a20] p-6 flex gap-6 border-t border-white/5">
                        <div className="flex-1 bg-gradient-to-br from-[#1e2329] to-[#0b0e11] rounded-3xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Cpu className="w-20 h-20 text-[#FCD535]" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                                    <span className="text-[10px] font-black text-[#FCD535] uppercase tracking-widest">Neural Strategy Active</span>
                                </div>
                                <h2 className="text-2xl font-black mb-1">{data.ai_prediction?.signal || "ANALYZING MARKET"}</h2>
                                <p className="text-xs text-[#848e9c] max-w-md">{data.ai_prediction?.reason || "Scanning depth and sentiment patterns for next move..."}</p>

                                <div className="mt-6 flex items-center gap-8">
                                    <div>
                                        <p className="text-[9px] font-black text-[#848e9c] uppercase tracking-widest mb-1 text-emerald-400">Target Exit (5-6%)</p>
                                        <p className="text-lg font-black font-mono">${formatPrice(data.ai_prediction?.prediction_target, activeCoin)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-[#848e9c] uppercase tracking-widest mb-1 text-rose-400">Security SL (2-3%)</p>
                                        <p className="text-lg font-black font-mono">${formatPrice(data.ai_prediction?.stop_loss, activeCoin)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-80 bg-[#1e2329]/50 rounded-3xl p-6 border border-white/5 flex flex-col gap-4">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">Neural Talk</span>
                                <Activity className="w-3.5 h-3.5 text-[#FCD535]" />
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[11px] leading-relaxed text-[#eaecef]">
                                        "{data.neural_talk || "Preparing AI sentiment analysis for current price action..."}"
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between px-2">
                                    <span className="text-[9px] font-black text-[#848e9c] uppercase tracking-widest">Next Gem Hint</span>
                                    <span className="text-[11px] font-black text-[#FCD535] px-2 py-0.5 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                        {data.best_gem_hint || "..."}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR: ORDERBOOK & TERMINAL */}
                <aside className="w-80 border-l border-white/5 bg-[#181a20] flex flex-col hidden sm:flex">
                    <div className="flex items-center bg-[#1e2329] p-1 mx-4 mt-6 rounded-xl">
                        <button onClick={() => setActiveTab("BUY")} className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'BUY' ? 'bg-[#0ecb81] text-black shadow-lg shadow-emerald-500/20' : 'text-[#848e9c]'}`}>Buy</button>
                        <button onClick={() => setActiveTab("SELL")} className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'SELL' ? 'bg-[#f6465d] text-white shadow-lg shadow-rose-500/20' : 'text-[#848e9c]'}`}>Sell</button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <p className="text-[9px] font-black text-[#848e9c] uppercase tracking-widest mb-2 ml-1">Order Volume</p>
                                <input type="text" placeholder="0.00" className="w-full bg-[#2b2f36] p-4 rounded-xl outline-none text-white text-sm font-black border border-transparent focus:border-[#fcd535]/30 flex items-center justify-between" />
                                <span className="absolute right-4 top-10 text-[10px] font-black text-[#FCD535]">USDT</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#2b2f36] p-3 rounded-xl border border-white/5">
                                    <p className="text-[8px] text-[#848e9c] font-black uppercase mb-1">Leverage</p>
                                    <p className="text-xs font-black">20x CROSS</p>
                                </div>
                                <div className="bg-[#2b2f36] p-3 rounded-xl border border-white/5">
                                    <p className="text-[8px] text-[#848e9c] font-black uppercase mb-1">Mode</p>
                                    <p className="text-xs font-black text-emerald-400">SHIELD ON</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h3 className="text-[10px] font-black text-[#848e9c] uppercase tracking-widest">Order Book</h3>
                            <div className="space-y-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="flex justify-between text-[11px] font-mono group hover:bg-white/5 p-1 rounded transition-all relative">
                                        <div className="absolute right-0 top-0 bottom-0 bg-rose-500/5 transition-all" style={{ width: `${Math.random() * 80}%` }}></div>
                                        <span className="text-[#f6465d] font-bold">${formatPrice(parseFloat(data.current_price) + i * 0.5, activeCoin)}</span>
                                        <span className="text-[#848e9c] group-hover:text-white transition-colors">{(Math.random() * 0.2).toFixed(3)}</span>
                                    </div>
                                ))}
                                <div className="py-3 text-center">
                                    <p className={`text-lg font-black font-mono ${data.trend === 'UP' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{formatPrice(data.current_price, activeCoin)}</p>
                                </div>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="flex justify-between text-[11px] font-mono group hover:bg-white/5 p-1 rounded transition-all relative">
                                        <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/5 transition-all" style={{ width: `${Math.random() * 80}%` }}></div>
                                        <span className="text-[#0ecb81] font-bold">${formatPrice(parseFloat(data.current_price) - i * 0.5, activeCoin)}</span>
                                        <span className="text-[#848e9c] group-hover:text-white transition-colors">{(Math.random() * 0.2).toFixed(3)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${activeTab === 'BUY' ? 'bg-emerald-500 text-black shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'}`}>
                            {activeTab} {activeCoin.replace("USDT", "")}
                        </button>
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default App;
