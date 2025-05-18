import { configureStore } from "@reduxjs/toolkit";
import wallerReducer from './WalletSlice';
import tokenBalanceReducer from './TokenBalanceSlice';
import positionReducer from './PositionSlice';
import advancedPositionReducer from './AdvancedPositionSlice';
import liquidityPoolReducer from './LiquidityPoolSlice';
import notificationReducer from './NotificationSlice';


export const store = configureStore({
    reducer: {
        wallet: wallerReducer,
        tokenBalances: tokenBalanceReducer,
        positions: positionReducer,
        advancedPositions: advancedPositionReducer,
        liquidityPool: liquidityPoolReducer,
        notifications: notificationReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;