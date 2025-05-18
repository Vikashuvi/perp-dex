import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

// Define types
export interface ProviderInfo {
  address: string;
  amount: number;
  sharePercentage: number;
  rewards: number;
  lastRewardTimestamp: number;
}

export interface PoolStats {
  totalLiquidity: number;
  utilizationRate: number;
  feeRate: number;
  insuranceFund: number;
  apy: number;
}

interface LiquidityPoolState {
  providerInfo: ProviderInfo | null;
  poolStats: PoolStats;
  loading: boolean;
  error: string | null;
}

const initialState: LiquidityPoolState = {
  providerInfo: null,
  poolStats: {
    totalLiquidity: 0,
    utilizationRate: 0,
    feeRate: 0,
    insuranceFund: 0,
    apy: 0
  },
  loading: false,
  error: null
};

// Mock function to simulate fetching provider info from a smart contract
const fetchProviderInfoFromContract = async (address: string): Promise<ProviderInfo> => {
  // In a real app, this would call the smart contract
  // For now, return mock data
  return {
    address,
    amount: 5000,
    sharePercentage: 0.5,
    rewards: 125,
    lastRewardTimestamp: Date.now() - 86400000 // 1 day ago
  };
};

// Mock function to simulate fetching pool stats from a smart contract
const fetchPoolStatsFromContract = async (): Promise<PoolStats> => {
  // In a real app, this would call the smart contract
  // For now, return mock data
  return {
    totalLiquidity: 1000000,
    utilizationRate: 65,
    feeRate: 0.05,
    insuranceFund: 50000,
    apy: 12.5
  };
};

// Async thunk to fetch provider info
export const fetchProviderInfo = createAsyncThunk(
  'liquidityPool/fetchProviderInfo',
  async (address: string, { rejectWithValue }) => {
    try {
      // In a real app, this would connect to the blockchain
      const providerInfo = await fetchProviderInfoFromContract(address);
      return providerInfo;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async thunk to fetch pool stats
export const fetchPoolStats = createAsyncThunk(
  'liquidityPool/fetchPoolStats',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would connect to the blockchain
      const poolStats = await fetchPoolStatsFromContract();
      return poolStats;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async thunk to provide liquidity
export const provideLiquidity = createAsyncThunk(
  'liquidityPool/provideLiquidity',
  async (amount: number, { rejectWithValue, getState }) => {
    try {
      // In a real app, this would call the smart contract
      // For now, simulate a successful transaction
      
      // Get current state
      const state = getState() as any;
      const providerInfo = state.liquidityPool.providerInfo;
      const poolStats = state.liquidityPool.poolStats;
      
      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate new values
      const newAmount = providerInfo ? providerInfo.amount + amount : amount;
      const newTotalLiquidity = poolStats.totalLiquidity + amount;
      const newSharePercentage = (newAmount / newTotalLiquidity) * 100;
      
      return {
        providerInfo: {
          ...providerInfo,
          amount: newAmount,
          sharePercentage: newSharePercentage
        },
        poolStats: {
          ...poolStats,
          totalLiquidity: newTotalLiquidity
        }
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async thunk to withdraw liquidity
export const withdrawLiquidity = createAsyncThunk(
  'liquidityPool/withdrawLiquidity',
  async (amount: number, { rejectWithValue, getState }) => {
    try {
      // In a real app, this would call the smart contract
      // For now, simulate a successful transaction
      
      // Get current state
      const state = getState() as any;
      const providerInfo = state.liquidityPool.providerInfo;
      const poolStats = state.liquidityPool.poolStats;
      
      if (!providerInfo || providerInfo.amount < amount) {
        throw new Error('Insufficient liquidity');
      }
      
      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate new values
      const newAmount = providerInfo.amount - amount;
      const newTotalLiquidity = poolStats.totalLiquidity - amount;
      const newSharePercentage = newAmount > 0 ? (newAmount / newTotalLiquidity) * 100 : 0;
      
      return {
        providerInfo: {
          ...providerInfo,
          amount: newAmount,
          sharePercentage: newSharePercentage
        },
        poolStats: {
          ...poolStats,
          totalLiquidity: newTotalLiquidity
        }
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async thunk to claim rewards
export const claimRewards = createAsyncThunk(
  'liquidityPool/claimRewards',
  async (_, { rejectWithValue, getState }) => {
    try {
      // In a real app, this would call the smart contract
      // For now, simulate a successful transaction
      
      // Get current state
      const state = getState() as any;
      const providerInfo = state.liquidityPool.providerInfo;
      
      if (!providerInfo || providerInfo.rewards <= 0) {
        throw new Error('No rewards to claim');
      }
      
      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        ...providerInfo,
        rewards: 0
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const liquidityPoolSlice = createSlice({
  name: 'liquidityPool',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch provider info
      .addCase(fetchProviderInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderInfo.fulfilled, (state, action) => {
        state.providerInfo = action.payload;
        state.loading = false;
      })
      .addCase(fetchProviderInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch pool stats
      .addCase(fetchPoolStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPoolStats.fulfilled, (state, action) => {
        state.poolStats = action.payload;
        state.loading = false;
      })
      .addCase(fetchPoolStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Provide liquidity
      .addCase(provideLiquidity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(provideLiquidity.fulfilled, (state, action) => {
        state.providerInfo = action.payload.providerInfo;
        state.poolStats = action.payload.poolStats;
        state.loading = false;
      })
      .addCase(provideLiquidity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Withdraw liquidity
      .addCase(withdrawLiquidity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(withdrawLiquidity.fulfilled, (state, action) => {
        state.providerInfo = action.payload.providerInfo;
        state.poolStats = action.payload.poolStats;
        state.loading = false;
      })
      .addCase(withdrawLiquidity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Claim rewards
      .addCase(claimRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(claimRewards.fulfilled, (state, action) => {
        if (state.providerInfo) {
          state.providerInfo.rewards = 0;
        }
        state.loading = false;
      })
      .addCase(claimRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default liquidityPoolSlice.reducer;
