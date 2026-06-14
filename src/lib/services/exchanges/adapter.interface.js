// lib/services/exchanges/adapter.interface.js
// Standard interface that every exchange integration must implement

/**
 * Standard Exchange Adapter Interface
 * 
 * Every exchange added to the platform must expose these methods
 * returning data in a normalized format.
 */

class ExchangeAdapter {
  constructor(apiKey, apiSecret, passphrase = null) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.passphrase = passphrase;
  }

  /**
   * Fetch current balances
   * @returns {Promise<Array>} Array of { asset, free, locked, total }
   */
  async getBalances() { throw new Error('Not implemented'); }

  /**
   * Fetch full portfolio with current USD/INR values
   * @param {string} currency - 'USDT', 'INR', 'USD'
   * @returns {Promise<Array>} Array of { asset, quantity, price, value }
   */
  async getPortfolio(_currency = 'USDT') { throw new Error('Not implemented'); }

  /**
   * Place an order on the exchange
   * @param {object} params - { symbol, side, type, quantity, price }
   * @returns {Promise<object>} Standardized order object
   */
  async placeOrder(_params) { throw new Error('Not implemented'); }

  /**
   * Cancel an open order
   * @param {string} symbol - Trading pair
   * @param {string} orderId - Exchange order ID
   */
  async cancelOrder(_symbol, _orderId) { throw new Error('Not implemented'); }

  /**
   * Get all open/recent orders
   * @param {string} symbol - Optional filter
   */
  async getOrders(_symbol = null) { throw new Error('Not implemented'); }

  /**
   * Get current ticker price
   * @param {string} symbol - Trading pair e.g. "BTCUSDT"
   * @returns {Promise<number>} Current price
   */
  async getTicker(_symbol) { throw new Error('Not implemented'); }

  /**
   * Get multiple ticker prices
   * @param {Array<string>} symbols 
   * @returns {Promise<object>} Map of { [symbol]: price }
   */
  async getTickers(_symbols) { throw new Error('Not implemented'); }
}

module.exports = ExchangeAdapter;
