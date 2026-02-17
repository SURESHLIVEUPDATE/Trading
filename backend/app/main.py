import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.engine.binance_client import BinanceManager
from app.engine.strategy import StrategyEngine
from app.engine.ai_layer import AIDecisionLayer
import pandas as pd

app = FastAPI(title="Smart Trading Bot API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.engine.news_fetcher import NewsFetcher
from app.engine.risk_manager import RiskManager

binance_mgr = BinanceManager(testnet=False)
strategy_eng = StrategyEngine()
ai_layer = AIDecisionLayer()
news_fetcher = NewsFetcher()
risk_mgr = RiskManager()

# Global state for demonstration
active_position = {
    "entry_price": 42000.0,
    "amount": 0.1,
    "is_open": True
}

@app.on_event("startup")
async def startup_event():
    try:
        await asyncio.wait_for(binance_mgr.init_client(), timeout=5.0)
        print("DEBUG: Binance Engine Initialized")
    except Exception as e:
        print(f"DEBUG: Initial Binance connection skipped ({e}). Re-trying on first request.")

@app.on_event("shutdown")
async def shutdown_event():
    try:
        await binance_mgr.close()
    except: pass

@app.get("/")
async def root():
    return {"status": "Trade Engine Online", "environment": "Binance Testnet"}

# Persistent Market History Manager
class MarketHistoryManager:
    def __init__(self, window_size=50):
        self.history = {} # {symbol: [prices]}
        self.window_size = window_size

    def add_price(self, symbol, price):
        if symbol not in self.history:
            # Seed with some initial noise for TA depth
            import random
            self.history[symbol] = [price * (1 + random.uniform(-0.005, 0.005)) for _ in range(self.window_size)]
        
        self.history[symbol].append(price)
        if len(self.history[symbol]) > self.window_size:
            self.history[symbol].pop(0)
    
    def get_df(self, symbol):
        prices = self.history.get(symbol, [])
        return pd.DataFrame({
            "close": prices,
            "high": [p * 1.002 for p in prices],
            "low": [p * 0.998 for p in prices]
        })

history_mgr = MarketHistoryManager()
signal_lock = {} # {symbol: {"signal": str, "expiry": float}}

@app.websocket("/ws/trading")
async def trading_socket(websocket: WebSocket):
    print("DEBUG: New WebSocket connection request received")
    await websocket.accept()
    print("DEBUG: WebSocket connection accepted")
    try:
        news = []
        try: news = await asyncio.wait_for(news_fetcher.fetch_latest_news(), timeout=2.0)
        except: pass
        
        symbols = await binance_mgr.get_top_usdt_pairs()
        first_run = True
        
        async for ticker in binance_mgr.get_ticker_stream(symbols):
            symbol = ticker['symbol']
            current_price = float(ticker['price'])
            
            # 1. Update Persistent History
            history_mgr.add_price(symbol, current_price)
            df = history_mgr.get_df(symbol)
            
            # 2. Stable TA Calculation
            df = strategy_eng.calculate_indicators(df)
            trend = strategy_eng.detect_trend(df)
            
            # 3. Aggressive AI Strategy with Stability Lock
            import time
            now = time.time()
            
            if symbol not in signal_lock or now > signal_lock[symbol].get('expiry', 0):
                ai_pred = strategy_eng.get_ai_prediction(df)
                signal_lock[symbol] = {
                    "data": ai_pred,
                    "expiry": now + 5.0 
                }
            
            stable_ai_pred = signal_lock[symbol]["data"]

            # Whale Tracking Simulation
            import random
            is_whale = random.random() > 0.98
            whale_action = random.choice(["BUY", "SELL"]) if is_whale else None
            whale_amount = random.uniform(50000, 300000) if is_whale else 0

            # Recommendation Logic
            recommended_buy = current_price * 0.998
            recommended_sell = current_price * 1.002
            if 'BUY' in stable_ai_pred['signal']:
                recommended_buy = current_price * 0.999
                recommended_sell = stable_ai_pred['prediction_target']
            elif 'SELL' in stable_ai_pred['signal']:
                recommended_buy = stable_ai_pred['prediction_target']
                recommended_sell = current_price * 1.001

            payload = {
                "symbol": symbol,
                "current_price": current_price,
                "bid": ticker['bid'],
                "ask": ticker['ask'],
                "trend": trend,
                "ai_prediction": stable_ai_pred,
                "whale_alert": {
                    "active": is_whale,
                    "side": whale_action,
                    "amount_usdt": f"{whale_amount:,.0f}"
                },
                "neural_talk": stable_ai_pred.get("neural_talk", "Analyzing market depth..."),
                "best_gem_hint": symbol.replace("USDT", ""),
                "recommended_buy": recommended_buy,
                "recommended_sell": recommended_sell,
                "rsi": float(df['rsi'].iloc[-1]),
                "news": news if first_run else (news if random.random() > 0.95 else None),
                "timestamp": pd.Timestamp.now().isoformat()
            }
            first_run = False
            
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(0.1) # Rapid updates for that premium feel

    except WebSocketDisconnect:
        print("Market Terminal Disconnected")
    except Exception as e:
        print(f"Global WS Error: {e}")

@app.post("/api/futures/order")
async def place_futures_order(order: dict):
    """
    Simulates placing a Binance Futures order (Long/Short).
    """
    symbol = order.get("symbol", "BTCUSDT")
    side = order.get("side", "BUY")
    leverage = order.get("leverage", 10)
    
    # In production, use client.futures_create_order(...)
    print(f"FUTURES ORDER: {side} {symbol} at {leverage}x Leverage")
    
    return {
        "status": "SUCCESS",
        "order_id": "FUT-12345678",
        "symbol": symbol,
        "side": side,
        "leverage": leverage,
        "message": f"Position opened for {symbol} ({side})"
    }

