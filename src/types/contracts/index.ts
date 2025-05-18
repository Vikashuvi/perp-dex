import { ethers } from "ethers";

// ABI for the PerpetualMarket contract
const PERPETUAL_MARKET_ABI = [
  "function openPosition(uint256 _margin, uint256 _leverage, bool _isLong) external",
  "function closePosition() external",
  "function positions(address) external view returns (uint256 size, uint256 margin, uint256 entryPrice, bool isLong, uint256 lastFundingPayment)",
  "function liquidatePosition(address _trader) external",
  "function fundingRate() external view returns (uint256)",
  "function lastFundingTime() external view returns (uint256)"
];

// Factory for creating PerpetualMarket contract instances
export class PerpetualMarket__factory {
  static connect(address: string, signerOrProvider: ethers.Signer | ethers.Provider) {
    return new ethers.Contract(address, PERPETUAL_MARKET_ABI, signerOrProvider);
  }
}

// ABI for the CollateralManager contract
const COLLATERAL_MANAGER_ABI = [
  "function depositCollateral(uint256 _amount) external",
  "function withdrawCollateral(uint256 _amount) external",
  "function getAvailableCollateral(address _user) external view returns (uint256)",
  "function lockCollateral(address _user, uint256 _amount) external",
  "function releaseCollateral(address _user, uint256 _amount) external"
];

// Factory for creating CollateralManager contract instances
export class CollateralManager__factory {
  static connect(address: string, signerOrProvider: ethers.Signer | ethers.Provider) {
    return new ethers.Contract(address, COLLATERAL_MANAGER_ABI, signerOrProvider);
  }
}

// ABI for the PriceOracle contract
const PRICE_ORACLE_ABI = [
  "function getPrice(string memory _marketSymbol) external view returns (uint256)",
  "function updatePrice(string memory _marketSymbol, uint256 _price) external"
];

// Factory for creating PriceOracle contract instances
export class PriceOracle__factory {
  static connect(address: string, signerOrProvider: ethers.Signer | ethers.Provider) {
    return new ethers.Contract(address, PRICE_ORACLE_ABI, signerOrProvider);
  }
}
