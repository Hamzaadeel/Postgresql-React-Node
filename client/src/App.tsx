import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import EmployeePage from "./pages/EmployeePage";
import EmployeeDashboard from "./components/employee/EmployeeDashboard";
import EmployeeProfile from "./components/employee/settings/EmployeeProfile";
import EmployeeNotifications from "./components/employee/settings/EmployeeNotifications";
import EmployeeSecurity from "./components/employee/settings/EmployeeSecurity";
import EmployeeChallenges from "./components/employee/challenges/EmployeeChallenges";
import EmployeeCircles from "./components/employee/circles/EmployeeCircles";
import ModeratorPage from "./pages/ModeratorPage";
import ModeratorDashboard from "./components/moderator/ModeratorDashboard";
import ModeratorProfile from "./components/moderator/settings/ModeratorProfile";
import ModeratorNotifications from "./components/moderator/settings/ModeratorNotifications";
import ModeratorSecurity from "./components/moderator/settings/ModeratorSecurity";
import UserManagement from "./components/moderator/user/UserManagement";
import CirclesManagement from "./components/moderator/circle/CirclesManagement";
import ChallengesManagement from "./components/moderator/challenges/ChallengesManagement";
import TenantManagement from "./components/moderator/tenant/TenantManagement";
import EmployeeCircleView from "./components/employee/circles/EmployeeCircleView";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />

          {/* Employee Routes */}
          <Route path="/employee" element={<EmployeePage />}>
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="challenges" element={<EmployeeChallenges />} />
            <Route path="circles" element={<EmployeeCircles />} />
            <Route path="circles/:circleId" element={<EmployeeCircleView />} />

            {/* Employee Settings Routes */}
            <Route path="settings">
              <Route path="profile" element={<EmployeeProfile />} />
              <Route path="notifications" element={<EmployeeNotifications />} />
              <Route path="security" element={<EmployeeSecurity />} />
            </Route>

            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Moderator Routes */}
          <Route path="/moderator" element={<ModeratorPage />}>
            <Route path="dashboard" element={<ModeratorDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="tenants" element={<TenantManagement />} />
            <Route path="circles" element={<CirclesManagement />} />
            <Route path="challenges" element={<ChallengesManagement />} />

            {/* Moderator Settings Routes */}
            <Route path="settings">
              <Route path="profile" element={<ModeratorProfile />} />
              <Route
                path="notifications"
                element={<ModeratorNotifications />}
              />
              <Route path="security" element={<ModeratorSecurity />} />
            </Route>

            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
        <ToastContainer />
      </Router>
    </Provider>
  );
}

export default App;
