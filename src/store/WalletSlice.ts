import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


interface walletState {
    address: string;
    isConnected: boolean;
    chainId: string | null;
}

const initialState: walletState = {
    address: '',
    isConnected: false,
    chainId: null,
}

const walletSlice = createSlice ({
    name: 'wallet',
    initialState,
    reducers: {
        setWalletConnection: (state, action: PayloadAction<{ address: string;
            chainId: string}>) => {
                state.address = action.payload.address;
                state.chainId = action.payload.chainId;
                state.isConnected = true;
        },
        disconnectWallet: (state) => {
            state.address ='';
            state.chainId = null;
            state.isConnected = false;
        },
        updateChainId: (state, action: PayloadAction<string>) => { 
            state.chainId = action.payload;
         }
        
    }

});

export const { setWalletConnection,disconnectWallet,updateChainId } = walletSlice.actions;

export default walletSlice.reducer;