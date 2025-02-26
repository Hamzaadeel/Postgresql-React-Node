import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  User,
  LogOut,
  Home,
  Users,
  Building2,
  ChevronDown,
  Swords,
  CircleDollarSign,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import ConfirmationModal from "./ConfirmationModal";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setUserPoints } from "../../store/slices/pointsSlice";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";

interface HeaderProps {
  userRole: "Employee" | "Moderator";
  isSidebarOpen: boolean;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

const Header: React.FC<HeaderProps> = ({ userRole }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { userPoints } = useAppSelector((state) => state.points);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const navigate = useNavigate();

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // State for confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTotalPoints();
      fetchNotifications();
      initializeSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  const initializeSocket = () => {
    const newSocket = io("http://localhost:5000", {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      if (user) {
        newSocket.emit("register", user.id);
      }
    });

    newSocket.on("notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.info(notification.message, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    setSocket(newSocket);
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<Notification[]>(
        "http://localhost:5000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const fetchTotalPoints = async () => {
    try {
      if (!user) return;
      const token = localStorage.getItem("token");
      const response = await axios.get<{ totalPoints: number }>(
        `http://localhost:5000/api/points/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(setUserPoints(response.data.totalPoints));
    } catch (error) {
      console.error("Error fetching total points:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node) &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileToggle = () => {
    setIsProfileOpen((prev) => !prev);
    setIsNotificationsOpen(false);
  };

  const handleNotificationsToggle = () => {
    setIsNotificationsOpen((prev) => !prev);
    setIsProfileOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchQuery);
  };

  const handleNavigation = (path: string) => {
    setIsProfileOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsModalOpen(true); // Open confirmation modal
  };

  const confirmLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const unreadNotificationsCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <header className="bg-white shadow-lg transition-all duration-300">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </form>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-semibold text-gray-800">
                Welcome Back,{" "}
                {JSON.parse(localStorage.getItem("user") || "{}").name}!😎
              </p>
              {userRole === "Employee" && (
                <div className="flex items-center bg-amber-100 px-3 py-1 rounded-full">
                  <CircleDollarSign className="w-4 h-4 text-amber-600 mr-1" />
                  <span className="text-sm font-semibold text-amber-600">
                    {userPoints} Points
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={handleNotificationsToggle}
              className="p-2 hover:bg-gray-100 rounded-full relative"
            >
              <Bell className="h-6 w-6" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className={`absolute right-0 mt-2 w-80 ${
                    userRole === "Employee"
                      ? "bg-gradient-to-b from-blue-100 to-blue-300"
                      : "bg-gradient-to-b from-emerald-100 to-emerald-300"
                  } rounded-lg shadow-lg py-2 z-50`}
                >
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No notifications
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                          className={`px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer ${
                            !notification.isRead ? "bg-blue-50" : ""
                          }`}
                        >
                          <p className="font-semibold text-sm">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={handleProfileToggle}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <User className="h-6 w-6" />
              <span className="text-sm text-gray-800">
                {JSON.parse(localStorage.getItem("user") || "{}").name}
              </span>
              <ChevronDown
                className="h-4 w-4 transition-transform duration-200"
                style={{
                  transform: isProfileOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50"
                >
                  {userRole === "Employee" ? (
                    <>
                      <button
                        onClick={() => handleNavigation("/employee/dashboard")}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gradient-to-r from-cyan-700 to-teal-900 hover:text-white"
                      >
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                      </button>
                      <button
                        onClick={() => handleNavigation("/employee/circles")}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gradient-to-r from-cyan-700 to-teal-900 hover:text-white"
                      >
                        <FontAwesomeIcon icon={faUsers} className="h-4 w-4" />
                        <span>Circles</span>
                      </button>
                      <button
                        onClick={() => handleNavigation("/employee/challenges")}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gradient-to-r from-cyan-700 to-teal-900 hover:text-white"
                      >
                        <Swords className="h-4 w-4" />
                        <span>Challenges</span>
                      </button>
                      <button
                        onClick={() => handleNavigation("/employee/profile")}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gradient-to-r from-cyan-700 to-teal-900 hover:text-white"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleNavigation("/moderator/dashboard")}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gradient-to-r from-emerald-700 to-emerald-900 hover:text-white"
                      >
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                      </button>
                      <button
                        onClick={() => handleNavigation("/moderator/tenants")}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gradient-to-r from-emerald-700 to-emerald-900 hover:text-white"
                      >
                        <Building2 className="h-4 w-4" />
                        <span>Tenants</span>
                      </button>
                      <button
                        onClick={() => handleNavigation("/moderator/users")}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gradient-to-r from-emerald-700 to-emerald-900 hover:text-white"
                      >
                        <Users className="h-4 w-4" />
                        <span>Users</span>
                      </button>
                      <button
                        onClick={() => handleNavigation("/moderator/profile")}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gradient-to-r from-emerald-700 to-emerald-900 hover:text-white"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </button>
                    </>
                  )}
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gradient-to-r from-red-600 to-red-900 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmButtonColor="bg-blue-600"
      />
    </header>
  );
};

export default Header;
