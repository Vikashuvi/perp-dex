  import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

// Define position types
export interface StopLoss {
  price: number;
  percentage: number; // Percentage of position size to close
  triggered: boolean;
}

export interface TakeProfit {
  price: number;
  percentage: number; // Percentage of position size to close
  triggered: boolean;
}

export interface AdvancedPosition {
  id: string;
  trader: string;
  market: string;
  size: number;
  margin: number;
  leverage: number;
  entryPrice: number;
  isLong: boolean;
  timestamp: number;
  orderType: string;
  stopLoss: StopLoss | null;
  takeProfit: TakeProfit | null;
  fundingPaid: number;
  lastFundingTime: number;
  liquidationPrice: number;
}

interface AdvancedPositionState {
  positions: AdvancedPosition[];
  loading: boolean;
  error: string | null;
  selectedPositionId: string | null;
}

const initialState: AdvancedPositionState = {
  positions: [],
  loading: false,
  error: null,
  selectedPositionId: null
};

// Mock function to simulate fetching positions from a smart contract
const fetchAdvancedPositionsFromContract = async (address: string): Promise<AdvancedPosition[]> => {
  // In a real app, this would call the smart contract
  // For now, return mock data
  return [
    {
      id: '1',
      trader: address,
      market: 'ETH-USD',
      size: 1000,
      margin: 100,
      leverage: 10,
      entryPrice: 1800,
      isLong: true,
      timestamp: Date.now() - 3600000, // 1 hour ago
      orderType: 'market',
      stopLoss: {
        price: 1700,
        percentage: 100,
        triggered: false
      },
      takeProfit: {
        price: 1900,
        percentage: 50,
        triggered: false
      },
      fundingPaid: -0.25,
      lastFundingTime: Date.now() - 1800000, // 30 minutes ago
      liquidationPrice: 1620
    },
    {
      id: '2',
      trader: address,
      market: 'BTC-USD',
      size: 2000,
      margin: 200,
      leverage: 10,
      entryPrice: 35000,
      isLong: false,
      timestamp: Date.now() - 7200000, // 2 hours ago
      orderType: 'limit',
      stopLoss: null,
      takeProfit: {
        price: 33000,
        percentage: 100,
        triggered: false
      },
      fundingPaid: 0.5,
      lastFundingTime: Date.now() - 1800000, // 30 minutes ago
      liquidationPrice: 38500
    }
  ];
};

