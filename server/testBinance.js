// server/testBinance.js
import Binance from 'binance-api-node';
import dotenv from 'dotenv';

dotenv.config();

const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_SECRET_KEY,
});

async function testBinance() {
  try {
    const accountInfo = await client.accountInfo();
    console.log("Binance Account Balances:", accountInfo.balances);
  } catch (error) {
    console.error("Binance API Error:", error);
  }
}

testBinance();
