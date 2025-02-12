import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Circle,
  CheckCircle,
  User,
  Building2,
  ChevronRight,
  LogOut,
  Menu,
} from "lucide-react";
import logo from "../../assets/logos/dpl-logo.png"; // Adjust the path as necessary

interface SidebarProps {
  userRole: "Employee" | "Moderator";
  onToggle?: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userRole, onToggle }) => {
  const [isOpen, setIsOpen] = useState(true); // State to manage sidebar open/close
  const location = useLocation(); // Get the current location
  const [selectedTab, setSelectedTab] = useState<string | null>(
    location.pathname
  ); // Set initial selected tab to current path
  const navigate = useNavigate(); // Use navigate for logout

  useEffect(() => {
    setSelectedTab(location.pathname); // Update selected tab when location changes
  }, [location.pathname]);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  const handleTabClick = (tab: string) => {
    navigate(tab); // Navigate to the selected tab
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
          <Menu className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>

      {isOpen ? (
        <h1 className={`text-left ml-2 text-xl font-bold`}>Project Name</h1>
      ) : (
        <img
          src={logo}
          alt="Logo"
          className="ml-1 w-8 h-8 cursor-pointer"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex-grow">
        <ul className="mt-4">
          {userRole === "Employee" ? (
            <>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-gray-700 ${
                  selectedTab === "/employee/dashboard" ? "bg-gray-700" : ""
                }`}
                onClick={() => handleTabClick("/employee/dashboard")}
              >
                <Home className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Dashboard
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-gray-700 ${
                  selectedTab === "/employee/circles" ? "bg-gray-700" : ""
                }`}
                onClick={() => handleTabClick("/employee/circles")}
              >
                <Circle className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Circles
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-gray-700 ${
                  selectedTab === "/employee/challenges" ? "bg-gray-700" : ""
                }`}
                onClick={() => handleTabClick("/employee/challenges")}
              >
                <CheckCircle className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Challenges
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-gray-700 ${
                  selectedTab === "/employee/profile" ? "bg-gray-700" : ""
                }`}
                onClick={() => handleTabClick("/employee/profile")}
              >
                <User className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Profile
                </span>
              </li>
            </>
          ) : userRole === "Moderator" ? (
            <>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-gray-700 ${
                  selectedTab === "/moderator/dashboard" ? "bg-gray-700" : ""
                }`}
                onClick={() => handleTabClick("/moderator/dashboard")}
              >
                <Home className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Dashboard
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-gray-700 ${
                  selectedTab === "/moderator/tenants" ? "bg-gray-700" : ""
                }`}
                onClick={() => handleTabClick("/moderator/tenants")}
              >
                <Building2 className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Tenants
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-gray-700 ${
                  selectedTab === "/moderator/users" ? "bg-gray-700" : ""
                }`}
                onClick={() => handleTabClick("/moderator/users")}
              >
                <Users className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Users
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-gray-700 ${
                  selectedTab === "/moderator/circles" ? "bg-gray-700" : ""
                }`}
                onClick={() => handleTabClick("/moderator/circles")}
              >
                <Circle className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Circles
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-gray-700 ${
                  selectedTab === "/moderator/challenges" ? "bg-gray-700" : ""
                }`}
                onClick={() => handleTabClick("/moderator/challenges")}
              >
                <CheckCircle className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Challenges
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-gray-700 ${
                  selectedTab === "/moderator/profile" ? "bg-gray-700" : ""
                }`}
                onClick={() => handleTabClick("/moderator/profile")}
              >
                <User className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Profile
                </span>
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
