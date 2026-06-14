// services/priceService.js

const axios = require('axios');

async function getPriceUSD(symbol) {
  // Use a mapping from symbol to coingecko ID if needed
  try {
    // For major coins, symbol and id often match lowercased (e.g., "btc" => "bitcoin")
    const idMap = {
      BTC: "bitcoin",
      ETH: "ethereum",
      USDT: "tether",
      DOGE: "dogecoin",
      LUNA: "terra-luna",
      YFI: "yearn-finance",
      // Add more mappings as needed
    };
    const coinId = idMap[symbol.toUpperCase()] || symbol.toLowerCase();
    const res = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );
    return res.data[coinId]?.usd || 0;
  } catch {
    return 0;
  }
}
module.exports = { getPriceUSD };
