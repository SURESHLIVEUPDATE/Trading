import os
import asyncio
from dotenv import load_dotenv
from binance import AsyncClient, BinanceSocketManager

load_dotenv()

DEFAULT_SYMBOLS = ["BTCUSDT", "ETHUSDT", "DOGEUSDT", "SHIBUSDT", "PEPEUSDT"]

class BinanceManager:

    def __init__(self, api_key=None, api_secret=None, testnet=True):
        self.api_key = api_key or os.getenv("BINANCE_API_KEY")
        self.api_secret = api_secret or os.getenv("BINANCE_API_SECRET")
        self.testnet = testnet
        self.client = None
        self.bsm = None

    async def init_client(self):
        self.client = await AsyncClient.create(self.api_key, self.api_secret, testnet=self.testnet)
        self.bsm = BinanceSocketManager(self.client)
        return self.client

    async def get_top_usdt_pairs(self):
        """Fetches all active USDT pairs from Binance ExchangeInfo."""
        try:
            if not self.client:
                await self.init_client()
            info = await self.client.get_exchange_info()
            # Filter all active USDT pairs
            pairs = [s['symbol'] for s in info['symbols'] if s['status'] == 'TRADING' and s['symbol'].endswith('USDT')]
            return pairs[:100] # Return top 100 for stability
        except Exception:
            # Fallback if API fails
            return ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"]

    async def get_ticker_stream(self, symbols=None):
        """Streams real-time ticker data with fallback to mock data."""
        if not symbols:
            symbols = await self.get_top_usdt_pairs()
            
        try:
            if not self.bsm:
                await self.init_client()
            
            streams = [f"{s.lower()}@ticker" for s in symbols]
            async with self.bsm.multiplex_socket(streams) as stream:
                while True:
                    try:
                        res = await asyncio.wait_for(stream.recv(), timeout=5.0)
                        if res:
                            yield {
                                "symbol": res['s'],
                                "price": res['c'],
                                "bid": res['b'],
                                "ask": res['a'],
                                "spread": float(res['a']) - float(res['b']),
                                "high": res['h'],
                                "low": res['l']
                            }
                    except asyncio.TimeoutError:
                        print("DEBUG: Binance stream timeout, switching to Mock mode for UI responsiveness")
                        raise Exception("Binance Timeout Fallback")
        except Exception as e:
            print(f"DEBUG: Binance connection failed ({e}), switching to Multi-Coin Mock Mode")
            # Fallback Mock Data for all symbols
            import random
            
            # Universal Mock Start Prices
            prices = {s: 1.0 for s in symbols}
            # Specific high-cap starting prices
            seed_prices = {"BTCUSDT": 96500.0, "ETHUSDT": 2400.0, "BNBUSDT": 600.0, "SOLUSDT": 210.0, "XRPUSDT": 2.50}
            for s, p in seed_prices.items():
                if s in prices: prices[s] = p

            while True:
                for symbol in symbols:
                    volatility = prices[symbol] * 0.002
                    prices[symbol] += random.uniform(-volatility, volatility)
                    
                    price = prices[symbol]
                    # Smart Precision: Small prices get more decimals
                    precision = 8 if price < 0.01 else (4 if price < 10 else 2)
                    
                    price_str = f"{price:.{precision}f}"
                    bit_str = f"{price * 0.999:.{precision}f}"
                    ask_str = f"{price * 1.001:.{precision}f}"
                    
                    yield {
                        "symbol": symbol,
                        "price": price_str,
                        "bid": bit_str,
                        "ask": ask_str,
                        "spread": float(ask_str) - float(bit_str),
                        "high": f"{price * 1.02:.{precision}f}",
                        "low": f"{price * 0.98:.{precision}f}"
                    }

                await asyncio.sleep(0.3)


    async def close(self):
        if self.client:
            await self.client.close_connection()
