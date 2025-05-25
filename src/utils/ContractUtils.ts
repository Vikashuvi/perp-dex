import { ethers } from 'ethers';
import { getContractAddresses, DEFAULT_CHAIN_ID } from '../config/contracts';

// Contract ABIs - These will be imported from the artifacts after compilation
import PerpetualMarketABI from '../../artifacts/contracts/PerpetualMarket.sol/PerpetualMarket.json';
import CollateralManagerABI from '../../artifacts/contracts/CollateralManager.sol/CollateralManager.json';
import LiquidityPoolABI from '../../artifacts/contracts/LiquidityPool.sol/LiquidityPool.json';
import PriceOracleABI from '../../artifacts/contracts/PriceOracle.sol/PriceOracle.json';
import MockERC20ABI from '../../artifacts/contracts/mocks/MockERC20.sol/MockERC20.json';

// Types for contract interactions
export interface Position {
  size: bigint;
  margin: bigint;
  entryPrice: bigint;
  isLong: boolean;
  lastFundingPayment: bigint;
}

export interface MarketData {
  symbol: string;
  currentPrice: bigint;
  openInterestLong: bigint;
  openInterestShort: bigint;
  fundingRate: bigint;
  tradingEnabled: boolean;
}

export interface UserBalance {
  total: bigint;
  available: bigint;
  locked: bigint;
}

export class ContractUtils {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contracts: { [key: string]: ethers.Contract } = {};
  private chainId: number = DEFAULT_CHAIN_ID;
  private contractAddresses: any;

