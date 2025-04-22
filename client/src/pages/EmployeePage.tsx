import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";

const EmployeePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-800">
      <Sidebar userRole="Employee" onToggle={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <Header userRole="Employee" isSidebarOpen={isSidebarOpen} />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EmployeePage;
