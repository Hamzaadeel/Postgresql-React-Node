import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Challenge {
  id: number;
  title: string;
  description: string;
  circleId: number;
  points: number;
  createdBy: number;
  createdAt: string;
  circle: {
    id: number;
    name: string;
  };
  creator: {
    id: number;
    name: string;
  };
  images?: {
    id: number;
    image_path: string;
  }[];
  participationId?: number;
  status?: "Pending" | "Completed";
  participantCount?: number;
}

interface ChallengeState {
  challenges: Challenge[];
  loading: boolean;
  error: string | null;
  totalChallenges: number;
}

const initialState: ChallengeState = {
  challenges: [],
  loading: false,
  error: null,
  totalChallenges: 0,
};

const challengeSlice = createSlice({
  name: "challenge",
  initialState,
  reducers: {
    setChallenges: (
      state,
      action: PayloadAction<{ challenges: Challenge[]; total: number }>
    ) => {
      state.challenges = action.payload.challenges;
      state.totalChallenges = action.payload.total;
    },
    addChallenge: (state, action: PayloadAction<Challenge | Challenge[]>) => {
      if (Array.isArray(action.payload)) {
        state.challenges = [...state.challenges, ...action.payload];
        state.totalChallenges += action.payload.length;
      } else {
        state.challenges.push(action.payload);
        state.totalChallenges += 1;
      }
    },
    updateChallenge: (state, action: PayloadAction<Challenge>) => {
      const index = state.challenges.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.challenges[index] = {
          ...state.challenges[index],
          ...action.payload,
        };
      }
    },
    joinChallenge: (
      state,
      action: PayloadAction<{ challengeId: number; participationId: number }>
    ) => {
      const index = state.challenges.findIndex(
        (c) => c.id === action.payload.challengeId
      );
      if (index !== -1) {
        state.challenges[index] = {
          ...state.challenges[index],
          participationId: action.payload.participationId,
          status: "Pending",
        };
      }
    },
    submitChallenge: (
      state,
      action: PayloadAction<{ challengeId: number }>
    ) => {
      const index = state.challenges.findIndex(
        (c) => c.id === action.payload.challengeId
      );
      if (index !== -1) {
        state.challenges[index] = {
          ...state.challenges[index],
          status: "Completed",
        };
      }
    },
    deleteChallenge: (state, action: PayloadAction<number>) => {
      state.challenges = state.challenges.filter(
        (c) => c.id !== action.payload
      );
      state.totalChallenges -= 1;
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
  setChallenges,
  addChallenge,
  updateChallenge,
  deleteChallenge,
  joinChallenge,
  submitChallenge,
  setLoading,
  setError,
} = challengeSlice.actions;
export default challengeSlice.reducer;
