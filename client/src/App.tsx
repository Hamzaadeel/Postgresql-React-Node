import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import ModeratorDashboard from "./components/ModeratorDashboard";
import EmployeeDashboard from "./components/EmployeeDashboard";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/moderator" element={<ModeratorDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
