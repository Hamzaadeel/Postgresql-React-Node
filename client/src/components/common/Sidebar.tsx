import { useState, useEffect } from "react";
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
  Shield,
  Clock as ClockIcon,
} from "lucide-react";
import logo from "../../assets/logos/Polarbear.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import ConfirmationModal from "./ConfirmationModal";
import { AnimatePresence, motion } from "framer-motion";
import Clock from "./Clock";

interface SidebarProps {
  userRole: "Employee" | "Moderator";
  onToggle?: (isOpen: boolean) => void;
}

const Sidebar = ({ userRole, onToggle }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState<string | null>(
    location.pathname
  );
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    setSelectedTab(location.pathname);
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
    navigate(tab);
  };

  const handleLogout = () => {
    setIsModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderSettingsDropdown = () => (
    <>
      <li
        title="Open Settings"
        className={`flex items-center p-2 mb-1 cursor-pointer justify-between rounded-xl mx-1 ${
          selectedTab?.includes("/settings")
            ? userRole === "Employee"
              ? "bg-gradient-to-r from-cyan-200 to-teal-400 text-black dark:bg-gradient-to-r dark:from-cyan-700 dark:to-teal-600 dark:text-white"
              : "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black dark:bg-gradient-to-r dark:from-emerald-700 dark:to-emerald-600 dark:text-white"
            : ""
        } ${
          userRole === "Employee"
            ? "hover:bg-gradient-to-r from-cyan-200 to-teal-400 hover:text-black dark:hover:bg-gradient-to-r dark:hover:from-cyan-700 dark:hover:to-teal-600 dark:hover:text-white"
            : "hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black dark:hover:bg-gradient-to-r dark:hover:from-emerald-700 dark:hover:to-emerald-600 dark:hover:text-white"
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
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className={isOpen ? "ml-4" : "flex flex-col items-center"}
          >
            <li
              title="Profile Settings"
              className={`flex items-center p-2 mb-1 cursor-pointer rounded-xl ${
                !isOpen ? "w-full justify-center" : "mr-1"
              } 
                ${
                  userRole === "Employee"
                    ? "hover:bg-gradient-to-r from-cyan-200 to-teal-400 hover:text-black dark:hover:bg-gradient-to-r dark:hover:from-cyan-700 dark:hover:to-teal-600 dark:hover:text-white"
                    : "hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black dark:hover:bg-gradient-to-r dark:hover:from-emerald-700 dark:hover:to-emerald-600 dark:hover:text-white"
                }
                ${
                  selectedTab === `/${userRole.toLowerCase()}/settings/profile`
                    ? userRole === "Employee"
                      ? "bg-gradient-to-r from-cyan-200 to-teal-400 text-black dark:bg-gradient-to-r dark:from-cyan-700 dark:to-teal-600 dark:text-white"
                      : "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black dark:bg-gradient-to-r dark:from-emerald-700 dark:to-emerald-600 dark:text-white"
                    : ""
                }`}
              onClick={() =>
                handleTabClick(`/${userRole.toLowerCase()}/settings/profile`)
              }
            >
              <User className="w-5 h-5" />
              {isOpen && <span className="ml-2">Profile</span>}
            </li>

            <li
              title="Security Settings"
              className={`flex items-center p-2 mb-1 cursor-pointer rounded-xl ${
                !isOpen ? "w-full justify-center" : "mr-1"
              }
              ${
                userRole === "Employee"
                  ? "hover:bg-gradient-to-r from-cyan-200 to-teal-400 hover:text-black dark:hover:bg-gradient-to-r dark:hover:from-cyan-700 dark:hover:to-teal-600 dark:hover:text-white"
                  : "hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black dark:hover:bg-gradient-to-r dark:hover:from-emerald-700 dark:hover:to-emerald-600 dark:hover:text-white"
              }
                ${
                  selectedTab === `/${userRole.toLowerCase()}/settings/security`
                    ? userRole === "Employee"
                      ? "bg-gradient-to-r from-cyan-200 to-teal-400 text-black dark:bg-gradient-to-r dark:from-cyan-700 dark:to-teal-600 dark:text-white"
                      : "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black dark:bg-gradient-to-r dark:from-emerald-700 dark:to-emerald-600 dark:text-white"
                    : ""
                }`}
              onClick={() =>
                handleTabClick(`/${userRole.toLowerCase()}/settings/security`)
              }
            >
              <Shield className="w-5 h-5" />
              {isOpen && <span className="ml-2">Security</span>}
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
          ? "bg-gradient-to-b from-sky-950 via-sky-800 to-sky-600 dark:from-sky-950 dark:via-sky-900 dark:to-sky-800"
          : "bg-gradient-to-b from-emerald-950 via-emerald-800 to-emerald-600 dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-800"
      } text-white ${isOpen ? "w-48" : "w-11"} transition-width duration-300`}
    >
      <button
        onClick={toggleSidebar}
        title={isOpen ? "Minimize sidebar" : "Open sidebar"}
        className="p-2 text-white hover:text-gray-100 dark:hover:text-gray-300"
      >
        {isOpen ? (
          <Menu className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>

      {isOpen ? (
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="w-10 h-10 cursor-pointer" />
          <h1 className={`text-left ml-2 text-lg font-bold dark:text-gray-100`}>
            PolarBear
          </h1>
        </div>
      ) : (
        <img
          src={logo}
          alt="Logo"
          className="w-10 h-10 cursor-pointer"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex-grow">
        <ul className="mt-4">
          {userRole === "Employee" ? (
            <>
              <li
                title="Dashboard"
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer hover:bg-gradient-to-r from-cyan-200 to-teal-400 hover:text-black dark:hover:from-cyan-700 dark:hover:to-teal-600 dark:hover:text-white ${
                  selectedTab === "/employee/dashboard"
                    ? "bg-gradient-to-r from-cyan-200 to-teal-400 text-black dark:from-cyan-700 dark:to-teal-600 dark:text-white"
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
                title="Circles"
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer hover:bg-gradient-to-r from-cyan-200 to-teal-400 hover:text-black dark:hover:from-cyan-700 dark:hover:to-teal-600 dark:hover:text-white ${
                  selectedTab === "/employee/circles"
                    ? "bg-gradient-to-r from-cyan-200 to-teal-400 text-black dark:from-cyan-700 dark:to-teal-600 dark:text-white"
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
                title="Challenges"
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer hover:bg-gradient-to-r from-cyan-200 to-teal-400 hover:text-black dark:hover:from-cyan-700 dark:hover:to-teal-600 dark:hover:text-white ${
                  selectedTab === "/employee/challenges"
                    ? "bg-gradient-to-r from-cyan-200 to-teal-400 text-black dark:from-cyan-700 dark:to-teal-600 dark:text-white"
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
                title="Dashboard"
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer ease-in-out hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black dark:hover:from-emerald-700 dark:hover:to-emerald-600 dark:hover:text-white ${
                  selectedTab === "/moderator/dashboard"
                    ? "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black dark:from-emerald-700 dark:to-emerald-600 dark:text-white "
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
                title="Tenants"
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black dark:hover:from-emerald-700 dark:hover:to-emerald-600 dark:hover:text-white ${
                  selectedTab === "/moderator/tenants"
                    ? "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black dark:from-emerald-700 dark:to-emerald-600 dark:text-white"
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
                title="Users"
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black dark:hover:from-emerald-700 dark:hover:to-emerald-600 dark:hover:text-white ${
                  selectedTab === "/moderator/users"
                    ? "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black dark:from-emerald-700 dark:to-emerald-600 dark:text-white"
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
                title="Circles"
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black dark:hover:from-emerald-700 dark:hover:to-emerald-600 dark:hover:text-white ${
                  selectedTab === "/moderator/circles"
                    ? "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black dark:from-emerald-700 dark:to-emerald-600 dark:text-white"
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
                title="Challenges"
                className={`flex items-center p-2 mb-1 rounded-xl mx-1 cursor-pointer hover:bg-gradient-to-r from-emerald-200 to-emerald-400 hover:text-black dark:hover:from-emerald-700 dark:hover:to-emerald-600 dark:hover:text-white ${
                  selectedTab === "/moderator/challenges"
                    ? "bg-gradient-to-r from-emerald-200 to-emerald-400 text-black dark:from-emerald-700 dark:to-emerald-600 dark:text-white"
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

      {/* Clock Section */}
      <div className="mt-auto mb-2">
        {isOpen ? (
          <Clock userRole={userRole} />
        ) : (
          <div className="relative group">
            <button
              className="flex items-center justify-center p-2 w-full hover:bg-gray-700/30 rounded-lg"
              title="Clock"
            >
              <ClockIcon className="w-5 h-5" />
            </button>
            <div className="hidden group-hover:block absolute w-48 bottom-0 left-full ml-2">
              <Clock userRole={userRole} />
            </div>
          </div>
        )}
      </div>

      <li
        className="flex items-center mb-2 p-2 w-auto rounded-xl mx-1 hover:bg-gradient-to-r from-red-600 to-red-900 cursor-pointer dark:hover:from-red-700 dark:hover:to-red-800"
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
