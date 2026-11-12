const MarketData = {
  async fetchCandles(interval) {
    const url = `https://biquote.io/api/ohlc?symbol=EURUSD&interval=${interval}&limit=200`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API Error');
    const json = await res.json();
    return json.data;
  }
};

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const out = [];
  for (let line of lines) {
    const p = line.split(',');
    if (p.length >= 5 && !isNaN(parseFloat(p[1]))) {
      out.push({ time: p[0], open: +p[1], high: +p[2], low: +p[3], close: +p[4] });
    }
  }
  return out;
}
