import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import ModeratorPage from "./pages/ModeratorPage";
import EmployeePage from "./pages/EmployeePage";
import ModeratorDashboard from "./components/moderator/ModeratorDashboard";
import EmployeeDashboard from "./components/employee/EmployeeDashboard";
import EmployeeProfile from "./components/employee/EmployeeProfile";
import EmployeeChallenges from "./components/employee/EmployeeChallenges";
import EmployeeCircles from "./components/employee/EmployeeCircles";
import UserManagement from "./components/moderator/UserManagement";
import TenantManagement from "./components/moderator/TenantManagement";
import CirclesManagement from "./components/moderator/CirclesManagement";
import ChallengesManagement from "./components/moderator/ChallengesManagement";
import ModeratorProfile from "./components/moderator/ModeratorProfile";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* Employee Routes */}
        <Route path="/employee" element={<EmployeePage />}>
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="challenges" element={<EmployeeChallenges />} />
          <Route path="circles" element={<EmployeeCircles />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Moderator Routes */}
        <Route path="/moderator" element={<ModeratorPage />}>
          <Route path="dashboard" element={<ModeratorDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="tenants" element={<TenantManagement />} />
          <Route path="circles" element={<CirclesManagement />} />
          <Route path="challenges" element={<ChallengesManagement />} />
          <Route path="profile" element={<ModeratorProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
