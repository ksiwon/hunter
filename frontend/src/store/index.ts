import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // 다른 리듀서들 추가 가능
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 직렬화 불가능한 값을 가진 액션과 경로 무시 설정
        ignoredActions: [],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;