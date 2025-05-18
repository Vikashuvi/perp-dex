import { ethers } from "ethers";
import { PerpetualMarket__factory } from "../types/contracts";

// ABI for the PerpetualMarket contract
const PERPETUAL_MARKET_ABI = [
  "function openPosition(uint256 _margin, uint256 _leverage, bool _isLong) external",
  "function closePosition() external",
  "function positions(address) external view returns (uint256 size, uint256 margin, uint256 entryPrice, bool isLong, uint256 lastFundingPayment)",
  "function liquidatePosition(address _trader) external",
  "function fundingRate() external view returns (uint256)",
  "function lastFundingTime() external view returns (uint256)"
];

// Contract addresses - would be different for each network
export const CONTRACT_ADDRESSES = {
  perpetualMarket: "0x0000000000000000000000000000000000000000", // Replace with actual address after deployment
  collateralManager: "0x0000000000000000000000000000000000000000", // Replace with actual address after deployment
  priceOracle: "0x0000000000000000000000000000000000000000" // Replace with actual address after deployment
};

/**
 * Open a new trading position
 * @param provider Ethereum provider
 * @param margin Amount of collateral to use as margin
 * @param leverage Leverage multiplier (1-20x)
 * @param isLong Whether position is long (true) or short (false)
 * @returns Transaction hash
 */
export const openPosition = async (
  provider: ethers.JsonRpcProvider,
  margin: number,
  leverage: number,
  isLong: boolean
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.perpetualMarket,
      PERPETUAL_MARKET_ABI,
      signer
    );

    // Convert margin to wei (assuming 18 decimals)
    const marginInWei = ethers.parseEther(margin.toString());
    
    // Call the contract method
    const tx = await contract.openPosition(marginInWei, leverage, isLong);
    await tx.wait();
    
    return tx.hash;
  } catch (error) {
    console.error("Error opening position:", error);
    throw error;
  }
};

/**
 * Close an existing position
 * @param provider Ethereum provider
 * @returns Transaction hash
 */
export const closePosition = async (
  provider: ethers.JsonRpcProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.perpetualMarket,
      PERPETUAL_MARKET_ABI,
      signer
    );
    
    // Call the contract method
    const tx = await contract.closePosition();
    await tx.wait();
    
    return tx.hash;
  } catch (error) {
    console.error("Error closing position:", error);
    throw error;
  }
};

/**
 * Get position details for a trader
 * @param provider Ethereum provider
 * @param traderAddress Address of the trader
 * @returns Position details
 */
export const getPosition = async (
  provider: ethers.JsonRpcProvider,
  traderAddress: string
): Promise<{
  size: bigint;
  margin: bigint;
  entryPrice: bigint;
  isLong: boolean;
  lastFundingPayment: bigint;
}> => {
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.perpetualMarket,
      PERPETUAL_MARKET_ABI,
      provider
    );
    
    // Call the contract method
    const position = await contract.positions(traderAddress);
    
    return {
      size: position[0],
      margin: position[1],
      entryPrice: position[2],
      isLong: position[3],
      lastFundingPayment: position[4]
    };
  } catch (error) {
    console.error("Error getting position:", error);
    throw error;
  }
};

/**
 * Get current funding rate
 * @param provider Ethereum provider
 * @returns Current funding rate
 */
export const getFundingRate = async (
  provider: ethers.JsonRpcProvider
): Promise<bigint> => {
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.perpetualMarket,
      PERPETUAL_MARKET_ABI,
      provider
    );
    
    // Call the contract method
    return await contract.fundingRate();
  } catch (error) {
    console.error("Error getting funding rate:", error);
    throw error;
  }
};

/**
 * Calculate liquidation price for a position
 * @param entryPrice Entry price of the position
 * @param leverage Leverage used
 * @param isLong Whether position is long or short
 * @returns Liquidation price
 */
export const calculateLiquidationPrice = (
  entryPrice: number,
  leverage: number,
  isLong: boolean
): number => {
  const liquidationThreshold = 0.8; // 80% of margin
  
  if (isLong) {
    return entryPrice * (1 - liquidationThreshold / leverage);
  } else {
    return entryPrice * (1 + liquidationThreshold / leverage);
  }
};

/**
 * Calculate PnL for a position
 * @param size Position size
 * @param entryPrice Entry price
 * @param currentPrice Current market price
 * @param isLong Whether position is long or short
 * @returns PnL amount
 */
export const calculatePnL = (
  size: number,
  entryPrice: number,
  currentPrice: number,
  isLong: boolean
): number => {
  if (isLong) {
    return size * (currentPrice - entryPrice) / entryPrice;
  } else {
    return size * (entryPrice - currentPrice) / entryPrice;
  }
};
