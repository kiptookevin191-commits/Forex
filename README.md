# EUR/USD AI Forex Trading Assistant

A free, mobile-first, professional Forex analysis assistant designed to run entirely on an Android phone via GitHub Pages. 

> ⚠️ **IMPORTANT DISCLAIMER**
> This is an **educational tool and a signal generator only**. It **does not** execute trades automatically. You must place trades manually in MetaTrader 5 (MT5) Android. Forex trading carries significant risk. Past performance does not guarantee future results. Always use a demo account first.

## 🌟 Features
- **Multi-Timeframe Analysis:** Confirms trends across H1 and M15 timeframes.
- **Strict Confluence Engine:** Only generates BUY or SELL signals when EMA, RSI, MACD, and ADX perfectly align. 
- **Trap Detection:** Built-in logic to detect and block false breakouts (Bull/Bear traps).
- **100-Point Quality Score:** Rates the strength of the setup from 0-100. A minimum score of 80 is required to trigger a signal.
- **Risk Management:** Calculates exact lot sizes based on your account balance and risk percentage.
- **Trade Journal:** Logs your manual trades, calculates win rate, and allows CSV export.
- **Backtesting Lab:** Upload historical data to test strategies without look-ahead bias.
- **PWA Ready:** Can be installed directly to your Android home screen like a native app.

## 🚀 How to Use the App

1. **Open the App:** Navigate to your GitHub Pages URL and tap "Add to Home Screen" in Chrome.
2. **Start Analysis:** Tap the green **START** button.
3. **Data Source:** 
   - The app will try to fetch free live data from the API.
   - If the API fails or is delayed, use the **CSV Upload** buttons on the Dashboard to upload your own H1 and M15 historical data.
4. **Read the Dashboard:**
   - **WAIT:** Do not trade. Conditions are not optimal.
   - **BUY / SELL:** A high-probability setup is detected. Look at the Entry, Stop Loss (SL), and Take Profit (TP) levels.
5. **Execute Manually:** Open your MT5 Android app and place the trade exactly as suggested.
6. **Log the Trade:** Go to the **Journal** tab and record your trade so the app can track your win rate.

## 📁 Project Architecture

The project is built using Vanilla JavaScript and requires no backend, database, or paid hosting.

- `index.html` - The main UI and dashboard structure.
- `style.css` - The dark mode mobile-responsive design.
- `app.js` - The main controller that connects the UI to the engine.
- `indicators.js` - Mathematical formulas (EMA, RSI, MACD, ADX, ATR).
- `strategy.js` - The logic that scores the setup and generates signals.
- `market-data.js` - API fetching and CSV parsing.
- `risk-management.js` - Lot size and risk calculators.
- `trading-tools.js` - Additional calculators (Fibonacci, Pips).
- `backtesting.js` - Historical data simulation.
- `journal.js` - LocalStorage trade tracking and CSV export.
- `manifest.json` - Progressive Web App (PWA) configuration.
- `service-worker.js` - Offline caching for the PWA.

## ⚙️ Technology Stack
- HTML5 / CSS3
- Vanilla JavaScript (ES6+)
- LocalStorage (for saving your journal and settings)
- Chart.js / Custom Canvas Math (no heavy dependencies)
- GitHub Pages (Free Hosting)

## 🛠️ Deployment
To update the app in the future, simply edit the files directly in your GitHub repository. GitHub Pages will automatically rebuild and publish the changes within 1-2 minutes.
