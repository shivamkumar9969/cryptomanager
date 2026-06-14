// lib/services/exchanges/binanceService.js
const axios = require('axios');
const crypto = require('crypto');
const ExchangeAdapter = require('./adapter.interface');

const BINANCE_BASE_URL = 'https://api.binance.com';

class BinanceAdapter extends ExchangeAdapter {
  constructor(apiKey, apiSecret) {
    super(apiKey, apiSecret);
  }

  _signQuery(queryString) {
    return crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
  }

  async getBalances() {
    try {
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}&omitZeroBalances=true`;
      const signature = this._signQuery(queryString);
      
      const res = await axios.get(`${BINANCE_BASE_URL}/api/v3/account`, {
        headers: { "X-MBX-APIKEY": this.apiKey },
        params: { timestamp, omitZeroBalances: true, signature },
        timeout: 10000,
      });

      return res.data.balances
        .filter(b => parseFloat(b.free) + parseFloat(b.locked) > 0)
        .map(b => ({
          asset: b.asset,
          free: parseFloat(b.free),
          locked: parseFloat(b.locked),
          total: parseFloat(b.free) + parseFloat(b.locked)
        }));
    } catch (err) {
      const message = err.response?.data?.msg || err.message;
      throw new Error(`Binance getBalances failed: ${message}`);
    }
  }

  async getPortfolio(currency = 'USDT') {
    try {
      const balances = await this.getBalances();
      
      const symbolSet = new Set(
        balances
          .filter(b => b.asset !== currency)
          .map(b => `${b.asset}${currency}`)
      );

      let prices = {};
      if (symbolSet.size > 0 && ["USDT", "BTC", "ETH", "BNB"].includes(currency.toUpperCase())) {
        try {
          const priceRes = await axios.get(`${BINANCE_BASE_URL}/api/v3/ticker/price`, {
            params: { symbols: JSON.stringify(Array.from(symbolSet)) },
          });
          (priceRes.data || []).forEach((p) => {
            prices[p.symbol] = parseFloat(p.price);
          });
        } catch { /* fallback silent */ }
      }

      // We'll skip complex fiat logic here and offload it to a priceService later if needed.
      // For now, assuming USD/USDT parity for simplicity, or direct Binance pair matches.
      
      const portfolio = [];
      for (const b of balances) {
        let price = 0;
        if (b.asset === currency) {
          price = 1;
        } else {
          const directSymbol = `${b.asset}${currency}`;
          if (prices[directSymbol]) price = prices[directSymbol];
          // If no direct pair, we default to 0 for MVP
        }

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
      console.error("Binance getPortfolio error:", err.message);
      throw err;
    }
  }

  async placeOrder(params) {
    try {
      const { symbol, side, type, quantity, price } = params;
      const timestamp = Date.now();
      
      const orderParams = { symbol, side: side.toUpperCase(), type: type.toUpperCase(), quantity, timestamp };
      if (price && type.toUpperCase() === 'LIMIT') {
        orderParams.price = price;
        orderParams.timeInForce = 'GTC';
      }

      const query = new URLSearchParams(orderParams).toString();
      const signature = this._signQuery(query);
      
      const res = await axios.post(
        `${BINANCE_BASE_URL}/api/v3/order?${query}&signature=${signature}`,
        {},
        { headers: { 'X-MBX-APIKEY': this.apiKey } }
      );
      
      return {
        exchangeOrderId: String(res.data.orderId),
        symbol: res.data.symbol,
        status: res.data.status.toLowerCase(), // new, partially_filled, filled, canceled
        price: res.data.price,
        origQty: res.data.origQty,
        executedQty: res.data.executedQty,
        side: res.data.side.toLowerCase(),
        type: res.data.type.toLowerCase()
      };
    } catch (err) {
      const message = err.response?.data?.msg || err.message;
      throw new Error(`Binance placeOrder failed: ${message}`);
    }
  }

  async cancelOrder(symbol, orderId) {
    try {
      const timestamp = Date.now();
      const query = new URLSearchParams({ symbol, orderId, timestamp }).toString();
      const signature = this._signQuery(query);
      
      const res = await axios.delete(
        `${BINANCE_BASE_URL}/api/v3/order?${query}&signature=${signature}`,
        { headers: { 'X-MBX-APIKEY': this.apiKey } }
      );
      return res.data;
    } catch (err) {
      const message = err.response?.data?.msg || err.message;
      throw new Error(`Binance cancelOrder failed: ${message}`);
    }
  }

  async getOrders(symbol = null) {
    try {
      const timestamp = Date.now();
      const queryParams = { timestamp };
      if (symbol) queryParams.symbol = symbol;
      
      const query = new URLSearchParams(queryParams).toString();
      const signature = this._signQuery(query);
      
      const res = await axios.get(
        `${BINANCE_BASE_URL}/api/v3/openOrders?${query}&signature=${signature}`,
        { headers: { 'X-MBX-APIKEY': this.apiKey } }
      );
      return res.data;
    } catch (err) {
      const message = err.response?.data?.msg || err.message;
      throw new Error(`Binance getOrders failed: ${message}`);
    }
  }

  async getTicker(symbol) {
    try {
      const res = await axios.get(`${BINANCE_BASE_URL}/api/v3/ticker/price`, {
        params: { symbol: symbol.toUpperCase() }
      });
      return parseFloat(res.data.price);
    } catch {
      return null;
    }
  }
  
  async getTickers(symbols) {
    try {
      const res = await axios.get(`${BINANCE_BASE_URL}/api/v3/ticker/price`, {
        params: { symbols: JSON.stringify(symbols.map(s => s.toUpperCase())) }
      });
      const map = {};
      res.data.forEach(t => { map[t.symbol] = parseFloat(t.price); });
      return map;
    } catch {
      return {};
    }
  }
}

module.exports = BinanceAdapter;
