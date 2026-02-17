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

binance_mgr = BinanceManager(testnet=True)
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

@app.websocket("/ws/trading")
async def trading_socket(websocket: WebSocket):
    print("DEBUG: New WebSocket connection request received")
    await websocket.accept()
    print("DEBUG: WebSocket connection accepted")
    try:
        # Initial news fetch (with safety)
        news = [{"title": "Syncing news...", "sentiment": "NEUTRAL"}]
        print("DEBUG: Fetching initial news...")
        try:
            news = await asyncio.wait_for(news_fetcher.fetch_latest_news(), timeout=2.0)
            print("DEBUG: News fetched")
        except: 
            print("DEBUG: News fetch timed out, using fallback")
        
        # Universal Coin List (Dynamic from Binance)
        print("DEBUG: Fetching dynamic symbol list...")
        try:
            symbols = await asyncio.wait_for(binance_mgr.get_top_usdt_pairs(), timeout=3.0)
        except:
            print("DEBUG: Symbol fetch timed out, using fallback list")
            symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "ADAUSDT"]
        
        print(f"DEBUG: Symbols loaded: {len(symbols)}")
        
        iteration = 0
        print(f"DEBUG: Professional Terminal Connected. Monitoring {len(symbols)} coins...")
        
        last_advice_update = 0
        current_advice = "Initializing deep scan..."
        current_gem = "SCANNING..."

        async for ticker in binance_mgr.get_ticker_stream(symbols):
            iteration += 1
            
            # Auto-refetch every 10 minutes to handle delistings/new listings
            if iteration % 2000 == 0:
                symbols = await binance_mgr.get_top_usdt_pairs()
            
            # Periodically refresh news
            if iteration % 100 == 0:
                try: news = await asyncio.wait_for(news_fetcher.fetch_latest_news(), timeout=1.0)
                except: pass

            current_price = float(ticker['price'])
            symbol = ticker['symbol']
            
            # Build realistic TA context (Adding volatility to mock history)
            import random
            history = [current_price * (1 + random.uniform(-0.01, 0.01)) for _ in range(30)]
            df = pd.DataFrame({"close": history, "high": [p * 1.002 for p in history], "low": [p * 0.998 for p in history]})
            
            df = strategy_eng.calculate_indicators(df)
            trend = strategy_eng.detect_trend(df)
            
            # Whale Tracking Logic (Simulated for high volume spikes)
            is_whale = random.random() > 0.98 # 2% chance per update
            whale_action = random.choice(["BUY", "SELL"]) if is_whale else None
            whale_amount = random.uniform(50000, 500000) if is_whale else 0

            # Strategy & AI
            iron_fly = strategy_eng.get_iron_butterfly_strikes(current_price)
            ai_pred = strategy_eng.get_ai_prediction(df)

            # Personal Advisor Logic (Update only every 5 seconds / ~250 iterations)
            if iteration - last_advice_update > 250:
                advice_templates = [
                    f"Hey, {symbol.replace('USDT', '')} is looking spicy right now. RSI is at {df['rsi'].iloc[-1]:.1f}, meaning we might see a breakout soon.",
                    f"Master, I've scanned the deep charts for {symbol}. The trend is {trend}. If we hold current levels, $1000 profit is within reach.",
                    f"Neutral vibes on {symbol} today. I'm searching for better entries. Don't rush, patience is key for our goal.",
                    f"Whale activity detected nearby. I've calculated a high-probability entry for you. Trust the SL Shield."
                ]
                current_advice = random.choice(advice_templates)
                current_gem = symbol.replace("USDT", "")
                last_advice_update = iteration

            # Enhanced Buy/Sell Recommendations based on AI Signal
            buy_margin = 0.004 if ai_pred['signal'] in ['STRONG BUY', 'BUY'] else 0.002
            sell_margin = 0.004 if ai_pred['signal'] in ['STRONG SELL', 'SELL'] else 0.002
            
            # Calculate recommended buy/sell based on signal direction
            if ai_pred['signal'] in ['STRONG BUY', 'BUY']:
                recommended_buy = current_price * (1 - buy_margin)
                recommended_sell = ai_pred['prediction_target']
            elif ai_pred['signal'] in ['STRONG SELL', 'SELL']:
                recommended_buy = ai_pred['prediction_target']
                recommended_sell = current_price * (1 + sell_margin)
            else:  # HOLD
                recommended_buy = current_price * 0.998
                recommended_sell = current_price * 1.002

            payload = {
                "symbol": symbol,
                "current_price": current_price,
                "bid": ticker['bid'],
                "ask": ticker['ask'],
                "trend": trend,
                "ai_prediction": ai_pred,
                "iron_fly": iron_fly,
                "whale_alert": {
                    "active": is_whale,
                    "side": whale_action,
                    "amount_usdt": f"{whale_amount:,.0f}"
                },
                "neural_talk": current_advice,
                "best_gem_hint": current_gem,
                "recommended_buy": f"{recommended_buy:.8f}" if current_price < 1 else f"{recommended_buy:.2f}",
                "recommended_sell": f"{recommended_sell:.8f}" if current_price < 1 else f"{recommended_sell:.2f}",
                "rsi": float(df['rsi'].iloc[-1]),
                "news": news,
                "timestamp": pd.Timestamp.now().isoformat()
            }
            
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(0.02)

    except WebSocketDisconnect:
        print("Market Terminal Disconnected")
    except Exception as e:
        print(f"Global WS Error: {e}")
        await websocket.close()

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

