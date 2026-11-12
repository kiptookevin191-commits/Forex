const Indicators = {
  ema(values, period) {
    if (values.length < period) return [];
    const k = 2 / (period + 1);
    const out = new Array(values.length).fill(null);
    let sum = 0;
    for (let i = 0; i < period; i++) sum += values[i];
    out[period - 1] = sum / period;
    for (let i = period; i < values.length; i++) {
      out[i] = (values[i] - out[i - 1]) * k + out[i - 1];
    }
    return out;
  },
  rsi(values, period = 14) {
    if (values.length <= period) return [];
    const out = new Array(values.length).fill(null);
    let avgGain = 0, avgLoss = 0;
    for (let i = 1; i <= period; i++) {
      const diff = values[i] - values[i - 1];
      if (diff >= 0) avgGain += diff; else avgLoss -= diff;
    }
    avgGain /= period; avgLoss /= period;
    out[period] = 100 - 100 / (1 + (avgGain / (avgLoss || 0.00001)));
    for (let i = period + 1; i < values.length; i++) {
      const diff = values[i] - values[i - 1];
      const gain = diff >= 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      out[i] = 100 - 100 / (1 + (avgGain / (avgLoss || 0.00001)));
    }
    return out;
  },
  macd(values, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const fastEma = this.ema(values, fastPeriod);
    const slowEma = this.ema(values, slowPeriod);
    const macdLine = new Array(values.length).fill(null);
    for (let i = 0; i < values.length; i++) {
      if (fastEma[i] !== null && slowEma[i] !== null) macdLine[i] = fastEma[i] - slowEma[i];
    }
    const validMacd = macdLine.filter(v => v !== null);
    const signalEma = this.ema(validMacd, signalPeriod);
    const signalLine = new Array(values.length).fill(null);
    let validIndex = 0;
    for (let i = 0; i < values.length; i++) {
      if (macdLine[i] !== null) {
        signalLine[i] = signalEma[validIndex] || null;
        validIndex++;
      }
    }
    return { macdLine, signalLine };
  },
  atr(candles, period = 14) {
    if (candles.length <= period) return [];
    const trs = [0];
    for (let i = 1; i < candles.length; i++) {
      const h = candles[i].high, l = candles[i].low, pc = candles[i - 1].close;
      trs.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
    }
    const out = new Array(candles.length).fill(null);
    let sum = 0;
    for (let i = 1; i <= period; i++) sum += trs[i];
    out[period] = sum / period;
    for (let i = period + 1; i < candles.length; i++) {
      out[i] = (out[i - 1] * (period - 1) + trs[i]) / period;
    }
    return out;
  },
  adx(candles, period = 14) {
    if (candles.length < period * 2) return [];
    let tr = [], plusDM = [], minusDM = [];
    for (let i = 1; i < candles.length; i++) {
      const upMove = candles[i].high - candles[i - 1].high;
      const downMove = candles[i - 1].low - candles[i].low;
      plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
      minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
      const h = candles[i].high, l = candles[i].low, pc = candles[i - 1].close;
      tr.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
    }
    let smoothTR = tr.slice(0, period).reduce((a, b) => a + b, 0);
    let smoothPlus = plusDM.slice(0, period).reduce((a, b) => a + b, 0);
    let smoothMinus = minusDM.slice(0, period).reduce((a, b) => a + b, 0);
    let dx = [];
    const calcDX = (sTR, sP, sM) => {
      if (sTR === 0) return 0;
      const pDI = 100 * (sP / sTR), mDI = 100 * (sM / sTR);
      const sum = pDI + mDI;
      return sum === 0 ? 0 : 100 * Math.abs(pDI - mDI) / sum;
    };
    dx.push(calcDX(smoothTR, smoothPlus, smoothMinus));
    for (let i = period; i < tr.length; i++) {
      smoothTR = smoothTR - (smoothTR / period) + tr[i];
      smoothPlus = smoothPlus - (smoothPlus / period) + plusDM[i];
      smoothMinus = smoothMinus - (smoothMinus / period) + minusDM[i];
      dx.push(calcDX(smoothTR, smoothPlus, smoothMinus));
    }
    const adxArr = new Array(candles.length).fill(null);
    let sumDX = dx.slice(0, period).reduce((a, b) => a + b, 0);
    let currentADX = sumDX / period;
    adxArr[period * 2 - 1] = currentADX;
    for (let i = period; i < dx.length; i++) {
      currentADX = (currentADX * (period - 1) + dx[i]) / period;
      adxArr[i + period] = currentADX;
    }
    return adxArr;
  },
  detectTrap(candles, lookback = 20) {
    if (candles.length < lookback) return null;
    const recent = candles.slice(-lookback);
    const current = candles[candles.length - 1];
    const highestHigh = Math.max(...recent.map(c => c.high));
    const lowestLow = Math.min(...recent.map(c => c.low));
    if (current.high > highestHigh && current.close < highestHigh) return 'BULL_TRAP';
    if (current.low < lowestLow && current.close > lowestLow) return 'BEAR_TRAP';
    return null;
  }
};
