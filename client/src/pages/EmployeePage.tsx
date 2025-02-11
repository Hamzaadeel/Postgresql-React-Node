import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";

const EmployeePage = () => {
  return (
    <div className="flex h-screen">
      <Sidebar userRole="Employee" />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default EmployeePage;
