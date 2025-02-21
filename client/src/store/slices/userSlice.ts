import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/User";

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  totalUsers: number;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
  totalUsers: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      state.totalUsers = action.payload.length;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
      state.totalUsers += 1;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
      state.totalUsers -= 1;
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
  setUsers,
  addUser,
  updateUser,
  deleteUser,
  setLoading,
  setError,
} = userSlice.actions;
export default userSlice.reducer;
