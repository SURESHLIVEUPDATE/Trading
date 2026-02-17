class RiskManager:
    def __init__(self, risk_per_trade_percent=2.0):
        self.risk_per_trade_percent = risk_per_trade_percent
        self.stop_loss_distance = 1.5  # % below/above entry
        self.take_profit_distance = 3.0 # % target
        self.active_position = None

    def calculate_position_size(self, balance, current_price):
        """Calculates amount to buy based on risk % of balance."""
        risk_amount = balance * (self.risk_per_trade_percent / 100)
        # Position size in base currency
        # This is simplified; usually risk_amount / (price - stop_loss)
        return risk_amount / current_price

    def get_dynamic_stop_loss(self, entry_price, market_trend, current_price):
        """
        Adjusts stop loss dynamically.
        - If BULLISH: Trail stop loss upwards to protect profit.
        - If BEARISH (and we are long): Tighten stop loss significantly.
        """
        if not self.active_position:
            return None

        current_profit = (current_price - entry_price) / entry_price * 100

        # Protect profit: If we are 1% in profit, set stop loss at break-even
        if current_profit > 1.0:
            suggested_sl = entry_price * (1 + 0.002) # Entry + 0.2%
        else:
            suggested_sl = entry_price * (1 - (self.stop_loss_distance / 100))

        # Trail stop loss if market is strongly bullish
        if market_trend == "BULLISH" and current_profit > 2.0:
            suggested_sl = current_price * 0.99 # Keep stop 1% below current price

        return suggested_sl

    def evaluate_exit(self, current_price, stop_loss, take_profit):
        """Checks if we should exit based on SL or TP."""
        if current_price <= stop_loss:
            return "EXIT_STOP_LOSS"
        if current_price >= take_profit:
            return "EXIT_TAKE_PROFIT"
        return "HOLD"
