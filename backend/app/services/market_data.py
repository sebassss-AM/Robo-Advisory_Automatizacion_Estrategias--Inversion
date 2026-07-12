import time

_CACHE: dict[str, tuple[float, dict]] = {}
_CACHE_TTL = 300


def _get_ticker_info(ticker: str) -> dict | None:
    now = time.time()
    cached = _CACHE.get(ticker)
    if cached and (now - cached[0]) < _CACHE_TTL:
        return cached[1]

    try:
        import yfinance as yf

        t = yf.Ticker(ticker)
        info = t.info or {}
        hist = t.history(period="1mo")

        price = info.get("regularMarketPrice") or info.get("currentPrice") or info.get("previousClose")
        if not price and not hist.empty:
            price = round(float(hist["Close"].iloc[-1]), 2)
        ytd_change = None
        ytd_hist = t.history(period="ytd")
        if not ytd_hist.empty:
            ytd_start = float(ytd_hist["Close"].iloc[0])
            ytd_end = float(ytd_hist["Close"].iloc[-1])
            ytd_change = round((ytd_end - ytd_start) / ytd_start * 100, 2)

        result = {
            "ticker": ticker,
            "name": info.get("longName") or info.get("shortName") or ticker,
            "price": price,
            "pe_ratio": info.get("trailingPE") or info.get("forwardPE"),
            "dividend_yield": (
                round(info.get("dividendYield", 0), 2)
                if info.get("dividendYield")
                else None
            ),
            "ytd_return": ytd_change,
            "sector": info.get("sector"),
            "currency": info.get("currency") or "USD",
        }
        _CACHE[ticker] = (now, result)
        return result
    except Exception:
        return None



