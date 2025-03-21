import { useState } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../store/hooks";
import { updatePassword } from "../../../services/api";
import { toast } from "react-toastify";

const ModeratorSecurity = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      if (!user) {
        throw new Error("User not found");
      }

      await updatePassword(user.id, {
        currentPassword,
        newPassword,
      });

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Current password is incorrect");
      } else if (err.response?.status === 404) {
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to update password");
      }
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
      className="p-8 bg-gray-100 dark:bg-gray-800 h-screen flex justify-start"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-2xl w-full"
      >
        {/* Heading */}
        <motion.h2
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-2xl font-bold flex items-center mb-6 dark:text-gray-100"
        >
          <Shield className="w-6 h-6 mr-2" />
          Security Settings
        </motion.h2>

        {/* Security Form */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <form onSubmit={handleSubmit}>
            {/* Current Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-4 relative"
            >
              <label className="block text-gray-700 font-semibold text-sm mb-2">
                Current Password
              </label>
              <motion.input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-opacity"
                required
                disabled={loading}
                whileFocus={{ opacity: 0.9 }}
              />
              <button
                type="button"
                title="View Password"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2  mt-3"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-5 h-5 opacity-70" />
                ) : (
                  <Eye className="w-5 h-5 opacity-70" />
                )}
              </button>
            </motion.div>

            {/* New Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-4 relative"
            >
              <label className="block text-gray-700 font-semibold text-sm mb-2">
                New Password
              </label>
              <motion.input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-opacity"
                required
                disabled={loading}
                whileFocus={{ opacity: 0.9 }}
              />
              <button
                type="button"
                title="View Password"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5 opacity-70" />
                ) : (
                  <Eye className="w-5 h-5 opacity-70" />
                )}
              </button>
            </motion.div>

            {/* Confirm New Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-6 relative"
            >
              <label className="block text-gray-700 font-semibold text-sm mb-2">
                Confirm New Password
              </label>
              <motion.input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-opacity"
                required
                disabled={loading}
                whileFocus={{ opacity: 0.9 }}
              />
              <button
                type="button"
                title="View Password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 opacity-70" />
                ) : (
                  <Eye className="w-5 h-5 opacity-70" />
                )}
              </button>
            </motion.div>

            {/* Submit Button */}
            <motion.div className="flex justify-end">
              <motion.button
                type="submit"
                className={`px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded hover:bg-gradient-to-l hover:from-emerald-600 hover:to-emerald-800 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
                whileHover={!loading ? { scale: 1.05 } : {}}
                whileTap={!loading ? { scale: 0.95 } : {}}
              >
                {loading ? "Updating..." : "Update Password"}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ModeratorSecurity;
