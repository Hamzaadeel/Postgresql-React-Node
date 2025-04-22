import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Circle } from "../../services/api";

export interface CircleWithParticipation extends Circle {
  isParticipant?: boolean;
  participationId?: number;
}

interface CircleState {
  circles: CircleWithParticipation[];
  loading: boolean;
  error: string | null;
  totalCircles: number;
  successMessage: string | null;
}

const initialState: CircleState = {
  circles: [],
  loading: false,
  error: null,
  totalCircles: 0,
  successMessage: null,
};

const circleSlice = createSlice({
  name: "circles",
  initialState,
  reducers: {
    setCircles: (state, action: PayloadAction<CircleWithParticipation[]>) => {
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
    setSuccessMessage: (state, action: PayloadAction<string | null>) => {
      state.successMessage = action.payload;
    },
    joinCircle: (
      state,
      action: PayloadAction<{ circleId: number; participationId: number }>
    ) => {
      const circle = state.circles.find(
        (c) => c.id === action.payload.circleId
      );
      if (circle) {
        circle.isParticipant = true;
        circle.participationId = action.payload.participationId;
      }
    },
    leaveCircle: (state, action: PayloadAction<number>) => {
      const circle = state.circles.find((c) => c.id === action.payload);
      if (circle) {
        circle.isParticipant = false;
        circle.participationId = undefined;
      }
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
  setSuccessMessage,
  joinCircle,
  leaveCircle,
} = circleSlice.actions;
export default circleSlice.reducer;
