const Strategy = {
  analyze(h1Candles, m15Candles) {
    if (!h1Candles || h1Candles.length < 200 || !m15Candles || m15Candles.length < 200) {
      return { signal: 'WAIT', score: 0, reasons: ['Need 200+ candles for indicators.'] };
    }
    const h1Closes = h1Candles.map(c => c.close);
    const m15Closes = m15Candles.map(c => c.close);
    const iH1 = h1Candles.length - 1, iM15 = m15Candles.length - 1;

    const h1Ema50 = Indicators.ema(h1Closes, 50);
    const h1Ema200 = Indicators.ema(h1Closes, 200);
    const m15Ema50 = Indicators.ema(m15Closes, 50);
    const m15Ema200 = Indicators.ema(m15Closes, 200);
    const m15Rsi = Indicators.rsi(m15Closes, 14);
    const m15Macd = Indicators.macd(m15Closes);
    const m15Atr = Indicators.atr(m15Candles, 14);
    const m15Adx = Indicators.adx(m15Candles, 14);

    const price = m15Closes[iM15], rsi = m15Rsi[iM15], atr = m15Atr[iM15], adx = m15Adx[iM15];
    const macdVal = m15Macd.macdLine[iM15], signalVal = m15Macd.signalLine[iM15];

    if ([rsi, atr, adx, macdVal, signalVal].includes(null)) {
      return { signal: 'WAIT', score: 0, reasons: ['Indicators warming up.'] };
    }

    const h1Bull = h1Ema50[iH1] > h1Ema200[iH1], h1Bear = h1Ema50[iH1] < h1Ema200[iH1];
    const m15Bull = m15Ema50[iM15] > m15Ema200[iM15], m15Bear = m15Ema50[iM15] < m15Ema200[iM15];
    const macdBull = macdVal > signalVal, macdBear = macdVal < signalVal;
    const trap = Indicators.detectTrap(m15Candles, 20);

    let buyScore = 0, sellScore = 0;

    if (h1Bull && m15Bull) {
      buyScore += 40;
      if (rsi > 50 && rsi < 70) buyScore += 15;
      if (macdBull) buyScore += 15;
      if (adx > 25) buyScore += 15;
      if (trap !== 'BULL_TRAP') buyScore += 15; else buyScore = 0; 
    }
    if (h1Bear && m15Bear) {
      sellScore += 40;
      if (rsi < 50 && rsi > 30) sellScore += 15;
      if (macdBear) sellScore += 15;
      if (adx > 25) sellScore += 15;
      if (trap !== 'BEAR_TRAP') sellScore += 15; else sellScore = 0;
    }

    let signal = 'WAIT', finalScore = 0;
    if (buyScore >= 80) { signal = 'BUY'; finalScore = buyScore; }
    else if (sellScore >= 80) { signal = 'SELL'; finalScore = sellScore; }

    let entry = null, sl = null, tp1 = null, tp2 = null;
    if (signal !== 'WAIT') {
      entry = price;
      const dist = atr * 1.5;
      if (signal === 'BUY') { sl = entry - dist; tp1 = entry + dist; tp2 = entry + (dist * 2); }
      else { sl = entry + dist; tp1 = entry - dist; tp2 = entry - (dist * 2); }
    }
    return { signal, score: finalScore, entry, sl, tp1, tp2, price, rsi, adx, atr };
  }
};
