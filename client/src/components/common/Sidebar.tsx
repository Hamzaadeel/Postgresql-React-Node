import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  User,
  Building2,
  ChevronRight,
  LogOut,
  Menu,
  Swords,
} from "lucide-react";
import logo from "../../assets/logos/dpl-logo.png"; // Adjust the path as necessary
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import ConfirmationModal from "./ConfirmationModal"; // Import the ConfirmationModal

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

  // State for confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setIsModalOpen(true); // Open confirmation modal
  };

  const confirmLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div
      className={`flex flex-col shadow-lg h-screen ${
        userRole === "Employee" ? "bg-sky-900" : "bg-emerald-900"
      } text-white ${isOpen ? "w-56" : "w-10"} transition-width duration-300`}
    >
      <button
        onClick={toggleSidebar}
        className="p-2 text-white hover:text-gray-100"
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
                className={`flex items-center p-2 cursor-pointer hover:bg-cyan-200 hover:text-black ${
                  selectedTab === "/employee/dashboard"
                    ? "bg-cyan-200 text-black"
                    : ""
                }`}
                onClick={() => handleTabClick("/employee/dashboard")}
              >
                <Home className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Dashboard
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-cyan-200 hover:text-black ${
                  selectedTab === "/employee/circles"
                    ? "bg-cyan-200 text-black"
                    : ""
                }`}
                onClick={() => handleTabClick("/employee/circles")}
              >
                <FontAwesomeIcon icon={faUsers} className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Circles
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-cyan-200 hover:text-black ${
                  selectedTab === "/employee/challenges"
                    ? "bg-cyan-200 text-black"
                    : ""
                }`}
                onClick={() => handleTabClick("/employee/challenges")}
              >
                <Swords className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Challenges
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-cyan-200 hover:text-black ${
                  selectedTab === "/employee/profile"
                    ? "bg-cyan-200 text-black"
                    : ""
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
                className={`flex items-center p-2 cursor-pointer hover:bg-emerald-200 hover:text-black ${
                  selectedTab === "/moderator/dashboard"
                    ? "bg-emerald-200 text-black"
                    : ""
                }`}
                onClick={() => handleTabClick("/moderator/dashboard")}
              >
                <Home className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Dashboard
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-emerald-200 hover:text-black ${
                  selectedTab === "/moderator/tenants"
                    ? "bg-emerald-200 text-black"
                    : ""
                }`}
                onClick={() => handleTabClick("/moderator/tenants")}
              >
                <Building2 className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Tenants
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-emerald-200 hover:text-black ${
                  selectedTab === "/moderator/users"
                    ? "bg-emerald-200 text-black"
                    : ""
                }`}
                onClick={() => handleTabClick("/moderator/users")}
              >
                <Users className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Users
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-emerald-200 hover:text-black ${
                  selectedTab === "/moderator/circles"
                    ? "bg-emerald-200 text-black"
                    : ""
                }`}
                onClick={() => handleTabClick("/moderator/circles")}
              >
                <FontAwesomeIcon icon={faUsers} className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Circles
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-emerald-200 hover:text-black ${
                  selectedTab === "/moderator/challenges"
                    ? "bg-emerald-200 text-black"
                    : ""
                }`}
                onClick={() => handleTabClick("/moderator/challenges")}
              >
                <Swords className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Challenges
                </span>
              </li>
              <li
                className={`flex items-center p-2 cursor-pointer hover:bg-emerald-200 hover:text-black ${
                  selectedTab === "/moderator/profile"
                    ? "bg-emerald-200 text-black"
                    : ""
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

      <li
        className="flex items-center mb-2 p-2 w-full hover:bg-red-700 cursor-pointer"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5" />
        <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>Logout</span>
      </li>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmButtonColor="bg-blue-600"
      />
    </div>
  );
};

export default Sidebar;
