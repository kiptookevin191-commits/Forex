document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('backtest-csv')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const candles = parseCSV(ev.target.result);
      if (candles.length < 200) return alert('Need 200+ candles.');
      
      const closes = candles.map(c => c.close);
      const ema20 = Indicators.ema(closes, 20);
      const ema50 = Indicators.ema(closes, 50);
      let wins = 0, losses = 0, netPL = 0;

      for (let i = 50; i < candles.length - 10; i++) {
        if (!ema20[i] || !ema50[i]) continue;
        const bull = ema20[i] > ema50[i] && ema20[i-1] <= ema50[i-1];
        const bear = ema20[i] < ema50[i] && ema20[i-1] >= ema50[i-1];
        
        if (bull || bear) {
          // Simulate 1:2 RR. 
          const entry = closes[i];
          const sl = bull ? entry - 0.0020 : entry + 0.0020; // 20 pips SL
          const tp = bull ? entry + 0.0040 : entry - 0.0040; // 40 pips TP
          
          let result = null;
          for (let j = i + 1; j < i + 10; j++) { // Look ahead 10 candles
            if (bull) {
              if (candles[j].low <= sl) { result = 'LOSS'; break; }
              if (candles[j].high >= tp) { result = 'WIN'; break; }
            } else {
              if (candles[j].high >= sl) { result = 'LOSS'; break; }
              if (candles[j].low <= tp) { result = 'WIN'; break; }
            }
          }
          if (result === 'WIN') { wins++; netPL += 20; }
          if (result === 'LOSS') { losses++; netPL -= 40; }
          i += 10; // Cooldown
        }
      }
      
      const total = wins + losses;
      document.getElementById('backtest-results').innerHTML = `
        <div>Trades: <strong>${total}</strong></div>
        <div>Win Rate: <strong>${total ? ((wins/total)*100).toFixed(1) : 0}%</strong></div>
        <div>Net P/L (Pips): <strong>${netPL}</strong></div>
      `;
    };
    reader.readAsText(file);
  });
});
