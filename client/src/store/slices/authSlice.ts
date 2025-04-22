import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/User";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Helper function to get user data with profile picture
const getUserFromStorage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (user) {
    // Check for profile picture in localStorage
    const profilePicture = localStorage.getItem(`profilePicture_${user.id}`);
    if (profilePicture) {
      user.profilePicture = profilePicture;
    }

    // Ensure consistentcy between profilePicture and profile_picture_path
    if (user.profile_picture_path && !user.profilePicture) {
      user.profilePicture = user.profile_picture_path;
    } else if (user.profilePicture && !user.profile_picture_path) {
      user.profile_picture_path = user.profilePicture;
    }
  }
  return user;
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      // Get profile picture if it exists in localStorage
      const profilePicture = localStorage.getItem(`profilePicture_${user.id}`);

      // Keep both profilePicture and profile_picture_path in sync
      if (profilePicture) {
        user.profilePicture = profilePicture;
        user.profile_picture_path = profilePicture;
      } else if (user.profile_picture_path) {
        user.profilePicture = user.profile_picture_path;
      }

      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    },
    logout: (state) => {
      if (state.user?.id) {
        // Remove profile picture from localStorage on logout
        localStorage.removeItem(`profilePicture_${state.user.id}`);
      }
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    updateUser: (state, action: PayloadAction<User>) => {
      // Preserve profile picture information when updating other user details
      if (state.user?.profilePicture) {
        action.payload.profilePicture = state.user.profilePicture;
      }
      if (state.user?.profile_picture_path) {
        action.payload.profile_picture_path = state.user.profile_picture_path;
      }

      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    // Action to update profile picture
    updateProfilePicture: (
      state,
      action: PayloadAction<{ userId: number; profilePictureUrl: string }>
    ) => {
      if (state.user) {
        // Update both profilePicture and profile_picture_path to ensure consistency
        state.user.profilePicture = action.payload.profilePictureUrl;
        state.user.profile_picture_path = action.payload.profilePictureUrl;

        // Store profile picture URL in localStorage
        localStorage.setItem(
          `profilePicture_${action.payload.userId}`,
          action.payload.profilePictureUrl
        );

        // Update the main user object in localStorage
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
});

export const { setCredentials, logout, updateUser, updateProfilePicture } =
  authSlice.actions;
export default authSlice.reducer;
