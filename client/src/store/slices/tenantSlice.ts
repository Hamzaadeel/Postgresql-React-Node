import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Tenant } from "../../services/api";

interface TenantState {
  tenants: Tenant[];
  loading: boolean;
  error: string | null;
  totalTenants: number;
}

const initialState: TenantState = {
  tenants: [],
  loading: false,
  error: null,
  totalTenants: 0,
};

const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    setTenants: (state, action: PayloadAction<Tenant[]>) => {
      state.tenants = action.payload;
      state.totalTenants = action.payload.length;
    },
    addTenant: (state, action: PayloadAction<Tenant>) => {
      state.tenants.push(action.payload);
      state.totalTenants += 1;
    },
    updateTenant: (state, action: PayloadAction<Tenant>) => {
      const index = state.tenants.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tenants[index] = action.payload;
      }
    },
    deleteTenant: (state, action: PayloadAction<number>) => {
      state.tenants = state.tenants.filter((t) => t.id !== action.payload);
      state.totalTenants -= 1;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTenants,
  addTenant,
  updateTenant,
  deleteTenant,
  setLoading,
  setError,
} = tenantSlice.actions;
export default tenantSlice.reducer;