  constructor() {
    this.initializeProvider();
    this.contractAddresses = getContractAddresses(this.chainId);
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainIdHex: string) => {
        // Parse the chainId from hex to decimal
        const newChainId = parseInt(chainIdHex, 16);
        this.updateChainId(newChainId);
      });

      // Get initial chainId
      try {
        const { chainId } = await this.provider.getNetwork();
        this.updateChainId(Number(chainId));
      } catch (error) {
        console.error('Failed to get network:', error);
      }
    }
  }

  private updateChainId(newChainId: number) {
    console.log(`Chain changed to: ${newChainId}`);
    this.chainId = newChainId;

    try {
      this.contractAddresses = getContractAddresses(newChainId);
      // Re-initialize contracts if signer is available
      if (this.signer) {
        this.initializeContracts();
      }
    } catch (error) {
      console.error(`No configuration found for chainId ${newChainId}. Using default.`);
      this.contractAddresses = getContractAddresses(DEFAULT_CHAIN_ID);
    }
  }

  async connectWallet(): Promise<string | null> {
    try {
      if (!this.provider) {
        throw new Error('No wallet provider found');
      }

      await this.provider.send('eth_requestAccounts', []);
      this.signer = await this.provider.getSigner();

      // Get current chainId
      const { chainId } = await this.provider.getNetwork();
      this.updateChainId(Number(chainId));

      // Initialize contracts
      await this.initializeContracts();

      return await this.signer.getAddress();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  private async initializeContracts() {
    if (!this.signer) {
      throw new Error('Signer not available');
    }

    this.contracts = {
      perpetualMarket: new ethers.Contract(
        this.contractAddresses.PerpetualMarket,
        PerpetualMarketABI.abi,
        this.signer
      ),
      collateralManager: new ethers.Contract(
        this.contractAddresses.CollateralManager,
        CollateralManagerABI.abi,
        this.signer
      ),
      liquidityPool: new ethers.Contract(
        this.contractAddresses.LiquidityPool,
        LiquidityPoolABI.abi,
        this.signer
      ),
      priceOracle: new ethers.Contract(
        this.contractAddresses.PriceOracle,
        PriceOracleABI.abi,
        this.signer
      ),
      usdc: new ethers.Contract(
        this.contractAddresses.USDC,
        MockERC20ABI.abi,
        this.signer
      )
    };
  }

  // Market Data Functions
  async getMarketData(symbol: string): Promise<MarketData> {
    const perpetualMarket = this.contracts.perpetualMarket;
    const priceOracle = this.contracts.priceOracle;

    const [currentPrice, openInterestLong, openInterestShort, fundingRate, tradingEnabled] = await Promise.all([
      priceOracle.getPrice(symbol),
      perpetualMarket.openInterestLong(),
      perpetualMarket.openInterestShort(),
      perpetualMarket.fundingRate(),
      perpetualMarket.tradingEnabled()
    ]);

    return {
      symbol,
      currentPrice,
      openInterestLong,
      openInterestShort,
      fundingRate,
      tradingEnabled
    };
  }

  async getCurrentPrice(symbol: string): Promise<bigint> {
    const priceOracle = this.contracts.priceOracle;
    return await priceOracle.getPrice(symbol);
  }

  // Position Management Functions
  async openPosition(margin: bigint, leverage: number, isLong: boolean): Promise<ethers.TransactionResponse> {
    const perpetualMarket = this.contracts.perpetualMarket;
    return await perpetualMarket.openPosition(margin, leverage, isLong);
  }

  async closePosition(): Promise<ethers.TransactionResponse> {
    const perpetualMarket = this.contracts.perpetualMarket;
    return await perpetualMarket.closePosition();
  }

  async getUserPosition(userAddress: string): Promise<Position> {
    const perpetualMarket = this.contracts.perpetualMarket;
    return await perpetualMarket.positions(userAddress);
  }

  async liquidatePosition(traderAddress: string): Promise<ethers.TransactionResponse> {
    const perpetualMarket = this.contracts.perpetualMarket;
    return await perpetualMarket.liquidatePosition(traderAddress);
  }

  // Collateral Management Functions
  async getUserBalance(userAddress: string): Promise<UserBalance> {
    const collateralManager = this.contracts.collateralManager;

    const [total, locked]: [bigint, bigint] = await Promise.all([
      collateralManager.userBalance(userAddress),
      collateralManager.lockedCollateral(userAddress)
    ]);

    return {
      total,
      available: total - locked,
      locked
    };
  }

  async depositCollateral(amount: bigint): Promise<ethers.TransactionResponse> {
    const collateralManager = this.contracts.collateralManager;
    const usdc = this.contracts.usdc;

    // First approve the collateral manager to spend USDC
    const approveTx = await usdc.approve(this.contractAddresses.CollateralManager, amount);
    await approveTx.wait();

    // Then deposit the collateral
    return await collateralManager.depositCollateral(amount);
  }

  async withdrawCollateral(amount: bigint): Promise<ethers.TransactionResponse> {
    const collateralManager = this.contracts.collateralManager;
    return await collateralManager.withdrawCollateral(amount);
  }

  async getUSDCBalance(userAddress: string): Promise<bigint> {
    const usdc = this.contracts.usdc;
    return await usdc.balanceOf(userAddress);
  }

  // Liquidity Pool Functions
  async addLiquidity(amount: bigint): Promise<ethers.TransactionResponse> {
    const liquidityPool = this.contracts.liquidityPool;
    const usdc = this.contracts.usdc;

    // First approve the liquidity pool to spend USDC
    const approveTx = await usdc.approve(this.contractAddresses.LiquidityPool, amount);
    await approveTx.wait();

    // Then add liquidity
    return await liquidityPool.addLiquidity(amount);
  }

  async removeLiquidity(amount: bigint): Promise<ethers.TransactionResponse> {
    const liquidityPool = this.contracts.liquidityPool;
    return await liquidityPool.removeLiquidity(amount);
  }

  async getProviderInfo(providerAddress: string): Promise<{
    amount: bigint;
    sharePercentage: bigint;
    rewardsAccrued: bigint;
  }> {
    const liquidityPool = this.contracts.liquidityPool;
    return await liquidityPool.getProviderInfo(providerAddress);
  }

  async claimRewards(): Promise<ethers.TransactionResponse> {
    const liquidityPool = this.contracts.liquidityPool;
    return await liquidityPool.claimRewards();
  }

  // Utility Functions
  formatPrice(price: bigint): string {
    return ethers.formatEther(price);
  }

  formatUSDC(amount: bigint): string {
    return ethers.formatUnits(amount, 6);
  }

  parseUSDC(amount: string): bigint {
    return ethers.parseUnits(amount, 6);
  }

  parsePrice(price: string): bigint {
    return ethers.parseEther(price);
  }

  // Event Listeners
  onPositionOpened(callback: (trader: string, size: bigint, margin: bigint, isLong: boolean, price: bigint) => void) {
    const perpetualMarket = this.contracts.perpetualMarket;
    perpetualMarket.on('PositionOpened', callback);
  }

  onPositionClosed(callback: (trader: string, size: bigint, margin: bigint, isLong: boolean, price: bigint, pnl: bigint) => void) {
    const perpetualMarket = this.contracts.perpetualMarket;
    perpetualMarket.on('PositionClosed', callback);
  }

  onPositionLiquidated(callback: (trader: string, size: bigint, margin: bigint, isLong: boolean, price: bigint) => void) {
    const perpetualMarket = this.contracts.perpetualMarket;
    perpetualMarket.on('PositionLiquidated', callback);
  }

  // Clean up event listeners
  removeAllListeners() {
    Object.values(this.contracts).forEach(contract => {
      contract.removeAllListeners();
    });
  }
}

// Singleton instance
export const contractUtils = new ContractUtils();