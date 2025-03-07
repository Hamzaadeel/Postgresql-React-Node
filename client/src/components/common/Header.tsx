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
  Check,
  Trash2,
  CheckCheck,
  X,
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
import {
  setNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotifications,
  selectNotifications,
  selectUnreadCount,
} from "../../store/slices/notificationSlice";
import { debounce } from "lodash";

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

interface SearchResult {
  id: number;
  type: "challenge" | "circle" | "tenant" | "user";
  displayName: string;
  subtitle: string;
}

interface SearchResults {
  challenges: SearchResult[];
  circles: SearchResult[];
  tenants: SearchResult[];
  users: SearchResult[];
}

const Header: React.FC<HeaderProps> = ({ userRole }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { userPoints } = useAppSelector((state) => state.points);
  const notifications = useAppSelector(selectNotifications);
  const unreadNotificationsCount = useAppSelector(selectUnreadCount);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const navigate = useNavigate();

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // State for confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchResults, setSearchResults] = useState<SearchResults>({
    challenges: [],
    circles: [],
    tenants: [],
    users: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
      dispatch(addNotification(notification));
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
      dispatch(setNotifications(response.data));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: number) => {
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
      dispatch(markNotificationAsRead(notificationId));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(deleteNotification(notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/notifications/mark-all-read",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(markAllNotificationsAsRead());
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleClearAll = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:5000/api/notifications/clear-all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(clearNotifications());
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ challenges: [], circles: [], tenants: [], users: [] });
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<SearchResults>(
        `http://localhost:5000/api/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSearchResults(response.data);
      setShowSearchDropdown(true);
    } catch (error) {
      console.error("Error performing search:", error);
      toast.error("Error performing search");
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useRef(
    debounce((query: string) => performSearch(query), 300)
  ).current;

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setShowSearchDropdown(false);
    setSearchQuery("");

    switch (result.type) {
      case "challenge":
        navigate(`/${userRole.toLowerCase()}/challenges`);
        break;
      case "circle":
        navigate(`/${userRole.toLowerCase()}/circles`);
        break;
      case "tenant":
        navigate("/moderator/tenants");
        break;
      case "user":
        navigate("/moderator/users");
        break;
    }
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

  const renderSearchBar = () => (
    <div className="flex-1 max-w-xl relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchInputChange}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {/* Search Results Dropdown */}
      {showSearchDropdown && (
        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border z-50 max-h-[80vh] overflow-y-auto">
          {Object.entries(searchResults).some(
            ([_, results]) => results.length > 0
          ) ? (
            Object.entries(searchResults).map(([category, results]) => {
              if (results.length === 0) return null;

              return (
                <div key={category} className="py-2">
                  <div className="px-4 py-1 bg-gray-50 text-sm font-semibold text-gray-600 uppercase">
                    {category}
                  </div>
                  {results.map((result: SearchResult) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSearchResultClick(result)}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="font-medium">{result.displayName}</div>
                      <div className="text-sm text-gray-500">
                        {result.subtitle}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="bg-white shadow-lg transition-all duration-300">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Search Bar */}
        {renderSearchBar()}

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
                  className={`absolute right-0 mt-2 w-96 ${
                    userRole === "Employee"
                      ? "bg-gradient-to-b from-blue-100 to-blue-300"
                      : "bg-gradient-to-b from-emerald-100 to-emerald-300"
                  } rounded-lg shadow-lg py-2 z-50`}
                >
                  {/* Header */}
                  <div className="px-4 py-2 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">
                        Notifications ({notifications.length})
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleMarkAllAsRead}
                          className="p-1 hover:bg-blue-200 rounded-full transition-colors"
                          title="Mark all as read"
                        >
                          <CheckCheck className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={handleClearAll}
                          className="p-1 hover:bg-red-200 rounded-full transition-colors"
                          title="Clear all notifications"
                        >
                          <Trash2 className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No notifications
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 ${
                            !notification.isRead ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkNotificationAsRead(
                                      notification.id
                                    );
                                  }}
                                  className="p-1 hover:bg-blue-200 rounded-full transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4 text-gray-600" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notification.id);
                                }}
                                className="p-1 hover:bg-red-200 rounded-full transition-colors"
                                title="Delete notification"
                              >
                                <X className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
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
