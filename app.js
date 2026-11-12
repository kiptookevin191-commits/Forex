/* app.js — Main Application Controller */

const APP = {
  h1Candles: [],
  m15Candles: [],
  running: false,
  paused: false,
  timer: null,
};

const $ = (id) => document.getElementById(id);

// 1. Tab Navigation
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    $(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});

// 2. Data Fetching & Fallback
async function runAnalysis() {
  if (APP.paused) return;
  $('data-timestamp').textContent = 'Fetching API...';

  try {
    // Try to fetch from free API
    const [h1, m15] = await Promise.all([
      MarketData.fetchCandles('1h'),
      MarketData.fetchCandles('15m')
    ]);
    APP.h1Candles = h1;
    APP.m15Candles = m15;
    $('data-timestamp').textContent = 'API Connected';
    updateDashboard();
  } catch (err) {
    console.error(err);
    $('data-timestamp').textContent = 'API Failed. Upload CSV.';
  }
}

// 3. Handle CSV Fallback
$('csv-h1').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    APP.h1Candles = parseCSV(ev.target.result);
    checkDataReady();
  };
  reader.readAsText(file);
});

$('csv-m15').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    APP.m15Candles = parseCSV(ev.target.result);
    checkDataReady();
  };
  reader.readAsText(file);
});

function checkDataReady() {
  if (APP.h1Candles.length > 50 && APP.m15Candles.length > 50) {
    $('data-timestamp').textContent = 'CSV Loaded';
    updateDashboard();
  }
}

// 4. Update the UI
function updateDashboard() {
  const result = Strategy.analyze(APP.h1Candles, APP.m15Candles);

  // Update Signal
  $('signal-display').textContent = result.signal;
  $('signal-display').className = 'signal ' + (
    result.signal === 'BUY' ? 'signal-buy' : 
    result.signal === 'SELL' ? 'signal-sell' : 'signal-wait'
  );
  $('confidence-value').textContent = result.score || 0;

  // Update Metrics
  $('current-price').textContent = result.price ? result.price.toFixed(5) : '—';
  $('rsi-value').textContent = result.rsi ? result.rsi.toFixed(1) : '—';
  $('adx-value').textContent = result.adx ? result.adx.toFixed(1) : '—';
  $('atr-value').textContent = result.atr ? result.atr.toFixed(5) : '—';
  
  $('entry-price').textContent = result.entry ? result.entry.toFixed(5) : '—';
  $('stop-loss').textContent = result.sl ? result.sl.toFixed(5) : '—';
  $('tp1').textContent = result.tp1 ? result.tp1.toFixed(5) : '—';
  $('tp2').textContent = result.tp2 ? result.tp2.toFixed(5) : '—';

  // Update H1 Trend & MACD (using basic logic for display)
  const h1Closes = APP.h1Candles.map(c => c.close);
  const h1Ema50 = Indicators.ema(h1Closes, 50);
  const h1Ema200 = Indicators.ema(h1Closes, 200);
  const iH1 = h1Closes.length - 1;
  
  if (h1Ema50[iH1] && h1Ema200[iH1]) {
    $('trend-h1').textContent = h1Ema50[iH1] > h1Ema200[iH1] ? 'Bullish' : 'Bearish';
  }

  const m15Closes = APP.m15Candles.map(c => c.close);
  const macd = Indicators.macd(m15Closes);
  const iM15 = m15Closes.length - 1;
  if (macd.macdLine[iM15] && macd.signalLine[iM15]) {
    $('macd-status').textContent = macd.macdLine[iM15] > macd.signalLine[iM15] ? 'Bullish' : 'Bearish';
  }

  // AI Analysis Text
  if (result.signal === 'WAIT') {
    $('ai-analysis-text').textContent = "Market conditions are not optimal. " + (result.reasons ? result.reasons.join(' ') : "Indicators are conflicting or data is warming up. Wait for an A+ setup.");
  } else {
    $('ai-analysis-text').innerHTML = `<strong>${result.signal} SIGNAL (Score: ${result.score}/100)</strong><br><br>
      Multi-timeframe alignment confirmed. H1 and M15 trends agree. RSI and MACD momentum are in your favor. 
      The Stop Loss is set at ${result.sl.toFixed(5)} and TP2 is at ${result.tp2.toFixed(5)}.`;
  }

  $('data-timestamp').textContent = 'Updated ' + new Date().toLocaleTimeString();
}

// 5. Control Buttons
$('btn-start').addEventListener('click', () => {
  APP.running = true;
  APP.paused = false;
  runAnalysis();
  // Auto-refresh every 60 seconds
  APP.timer = setInterval(runAnalysis, 60000);
});

$('btn-pause').addEventListener('click', () => {
  APP.paused = true;
  $('data-timestamp').textContent = 'Paused';
});

$('btn-stop').addEventListener('click', () => {
  APP.running = false;
  APP.paused = false;
  clearInterval(APP.timer);
  $('data-timestamp').textContent = 'Stopped';
  $('signal-display').textContent = 'WAIT';
  $('signal-display').className = 'signal signal-wait';
  $('ai-analysis-text').textContent = 'Analysis stopped.';
});

// 6. Register PWA Service Worker (for offline install)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(err => console.log('SW failed', err));
  });
}
