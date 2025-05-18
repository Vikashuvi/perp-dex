import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

// Define position type
export interface Position {
  id: string;
  trader: string;
  size: number;
  margin: number;
  leverage: number;
  entryPrice: number;
  isLong: boolean;
  timestamp: number;
  orderType: string;
}

interface PositionState {
  positions: Position[];
  loading: boolean;
  error: string | null;
}

const initialState: PositionState = {
  positions: [],
  loading: false,
  error: null
};

// Mock function to simulate fetching positions from a smart contract
const fetchPositionsFromContract = async (address: string): Promise<Position[]> => {
  // In a real app, this would call the smart contract
  // For now, return mock data
  return [
    {
      id: '1',
      trader: address,
      size: 1000,
      margin: 100,
      leverage: 10,
      entryPrice: 1800,
      isLong: true,
      timestamp: Date.now() - 3600000, // 1 hour ago
      orderType: 'market'
    },
    {
      id: '2',
      trader: address,
      size: 500,
      margin: 100,
      leverage: 5,
      entryPrice: 1750,
      isLong: false,
      timestamp: Date.now() - 7200000, // 2 hours ago
      orderType: 'limit'
    }
  ];
};

// Async thunk to fetch positions
export const fetchPositions = createAsyncThunk(
  'positions/fetchPositions',
  async (address: string, { rejectWithValue }) => {
    try {
      // In a real app, this would connect to the blockchain
      const positions = await fetchPositionsFromContract(address);
      return positions;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async thunk to open a position
export const openPosition = createAsyncThunk(
  'positions/openPosition',
  async (positionData: {
    margin: number;
    leverage: number;
    isLong: boolean;
    entryPrice: number;
    orderType: string;
  }, { rejectWithValue, getState }) => {
    try {
      // In a real app, this would call the smart contract
      // For now, simulate a successful position opening
      
      // Get user address from state
      const state = getState() as any;
      const address = state.wallet.address;
      
      // Create new position object
      const newPosition: Position = {
        id: uuidv4(),
        trader: address,
        size: positionData.margin * positionData.leverage,
        margin: positionData.margin,
        leverage: positionData.leverage,
        entryPrice: positionData.entryPrice,
        isLong: positionData.isLong,
        timestamp: Date.now(),
        orderType: positionData.orderType
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
export const closePosition = createAsyncThunk(
  'positions/closePosition',
  async (positionId: string, { rejectWithValue, getState }) => {
    try {
      // In a real app, this would call the smart contract
      // For now, simulate a successful position closing
      
      // Get positions from state
      const state = getState() as any;
      const position = state.positions.positions.find((p: Position) => p.id === positionId);
      
      if (!position) {
        throw new Error('Position not found');
      }
      
      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return positionId;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const positionSlice = createSlice({
  name: 'positions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch positions
      .addCase(fetchPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.positions = action.payload;
        state.loading = false;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Open position
      .addCase(openPosition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(openPosition.fulfilled, (state, action) => {
        state.positions.push(action.payload);
        state.loading = false;
      })
      .addCase(openPosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Close position
      .addCase(closePosition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(closePosition.fulfilled, (state, action) => {
        state.positions = state.positions.filter(position => position.id !== action.payload);
        state.loading = false;
      })
      .addCase(closePosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default positionSlice.reducer;
