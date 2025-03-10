import { useState } from "react";
import { Bell, Trash2, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  markAllNotificationsAsRead,
  clearNotifications,
  selectNotifications,
} from "../../../store/slices/notificationSlice";

const EmployeeNotifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const [loading, setLoading] = useState(false);

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await dispatch(markAllNotificationsAsRead());
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    setLoading(true);
    try {
      await dispatch(clearNotifications());
    } finally {
      setLoading(false);
    }
  };

  const dashboardVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={dashboardVariants}
      className="p-8 bg-gray-100 h-screen"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mb-6"
        >
          <motion.h2
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-2xl font-bold flex items-center"
          >
            <Bell className="w-6 h-6 mr-2" />
            Notifications
          </motion.h2>

          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMarkAllAsRead}
              disabled={loading || notifications.length === 0}
              className={`px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-800 text-white rounded-md flex items-center ${
                loading || notifications.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gradient-to-l hover:from-cyan-600 hover:to-teal-800"
              }`}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All as Read
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearAll}
              disabled={loading || notifications.length === 0}
              className={`px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-md flex items-center ${
                loading || notifications.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gradient-to-l hover:from-red-500 hover:to-red-700"
              }`}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </motion.button>
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No notifications to display
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">
                    {notification.title}
                  </h3>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EmployeeNotifications;
