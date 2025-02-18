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
import ConfirmationModal from "./ConfirmationModal"; // Import the ConfirmationModal

interface HeaderProps {
  userRole: "Employee" | "Moderator";
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ userRole }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const navigate = useNavigate();

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // State for confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTotalPoints = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = localStorage.getItem("token");

        if (!user.id || !token) return;

        const response = await fetch(
          `http://localhost:5000/api/points/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch points");

        const data = await response.json();
        setTotalPoints(data.totalPoints || 0);
      } catch (error) {
        console.error("Error fetching total points:", error);
      }
    };

    fetchTotalPoints();
    // Set up an interval to refresh points every minute
    const intervalId = setInterval(fetchTotalPoints, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node) &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileToggle = () => {
    setIsProfileOpen((prev) => !prev);
    setShowNotifications(false);
  };

  const handleNotificationsToggle = () => {
    setShowNotifications((prev) => !prev);
    setIsProfileOpen(false);
  };

  // Hardcoded notifications for now
  const notifications = [
    {
      id: 1,
      title: "New Challenge Available",
      message: "A new challenge has been added to your circle",
      time: "5 min ago",
    },
    {
      id: 2,
      title: "Circle Update",
      message: "Your circle has completed a milestone",
      time: "1 hour ago",
    },
    {
      id: 3,
      title: "Profile Update",
      message: "Your profile has been updated successfully",
      time: "2 hours ago",
    },
  ];

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
                    {totalPoints} Points
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
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {notifications.length}
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <p className="font-semibold text-sm">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.time}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
              <ChevronDown className="h-4 w-4" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                {userRole === "Employee" ? (
                  <>
                    <button
                      onClick={() => handleNavigation("/employee/dashboard")}
                      className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100"
                    >
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => handleNavigation("/employee/circles")}
                      className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100"
                    >
                      <FontAwesomeIcon icon={faUsers} className="h-4 w-4" />
                      <span>Circles</span>
                    </button>
                    <button
                      onClick={() => handleNavigation("/employee/challenges")}
                      className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100"
                    >
                      <Swords className="h-4 w-4" />
                      <span>Challenges</span>
                    </button>
                    <button
                      onClick={() => handleNavigation("/employee/profile")}
                      className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavigation("/moderator/dashboard")}
                      className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100"
                    >
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => handleNavigation("/moderator/tenants")}
                      className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100"
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Tenants</span>
                    </button>
                    <button
                      onClick={() => handleNavigation("/moderator/users")}
                      className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100"
                    >
                      <Users className="h-4 w-4" />
                      <span>Users</span>
                    </button>
                    <button
                      onClick={() => handleNavigation("/moderator/profile")}
                      className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                  </>
                )}
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-red-700 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
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
