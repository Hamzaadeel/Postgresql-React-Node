import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Circle } from "../../services/api";

interface CircleState {
  circles: Circle[];
  loading: boolean;
  error: string | null;
  totalCircles: number;
}

const initialState: CircleState = {
  circles: [],
  loading: false,
  error: null,
  totalCircles: 0,
};

const circleSlice = createSlice({
  name: "circle",
  initialState,
  reducers: {
    setCircles: (state, action: PayloadAction<Circle[]>) => {
      state.circles = action.payload;
      state.totalCircles = action.payload.length;
    },
    addCircle: (state, action: PayloadAction<Circle>) => {
      state.circles.push(action.payload);
      state.totalCircles += 1;
    },
    updateCircle: (state, action: PayloadAction<Circle>) => {
      const index = state.circles.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.circles[index] = action.payload;
      }
    },
    deleteCircle: (state, action: PayloadAction<number>) => {
      state.circles = state.circles.filter((c) => c.id !== action.payload);
      state.totalCircles -= 1;
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
  setCircles,
  addCircle,
  updateCircle,
  deleteCircle,
  setLoading,
  setError,
} = circleSlice.actions;
export default circleSlice.reducer;
