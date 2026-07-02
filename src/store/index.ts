// Redux State Store for multi-tenant SaaS Apartment Management System
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Auth State Interfaces
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string | null;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tenantId: string | null;
  tenantSlug: string | null;
}

const initialAuthState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  tenantId: localStorage.getItem('tenantId'),
  tenantSlug: localStorage.getItem('tenantSlug') || 'lotus-heights',
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.tenantId = action.payload.user.tenantId;
      
      if (action.payload.user.tenant?.slug) {
        state.tenantSlug = action.payload.user.tenant.slug;
        localStorage.setItem('tenantSlug', action.payload.user.tenant.slug);
      }
      
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      if (action.payload.user.tenantId) {
        localStorage.setItem('tenantId', action.payload.user.tenantId);
      }
    },
    setTenantSlug: (state, action: PayloadAction<string>) => {
      state.tenantSlug = action.payload;
      localStorage.setItem('tenantSlug', action.payload);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tenantId = null;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tenantId');
    },
  },
});

export const { setCredentials, setTenantSlug, clearCredentials } = authSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
