import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import tenantReducer from "./slices/tenantSlice";
import circleReducer from "./slices/circleSlice";
import challengeReducer from "./slices/challengeSlice";
import pointsReducer from "./slices/pointsSlice";
import notificationsReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    tenants: tenantReducer,
    circles: circleReducer,
    challenges: challengeReducer,
    points: pointsReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
