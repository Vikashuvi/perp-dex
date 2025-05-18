import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import type { TokenBalance } from '../types/Token';
import { COMMON_TOKENS } from '../types/Token';
import { getTokenBalances } from '../utils/TokenUtils';

interface TokenBalanceState {
  balances: TokenBalance[];
  loading: boolean;
  error: string | null;
}

const initialState: TokenBalanceState = {
  balances: [],
  loading: false,
  error: null
};

// Async thunk to fetch token balances
export const fetchTokenBalances = createAsyncThunk(
  'tokenBalances/fetchBalances',
  async (address: string, { rejectWithValue }) => {
    try {
      if (!window.ethereum) {
        throw new Error('No Ethereum provider found');
      }
      
      const provider = new ethers.JsonRpcProvider(window.ethereum.currentProvider);
      const balances = await getTokenBalances(COMMON_TOKENS, address, provider);
      return balances;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const tokenBalanceSlice = createSlice({
  name: 'tokenBalances',
  initialState,
  reducers: {
    clearBalances: (state) => {
      state.balances = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTokenBalances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTokenBalances.fulfilled, (state, action) => {
        state.balances = action.payload;
        state.loading = false;
      })
      .addCase(fetchTokenBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearBalances } = tokenBalanceSlice.actions;
export default tokenBalanceSlice.reducer;