// Async thunk to fetch positions
export const fetchAdvancedPositions = createAsyncThunk(
  'advancedPositions/fetchPositions',
  async (address: string, { rejectWithValue }) => {
    try {
      // In a real app, this would connect to the blockchain
      const positions = await fetchAdvancedPositionsFromContract(address);
      return positions;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async thunk to open a position
export const openAdvancedPosition = createAsyncThunk(
  'advancedPositions/openPosition',
  async (positionData: {
    market: string;
    margin: number;
    leverage: number;
    isLong: boolean;
    entryPrice: number;
    orderType: string;
    stopLoss?: { price: number; percentage: number };
    takeProfit?: { price: number; percentage: number };
  }, { rejectWithValue, getState }) => {
    try {
      // In a real app, this would call the smart contract
      // For now, simulate a successful position opening

      // Get user address from state
      const state = getState() as any;
      const address = state.wallet.address;

      // Calculate liquidation price
      const liquidationThreshold = 0.8; // 80% of margin
      const liquidationPrice = positionData.isLong
        ? positionData.entryPrice * (1 - liquidationThreshold / positionData.leverage)
        : positionData.entryPrice * (1 + liquidationThreshold / positionData.leverage);

      // Create new position object
      const newPosition: AdvancedPosition = {
        id: uuidv4(),
        trader: address,
        market: positionData.market,
        size: positionData.margin * positionData.leverage,
        margin: positionData.margin,
        leverage: positionData.leverage,
        entryPrice: positionData.entryPrice,
        isLong: positionData.isLong,
        timestamp: Date.now(),
        orderType: positionData.orderType,
        stopLoss: positionData.stopLoss ? {
          price: positionData.stopLoss.price,
          percentage: positionData.stopLoss.percentage,
          triggered: false
        } : null,
        takeProfit: positionData.takeProfit ? {
          price: positionData.takeProfit.price,
          percentage: positionData.takeProfit.percentage,
          triggered: false
        } : null,
        fundingPaid: 0,
        lastFundingTime: Date.now(),
        liquidationPrice
      };

      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return newPosition;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async thunk to close a position
export const closeAdvancedPosition = createAsyncThunk(
  'advancedPositions/closePosition',
  async (
    data: { positionId: string; percentage: number },
    { rejectWithValue, getState }
  ) => {
    try {
      // In a real app, this would call the smart contract
      // For now, simulate a successful position closing

      // Get positions from state
      const state = getState() as any;
      const position = state.advancedPositions.positions.find(
        (p: AdvancedPosition) => p.id === data.positionId
      );

      if (!position) {
        throw new Error('Position not found');
      }

      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        positionId: data.positionId,
        percentage: data.percentage
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async thunk to update stop loss
export const updateStopLoss = createAsyncThunk(
  'advancedPositions/updateStopLoss',
  async (
    data: { positionId: string; price: number; percentage: number },
    { rejectWithValue, getState }
  ) => {
    try {
      // In a real app, this would call the smart contract
      // For now, simulate a successful update

      // Get positions from state
      const state = getState() as any;
      const position = state.advancedPositions.positions.find(
        (p: AdvancedPosition) => p.id === data.positionId
      );

      if (!position) {
        throw new Error('Position not found');
      }

      // Validate stop loss price
      if (position.isLong && data.price >= position.entryPrice) {
        throw new Error('Stop loss price must be below entry price for long positions');
      }

      if (!position.isLong && data.price <= position.entryPrice) {
        throw new Error('Stop loss price must be above entry price for short positions');
      }

      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        positionId: data.positionId,
        stopLoss: {
          price: data.price,
          percentage: data.percentage,
          triggered: false
        }
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async thunk to update take profit
export const updateTakeProfit = createAsyncThunk(
  'advancedPositions/updateTakeProfit',
  async (
    data: { positionId: string; price: number; percentage: number },
    { rejectWithValue, getState }
  ) => {
    try {
      // In a real app, this would call the smart contract
      // For now, simulate a successful update

      // Get positions from state
      const state = getState() as any;
      const position = state.advancedPositions.positions.find(
        (p: AdvancedPosition) => p.id === data.positionId
      );

      if (!position) {
        throw new Error('Position not found');
      }

      // Validate take profit price
      if (position.isLong && data.price <= position.entryPrice) {
        throw new Error('Take profit price must be above entry price for long positions');
      }

      if (!position.isLong && data.price >= position.entryPrice) {
        throw new Error('Take profit price must be below entry price for short positions');
      }

      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        positionId: data.positionId,
        takeProfit: {
          price: data.price,
          percentage: data.percentage,
          triggered: false
        }
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const advancedPositionSlice = createSlice({
  name: 'advancedPositions',
  initialState,
  reducers: {
    selectPosition: (state, action: PayloadAction<string>) => {
      state.selectedPositionId = action.payload;
    },
    clearSelectedPosition: (state) => {
      state.selectedPositionId = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch positions
      .addCase(fetchAdvancedPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvancedPositions.fulfilled, (state, action) => {
        state.positions = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdvancedPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Open position
      .addCase(openAdvancedPosition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(openAdvancedPosition.fulfilled, (state, action) => {
        state.positions.push(action.payload);
        state.loading = false;
      })
      .addCase(openAdvancedPosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Close position
      .addCase(closeAdvancedPosition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(closeAdvancedPosition.fulfilled, (state, action) => {
        const { positionId, percentage } = action.payload;

        if (percentage === 100) {
          // Remove position completely
          state.positions = state.positions.filter(position => position.id !== positionId);
          if (state.selectedPositionId === positionId) {
            state.selectedPositionId = null;
          }
        } else {
          // Partially close position
          const position = state.positions.find(p => p.id === positionId);
          if (position) {
            const closingRatio = percentage / 100;
            position.size = position.size * (1 - closingRatio);
            position.margin = position.margin * (1 - closingRatio);
          }
        }

        state.loading = false;
      })
      .addCase(closeAdvancedPosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update stop loss
      .addCase(updateStopLoss.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStopLoss.fulfilled, (state, action) => {
        const { positionId, stopLoss } = action.payload;
        const position = state.positions.find(p => p.id === positionId);
        if (position) {
          position.stopLoss = stopLoss;
        }
        state.loading = false;
      })
      .addCase(updateStopLoss.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update take profit
      .addCase(updateTakeProfit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTakeProfit.fulfilled, (state, action) => {
        const { positionId, takeProfit } = action.payload;
        const position = state.positions.find(p => p.id === positionId);
        if (position) {
          position.takeProfit = takeProfit;
        }
        state.loading = false;
      })
      .addCase(updateTakeProfit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { selectPosition, clearSelectedPosition } = advancedPositionSlice.actions;
export default advancedPositionSlice.reducer;
