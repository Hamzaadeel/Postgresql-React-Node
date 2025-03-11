import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Building2,
  ChevronRight,
  LogOut,
  Menu,
  Swords,
  Settings,
  ChevronDown,
  User,
  Bell,
  Shield,
} from "lucide-react";
import logo from "../../assets/logos/dpl-logo.png"; // Adjust the path as necessary
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import ConfirmationModal from "./ConfirmationModal"; // Import the ConfirmationModal
import { AnimatePresence, motion } from "framer-motion";

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    setSelectedTab(location.pathname); // Update selected tab when location changes
  }, [location.pathname]);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  const handleTabClick = (tab: string) => {
    if (!tab.includes("/settings")) {
      setIsSettingsOpen(false);
    }
    navigate(tab); // Navigate to the selected tab
  };

  const handleLogout = () => {
    setIsModalOpen(true); // Open confirmation modal
  };

  const confirmLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderSettingsDropdown = () => (
    <>
      <li
        className={`flex items-center p-2 mb-1 cursor-pointer justify-between rounded-xl mx-1 ${
          selectedTab?.includes("/settings")
            ? userRole === "Employee"
              ? "bg-gradient-to-r from-cyan-200 to-teal-400 text-black"
              : "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black"
            : ""
        } ${
          userRole === "Employee"
            ? "hover:bg-gradient-to-r from-cyan-200 to-teal-400 hover:text-black"
            : "hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black"
        }`}
        onClick={() => {
          setIsSettingsOpen(!isSettingsOpen);
          if (!selectedTab?.includes("/settings")) {
            handleTabClick(`/${userRole.toLowerCase()}/settings/profile`);
          }
        }}
      >
        <div className="flex items-center">
          <Settings className="w-5 h-5" />
          <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
            Settings
          </span>
        </div>
        {isOpen && (
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isSettingsOpen ? "transform rotate-180" : ""
            }`}
          />
        )}
      </li>
      <AnimatePresence>
        {isSettingsOpen && isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="ml-4"
          >
            <li
              className={`flex items-center p-2 mb-1 cursor-pointer rounded-xl mr-1 
                ${
                  userRole === "Employee"
                    ? "hover:bg-gradient-to-r from-cyan-200 to-teal-400 hover:text-black"
                    : "hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black"
                }
                ${
                  selectedTab === `/${userRole.toLowerCase()}/settings/profile`
                    ? userRole === "Employee"
                      ? "bg-gradient-to-r from-cyan-200 to-teal-400 text-black"
                      : "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black"
                    : ""
                }`}
              onClick={() =>
                handleTabClick(`/${userRole.toLowerCase()}/settings/profile`)
              }
            >
              <User className="w-5 h-5" />
              <span className="ml-2">Profile</span>
            </li>
            <li
              className={`flex items-center p-2 mb-1 cursor-pointer rounded-xl mr-1
               ${
                 userRole === "Employee"
                   ? "hover:bg-gradient-to-r from-cyan-200 to-teal-400 hover:text-black"
                   : "hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black"
               }
                ${
                  selectedTab ===
                  `/${userRole.toLowerCase()}/settings/notifications`
                    ? userRole === "Employee"
                      ? "bg-gradient-to-r from-cyan-200 to-teal-400 text-black"
                      : "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black"
                    : ""
                }`}
              onClick={() =>
                handleTabClick(
                  `/${userRole.toLowerCase()}/settings/notifications`
                )
              }
            >
              <Bell className="w-5 h-5" />
              <span className="ml-2">Notifications</span>
            </li>
            <li
              className={`flex items-center p-2 mb-1 cursor-pointer rounded-xl mr-1
              ${
                userRole === "Employee"
                  ? "hover:bg-gradient-to-r from-cyan-200 to-teal-400 hover:text-black"
                  : "hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black"
              }
                ${
                  selectedTab === `/${userRole.toLowerCase()}/settings/security`
                    ? userRole === "Employee"
                      ? "bg-gradient-to-r from-cyan-200 to-teal-400 text-black"
                      : "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black"
                    : ""
                }`}
              onClick={() =>
                handleTabClick(`/${userRole.toLowerCase()}/settings/security`)
              }
            >
              <Shield className="w-5 h-5" />
              <span className="ml-2">Security</span>
            </li>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <div
      className={`flex flex-col shadow-lg h-screen ${
        userRole === "Employee"
          ? "bg-gradient-to-b from-sky-950 via-sky-800 to-sky-600"
          : "bg-gradient-to-b from-emerald-950 via-emerald-800 to-emerald-600"
      } text-white ${isOpen ? "w-56" : "w-11"} transition-width duration-300`}
    >
      <button
        onClick={toggleSidebar}
        title={isOpen ? "Minimize sidebar" : "Open sidebar"}
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
          className="ml-1.5 w-8 h-8 cursor-pointer"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex-grow">
        <ul className="mt-4">
          {userRole === "Employee" ? (
            <>
              <li
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer  hover:bg-gradient-to-r from-cyan-200 to-teal-400 hover:text-black ${
                  selectedTab === "/employee/dashboard"
                    ? "bg-gradient-to-r from-cyan-200 to-teal-400 text-black"
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
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer hover:bg-gradient-to-r from-cyan-200 to-teal-400 hover:text-black ${
                  selectedTab === "/employee/circles"
                    ? "bg-gradient-to-r from-cyan-200 to-teal-400 text-black"
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
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer hover:bg-gradient-to-r from-cyan-200 to-teal-400 hover:text-black ${
                  selectedTab === "/employee/challenges"
                    ? "bg-gradient-to-r from-cyan-200 to-teal-400 text-black"
                    : ""
                }`}
                onClick={() => handleTabClick("/employee/challenges")}
              >
                <Swords className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Challenges
                </span>
              </li>
              {renderSettingsDropdown()}
            </>
          ) : userRole === "Moderator" ? (
            <>
              <li
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer ease-in-out hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black ${
                  selectedTab === "/moderator/dashboard"
                    ? "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black"
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
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black ${
                  selectedTab === "/moderator/tenants"
                    ? "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black"
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
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black ${
                  selectedTab === "/moderator/users"
                    ? "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black"
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
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black ${
                  selectedTab === "/moderator/circles"
                    ? "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black"
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
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black ${
                  selectedTab === "/moderator/challenges"
                    ? "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black"
                    : ""
                }`}
                onClick={() => handleTabClick("/moderator/challenges")}
              >
                <Swords className="w-5 h-5" />
                <span className={`ml-2 ${isOpen ? "block" : "hidden"}`}>
                  Challenges
                </span>
              </li>
              {renderSettingsDropdown()}
            </>
          ) : null}
        </ul>
      </div>

      <li
        className="flex items-center mb-2 p-2 w-auto rounded-xl mx-1 hover:bg-gradient-to-r from-red-600 to-red-900 cursor-pointer"
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
