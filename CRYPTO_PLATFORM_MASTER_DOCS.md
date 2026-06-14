# 🚀 CryptoManager — Ultimate Crypto Exchange Management Platform
## Master Documentation & Feature Bible

> **Version:** 2.0  
> **Stack:** Next.js 15 (App Router) + TypeScript + MongoDB + Tailwind CSS  
> **Last Updated:** May 2026

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Supported Exchanges](#2-supported-exchanges)
3. [Core Modules & Features](#3-core-modules--features)
4. [🤖 Smart Order Automation ← THE CORE FEATURE](#4-smart-order-automation)
5. [Database Schema Design](#5-database-schema-design)
6. [API Architecture](#6-api-architecture)
7. [Automation Engine (Bots)](#7-automation-engine-bots)
8. [Security Architecture](#8-security-architecture)
9. [UI/UX Pages & Components](#9-uiux-pages--components)
10. [Tech Stack & Dependencies](#10-tech-stack--dependencies)
11. [File & Folder Structure](#11-file--folder-structure)
12. [Environment Variables](#12-environment-variables)
13. [Deployment Plan](#13-deployment-plan)
14. [Future Roadmap](#14-future-roadmap)

---

## 1. PROJECT OVERVIEW

CryptoManager is a **unified crypto exchange management platform** that allows users to:
- Connect **multiple exchange accounts** (Binance, CoinDCX, WazirX, Kraken, Coinbase, etc.) via API keys
- **View consolidated portfolio** across all exchanges in one dashboard
- **Place, track, and cancel orders** on any connected exchange
- **🔑 AUTO BUY/SELL at a specific date & time** — schedule orders for the future
- **🔑 AUTO BUY/SELL when price hits a target** — price-triggered order automation
- **🔑 Stop-Loss & Take-Profit** — protect gains, limit losses automatically
- **🔑 Trailing Stop** — dynamically follow the price and auto-sell at peak minus X%
- **🔑 Conditional Order Chains** — "If BTC drops to 60k, buy; then if it hits 70k, sell"
- **🔑 Recurring Buy/Sell Schedules** — daily/weekly/monthly auto-buy (DCA)
- Run **automated trading bots** with configurable strategies (DCA, Grid, RSI-based, etc.)
- Set **price alerts and notifications** via email, SMS, or push
- Generate **P&L reports** and tax reports
- Manage **risk** with stop-loss, take-profit rules
- Access **live market data**, order book, and candlestick charts

---

## 2. SUPPORTED EXCHANGES

### Phase 1 (MVP — Already Started)
| Exchange | Region | API Status | Features Supported |
|----------|--------|------------|-------------------|
| **Binance** | Global | ✅ REST API | Portfolio, Orders, Place/Cancel |
| **CoinDCX** | India | ✅ REST API | Portfolio, Orders, Place/Cancel |

### Phase 2 (Planned)
| Exchange | Region | Auth Type |
|----------|--------|-----------|
| **WazirX** | India | API Key + Secret |
| **Kraken** | Global | API Key + Secret |
| **Coinbase Advanced** | Global | OAuth 2.0 / API Key |
| **Bybit** | Global | API Key + Secret |
| **KuCoin** | Global | API Key + Secret + Passphrase |
| **OKX** | Global | API Key + Secret + Passphrase |
| **Bitfinex** | Global | API Key + Secret |
| **Gate.io** | Global | API Key + Secret |

### Exchange Abstraction Layer
All exchanges share a **unified adapter interface**:
```
interface ExchangeAdapter {
  getBalance(): Promise<Balance[]>
  placeOrder(params: OrderParams): Promise<Order>
  cancelOrder(orderId: string): Promise<void>
  getOrders(symbol?: string): Promise<Order[]>
  getOrderBook(symbol: string): Promise<OrderBook>
  getTicker(symbol: string): Promise<Ticker>
  getKlines(symbol: string, interval: string): Promise<Candle[]>
}
```

---

## 3. CORE MODULES & FEATURES

> ⚡ **Section 4 below covers the full Smart Order Automation engine — the heart of this platform.**

### 3.1 🔐 Authentication & User Management
- [ ] Email + Password registration with OTP verification
- [ ] JWT-based session management (access + refresh tokens)
- [ ] Forgot Password / Reset Password via email OTP
- [ ] Google OAuth login (Phase 2)
- [ ] Two-Factor Authentication (2FA) via TOTP (Google Authenticator)
- [ ] Session management (view & revoke active sessions)
- [ ] Account deletion with data wipe
- [ ] User roles: Admin, Pro User, Free User
- [ ] Subscription/plan management (Free, Pro, Enterprise)

### 3.2 🔑 API Key Management
- [ ] Add API keys per exchange (AES-256 encrypted at rest)
- [ ] Test connectivity before saving (validation)
- [ ] Read-only vs Trade permission detection
- [ ] IP whitelisting guide per exchange
- [ ] Key rotation reminders & expiry alerts
- [ ] Multiple accounts per exchange (sub-accounts)
- [ ] Soft-delete keys (mark as inactive)
- [ ] Key usage logs (last used, # requests)

### 3.3 📊 Dashboard (Home)
- [ ] Total portfolio value (all exchanges combined) in USD / INR / BTC
- [ ] Portfolio change: 24h, 7d, 30d (% and absolute)
- [ ] Asset allocation donut/pie chart
- [ ] Exchange breakdown card (Binance: $X, CoinDCX: $Y, etc.)
- [ ] Top gainers and losers in your portfolio
- [ ] Quick action buttons: Buy, Sell, Transfer
- [ ] Recent orders feed (last 10 orders across all exchanges)
- [ ] Active bot count widget
- [ ] Watchlist widget (pinned coins with live prices)
- [ ] News feed widget (CryptoPanic API integration)
- [ ] Market overview: BTC dominance, total market cap, Fear & Greed index
- [ ] P&L summary card (realized + unrealized)

### 3.4 💼 Portfolio Management
- [ ] Unified portfolio view across all exchanges
- [ ] Per-exchange portfolio breakdown tab
- [ ] Asset detail page (click on any coin)
  - Price chart (1H, 4H, 1D, 1W)
  - Your holdings and avg buy price
  - Total P&L for this asset
  - Transaction history for this asset
- [ ] Currency selector: view values in USD, INR, EUR, BTC, ETH
- [ ] Portfolio snapshot history (daily snapshots stored in DB)
- [ ] Performance graph: portfolio value over time
- [ ] Cost basis calculation (FIFO / LIFO / Average)
- [ ] Unrealized P&L per asset
- [ ] Realized P&L per trade
- [ ] Portfolio rebalancing suggestions

### 3.5 📈 Trading Interface
- [ ] Place market orders (buy/sell instantly at market price)
- [ ] Place limit orders (buy/sell at specified price)
- [ ] Place stop-limit orders
- [ ] Place OCO (One Cancels Other) orders — Binance
- [ ] **Schedule future order** — pick a date + time to auto-execute
- [ ] **Price-trigger order** — set a target price, auto-executes when hit
- [ ] Order preview with fees estimate
- [ ] Trading pair search with live price
- [ ] Mini order book display
- [ ] Recent trades display (last 20 trades on market)
- [ ] TradingView chart embed (live candlestick)
- [ ] Keyboard shortcuts for fast order entry
- [ ] Mobile-friendly order form

### 3.6 📋 Order Management
- [ ] View all orders (open, filled, cancelled, rejected) across all exchanges
- [ ] Filter by: exchange, status, coin, date range, order type
- [ ] Cancel open orders (single or bulk)
- [ ] Order detail modal with full breakdown
- [ ] Export orders to CSV / Excel
- [ ] Trade history with timestamps, fees, fills
- [ ] Order sync: pull latest orders on-demand or auto-refresh
- [ ] Pagination & infinite scroll

### 3.7 🤖 Automation Engine (Trading Bots)
> ⚡ See **Section 4: Smart Order Automation** for full detail on scheduled + price-triggered automation.

This is the most powerful feature. The platform supports multiple bot strategies:

#### Bot Types
| Bot Type | Description |
|----------|-------------|
| **DCA Bot** | Dollar Cost Averaging — buy fixed amount at regular intervals |
| **Grid Bot** | Place buy/sell orders at price grid intervals |
| **RSI Bot** | Auto-buy/sell based on RSI indicator thresholds |
| **MACD Bot** | Trigger on MACD crossover signals |
| **Trailing Stop Bot** | Follow price up, sell when it drops X% from peak |
| **Arbitrage Bot** | Detect price differences between exchanges, auto-trade |
| **Portfolio Rebalance Bot** | Maintain target % allocations, auto-rebalance |
| **Sniper Bot** | Buy immediately on new listing (risky, advanced) |
| **Webhook Bot** | Receive TradingView alerts → auto-execute orders |

#### Bot Configuration
- [ ] Bot name, description, tags
- [ ] Exchange & trading pair selection
- [ ] Strategy parameters (custom per bot type)
- [ ] Investment amount limits (max spend per trade, total budget)
- [ ] Safety limits: max orders/day, max loss %, stop-all threshold
- [ ] Run schedule: 24/7, custom cron schedule, or manual trigger
- [ ] Paper trading mode (simulate without real money)
- [ ] Backtest mode (run strategy on historical data)
- [ ] Bot performance dashboard (P&L, win rate, # trades)
- [ ] Start / Pause / Stop controls
- [ ] Bot activity log (full audit trail)
- [ ] Notification on trade execution

#### Bot Execution Engine
- [ ] Cron job scheduler (node-cron or Agenda.js) for periodic bots
- [ ] WebSocket price feed listener for event-driven bots
- [ ] Queue system (BullMQ + Redis) for order execution tasks
- [ ] Retry logic with exponential backoff
- [ ] Rate limit awareness per exchange API
- [ ] Circuit breaker pattern (pause bot on too many errors)
- [ ] Concurrent bot isolation (one bot failure doesn't affect others)

### 3.8 🔔 Alerts & Notifications
- [ ] Price alerts (above / below threshold)
- [ ] Portfolio value alerts (total value thresholds)
- [ ] Order filled notification
- [ ] Bot trade executed notification
- [ ] Bot stopped/error notification
- [ ] Exchange API key error alert
- [ ] Withdrawal detected alert (security)
- [ ] Daily P&L summary email
- [ ] Weekly performance report email

#### Notification Channels
| Channel | Library |
|---------|---------|
| **Email** | Nodemailer + Gmail SMTP / SendGrid |
| **SMS** | Twilio (Phase 2) |
| **Push (Web)** | Web Push API (service worker) |
| **Telegram** | Telegram Bot API |
| **Webhook** | POST to user-configured URL |

### 3.9 📊 Reports & Analytics
- [ ] P&L Report (daily, weekly, monthly, custom range)
- [ ] Trade Performance Report (win/loss ratio, avg profit, etc.)
- [ ] Tax Report (per-country format — India ITR, US 8949 etc.)
- [ ] Exchange Fee Summary (total fees paid per exchange)
- [ ] Asset Return Report (how each coin performed)
- [ ] Portfolio Performance vs BTC/ETH benchmark
- [ ] Export: PDF, CSV, Excel
- [ ] Interactive charts (ApexCharts / Chart.js)

### 3.10 👤 User Profile & Settings
- [ ] Update name, email, avatar
- [ ] Change password
- [ ] Enable / disable 2FA
- [ ] Default currency preference (USD / INR / EUR / BTC)
- [ ] Default exchange preference
- [ ] Notification preferences (per channel, per event)
- [ ] Theme: Dark / Light / System
- [ ] Language: English (+ more in future)
- [ ] Session list (device, IP, location, last active)
- [ ] Connected OAuth accounts
- [ ] Subscription plan & billing (Stripe integration)
- [ ] Data export (download all your data — GDPR)
- [ ] Account deletion

### 3.11 🛡️ Risk Management
- [ ] Global stop-loss (if total portfolio drops X%, pause all bots)
- [ ] Per-asset stop-loss / take-profit rules (auto-sell)
- [ ] Max exposure per asset (don't let one coin exceed X% of portfolio)
- [ ] Daily loss limit (pause trading after losing $X in a day)
- [ ] Leverage / margin warnings
- [ ] Risk score indicator (low / medium / high)

### 3.12 🌐 Market Data & Research
- [ ] Live price ticker for 1000+ coins
- [ ] Coin detail page (price history, market cap, volume, supply)
- [ ] Top gainers / losers (24h)
- [ ] Trending coins (CoinGecko trending)
- [ ] Global market overview (total market cap, BTC dominance)
- [ ] Fear & Greed Index widget
- [ ] Exchange volume rankings
- [ ] New listings tracker
- [ ] Upcoming events / announcements (CryptoPanic feed)
- [ ] Search and filter by category, market cap, volume

### 3.13 📬 Help & Support
- [ ] FAQ page with searchable content
- [ ] Submit support ticket
- [ ] Chat support (Crisp.chat or Intercom integration)
- [ ] Exchange setup guides (how to get API keys per exchange)
- [ ] Video tutorials embed
- [ ] Changelog / release notes
- [ ] Status page (exchange API health, platform uptime)

### 3.14 🔌 Webhooks & Integrations
- [ ] Receive TradingView webhooks → trigger bot actions
- [ ] Zapier integration (connect to 5000+ apps)
- [ ] Slack notifications
- [ ] Discord bot notifications
- [ ] REST API for third-party access (user token-based)
- [ ] Google Sheets export (live portfolio sync)

---

## 4. SMART ORDER AUTOMATION ⭐ THE CORE FEATURE

> This is the **most powerful and unique feature** of the platform. While most platforms only let you place manual orders, CryptoManager lets you **automate every buy and sell decision** — by time, by price, or by complex conditions — across all your exchanges from one place.

---

### 4.1 📅 SCHEDULED ORDERS (Buy/Sell at a Specific Date & Time)

**What it does:** User sets a future date + time → the system automatically places a buy or sell order at exactly that moment.

#### Use Cases
| Example | Description |
|---------|-------------|
| "Buy $500 of BTC on 1st Jan 2027 at 9:00 AM" | New Year investment, scheduled in advance |
| "Sell all my ETH on 31st March at 11:59 PM" | Tax year end sale |
| "Buy DOGE every Friday at 5 PM" | Weekly recurring schedule |
| "Sell 10% of BNB 7 days from now" | Future partial profit-take |

#### Features
- [ ] **One-time scheduled order** — set exact date + time + exchange + coin + amount + order type (market/limit)
- [ ] **Recurring scheduled order** — repeat every: hour / day / week / month / custom interval (cron-style)
- [ ] **Day-of-week schedule** — e.g., "every Monday and Thursday at 10 AM"
- [ ] **End date / max executions** — stop after N runs or after a specific date
- [ ] **Order type selection** — market order (instant fill) or limit order (only fill if price ≤ target)
- [ ] **Currency amount or coin quantity** — "Buy $100 worth" OR "Buy 0.005 BTC"
- [ ] **Pre-execution notification** — email/push 1 hour before execution
- [ ] **Post-execution notification** — confirm the order was placed + fill details
- [ ] **Pause / Resume / Delete** scheduled orders
- [ ] **Skip next run** — temporarily skip one occurrence
- [ ] **Timezone support** — user picks their local timezone
- [ ] **Dry-run / Paper mode** — simulate without real money

#### Scheduled Order States
```
PENDING → RUNNING → PLACED → FILLED
                  ↘ FAILED (exchange error, insufficient funds)
                  ↘ SKIPPED (user skipped this run)
PAUSED (user paused)
CANCELLED (user deleted)
COMPLETED (max runs reached / end date passed)
```

#### Data Model: `scheduled_orders`
```js
{
  _id,
  userId,
  name,                   // "Weekly BTC DCA"
  exchangeName,           // "binance" | "coindcx"
  symbol,                 // "BTCUSDT"
  side,                   // "buy" | "sell"
  orderType,              // "market" | "limit"
  amountType,             // "currency" | "quantity" | "percentage"
  amount,                 // 100 (USD) or 0.005 (BTC) or 10 (% of balance)
  limitPrice,             // only for limit orders
  
  // Scheduling
  scheduleType,           // "once" | "recurring"
  executeAt,              // Date — for one-time orders
  cronExpression,         // "0 10 * * 1" — for recurring (every Monday 10am)
  timezone,               // "Asia/Kolkata"
  
  // Recurrence limits
  maxExecutions,          // null = unlimited
  endDate,                // null = no end
  executionCount,         // how many times run so far
  
  // Notifications
  notifyBefore,           // minutes before (0 = no pre-notify)
  notifyAfter,            // true/false
  notifyChannels,         // ["email", "push", "telegram"]
  
  // Status
  status,                 // "active" | "paused" | "cancelled" | "completed"
  lastRunAt,
  nextRunAt,
  lastOrderId,            // reference to the order placed
  lastError,
  
  isPaperTrade,           // simulate without real money
  createdAt, updatedAt
}
```

---

### 4.2 💰 PRICE-TRIGGERED ORDERS (Buy/Sell When Price Hits a Target)

**What it does:** User sets a price level → when the market price crosses that level, the system **automatically places a buy or sell order**.

#### Use Cases
| Example | Action |
|---------|--------|
| "Buy BTC if it drops to $58,000" | Dip buying |
| "Sell ETH if it rises to $4,000" | Take profit |
| "Buy DOGE if it falls 20% from current price" | % dip trigger |
| "Sell BNB if it drops below $400" | Stop-loss protection |
| "Buy SOL when it's back above its 7-day high" | Breakout buy |

#### Trigger Types
| Trigger | Condition | Example |
|---------|-----------|---------|
| **Price ≤ value** | Buy when price drops TO or BELOW | Buy BTC if price ≤ $58,000 |
| **Price ≥ value** | Sell when price rises TO or ABOVE | Sell ETH if price ≥ $4,000 |
| **Price drops X%** | Buy when price falls X% from current | Buy if -15% from now |
| **Price rises X%** | Sell when price gains X% from current | Sell if +20% from now |
| **Price drops X% from peak** | Trailing stop-loss | Sell if drops 10% from all-time-high-since-entry |
| **Price crosses MA** | Buy/sell when crossing moving average | Buy when price > 50-day MA |
| **24h % change** | Trigger on big daily moves | Buy if 24h change < -15% |

#### Features
- [ ] Set **exact price target** in any currency (USD, INR, BTC, USDT)
- [ ] Set **percentage change target** from current price or from your avg buy price
- [ ] Choose order type: **instant market** or **place limit at trigger price**
- [ ] Set **validity** — trigger active for: 1 day / 1 week / 1 month / forever
- [ ] **Expiry date** — auto-cancel if not triggered by date
- [ ] **One-shot** (fire once and deactivate) or **recurring** (reset after triggered)
- [ ] **Price check interval** — every 30s / 1min / 5min (configurable)
- [ ] **Multi-trigger chain** — "after this triggers, create another trigger"
- [ ] **Partial amount** — "sell only 50% of my holdings when triggered"
- [ ] **Notification** on trigger + on order fill
- [ ] **Cooldown period** — after trigger fires, don't trigger again for X minutes
- [ ] **Paper mode** — simulate price hits without real orders
- [ ] View all active price triggers on a price chart overlay

#### Data Model: `price_triggers`
```js
{
  _id,
  userId,
  name,                   // "BTC Dip Buy at 58k"
  exchangeName,
  symbol,                 // "BTCUSDT"
  side,                   // "buy" | "sell"
  orderType,              // "market" | "limit"

  // Trigger Condition
  triggerType,            // "price_lte" | "price_gte" | "pct_drop" | "pct_rise" | "trailing_stop" | "pct_from_avg"
  triggerValue,           // 58000 (price) OR 15 (percentage)
  triggerCurrency,        // "USDT" | "INR" | "USD"
  referencePrice,         // price at creation time (for % calculations)
  peakPrice,              // for trailing stop: tracks highest price seen
  
  // Order details
  amountType,             // "currency" | "quantity" | "percentage"
  amount,                 // 500 (USD) | 0.01 (BTC) | 50 (% of balance)
  limitPrice,             // null for market, or specific limit price

  // Behaviour after trigger
  isRecurring,            // re-arm after triggering
  cooldownMinutes,        // wait N min before re-arming
  chainTriggerId,         // create this trigger after firing
  
  // Validity
  expiresAt,              // auto-cancel if not triggered
  
  // Status
  status,                 // "active" | "triggered" | "expired" | "cancelled" | "paused"
  triggeredAt,
  triggeredPrice,
  triggeredOrderId,
  
  // Notifications
  notifyOnTrigger,
  notifyOnFill,
  notifyChannels,
  
  isPaperTrade,
  createdAt, updatedAt
}
```

---

### 4.3 🛡️ STOP-LOSS & TAKE-PROFIT AUTOMATION

**What it does:** Protects your positions automatically — cuts losses or locks in profits without you watching the screen.

#### Stop-Loss
- [ ] **Fixed Stop-Loss** — sell if price drops to $X (absolute price)
- [ ] **Percentage Stop-Loss** — sell if price drops X% from your average buy price
- [ ] **Portfolio Stop-Loss** — sell all / pause bots if total portfolio drops X% in a day
- [ ] **Per-asset Stop-Loss** — each coin has its own stop level
- [ ] **Time-based Stop-Loss** — if price hasn't moved up in N days, exit

#### Take-Profit
- [ ] **Fixed Take-Profit** — sell if price rises to $X (absolute price)
- [ ] **Percentage Take-Profit** — sell if price rises X% from your avg buy price
- [ ] **Partial Take-Profit** — "sell 25% at +15%, sell another 25% at +30%, sell rest at +50%"
- [ ] **Scaled Take-Profit** — multiple levels that auto-sell portions

#### Stop-Loss + Take-Profit Combo (OCO-style)
- [ ] Set BOTH on a position — whichever hits first executes, other cancels
- [ ] Example: "I bought BTC at $60k. Stop-Loss: $54k. Take-Profit: $75k. First hit wins."

#### Trailing Stop-Loss ⭐
- [ ] **Trailing by fixed amount** — "sell if price drops $1,000 from peak"
- [ ] **Trailing by percentage** — "sell if price drops 8% from peak seen since I bought"
- [ ] **Activation price** — only start trailing after price hits a target (e.g., start trailing after ETH hits $3,500)
- [ ] **Peak tracking** — platform monitors live price and updates peak continuously

---

### 4.4 🔗 CONDITIONAL ORDER CHAINS (If This → Then That)

**What it does:** Create **sequences of automated actions** where one event triggers the next. This turns simple orders into complete trading strategies.

#### Examples
```
Chain 1: DIP BUY THEN TAKE PROFIT
  Step 1: "If BTC price ≤ $58,000 → BUY $500 at market"
  Step 2: "After Step 1 fills → set Take-Profit at $65,000 (SELL same amount)"
  Step 3: "After Step 1 fills → set Stop-Loss at $54,000"

Chain 2: ACCUMULATE THEN SELL ALL  
  Step 1: "Buy $100 BTC every week for 10 weeks"
  Step 2: "After 10 buys complete → Sell ALL at market"

Chain 3: NEWS REACTION
  Step 1: "If BTC drops 10% in 1 hour → BUY $1000"
  Step 2: "After fill → Sell if +20% OR Stop-Loss if -10%"
```

#### Features
- [ ] **Visual chain builder** — drag-and-drop step creation UI
- [ ] **Step types**: Scheduled Order, Price Trigger, Stop-Loss, Take-Profit, Delay/Wait, Notification
- [ ] **Branching logic** — "if order fills → do A; if order fails → do B"
- [ ] **AND / OR conditions** — "trigger when BTC < $58k AND RSI < 30"
- [ ] **Maximum chain depth** — up to 10 steps
- [ ] **Chain status dashboard** — see which step is currently active
- [ ] **Full audit log** — every step execution recorded with timestamp + outcome
- [ ] **Paper mode** — simulate entire chain without real money

#### Data Model: `order_chains`
```js
{
  _id,
  userId,
  name,             // "BTC Dip Buy + Auto TP/SL"
  description,
  status,           // "active" | "paused" | "completed" | "failed"
  currentStep,      // index of currently active step
  steps: [
    {
      stepIndex,
      type,           // "scheduled" | "price_trigger" | "stop_loss" | "take_profit" | "delay" | "notify"
      config,         // { ...step-specific params }
      status,         // "pending" | "active" | "completed" | "skipped" | "failed"
      executedAt,
      orderId,
      onSuccess,      // stepIndex to activate on success (null = next)
      onFailure,      // stepIndex to activate on failure (null = stop)
    }
  ],
  isPaperTrade,
  createdAt, updatedAt
}
```

---

### 4.5 🔄 RECURRING BUY/SELL (DCA Schedules)

**What it does:** Automatically invest a fixed amount at regular intervals — the most proven long-term crypto strategy.

#### Features
- [ ] **Fixed amount DCA** — "Buy $50 of BTC every week"
- [ ] **Variable amount DCA** — "Buy more when price is low, buy less when price is high"  
  - Formula: amount = base × (1 + (targetPrice - currentPrice) / targetPrice × multiplier)
- [ ] **Multi-coin DCA** — split investment across multiple coins each run
  - "Weekly: 50% BTC, 30% ETH, 20% SOL"
- [ ] **Rebalancing DCA** — auto-rebalance portfolio to target % allocations on each buy
- [ ] **Pause on profit** — skip buy if your portfolio is already +X% up this month
- [ ] **Budget cap** — stop DCA after spending $X total
- [ ] **DCA performance report** — avg cost basis, total invested, current value, P&L

---

### 4.6 📊 AUTOMATION DASHBOARD (Manage All Automations)

One unified page to see and manage **every automation across all exchanges**:

| Widget | Description |
|--------|-------------|
| **Active Automations** | Count of running scheduled orders, price triggers, chains, bots |
| **Pending Executions** | Next scheduled order countdown timer |
| **Recent Executions** | Last 10 automated actions + outcome |
| **Automation P&L** | Total profit/loss generated by automated orders |
| **Price Trigger Map** | Overlay active triggers on a price chart |
| **Upcoming Schedule** | Calendar view of all future scheduled orders |

#### Actions available from dashboard
- [ ] One-click pause ALL automations (emergency stop)
- [ ] One-click resume all
- [ ] Filter by exchange / coin / type
- [ ] View execution history for each automation
- [ ] Edit any automation in-place

---

### 4.7 ⚡ AUTOMATION EXECUTION ENGINE

#### How price monitoring works
```
Every 30 seconds (configurable):
  1. Fetch latest prices from each exchange (REST ticker or WebSocket)
  2. For each active price_trigger:
     a. Evaluate condition (price ≤ target, etc.)
     b. If triggered → add order to execution queue
     c. Update trigger status
  3. Process execution queue:
     a. Place order on exchange via API
     b. Record in orders collection
     c. Update trigger status to "triggered"
     d. Activate next step in chain (if any)
     e. Send notification to user
```

#### How scheduled orders work
```
Cron job (runs every minute):
  1. Query scheduled_orders where:
     status = "active" AND nextRunAt <= now()
  2. For each due order:
     a. Place order on exchange
     b. Record result
     c. Update executionCount
     d. Calculate nextRunAt (for recurring)
     e. If maxExecutions reached → mark completed
     f. Send post-execution notification
```

#### Safety Features
- [ ] **Insufficient funds check** — before placing, verify balance > order amount
- [ ] **Duplicate prevention** — never place same order twice (idempotency key)
- [ ] **Rate limit awareness** — respect each exchange's API rate limits
- [ ] **Max retries** — retry failed orders up to 3 times with exponential backoff
- [ ] **Circuit breaker** — if exchange API fails 5x in a row, pause all automations for that exchange and notify user
- [ ] **Slippage protection** — for market orders, reject if expected slippage > X%
- [ ] **Night mode / Blackout hours** — user can set hours when no automation runs

---

### 4.8 📱 AUTOMATION NOTIFICATIONS

Every automation action sends a notification. User controls which channels per event:

| Event | Channels |
|-------|---------|
| Scheduled order placed | Email, Push, Telegram |
| Scheduled order filled | Email, Push, Telegram |
| Price trigger activated | Push, Telegram (instant!) |
| Price trigger filled | Email, Push, Telegram |
| Stop-loss executed | Email, Push, Telegram, SMS |
| Take-profit executed | Email, Push, Telegram |
| Chain step completed | Push |
| Chain completed fully | Email, Push |
| Order failed | Email, Push (critical!) |
| Balance too low to execute | Email, Push (critical!) |
| Exchange API error | Email, Push (critical!) |

---

## 5. DATABASE SCHEMA DESIGN

### MongoDB Collections

#### `users`
```js
{
  _id, name, email, passwordHash,
  avatar, role, plan,
  isEmailVerified, twoFAEnabled, twoFASecret,
  defaultCurrency, defaultExchange, theme,
  notificationPrefs: { email, sms, push, telegram },
  createdAt, updatedAt, lastLoginAt,
  isActive, deletedAt
}
```

#### `exchange_keys`
```js
{
  _id, userId, exchangeName, label,
  apiKey (encrypted), apiSecret (encrypted), passphrase (encrypted),
  permissions: ['read', 'trade', 'withdraw'],
  isActive, lastTestedAt, lastUsedAt,
  createdAt, updatedAt
}
```

#### `portfolio_snapshots`
```js
{
  _id, userId, snapshotDate,
  totalValueUSD, totalValueINR,
  assets: [{ exchange, asset, quantity, priceUSD, valueUSD }],
  createdAt
}
```

#### `orders`
```js
{
  _id, userId, exchangeName, exchangeOrderId,
  symbol, side, type, status,
  quantity, price, avgFillPrice,
  filledQuantity, remainingQuantity,
  fee, feeCurrency,
  botId, isBot,
  createdAt, updatedAt, filledAt
}
```

#### `bots`
```js
{
  _id, userId, name, description, tags,
  exchangeName, symbol, strategy,
  config: { /* strategy-specific params */ },
  status: 'active' | 'paused' | 'stopped',
  isPaperTrade, isBacktest,
  budget, spent, totalPnl, winRate,
  startedAt, stoppedAt,
  lastRunAt, nextRunAt,
  createdAt, updatedAt
}
```

#### `bot_logs`
```js
{
  _id, botId, userId,
  action, details, orderId,
  pnl, timestamp
}
```

#### `alerts`
```js
{
  _id, userId, type,
  coin, condition, threshold, currency,
  isTriggered, triggeredAt,
  channels: ['email', 'telegram'],
  createdAt
}
```

#### `notifications`
```js
{
  _id, userId, title, message,
  type, isRead, link,
  createdAt
}
```

#### `trades`
```js
{
  _id, userId, exchangeName, tradeId,
  symbol, side, quantity, price,
  fee, feeCurrency,
  orderId, botId,
  executedAt
}
```

#### `otps`
```js
{ _id, email, otp, expiresAt, createdAt }
```

#### `support_tickets`
```js
{
  _id, userId, subject, message,
  status: 'open' | 'in_progress' | 'resolved',
  adminReply, createdAt, updatedAt
}
```

---

## 5. API ARCHITECTURE

### Base URL: `/api/`

### Auth Routes (`/api/auth/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login with email+password |
| POST | `/logout` | Invalidate JWT |
| POST | `/send-otp` | Send email OTP |
| POST | `/verify-otp` | Verify OTP |
| POST | `/forgot-password` | Send reset email |
| POST | `/reset-password` | Reset with token |
| POST | `/refresh-token` | Refresh access token |
| GET | `/me` | Get current user profile |

### User Routes (`/api/user/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get user profile |
| PATCH | `/profile` | Update profile |
| PATCH | `/change-password` | Change password |
| POST | `/avatar` | Upload avatar |
| GET | `/sessions` | List active sessions |
| DELETE | `/sessions/:id` | Revoke session |
| DELETE | `/account` | Delete account |
| GET | `/data-export` | Export all data |

### Exchange Keys (`/api/keys/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all exchange keys |
| POST | `/` | Add new API key |
| POST | `/test` | Test connectivity |
| PATCH | `/:id` | Update key |
| DELETE | `/:id` | Delete key |

### Dashboard (`/api/dashboard/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/overview` | Total value, 24h change |
| GET | `/portfolio-chart` | Portfolio value history |
| GET | `/allocation` | Asset allocation breakdown |
| GET | `/recent-orders` | Last 10 orders |
| GET | `/market-overview` | BTC dominance, market cap |

### Portfolio (`/api/portfolio/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Full unified portfolio |
| GET | `/:exchange` | Portfolio for one exchange |
| GET | `/history` | Snapshot history |
| GET | `/pnl` | P&L summary |
| GET | `/asset/:symbol` | Single asset detail |

### Trading (`/api/trading/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/order` | Place order |
| GET | `/pairs` | Get available trading pairs |
| GET | `/ticker/:symbol` | Get live ticker |
| GET | `/orderbook/:symbol` | Get order book |
| GET | `/klines/:symbol` | Get candlestick data |

### Orders (`/api/orders/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all orders (paginated) |
| GET | `/:id` | Get order detail |
| DELETE | `/:id` | Cancel order |
| DELETE | `/bulk` | Bulk cancel open orders |
| GET | `/export` | Export as CSV |

### Bots (`/api/bots/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all bots |
| POST | `/` | Create new bot |
| GET | `/:id` | Get bot detail |
| PATCH | `/:id` | Update bot config |
| DELETE | `/:id` | Delete bot |
| POST | `/:id/start` | Start bot |
| POST | `/:id/pause` | Pause bot |
| POST | `/:id/stop` | Stop bot |
| GET | `/:id/logs` | Get bot activity logs |
| POST | `/:id/backtest` | Run backtest |

### Alerts (`/api/alerts/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List alerts |
| POST | `/` | Create alert |
| PATCH | `/:id` | Update alert |
| DELETE | `/:id` | Delete alert |

### Notifications (`/api/notifications/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get notifications |
| PATCH | `/:id/read` | Mark as read |
| PATCH | `/read-all` | Mark all read |
| DELETE | `/:id` | Delete notification |

### Reports (`/api/reports/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pnl` | P&L report |
| GET | `/trades` | Trade performance |
| GET | `/fees` | Fee summary |
| GET | `/tax` | Tax report |
| GET | `/export` | Export report |

### Exchange Info (`/api/exchange/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/supported` | List supported exchanges |
| GET | `/:name/pairs` | Trading pairs for exchange |
| GET | `/:name/status` | Exchange API health |

### Settings (`/api/settings/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all settings |
| PATCH | `/` | Update settings |
| PATCH | `/notifications` | Update notification prefs |
| POST | `/2fa/enable` | Enable 2FA |
| POST | `/2fa/disable` | Disable 2FA |
| GET | `/subscription` | Get plan details |

### Support (`/api/help/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ticket` | Submit support ticket |
| GET | `/ticket` | List user's tickets |
| GET | `/faq` | Get FAQ list |

### Webhooks (`/api/webhooks/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tradingview/:botId` | Receive TradingView alert |

---

## 6. AUTOMATION ENGINE

### Architecture
```
User Config → Bot Definition (MongoDB)
     ↓
Scheduler (node-cron / Agenda.js)
     ↓
Strategy Evaluator (RSI, DCA, Grid, etc.)
     ↓
Order Queue (BullMQ + Redis)
     ↓
Exchange Adapter (Binance / CoinDCX / etc.)
     ↓
Order Executed → Log → Notify User
```

### DCA Bot Logic
```
Every N hours/days:
  1. Fetch current price of target coin
  2. If conditions met (or always for pure DCA):
  3. Place market BUY order for $X amount
  4. Log the trade to bot_logs
  5. Send notification to user
  6. Update bot stats (total spent, total units)
```

### Grid Bot Logic
```
On setup:
  1. Calculate N price levels between lower and upper bound
  2. Place BUY orders at levels below current price
  3. Place SELL orders at levels above current price
On price hit:
  1. Order fills → place opposite order at next level
  2. Pocket the spread as profit per grid
```

### RSI Bot Logic
```
Every interval:
  1. Fetch candles (e.g., 15m, 1h)
  2. Calculate RSI (14-period default)
  3. If RSI < buyThreshold (e.g., 30) → place BUY
  4. If RSI > sellThreshold (e.g., 70) → place SELL
  5. Apply safety checks (max orders, budget limit)
```

### Webhook Bot (TradingView)
```
TradingView Alert → POST /api/webhooks/tradingview/:botId
  Body: { action: "buy" | "sell", symbol, quantity }
  1. Validate webhook secret
  2. Look up bot config
  3. Execute corresponding order
  4. Log & notify
```

---

## 7. SECURITY ARCHITECTURE

### API Key Encryption
- All exchange API keys stored using **AES-256-GCM** encryption
- Encryption key stored in environment variable (`ENCRYPTION_SECRET`)
- Keys are **never returned in plaintext** via API (only masked: `****XXXX`)
- Keys decrypted **only at runtime** when needed to call exchange APIs

### Authentication
- JWT access tokens (15 min expiry) + refresh tokens (7 days)
- Tokens stored in **HttpOnly cookies** (not localStorage)
- CSRF protection on all mutating endpoints
- Rate limiting: 100 req/min per IP, 20 auth attempts/15min

### Input Validation
- All inputs validated with **Zod** schemas
- SQL injection prevention (MongoDB parameterized queries via Mongoose)
- XSS protection via Content Security Policy headers
- All user-facing error messages are generic (no leaking internals)

### Audit Logs
- All sensitive actions logged: key add/delete, password change, bot start/stop
- IP address and user agent recorded per login

---

## 8. UI/UX PAGES & COMPONENTS

### Pages
| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing Page | Marketing page with features, pricing, CTA |
| `/login` | Login | Email + password, Google OAuth |
| `/register` | Register | Multi-step signup with OTP verify |
| `/reset-password` | Reset Password | Forgot password flow |
| `/dashboard` | Dashboard | Main overview (protected) |
| `/portfolio` | Portfolio | Unified portfolio view |
| `/trading` | Trading | Order placement + charts |
| `/orders` | Orders | Order history & management |
| `/bots` | Bots | Bot list, create, manage |
| `/bots/[id]` | Bot Detail | Config, logs, performance |
| `/bots/new` | Create Bot | Bot creation wizard |
| `/alerts` | Alerts | Price & portfolio alerts |
| `/reports` | Reports | Analytics & P&L reports |
| `/api-keys` | API Keys | Exchange key management |
| `/notifications` | Notifications | All notifications |
| `/settings` | Settings | Account settings |
| `/profile` | Profile | User profile |
| `/help` | Help & Support | FAQ + support tickets |
| `/market` | Market | Live market data explorer |

### Key UI Components
- `Navbar` — Top nav with search, notifications, user menu
- `Sidebar` — Collapsible left nav with all routes + icons
- `ExchangeCard` — Shows exchange balance summary
- `PortfolioTable` — Sortable asset list with P&L columns
- `TradingChart` — TradingView embed or ApexCharts candlestick
- `OrderForm` — Buy/Sell form with market/limit/stop options
- `OrderBook` — Live bid/ask display
- `BotCard` — Bot summary with status, P&L, controls
- `BotWizard` — Multi-step bot creation form
- `AlertForm` — Create/edit price alerts
- `NotificationPanel` — Slide-out notification drawer
- `PriceChart` — Line chart for portfolio history
- `AllocationChart` — Donut chart for asset allocation
- `ReportChart` — Bar/line chart for P&L over time
- `StatCard` — KPI stat display (value, % change, icon)
- `DataTable` — Reusable sortable, filterable, paginated table
- `Modal` — Confirmation and detail modals
- `Toast` — Success/error/info toasts

### Design System
- **Theme**: Dark mode primary + Light mode toggle
- **Primary Color**: Blue (#3B82F6) / Purple gradient (#7C3AED → #3B82F6)
- **Background**: #0A0A0F (dark), #F8F9FA (light)
- **Font**: Inter (Google Fonts)
- **Chart Colors**: Multi-color palette for assets
- **Glassmorphism**: Cards with backdrop-blur + semi-transparent bg
- **Animations**: Framer Motion for page transitions, micro-animations

---

## 9. TECH STACK & DEPENDENCIES

### Core
| Package | Purpose |
|---------|---------|
| `next@15` | Full-stack framework (App Router) |
| `react@19` | UI library |
| `typescript` | Type safety |
| `mongoose` | MongoDB ODM |
| `axios` | HTTP client for exchange APIs |

### Authentication & Security
| Package | Purpose |
|---------|---------|
| `jsonwebtoken` | JWT generation and verification |
| `bcryptjs` | Password hashing |
| `crypto` (built-in) | AES encryption for API keys |
| `zod` | Input validation |

### UI & Styling
| Package | Purpose |
|---------|---------|
| `tailwindcss@4` | Utility-first CSS |
| `framer-motion` | Animations |
| `lucide-react` | Icon library |
| `react-icons` | Additional icons |
| `apexcharts` + `react-apexcharts` | Charts |
| `chart.js` + `react-chartjs-2` | Additional charting |

### Email
| Package | Purpose |
|---------|---------|
| `nodemailer` | Email sending |
| `@sendgrid/mail` | SendGrid (Phase 2) |

### Forms
| Package | Purpose |
|---------|---------|
| `react-hook-form` | Form state management |
| `@hookform/resolvers` | Zod + react-hook-form integration |

### Automation (Phase 2)
| Package | Purpose |
|---------|---------|
| `node-cron` | Cron job scheduling |
| `bullmq` | Job queue (Redis-backed) |
| `ioredis` | Redis client |
| `agenda` | MongoDB-backed job scheduler |

### Market Data
| Package | Purpose |
|---------|---------|
| `ws` | WebSocket client (exchange live feeds) |
| CoinGecko API | Public price data (free tier) |
| CryptoPanic API | Crypto news feed |

---

## 10. FILE & FOLDER STRUCTURE

```
crypto-manager/
├── public/
│   ├── favicon.ico
│   └── images/
│       └── exchanges/         # Exchange logos
│           ├── binance.svg
│           ├── coindcx.svg
│           ├── wazirx.svg
│           └── ...
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   ├── globals.css        # Global styles
│   │   │
│   │   ├── (auth)/            # Auth route group (no sidebar)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── (app)/             # App route group (with sidebar)
│   │   │   ├── layout.tsx     # App layout with Sidebar + Navbar
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── portfolio/page.tsx
│   │   │   ├── trading/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── bots/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── alerts/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── api-keys/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── market/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── help/page.tsx
│   │   │
│   │   └── api/               # API Routes
│   │       ├── auth/
│   │       │   ├── register/route.ts
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   ├── send-otp/route.ts
│   │       │   ├── verify-otp/route.ts
│   │       │   ├── forgot-password/route.ts
│   │       │   ├── reset-password/route.ts
│   │       │   └── me/route.ts
│   │       ├── user/
│   │       │   ├── profile/route.ts
│   │       │   ├── change-password/route.ts
│   │       │   └── sessions/route.ts
│   │       ├── keys/
│   │       │   ├── route.ts           # GET list / POST add
│   │       │   ├── test/route.ts
│   │       │   └── [id]/route.ts      # PATCH / DELETE
│   │       ├── dashboard/
│   │       │   ├── overview/route.ts
│   │       │   ├── portfolio-chart/route.ts
│   │       │   └── market-overview/route.ts
│   │       ├── portfolio/
│   │       │   ├── route.ts
│   │       │   ├── history/route.ts
│   │       │   └── pnl/route.ts
│   │       ├── trading/
│   │       │   ├── order/route.ts
│   │       │   ├── ticker/[symbol]/route.ts
│   │       │   ├── orderbook/[symbol]/route.ts
│   │       │   └── klines/[symbol]/route.ts
│   │       ├── orders/
│   │       │   ├── route.ts
│   │       │   ├── export/route.ts
│   │       │   └── [id]/route.ts
│   │       ├── bots/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   ├── [id]/start/route.ts
│   │       │   ├── [id]/pause/route.ts
│   │       │   ├── [id]/stop/route.ts
│   │       │   └── [id]/logs/route.ts
│   │       ├── alerts/route.ts
│   │       ├── alerts/[id]/route.ts
│   │       ├── notifications/route.ts
│   │       ├── reports/route.ts
│   │       ├── exchange/route.ts
│   │       ├── settings/route.ts
│   │       ├── help/route.ts
│   │       └── webhooks/
│   │           └── tradingview/[botId]/route.ts
│   │
│   ├── components/            # Reusable UI components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── ExchangeCard.tsx
│   │   │   ├── RecentOrders.tsx
│   │   │   └── MarketOverview.tsx
│   │   ├── portfolio/
│   │   │   ├── PortfolioTable.tsx
│   │   │   ├── AllocationChart.tsx
│   │   │   └── PortfolioChart.tsx
│   │   ├── trading/
│   │   │   ├── OrderForm.tsx
│   │   │   ├── OrderBook.tsx
│   │   │   └── TradingChart.tsx
│   │   ├── orders/
│   │   │   └── OrdersTable.tsx
│   │   ├── bots/
│   │   │   ├── BotCard.tsx
│   │   │   ├── BotWizard.tsx
│   │   │   └── BotLogs.tsx
│   │   ├── alerts/
│   │   │   └── AlertForm.tsx
│   │   ├── reports/
│   │   │   └── ReportChart.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       ├── DataTable.tsx
│   │       ├── Badge.tsx
│   │       ├── Spinner.tsx
│   │       └── Card.tsx
│   │
│   ├── lib/                   # Backend logic
│   │   ├── dbConnect.js       # MongoDB connection
│   │   ├── models/            # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── ExchangeKey.js
│   │   │   ├── Order.js
│   │   │   ├── Bot.js
│   │   │   ├── BotLog.js
│   │   │   ├── Alert.js
│   │   │   ├── Notification.js
│   │   │   ├── Trade.js
│   │   │   ├── PortfolioSnapshot.js
│   │   │   ├── SupportTicket.js
│   │   │   └── Otp.js
│   │   ├── services/          # Exchange adapters + business logic
│   │   │   ├── exchanges/
│   │   │   │   ├── adapter.interface.js  # Common interface
│   │   │   │   ├── binanceService.js
│   │   │   │   ├── coindcxService.js
│   │   │   │   ├── wazirxService.js      # Phase 2
│   │   │   │   ├── krakenService.js      # Phase 2
│   │   │   │   └── coinbaseService.js    # Phase 2
│   │   │   ├── priceService.js           # CoinGecko price fetch
│   │   │   ├── notificationService.js    # Email + push + telegram
│   │   │   ├── botEngine.js              # Bot strategy execution
│   │   │   ├── portfolioService.js       # Unified portfolio aggregation
│   │   │   ├── reportService.js          # P&L calculation
│   │   │   └── encryptionService.js      # AES encrypt/decrypt
│   │   ├── controllers/       # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── apiKeysController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── portfolioController.js
│   │   │   ├── tradingController.js
│   │   │   ├── ordersController.js
│   │   │   ├── botsController.js
│   │   │   ├── alertsController.js
│   │   │   ├── notificationsController.js
│   │   │   ├── reportsController.js
│   │   │   ├── exchangeController.js
│   │   │   ├── settingsController.js
│   │   │   └── supportController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT verification
│   │   │   ├── rateLimiter.js
│   │   │   └── errorHandler.js
│   │   └── utils/
│   │       ├── apiResponse.js      # Standardized API responses
│   │       ├── dateUtils.js        # Date formatting helpers
│   │       ├── cryptoUtils.js      # AES encrypt/decrypt helpers
│   │       └── validationSchemas.js  # Zod schemas
│   │
│   └── hooks/                 # React custom hooks
│       ├── useAuth.ts
│       ├── usePortfolio.ts
│       ├── useOrders.ts
│       └── useWebSocket.ts
│
├── .env                       # Environment variables
├── .env.local                 # Local overrides
├── .gitignore
├── next.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 11. ENVIRONMENT VARIABLES

```env
# Database
MONGO_URI=mongodb+srv://...

# Auth
JWT_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption (for API keys at rest)
ENCRYPTION_SECRET=32-char-random-string

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=noreply@cryptomanager.com

# App URL
NEXT_PUBLIC_APP_URL=https://yourapp.com
FRONTEND_URL=https://yourapp.com

# Redis (for bot queue - Phase 2)
REDIS_URL=redis://localhost:6379

# SendGrid (Phase 2)
SENDGRID_API_KEY=

# Twilio SMS (Phase 2)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Telegram Bot (Phase 2)
TELEGRAM_BOT_TOKEN=

# CoinGecko
COINGECKO_API_KEY=   # Optional - increases rate limit

# CryptoPanic News Feed
CRYPTOPANIC_API_KEY=

# Stripe (for subscriptions - Phase 2)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Webhook signing
WEBHOOK_SECRET=random-secret-for-tradingview-webhooks
```

---

## 12. DEPLOYMENT PLAN

### Infrastructure
| Service | Provider |
|---------|---------|
| Frontend + API | Vercel (Next.js serverless) |
| Database | MongoDB Atlas (free M0 → paid M10) |
| Redis (bots) | Upstash Redis (serverless) |
| Email | Gmail SMTP → SendGrid |
| Media (avatars) | Cloudinary or Vercel Blob |
| Domain | Custom domain via Vercel |

### CI/CD
- GitHub → push to `main` → Vercel auto-deploy
- Staging branch: `dev` → preview URL on Vercel

### Monitoring
- Vercel Analytics (built-in)
- Sentry for error tracking
- Uptime monitoring via BetterUptime

---

## 13. FUTURE ROADMAP

### Version 2.1
- [ ] Mobile app (React Native / Expo)
- [ ] WazirX, Kraken, Coinbase exchange support
- [ ] Telegram bot for alerts + commands
- [ ] Advanced backtesting with historical OHLCV data

### Version 2.2
- [ ] Social trading (copy other users' bots)
- [ ] Leaderboard of top-performing bots
- [ ] AI-powered trade suggestions (ML model)
- [ ] NFT portfolio tracking

### Version 3.0
- [ ] DeFi integration (Uniswap, Aave, Compound)
- [ ] On-chain portfolio tracking (connect wallet)
- [ ] Cross-chain aggregation (ETH, BSC, Solana, Polygon)
- [ ] Tax report automation for multiple countries

---

## ✅ IMPLEMENTATION CHECKLIST (Phase 1 MVP)

### Backend
- [ ] Authentication system (register, login, OTP, JWT)
- [ ] User profile CRUD
- [ ] Exchange key management (add, encrypt, test, delete)
- [ ] Portfolio aggregation (Binance + CoinDCX)
- [ ] Unified orders API (list, place, cancel)
- [ ] Dashboard overview API
- [ ] Notifications system
- [ ] Settings API
- [ ] Support ticket API
- [ ] Reports / P&L calculation

### Frontend
- [ ] Landing page (marketing)
- [ ] Auth pages (login, register, OTP verify, reset password)
- [ ] App layout (sidebar + navbar)
- [ ] Dashboard page
- [ ] Portfolio page
- [ ] Trading page
- [ ] Orders page
- [ ] API Keys page
- [ ] Notifications page
- [ ] Settings page
- [ ] Profile page
- [ ] Help page

### Phase 2 Additions
- [ ] Bot engine (DCA, Grid, RSI strategies)
- [ ] Bots management UI
- [ ] Alerts system
- [ ] Reports page
- [ ] Market data explorer
- [ ] More exchange integrations
- [ ] TradingView webhook support

---

*This document serves as the single source of truth for all features and architecture decisions for the CryptoManager platform.*
