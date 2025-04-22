import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface LeaderboardEntry {
  id: number;
  name: string;
  totalPoints: number;
}

interface PointsState {
  userPoints: number;
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: PointsState = {
  userPoints: 0,
  leaderboard: [],
  loading: false,
  error: null,
};

const pointsSlice = createSlice({
  name: "points",
  initialState,
  reducers: {
    setUserPoints: (state, action: PayloadAction<number>) => {
      state.userPoints = action.payload;
    },
    setLeaderboard: (state, action: PayloadAction<LeaderboardEntry[]>) => {
      state.leaderboard = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setUserPoints, setLeaderboard, setLoading, setError } =
  pointsSlice.actions;
export default pointsSlice.reducer;
