import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Circle,
  CheckCircle,
  User,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  userRole: "Employee" | "Moderator";
}

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(true); // State to manage sidebar open/close
  const navigate = useNavigate(); // Use navigate for logout

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div
      className={`flex flex-col h-screen bg-gray-800 text-white ${
        isOpen ? "w-56" : "w-10"
      } transition-width duration-300`}
    >
      <button
        onClick={toggleSidebar}
        className="p-2 text-gray-300 hover:text-white"
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>

      <h1
        className={`text-left ml-2 text-xl font-bold ${
          isOpen ? "block" : "hidden"
        }`}
      >
        Sidebar
      </h1>

      <div className="flex-grow">
        <ul className="mt-4">
          {userRole === "Employee" ? (
            <>
              <li className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
                <Link
                  to="/employee/dashboard"
                  className="flex items-center w-full"
                >
                  <Home className="w-5 h-5" />
                  <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                    Dashboard
                  </span>
                </Link>
              </li>
              <li className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
                <Link
                  to="/employee/circles"
                  className="flex items-center w-full"
                >
                  <Circle className="w-5 h-5" />
                  <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                    Circles
                  </span>
                </Link>
              </li>
              <li className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
                <Link
                  to="/employee/challenges"
                  className="flex items-center w-full"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                    Challenges
                  </span>
                </Link>
              </li>
              <li className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
                <Link
                  to="/employee/profile"
                  className="flex items-center w-full"
                >
                  <User className="w-5 h-5" />
                  <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                    Profile
                  </span>
                </Link>
              </li>
            </>
          ) : userRole === "Moderator" ? (
            <>
              <li className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
                <Link
                  to="/moderator/dashboard"
                  className="flex items-center w-full"
                >
                  <Home className="w-5 h-5" />
                  <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                    Dashboard
                  </span>
                </Link>
              </li>
              <li className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
                <Link
                  to="/moderator/tenants"
                  className="flex items-center w-full"
                >
                  <Building2 className="w-5 h-5" />
                  <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                    Tenants
                  </span>
                </Link>
              </li>
              <li className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
                <Link
                  to="/moderator/users"
                  className="flex items-center w-full"
                >
                  <Users className="w-5 h-5" />
                  <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                    Users
                  </span>
                </Link>
              </li>
              <li className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
                <Link
                  to="/moderator/circles"
                  className="flex items-center w-full"
                >
                  <Circle className="w-5 h-5" />
                  <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                    Circles
                  </span>
                </Link>
              </li>
              <li className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
                <Link
                  to="/moderator/challenges"
                  className="flex items-center w-full"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                    Challenges
                  </span>
                </Link>
              </li>
              <li className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
                <Link
                  to="/moderator/profile"
                  className="flex items-center w-full"
                >
                  <User className="w-5 h-5" />
                  <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                    Profile
                  </span>
                </Link>
              </li>
            </>
          ) : null}
        </ul>
      </div>

      {/* Logout Button - Always Stays at the Bottom */}
      <li
        className="flex items-center mb-2 p-2 w-full hover:bg-red-700 cursor-pointer"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5" />
        <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>Logout</span>
      </li>
    </div>
  );
};

export default Sidebar;
