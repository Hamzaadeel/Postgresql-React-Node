import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateUser } from "../../../store/slices/authSlice";
import { updateUser as updateUserApi } from "../../../services/api";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
const ModeratorProfile = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setName(user.name);
    setEmail(user.email);
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!user) {
        throw new Error("User not found");
      }

      const updatedUser = await updateUserApi(user.id, { name, email });

      // Update Redux store
      dispatch(updateUser(updatedUser));

      toast.success("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError(err.message || "Failed to update profile. Please try again.");
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
        {/* Heading with Slide-Down Effect */}
        <motion.h2
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-2xl font-bold flex items-center mb-6 dark:text-gray-100"
        >
          <User className="w-6 h-6 mr-2" />
          My Profile
        </motion.h2>

        {/* Error & Success Messages */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
        >
          {error && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            >
              {error}
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
            >
              {successMessage}
            </motion.div>
          )}
        </motion.div>

        {/* Profile Form with Smooth Scale-In */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <form onSubmit={handleSubmit}>
            {/* Name Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-4"
            >
              <label className="block text-gray-700 font-semibold mb-2">
                Name
              </label>
              <motion.input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-opacity"
                required
                disabled={loading}
                whileFocus={{ opacity: 0.9 }}
              />
            </motion.div>

            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-6"
            >
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-opacity"
                required
                disabled={loading}
                whileFocus={{ opacity: 0.9 }}
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div className="flex justify-end">
              <motion.button
                type="submit"
                className={`px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded hover:bg-gradient-to-l hover:from-emerald-600 hover:to-emerald-800 focus:outline-none  ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
                whileHover={!loading ? { scale: 1.05 } : {}}
                whileTap={!loading ? { scale: 0.95 } : {}}
              >
                {loading ? "Updating..." : "Update Profile"}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ModeratorProfile;
