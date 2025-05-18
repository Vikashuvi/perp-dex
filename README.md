# Perpetual DEX

A modern decentralized exchange for trading perpetual futures contracts with advanced trading features.

![Perpetual DEX Screenshot](https://example.com/screenshot.png)

## Features

- **Perpetual Futures Trading**: Trade cryptocurrency perpetual futures without expiration dates
- **Leverage Trading**: Amplify your position size up to 20x
- **Advanced Order Types**: Market, limit, stop-loss, and take-profit orders
- **Position Management**: Open, modify, and close positions with detailed tracking
- **Liquidity Provision**: Provide liquidity to earn fees and rewards
- **Real-time Data**: Live price charts, order book, and trade history
- **Dark Mode**: Reduced eye strain for night trading
- **Responsive Design**: Works on desktop and mobile devices
- **Notification System**: Stay informed about important events

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/perp-dex.git
   cd perp-dex
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **State Management**: Redux Toolkit
- **Blockchain Interaction**: ethers.js
- **Build Tool**: Vite
- **Smart Contracts**: Solidity, Hardhat

---

# User Documentation

## Beginner's Guide

### What is a Perpetual DEX?

A Perpetual DEX (Decentralized Exchange) is a platform where you can trade cryptocurrency futures without an expiration date. This means you can hold your position for as long as you want.

### Basic Concepts

#### Trading Positions

- **Long Position**: You buy when you think the price will go up
- **Short Position**: You sell when you think the price will go down

#### Leverage

Leverage lets you borrow money to make bigger trades. For example, with 5x leverage, you can open a $500 position with only $100 of your own money.

**Example**: If you have $100 and use 5x leverage to go long (buy), you control a $500 position. If the price goes up 10%, you make $50 (50% of your $100), not just $10.

**Warning**: Leverage increases both potential profits AND potential losses!

#### Liquidation

If your position loses too much money, it will be automatically closed (liquidated). This happens to protect the platform from losses.

**Example**: If you open a position with 10x leverage and the price moves against you by about 8%, you might get liquidated and lose your entire margin.

### Getting Started

1. **Connect Your Wallet**: Click the "Connect Wallet" button in the top right corner
2. **Check Your Balance**: After connecting, you'll see your token balances
3. **Choose Basic or Advanced Mode**: Select the interface that suits your experience level

### How to Trade

#### Opening a Position

1. Go to the "Trade" tab
2. Choose "Long" (buy) or "Short" (sell)
3. Enter the amount of margin you want to use
4. Select your leverage (1x to 20x)
5. Click "Open Long Position" or "Open Short Position"

#### Closing a Position

1. Go to the "Positions" tab
2. Find the position you want to close
3. Click "Close Position"

### Beginner Tips

1. **Start Small**: Use small amounts until you understand how everything works
2. **Use Low Leverage**: Start with 1x or 2x leverage to reduce risk
3. **Set Stop Losses**: Always use stop losses to protect yourself from big losses
4. **Learn the Patterns**: Use the Analytics tab to see what works for you
5. **Don't Chase Losses**: If you lose money, don't immediately try to win it back with bigger trades

## Advanced Trading Features

### Advanced Trading Interface

The advanced trading interface provides additional tools and options compared to the basic interface:

- **Stop Loss & Take Profit**: Set automatic exit points for your positions
- **Partial Position Closing**: Close only a portion of your position
- **Multiple Market Support**: Trade across different markets (ETH-USD, BTC-USD, SOL-USD)
- **Advanced Position Management**: More detailed position information and controls
- **Enhanced UI**: Modern interface with dark mode support and improved visual feedback

### Accessing Advanced Mode

To access the advanced trading interface:

1. Click the "Advanced" button in the top-right corner of the interface
2. The interface will immediately switch to advanced mode with additional features
3. You can switch back to basic mode at any time by clicking the "Basic" button

### Dark Mode Support

The Perpetual DEX now supports dark mode for reduced eye strain during night trading:

1. Click the sun/moon icon in the top-right corner to toggle between light and dark mode
2. All charts, order books, and trading interfaces will automatically adjust to your preferred theme
3. Your preference will be saved for future sessions

### Advanced Risk Management

#### 1. Stop Loss and Take Profit Orders

Set automatic exit points for your positions:

- **Stop Loss**: Automatically closes your position if the price moves against you by a certain amount
- **Take Profit**: Automatically closes your position when you reach a desired profit level

Benefits:
- Limits potential losses with stop loss
- Secures profits with take profit
- Allows for unattended position management

#### 2. Scaled Entry and Exit

Instead of entering or exiting a position all at once:

- Open positions in multiple smaller increments at different price levels
- Close positions partially at different profit targets
- Helps achieve better average entry and exit prices

#### 3. Risk-Reward Ratio

Maintain a healthy risk-reward ratio:

- Aim for take profit targets that are at least 2-3 times the distance of your stop loss
- Example: If risking $100 on a stop loss, aim for at least $200-300 in potential profit

### Market Analysis Tools

The advanced interface includes enhanced market analysis tools:

- **Multiple Timeframes**: View charts in 5m, 15m, 1h, 4h, and 1d intervals
- **Order Book Depth**: See more levels of the order book
- **Open Interest Data**: View long/short ratio and market imbalance
- **Price Indicators**: Access to more technical indicators (coming soon)

#### Chart Timeframe Selection

The improved UI makes it easier to switch between different chart timeframes:

1. Look for the timeframe selector buttons above the price chart
2. Click on your desired timeframe (5m, 15m, 1h, 4h, or 1d)
3. The chart will immediately update to display data for the selected timeframe
4. Your selected timeframe will be highlighted in blue

#### Enhanced Order Book Visualization

The order book now features improved visualization:

1. Buy orders (bids) are displayed with green intensity based on order size
2. Sell orders (asks) are displayed with red intensity based on order size
3. Hover over any price level to see detailed information about the orders
4. The spread between the highest bid and lowest ask is clearly highlighted

#### Real-time Data Updates

All market data is now updated in real-time with visual indicators:

1. New trades are highlighted briefly when they appear in the trade history
2. Order book changes are animated to show additions and removals
3. Price movements in the chart are smoothly animated
4. Funding rate updates are highlighted when they change

## Notification System

### What are Notifications?

Notifications are messages that appear in your Perpetual DEX to let you know about important events. They help you stay informed about what's happening with your trades and account.

### Types of Notifications

The Perpetual DEX has four types of notifications, each with a distinct color and icon for easy identification:

1. **Info (Blue)**: General information and updates
   - Displayed with a blue information icon
   - Used for general announcements and updates

2. **Success (Green)**: Confirmation that something worked correctly
   - Displayed with a green checkmark icon
   - Indicates successful operations like trades or deposits

3. **Warning (Yellow)**: Something that needs your attention but isn't an emergency
   - Displayed with a yellow warning triangle
   - Alerts you to potential issues like approaching liquidation

4. **Error (Red)**: Something went wrong that needs immediate attention
   - Displayed with a red error icon
   - Indicates critical issues that require immediate action

### How to Use the Notification System

#### Viewing Notifications

1. Click the bell icon in the top right corner of the screen
2. A dropdown will appear showing your recent notifications
3. Unread notifications have a colored background based on their type:
   - Info: Light blue background
   - Success: Light green background
   - Warning: Light yellow background
   - Error: Light red background
4. Read notifications have a white background (or dark gray in dark mode)
5. New notifications will briefly pulse to draw your attention

#### Managing Notifications

- **Mark as Read**: Click on a notification to mark it as read
- **Clear All**: Click "Clear All" at the top of the notification panel to remove all notifications
- **Auto-dismiss**: Some notifications will automatically disappear after being viewed

#### Understanding Notification Badges

- The bell icon shows a red badge with a number when you have unread notifications
- The number indicates how many unread notifications you have
- The badge will briefly animate when you receive a new notification
- In dark mode, the notification panel adapts to provide better contrast

## Liquidity Pool

### Overview

The Liquidity Pool is a core component of the Perpetual DEX that allows users to provide liquidity to the protocol and earn fees from trading activity. By participating in the liquidity pool, you become a liquidity provider (LP) and receive a share of the trading fees proportional to your contribution.

### Key Features

- **Earn Passive Income**: Collect trading fees from all perpetual trading activity
- **Insurance Fund**: Part of the fees go to an insurance fund that protects against losses
- **Flexible Deposits/Withdrawals**: Add or remove liquidity at any time
- **Transparent Fee Distribution**: Fees are distributed proportionally to your share

### How It Works

#### Providing Liquidity

1. Navigate to the "Liquidity" tab in the Perpetual DEX interface
2. Enter the amount of USDC you want to provide as liquidity
3. Click "Provide Liquidity" to deposit your funds
4. You'll receive a share of the liquidity pool proportional to your contribution

#### Earning Fees

- Trading fees are collected from all perpetual trading activity
- 90% of fees are distributed to liquidity providers
- 10% goes to the insurance fund to protect against losses
- Fees are distributed proportionally to your share of the pool
- Rewards accumulate in real-time and can be claimed at any time

### Strategies for Liquidity Providers

#### Long-term Providing

- Provide liquidity for extended periods to maximize fee accumulation
- Reinvest earned fees to compound returns
- Monitor utilization rate and market conditions

#### Dynamic Liquidity Management

- Increase liquidity during periods of high trading volume
- Reduce exposure during extreme market volatility
- Diversify across multiple liquidity pools

#### Risk Management

- Start with smaller amounts to test the waters
- Gradually increase your liquidity as you become comfortable
- Monitor your returns and adjust your strategy accordingly

## Trading Analytics

### Overview

The Trading Analytics section helps you understand your trading performance and make better decisions. It provides detailed information about your trading history, profitability, and patterns.

### Key Metrics

#### 1. Overall Performance

This section shows your overall trading performance:

- **Total PnL**: How much money you've made or lost in total
- **Win Rate**: The percentage of your trades that were profitable
- **Total Trades**: How many trades you've made
- **Profit Factor**: How much you win compared to how much you lose

#### 2. Performance by Market

This section shows how you're doing in each market (like ETH-USD, BTC-USD):

- **Trades**: Number of trades in each market
- **Win Rate**: Percentage of winning trades in each market
- **PnL**: Profit or loss in each market

This helps you see which markets you trade best in.

#### 3. Performance by Direction

This section compares your performance in:

- **Long Positions**: When you bet prices will go up
- **Short Positions**: When you bet prices will go down

For each direction, you'll see:
- Number of trades
- Win rate
- Total profit or loss

This helps you understand if you're better at trading in one direction.

#### 4. Recent Trades

This table shows your most recent trades with details like:

- **Market**: Which market you traded in
- **Side**: Whether you went long or short
- **Size**: How big your position was
- **Entry/Exit**: The prices you entered and exited at
- **PnL**: How much profit or loss you made
- **Close Time**: When you closed the trade

### How to Use Trading Analytics

#### 1. Choose a Time Range

At the top of the page, you can select different time periods to analyze your performance over different timeframes.

#### 2. Identify Your Strengths

Look for patterns in your trading:
- Which markets are you most profitable in?
- Are you better at long or short positions?
- What position sizes work best for you?

#### 3. Learn From Your Mistakes

Analyze your losing trades:
- What went wrong?
- Are there common patterns in your losses?
- How can you avoid similar mistakes in the future?

#### 4. Refine Your Strategy

Use the insights from your analytics to improve your trading strategy:
- Focus more on markets where you perform well
- Adjust your approach based on your long/short performance
- Set appropriate position sizes based on your risk tolerance

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

- Email: support@perp-dex.com
- Discord: [Join our community](https://discord.gg/perpdex)
- Twitter: [@PerpDEX](https://twitter.com/perpdex)
