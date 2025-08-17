const fs = require('fs');
const path = require('path');
const axios = require('axios');

const coinFolder = path.join(__dirname, 'public', 'coins');
if (!fs.existsSync(coinFolder)) {
  fs.mkdirSync(coinFolder, { recursive: true });
}

const targetSymbols = ['ftm','omg','zec',
  'dash','aave','sand','chz','gmx','movr','mana','sushi','atom','algo',
  'steth','crv','bat','ren','band','kava','one',
  'lrc','quick','ray','ogn','bal','perp','amp','arb','op','gno',
  'dia','iost','fet','ar','ceLo','hbar','gnt','qtum','ont','tomo',
  'iota','zrx','enj','knc','hnt','ftt','yfi','alpha','reef','wax','waxp','rvn','hnt','celr','eGLD','mkr' 
];


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const listResp = await axios.get('https://api.coingecko.com/api/v3/coins/list');
  const coins = listResp.data;

  for (const symbol of targetSymbols) {
    try {
      // Find the first coin for the symbol (main version)
      const coin = coins.find(c => c.symbol.toLowerCase() === symbol);
      if (!coin) {
        console.log(`✗ Not found: ${symbol}`);
        continue;
      }
      const coinResp = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin.id}`);
      const imageUrl = coinResp.data.image.large;
      if (imageUrl && symbol) {
        const imgResp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(path.join(coinFolder, `${symbol}.png`), imgResp.data);
        console.log(`✔ Saved ${symbol} (${coin.id})`);
      }
    } catch (err) {
      console.log(`✗ Error: ${symbol}`, err.message);
    }
    await sleep(1500); // Sleep 1.5 seconds between requests (avoid rate limit)
  }
  console.log('Download complete.');
})();
