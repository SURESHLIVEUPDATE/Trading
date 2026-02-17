import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const WhaleTracker = ({ compact = false }) => {
    const [whaleActivities, setWhaleActivities] = useState([]);

    useEffect(() => {
        const initialActivities = generateInitialActivities();
        setWhaleActivities(initialActivities);

        const interval = setInterval(() => {
            const newActivity = generateWhaleActivity();
            setWhaleActivities(prev => [newActivity, ...prev].slice(0, 5));
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const generateInitialActivities = () => {
        const cryptos = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'];
        return Array.from({ length: 5 }).map((_, i) => ({
            id: `whale-${Date.now()}-${i}`,
            type: Math.random() > 0.5 ? 'BUY' : 'SELL',
            crypto: cryptos[i % cryptos.length],
            amount: Math.floor(Math.random() * 200000) + 50000,
            price: (67500 + Math.random() * 100).toFixed(2),
            timestamp: "Just Now"
        }));
    };

    const generateWhaleActivity = () => {
        const cryptos = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'];
        return {
            id: `whale-${Date.now()}`,
            type: Math.random() > 0.5 ? 'BUY' : 'SELL',
            crypto: cryptos[Math.floor(Math.random() * cryptos.length)],
            amount: Math.floor(Math.random() * 300000) + 50000,
            price: (67500 + Math.random() * 100).toFixed(2),
            timestamp: "Now"
        };
    };

    if (compact) {
        return (
            <div className="space-y-3">
                {whaleActivities.map(activity => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                            <span className={`w-1 h-4 rounded-full ${activity.type === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            <span className="text-[10px] font-black">{activity.crypto}</span>
                        </div>
                        <span className={`text-[10px] font-mono ${activity.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            ${(activity.amount / 1000).toFixed(0)}k
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-[#181a20] rounded-3xl border border-white/5 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-[#FCD535]" />
                    <h3 className="text-white font-black text-sm uppercase tracking-widest">Whale Pulse</h3>
                </div>
            </div>
            <div className="space-y-3">
                {whaleActivities.map(activity => (
                    <div key={activity.id} className={`p-4 rounded-2xl border ${activity.type === 'BUY' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'}`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className={`text-[10px] font-black ${activity.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>{activity.type} {activity.crypto}</p>
                                <p className="text-[9px] text-[#848e9c] font-bold">{activity.timestamp}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black font-mono">${activity.amount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WhaleTracker;
