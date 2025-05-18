# Perpetual DEX Guide

## Overview

This perpetual DEX (Decentralized Exchange) allows users to trade perpetual futures contracts in a decentralized manner. Perpetual futures are derivative contracts that allow traders to speculate on the price of an asset without an expiration date.

## Key Features

- **Decentralized Trading**: Trade directly from your wallet without intermediaries
- **Perpetual Futures**: No expiration date, trade as long as you want
- **Leverage Trading**: Amplify your position size up to 20x
- **Long & Short Positions**: Profit from both rising and falling markets
- **Funding Rate Mechanism**: Keeps perpetual prices aligned with spot prices
- **Liquidation Protection**: Automatic liquidation to protect the protocol

## Smart Contracts

The DEX is built on three main smart contracts:

1. **PerpetualMarket.sol**: Handles trading positions, leverage, and liquidations
2. **CollateralManager.sol**: Manages user deposits and locked collateral
3. **PriceOracle.sol**: Provides price data for the trading pairs

## How to Use the DEX

### Connecting Your Wallet

1. Click the "Connect Wallet" button in the top-right corner
2. Select your wallet provider (MetaMask, etc.)
3. Approve the connection request

### Depositing Collateral

Before trading, you need to deposit collateral:

1. Ensure you have the required tokens (USDC, etc.)
2. The collateral will be used as margin for your positions

### Opening a Position

1. Select the market you want to trade (e.g., ETH-USD)
2. Choose position type: Long (price goes up) or Short (price goes down)
3. Set your leverage (1x to 20x)
4. Enter the margin amount
5. For limit orders, set your desired entry price
6. Click "Open Long Position" or "Open Short Position"

### Managing Positions

1. View your open positions in the Positions tab
2. Monitor your PnL (Profit and Loss)
3. Be aware of your liquidation price
4. Close positions when ready by clicking "Close Position"

### Understanding Funding Rates

Funding rates are periodic payments between long and short traders:

- When funding rate is positive: Longs pay shorts
- When funding rate is negative: Shorts pay longs
- Funding occurs every 8 hours
- Rates are based on the difference between perpetual and spot prices

### Liquidations

Positions are liquidated when margin ratio falls below the liquidation threshold:

- Liquidation price depends on your leverage and position size
- Higher leverage means liquidation price is closer to entry price
- Always monitor your position's health

## Risk Management

- **Use Appropriate Leverage**: Higher leverage means higher risk
- **Set Stop Losses**: Consider setting stop-loss orders to limit potential losses
- **Monitor Funding Rates**: Be aware of funding payments that may affect your position
- **Diversify**: Don't put all your capital in a single position

## Technical Architecture

The DEX consists of:

1. **Smart Contracts**: Solidity contracts deployed on the blockchain
2. **Frontend Interface**: React application for user interaction
3. **Price Oracles**: External price feeds for accurate market data
4. **Order Matching**: On-chain order matching for trade execution

## Fees

- **Trading Fee**: 0.05% of position size
- **Funding Rate**: Variable, paid every 8 hours
- **Liquidation Fee**: 2.5% of position size

## Security Considerations

- Smart contracts have been designed with security best practices
- Always verify transaction details before confirming
- Use hardware wallets for additional security
- Be cautious of phishing attempts

## Support

For support or questions, please contact:
- Email: support@perp-dex.com
- Discord: [Join our community](https://discord.gg/perpdex)
- Twitter: [@PerpDEX](https://twitter.com/perpdex)
