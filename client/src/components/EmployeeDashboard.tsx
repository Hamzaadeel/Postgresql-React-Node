import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-6">Employee Dashboard</h2>
      <button
        onClick={handleLogout}
        className="mb-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default EmployeeDashboard;
