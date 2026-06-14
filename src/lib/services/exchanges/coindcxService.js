// lib/services/exchanges/coindcxService.js
const axios = require('axios');
const crypto = require('crypto');
const https = require('https');
const ExchangeAdapter = require('./adapter.interface');

const COINDCX_BASE_URL = 'https://api.coindcx.com';
const agent = new https.Agent({ family: 4 }); // Force IPv4

class CoindcxAdapter extends ExchangeAdapter {
  constructor(apiKey, apiSecret) {
    super(apiKey, apiSecret);
  }

  _signPayload(body) {
    const payload = Buffer.from(JSON.stringify(body)).toString();
    const signature = crypto.createHmac('sha256', this.apiSecret).update(payload).digest('hex');
    return { payload, signature };
  }

  async getBalances() {
    try {
      const timestamp = Math.floor(Date.now());
      const body = { timestamp };
      const { signature } = this._signPayload(body);

      const res = await axios.post(`${COINDCX_BASE_URL}/exchange/v1/users/balances`, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-AUTH-APIKEY': this.apiKey,
          'X-AUTH-SIGNATURE': signature
        },
        timeout: 10000,
        httpsAgent: agent
      });

      return (res.data || [])
        .map(b => ({
          asset: b.currency,
          free: parseFloat(b.balance ?? 0),
          locked: parseFloat(b.locked_balance ?? 0),
          total: parseFloat(b.balance ?? 0) + parseFloat(b.locked_balance ?? 0)
        }))
        .filter(b => b.total > 0);
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      throw new Error(`CoinDCX getBalances failed: ${message}`);
    }
  }

  async getPortfolio(currency = 'USDT') {
    try {
      const balances = await this.getBalances();
      
      const tickersRes = await axios.get(`${COINDCX_BASE_URL}/exchange/ticker`);
      const priceMap = {};
      for (const t of tickersRes.data) {
        priceMap[t.market.toUpperCase()] = parseFloat(t.last_price);
      }

      const getPriceInSelectedCurrency = (asset) => {
        const symbol = asset.toUpperCase();
        if (symbol === currency.toUpperCase()) return 1;

        let key = `${symbol}${currency}`;
        if (priceMap[key]) return priceMap[key];
        
        // Try via USDT bridge
        if (currency !== "USDT" && priceMap[`${symbol}USDT`] && priceMap[`USDT${currency}`]) {
          return priceMap[`${symbol}USDT`] * priceMap[`USDT${currency}`];
        }
        
        // Try via BTC bridge
        if (priceMap[`${symbol}BTC`]) {
          const btcToSelected = currency === "BTC" ? 1 : priceMap[`BTC${currency}`];
          if (btcToSelected) return priceMap[`${symbol}BTC`] * btcToSelected;
        }
        return 0;
      };

      const portfolio = [];
      for (const b of balances) {
        const price = getPriceInSelectedCurrency(b.asset);
        portfolio.push({
          asset: b.asset,
          quantity: b.total,
          free: b.free,
          locked: b.locked,
          price,
          value: b.total * price,
        });
      }
      return portfolio;
    } catch (err) {
      console.error("CoinDCX getPortfolio error:", err.message);
      throw err;
    }
  }

  async placeOrder(params) {
    try {
      const { symbol, side, type, quantity, price } = params;
      const timestamp = Math.floor(Date.now());
      
      // CoinDCX specific mapping
      // Note: CoinDCX expects specific format for market, side, order_type
      const body = { 
        market: symbol, // e.g. "BTCUSDT" (or sometimes they expect "B-BTC_USDT", we'll assume platform normalizes this)
        side: side.toLowerCase(), // "buy" or "sell"
        order_type: type.toLowerCase() === 'limit' ? 'limit_order' : 'market_order',
        total_quantity: quantity,
        timestamp 
      };
      
      if (price && type.toLowerCase() === 'limit') {
        body.price_per_unit = price;
      }

      const { signature } = this._signPayload(body);

      const res = await axios.post(`${COINDCX_BASE_URL}/exchange/v1/orders/create`, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-AUTH-APIKEY': this.apiKey,
          'X-AUTH-SIGNATURE': signature,
        },
        httpsAgent: agent,
      });

      return {
        exchangeOrderId: String(res.data.orders[0]?.id || res.data.id),
        symbol: res.data.market,
        status: 'new', // Assuming it's new upon placement
        price: res.data.price_per_unit,
        origQty: res.data.total_quantity,
        side: res.data.side,
        type: type
      };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      throw new Error(`CoinDCX placeOrder failed: ${message}`);
    }
  }

  async cancelOrder(symbol, orderId) {
    try {
      const timestamp = Math.floor(Date.now());
      const body = { order_id: orderId, timestamp };
      const { signature } = this._signPayload(body);

      const res = await axios.post(`${COINDCX_BASE_URL}/exchange/v1/orders/cancel`, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-AUTH-APIKEY': this.apiKey,
          'X-AUTH-SIGNATURE': signature,
        },
        httpsAgent: agent,
      });

      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      throw new Error(`CoinDCX cancelOrder failed: ${message}`);
    }
  }

  async getOrders(symbol = null) {
    try {
      const timestamp = Math.floor(Date.now());
      const body = { timestamp };
      if (symbol) body.market = symbol;
      
      const { signature } = this._signPayload(body);

      const res = await axios.post(`${COINDCX_BASE_URL}/exchange/v1/orders`, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-AUTH-APIKEY': this.apiKey,
          'X-AUTH-SIGNATURE': signature,
        },
        httpsAgent: agent,
      });

      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      throw new Error(`CoinDCX getOrders failed: ${message}`);
    }
  }

  async getTicker(symbol) {
    try {
      const res = await axios.get(`${COINDCX_BASE_URL}/exchange/ticker`);
      const ticker = res.data.find(t => t.market.toUpperCase() === symbol.toUpperCase());
      return ticker ? parseFloat(ticker.last_price) : null;
    } catch {
      return null;
    }
  }

  async getTickers(symbols) {
    try {
      const res = await axios.get(`${COINDCX_BASE_URL}/exchange/ticker`);
      const map = {};
      const upperSymbols = symbols.map(s => s.toUpperCase());
      res.data.forEach(t => { 
        if (upperSymbols.includes(t.market.toUpperCase())) {
          map[t.market.toUpperCase()] = parseFloat(t.last_price);
        }
      });
      return map;
    } catch {
      return {};
    }
  }
}

module.exports = CoindcxAdapter;
