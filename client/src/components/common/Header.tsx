import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  User,
  LogOut,
  Home,
  Circle,
  CheckCircle,
  Users,
  Building2,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  userRole: "Employee" | "Moderator";
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ userRole }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

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
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md transition-all duration-300">
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
            <p className="text-sm font-semibold text-gray-800 mr-4">
              Welcome Back,{" "}
              {JSON.parse(localStorage.getItem("user") || "{}").name}! 😎
            </p>
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
                      <Circle className="h-4 w-4" />
                      <span>Circles</span>
                    </button>
                    <button
                      onClick={() => handleNavigation("/employee/challenges")}
                      className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-gray-100"
                    >
                      <CheckCircle className="h-4 w-4" />
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
    </header>
  );
};

export default Header;
