import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const WhaleTracker = () => {
    const [whaleActivities, setWhaleActivities] = useState([]);

    useEffect(() => {
        // Initialize with some activities
        const initialActivities = generateInitialActivities();
        setWhaleActivities(initialActivities);

        // Simulate new whale activity every 10 seconds
        const interval = setInterval(() => {
            const newActivity = generateWhaleActivity();
            setWhaleActivities(prev => {
                const updated = [newActivity, ...prev];
                return updated.slice(0, 10); // Keep only last 10
            });
        }, 10000); // Every 10 seconds

        return () => clearInterval(interval);
    }, []);

    const generateInitialActivities = () => {
        const activities = [];
        const now = Date.now();
        const cryptos = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP', 'DOGE', 'MATIC', 'DOT', 'AVAX'];

        // Generate 10 activities (mix of BUY and SELL)
        for (let i = 0; i < 10; i++) {
            const isBuy = Math.random() > 0.5;
            const crypto = cryptos[Math.floor(Math.random() * cryptos.length)];
            const basePrice = crypto === 'BTC' ? 95000 :
                crypto === 'ETH' ? 2400 :
                    crypto === 'BNB' ? 310 :
                        crypto === 'SOL' ? 98 :
                            crypto === 'ADA' ? 0.45 :
                                crypto === 'XRP' ? 0.52 :
                                    crypto === 'DOGE' ? 0.08 :
                                        crypto === 'MATIC' ? 0.92 :
                                            crypto === 'DOT' ? 6.5 : 34;

            activities.push({
                id: `whale-${now}-${i}`,
                type: isBuy ? 'BUY' : 'SELL',
                crypto: crypto,
                amount: Math.floor(Math.random() * 500000) + 50000,
                price: (basePrice + (Math.random() - 0.5) * basePrice * 0.02).toFixed(crypto === 'BTC' || crypto === 'ETH' ? 2 : 4),
                timestamp: new Date(now - i * 60000).toLocaleTimeString(),
            });
        }

        return activities;
    };

    const generateWhaleActivity = () => {
        const types = ['BUY', 'SELL'];
        const type = types[Math.floor(Math.random() * types.length)];
        const cryptos = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP', 'DOGE', 'MATIC', 'DOT', 'AVAX'];
        const crypto = cryptos[Math.floor(Math.random() * cryptos.length)];
        const basePrice = crypto === 'BTC' ? 95000 :
            crypto === 'ETH' ? 2400 :
                crypto === 'BNB' ? 310 :
                    crypto === 'SOL' ? 98 :
                        crypto === 'ADA' ? 0.45 :
                            crypto === 'XRP' ? 0.52 :
                                crypto === 'DOGE' ? 0.08 :
                                    crypto === 'MATIC' ? 0.92 :
                                        crypto === 'DOT' ? 6.5 : 34;

        return {
            id: `whale-${Date.now()}-${Math.random()}`,
            type,
            crypto: crypto,
            amount: Math.floor(Math.random() * 500000) + 50000,
            price: (basePrice + (Math.random() - 0.5) * basePrice * 0.02).toFixed(crypto === 'BTC' || crypto === 'ETH' ? 2 : 4),
            timestamp: new Date().toLocaleTimeString(),
        };
    };

    const buyCount = whaleActivities.filter(w => w.type === 'BUY').length;
    const sellCount = whaleActivities.filter(w => w.type === 'SELL').length;

    return (
        <div className="bg-gradient-to-br from-black/90 to-black/50 rounded-[2rem] border border-white/5 p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FCD535]/10 rounded-xl flex items-center justify-center border border-[#FCD535]/20 animate-pulse">
                        <Activity className="w-5 h-5 text-[#FCD535]" />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-lg tracking-tight">Whale Activity Tracker</h3>
                        <p className="text-[#848E9C] text-[10px] font-bold uppercase tracking-widest">Last 10 Large Orders</p>
                    </div>
                </div>

                {/* Buy/Sell Count */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-black">{buyCount} BUY</span>
                    </div>
                    <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
                        <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-rose-400 text-xs font-black">{sellCount} SELL</span>
                    </div>
                </div>
            </div>

            {/* Activity List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                {whaleActivities.map((activity, index) => (
                    <div
                        key={activity.id}
                        className={`p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${activity.type === 'BUY'
                                ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
                                : 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'
                            } ${index === 0 ? 'animate-pulse' : ''}`}
                    >
                        <div className="flex items-center justify-between">
                            {/* Left: Type, Icon, and Crypto */}
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.type === 'BUY'
                                        ? 'bg-emerald-500/20'
                                        : 'bg-rose-500/20'
                                    }`}>
                                    {activity.type === 'BUY' ? (
                                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-rose-400" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm font-black ${activity.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                                            }`}>
                                            WHALE {activity.type}
                                        </p>
                                        {/* Crypto Symbol Badge */}
                                        <span className="bg-[#FCD535] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase">
                                            {activity.crypto}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-[#848E9C] font-bold">{activity.timestamp}</p>
                                </div>
                            </div>

                            {/* Right: Amount and Price */}
                            <div className="text-right">
                                <p className="text-white text-sm font-black font-mono">
                                    ${activity.amount.toLocaleString()} USDT
                                </p>
                                <p className="text-[#848E9C] text-[10px] font-mono">
                                    @ ${activity.price}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Summary */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-[#848E9C] font-bold uppercase tracking-widest">
                    Auto-updates every 10s
                </span>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="text-emerald-500 font-black uppercase">LIVE TRACKING</span>
                </div>
            </div>
        </div>
    );
};

export default WhaleTracker;
