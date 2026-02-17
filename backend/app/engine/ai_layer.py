import os
import openai
from dotenv import load_dotenv

load_dotenv()

class AIDecisionLayer:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if self.api_key:
            openai.api_key = self.api_key

    def get_decision(self, market_data):
        """
        Processes market data and returns BUY/SELL/HOLD decision with reasoning.
        market_data: dict containing current price, indicators, and trend.
        """
        trend = market_data.get("trend")
        rsi = market_data.get("rsi")
        ema_cross = market_data.get("ema_9") > market_data.get("ema_21")
        
        # Rule-based fallback or primary logic
        decision = "HOLD"
        reason = "Market is currently stable with no strong directional signals."
        
        if trend == "BULLISH" and rsi < 70 and ema_cross:
            decision = "BUY"
            reason = f"Trend is Bullish with EMA 9/21 cross-up confirmation and RSI at {rsi:.2f} (not overbought)."
        elif trend == "BEARISH" and rsi > 30 and not ema_cross:
            decision = "SELL"
            reason = f"Trend is Bearish with EMA 9/21 cross-down and RSI at {rsi:.2f} (not oversold)."
        
        # If OpenAI is available, we could enhance the 'reason' or the 'decision'
        # For now, we return the structured logic
        return {
            "decision": decision,
            "reason": reason,
            "confidence": 85 if decision != "HOLD" else 50
        }
