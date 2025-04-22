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
  Shield,
  Settings,
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
import { useDarkMode } from "../../context/DarkModeContext";
import DarkModeToggle from "./DarkModeToggle";
import { getProfilePictureUrl } from "../../services/api";

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
  type?: "challenge" | "circle" | "tenant" | "user";
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Updated profile picture state
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
  const [fetchingProfilePicture, setFetchingProfilePicture] = useState(false);

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

  // Function to fetch profile picture URL
  const fetchProfilePictureUrl = async (path: string | undefined) => {
    if (!path) return;

    setFetchingProfilePicture(true);
    try {
      console.log("Fetching profile picture URL for header:", path);
      const url = await getProfilePictureUrl(path);
      if (url) {
        console.log("Received signed URL for header:", url);
        setProfilePictureUrl(url);
      } else {
        console.warn("No signed URL returned for path:", path);
      }
    } catch (error) {
      console.error("Error fetching profile picture URL for header:", error);
    } finally {
      setFetchingProfilePicture(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTotalPoints();
      fetchNotifications();
      initializeSocket();

      // Fetch the profile picture URL
      if (user.profilePicture) {
        fetchProfilePictureUrl(user.profilePicture);
      } else if (user.profile_picture_path) {
        fetchProfilePictureUrl(user.profile_picture_path);
      }
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  // Additional effect to refresh profile picture when it changes
  useEffect(() => {
    // Only fetch if the value has changed and exists
    const picturePath = user?.profilePicture || user?.profile_picture_path;
    if (picturePath) {
      fetchProfilePictureUrl(picturePath);
    }
  }, [user?.profilePicture, user?.profile_picture_path]);

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
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user) {
      localStorage.removeItem(`clockPreferences_user_${user.id}`);
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNotificationClick = (notification: Notification) => {
    // Close the notification dropdown when a notification is clicked
    setIsNotificationsOpen(false);

    // Extract type from notification title or message
    const type =
      notification.type ||
      (notification.title.toLowerCase().includes("challenge")
        ? "challenge"
        : notification.title.toLowerCase().includes("circle")
        ? "circle"
        : notification.title.toLowerCase().includes("tenant")
        ? "tenant"
        : notification.title.toLowerCase().includes("user")
        ? "user"
        : null);

    // Mark notification as read
    handleMarkNotificationAsRead(notification.id);

    // Navigate based on type and user role
    if (type) {
      const basePath = userRole.toLowerCase();
      switch (type) {
        case "challenge":
          navigate(`/${basePath}/challenges`);
          break;
        case "circle":
          navigate(`/${basePath}/circles`);
          break;
        case "tenant":
          if (userRole === "Moderator") {
            navigate("/moderator/tenants");
          }
          break;
        case "user":
          if (userRole === "Moderator") {
            navigate("/moderator/users");
          }
          break;
      }
    }
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleSettingsItemClick = (path: string) => {
    handleNavigation(path);
    setIsSettingsOpen(false);
    setIsProfileOpen(false);
  };

  // Add a handler function to start and stop hovering
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const renderSearchBar = () => (
    <div className="flex-1 max-w-md relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchInputChange}
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-${
            userRole === "Moderator" ? "emerald" : "cyan"
          }-500`}
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      {/* Search Results Dropdown */}
      {showSearchDropdown && (
        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border z-50 max-h-[80vh] overflow-y-auto">
          {isSearching ? (
            <div className="px-4 py-3 text-gray-500 text-center">
              Searching...
            </div>
          ) : Object.entries(searchResults).some(
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
    <header className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-lg transition-all duration-300 z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Search Bar */}
        {renderSearchBar()}

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <DarkModeToggle
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />

          <div className="relative">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Welcome Back,{" "}
                {JSON.parse(localStorage.getItem("user") || "{}").name}!😎
              </p>
              {userRole === "Employee" && (
                <div className="flex items-center bg-amber-100 dark:bg-amber-900 px-3 py-1 rounded-full">
                  <CircleDollarSign className="w-4 h-4 text-amber-600 dark:text-amber-300 mr-1" />
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-300">
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
              title="Notifications"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative"
            >
              <Bell className="h-6 w-6 text-gray-600 dark:text-gray-200" />
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
                  className={`absolute right-0 mt-2 w-96 cursor-pointer ${
                    userRole === "Employee"
                      ? "bg-gradient-to-b from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700"
                      : "bg-gradient-to-b from-emerald-100 to-emerald-300 dark:from-emerald-900 dark:to-emerald-700"
                  } rounded-lg shadow-lg py-2 z-50`}
                >
                  {/* Header */}
                  <div className="px-4 py-2 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                        Notifications ({notifications.length})
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleMarkAllAsRead}
                          className="p-1 hover:bg-blue-200 rounded-full transition-colors"
                          title="Mark all as read"
                        >
                          <CheckCheck className="h-4 w-4 text-gray-600 dark:text-gray-100 dark:hover:text-gray-600" />
                        </button>
                        <button
                          onClick={handleClearAll}
                          className="p-1 hover:bg-red-200 rounded-full transition-colors"
                          title="Clear all notifications"
                        >
                          <Trash2 className="h-4 w-4 dark:text-gray-100 dark:hover:text-gray-600 " />
                        </button>
                      </div>
                    </div>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-gray-500 dark:text-gray-100 text-center">
                      No notifications
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 hover:bg-gray-50 ${
                            userRole === "Employee"
                              ? "dark:hover:bg-blue-600"
                              : "dark:hover:bg-emerald-600"
                          } border-b last:border-b-0 cursor-pointer ${
                            !notification.isRead
                              ? userRole === "Employee"
                                ? "bg-blue-50 dark:bg-gradient-to-br from-blue-500 to-blue-600"
                                : "bg-emerald-50 dark:bg-gradient-to-br from-emerald-500 to-emerald-600"
                              : ""
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold dark:text-gray-100 text-sm">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-100">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-100 mt-1">
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
                                  <Check className="h-4 w-4 text-gray-600 dark:text-gray-100 dark:hover:text-gray-600" />
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
                                <X className="h-4 w-4 text-gray-600 dark:text-gray-100 dark:hover:text-gray-600" />
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
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              title="User Menu"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {fetchingProfilePicture ? (
                <div className="w-8 h-8 rounded-full border shadow-lg bg-gray-100 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                  <span className="text-xs text-gray-400">...</span>
                </div>
              ) : profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border shadow-lg object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-gray-600 dark:text-gray-200" />
              )}
              <span className="text-sm text-gray-800 dark:text-gray-200">
                {JSON.parse(localStorage.getItem("user") || "{}").name}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform dark:text-white duration-200 ${
                  isProfileOpen || isHovering ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {(isProfileOpen || isHovering) && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="absolute right-0 mt-2 w-48 px-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 z-50"
                >
                  {userRole === "Employee" ? (
                    <>
                      <button
                        onClick={() => handleNavigation("/employee/dashboard")}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 rounded-xl mx-1 hover:bg-gradient-to-r from-cyan-700 to-teal-900 hover:text-white dark:text-gray-200 dark:hover:text-white"
                      >
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                      </button>
                      <button
                        onClick={() => handleNavigation("/employee/circles")}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 rounded-xl mx-1 hover:bg-gradient-to-r from-cyan-700 to-teal-900 hover:text-white dark:text-gray-200 dark:hover:text-white"
                      >
                        <FontAwesomeIcon icon={faUsers} className="h-4 w-4" />
                        <span>Circles</span>
                      </button>
                      <button
                        onClick={() => handleNavigation("/employee/challenges")}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 rounded-xl mx-1 hover:bg-gradient-to-r from-cyan-700 to-teal-900 hover:text-white dark:text-gray-200 dark:hover:text-white"
                      >
                        <Swords className="h-4 w-4" />
                        <span>Challenges</span>
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2">
                        <button
                          onClick={handleSettingsClick}
                          className="w-full px-4 py-2 text-left flex items-center justify-between rounded-xl mx-1 hover:bg-gradient-to-r from-cyan-700 to-teal-900 hover:text-white dark:text-gray-200 dark:hover:text-white"
                        >
                          <div className="flex items-center space-x-2">
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isSettingsOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {isSettingsOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-4"
                            >
                              <button
                                onClick={() =>
                                  handleSettingsItemClick(
                                    "/employee/settings/profile"
                                  )
                                }
                                className="w-full px-4 py-2 text-left flex items-center space-x-2 rounded-xl mx-1 hover:bg-gradient-to-r from-cyan-700 to-teal-900 hover:text-white dark:text-gray-200 dark:hover:text-white"
                              >
                                <User className="h-4 w-4" />
                                <span>Profile</span>
                              </button>
                              <button
                                onClick={() =>
                                  handleSettingsItemClick(
                                    "/employee/settings/security"
                                  )
                                }
                                className="w-full px-4 py-2 text-left flex items-center space-x-2 rounded-xl mx-1 hover:bg-gradient-to-r from-cyan-700 to-teal-900 hover:text-white dark:text-gray-200 dark:hover:text-white"
                              >
                                <Shield className="h-4 w-4" />
                                <span>Security</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleNavigation("/moderator/dashboard")}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 rounded-xl mx-1 hover:bg-gradient-to-r from-emerald-700 to-emerald-900 hover:text-white dark:text-gray-200 dark:hover:text-white"
                      >
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                      </button>
                      <button
                        onClick={() => handleNavigation("/moderator/tenants")}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 rounded-xl mx-1 hover:bg-gradient-to-r from-emerald-700 to-emerald-900 hover:text-white dark:text-gray-200 dark:hover:text-white"
                      >
                        <Building2 className="h-4 w-4" />
                        <span>Tenants</span>
                      </button>
                      <button
                        onClick={() => handleNavigation("/moderator/users")}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 rounded-xl mx-1 hover:bg-gradient-to-r from-emerald-700 to-emerald-900 hover:text-white dark:text-gray-200 dark:hover:text-white"
                      >
                        <Users className="h-4 w-4" />
                        <span>Users</span>
                      </button>
                      <button
                        onClick={() => handleNavigation("/moderator/circles")}
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 rounded-xl mx-1 hover:bg-gradient-to-r from-emerald-700 to-emerald-900 hover:text-white dark:text-gray-200 dark:hover:text-white"
                      >
                        <FontAwesomeIcon icon={faUsers} className="h-4 w-4" />
                        <span>Circles</span>
                      </button>
                      <button
                        onClick={() =>
                          handleNavigation("/moderator/challenges")
                        }
                        className="w-full px-4 py-2 text-left flex items-center space-x-2 rounded-xl mx-1 hover:bg-gradient-to-r from-emerald-700 to-emerald-900 hover:text-white dark:text-gray-200 dark:hover:text-white"
                      >
                        <Swords className="h-4 w-4" />
                        <span>Challenges</span>
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2">
                        <button
                          onClick={handleSettingsClick}
                          className="w-full px-4 py-2 text-left flex items-center justify-between rounded-xl mx-1 hover:bg-gradient-to-r from-emerald-700 to-emerald-900 hover:text-white dark:text-gray-200 dark:hover:text-white"
                        >
                          <div className="flex items-center space-x-2">
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isSettingsOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {isSettingsOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-4"
                            >
                              <button
                                onClick={() =>
                                  handleSettingsItemClick(
                                    "/moderator/settings/profile"
                                  )
                                }
                                className="w-full px-4 py-2 text-left flex items-center space-x-2 rounded-xl mx-1 hover:bg-gradient-to-r from-emerald-700 to-emerald-900 hover:text-white dark:text-gray-200 dark:hover:text-white"
                              >
                                <User className="h-4 w-4" />
                                <span>Profile</span>
                              </button>
                              <button
                                onClick={() =>
                                  handleSettingsItemClick(
                                    "/moderator/settings/security"
                                  )
                                }
                                className="w-full px-4 py-2 text-left flex items-center space-x-2 rounded-xl mx-1 hover:bg-gradient-to-r from-emerald-700 to-emerald-900 hover:text-white dark:text-gray-200 dark:hover:text-white"
                              >
                                <Shield className="h-4 w-4" />
                                <span>Security</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                  <hr className="my-2 dark:border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left flex items-center space-x-2 rounded-xl mx-1 hover:bg-gradient-to-r from-red-600 to-red-900 hover:text-white dark:text-gray-200 dark:hover:text-white"
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
