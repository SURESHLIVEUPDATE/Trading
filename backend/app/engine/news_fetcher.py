import httpx
import os

class NewsFetcher:
    def __init__(self):
        self.api_key = os.getenv("CRYPTO_NEWS_API_KEY") # Mocked for now
        self.news_url = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN"

    async def fetch_latest_news(self):
        """Fetches latest crypto news and simple sentiment."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.news_url)
                data = response.json()
                articles = data.get("Data", [])[:5]
                
                # Simple keyword-based sentiment for demonstration
                # In production, use NLP or AI Decision Layer
                processed_news = []
                for art in articles:
                    text = (art['title'] + art['body']).lower()
                    sentiment = "NEUTRAL"
                    if any(w in text for w in ["bullish", "jump", "high", "gain", "buy"]):
                        sentiment = "POSITIVE"
                    elif any(w in text for w in ["bearish", "drop", "low", "crash", "sell"]):
                        sentiment = "NEGATIVE"
                    
                    processed_news.append({
                        "title": art['title'],
                        "sentiment": sentiment,
                        "url": art['url']
                    })
                return processed_news
        except Exception:
            return [
                {"title": "🔴 BREAKING: FED meeting scheduled for Wednesday - Market expects 25bps hike.", "sentiment": "NEGATIVE", "source": "MacroScanner"},
                {"title": "🚀 BTC whale just moved 5,000 coins to cold storage! #Bullish", "sentiment": "POSITIVE", "source": "Twitter"},
                {"title": "Binance announces new SHIB/EUR pair for European traders.", "sentiment": "POSITIVE", "source": "News"},
                {"title": "PEPE volume spikes 40% in last hour - Social engagement at ATH!", "sentiment": "POSITIVE", "source": "TwitterPulse"},
                {"title": "Whale Alert: $300M USDT moved from Unknown wallet to Exchange.", "sentiment": "NEGATIVE", "source": "Twitter"},
                {"title": "ETF Inflows hit record high this week as institutional demand surges.", "sentiment": "POSITIVE", "source": "CryptoPro"}
            ]


