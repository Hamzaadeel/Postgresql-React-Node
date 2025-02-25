import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useAppDispatch } from "../../store/hooks";
import { updateUser } from "../../store/slices/authSlice";
import { updateUser as updateUserApi } from "../../services/api";
import { motion } from "framer-motion";

const EmployeeProfile = () => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const userString = localStorage.getItem("user");
    if (!userString) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userString);
    setName(user.name);
    setEmail(user.email);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const userString = localStorage.getItem("user");
      if (!userString) {
        throw new Error("User not found");
      }

      const user = JSON.parse(userString);
      const updatedUser = await updateUserApi(user.id, { name, email });
      dispatch(updateUser(updatedUser));

      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: index * 0.1, duration: 0.3, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      className="space-y-4 bg-gray-100 h-full"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      {/* Heading */}
      <motion.h2
        className="text-2xl font-bold p-2 pt-6 ml-3 flex items-center"
        variants={fadeInVariants}
      >
        <User className="w-6 h-6 mr-2 text-blue-500" />
        Employee Profile
      </motion.h2>

      {/* Error & Success Messages with Staggered Animations */}
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

      {/* Profile Form */}
      <motion.div
        className="bg-white rounded-lg shadow-md ml-4 p-6 w-1/2"
        variants={cardVariants}
      >
        <form onSubmit={handleSubmit}>
          {/* Name Input with Soft Motion */}
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
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-opacity"
              required
              disabled={loading}
              whileFocus={{ opacity: 0.9 }}
            />
          </motion.div>

          {/* Email Input with Soft Motion */}
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
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-opacity"
              required
              disabled={loading}
              whileFocus={{ opacity: 0.9 }}
            />
          </motion.div>

          {/* Submit Button with Hover & Disabled Animation */}
          <motion.div className="flex justify-end">
            <motion.button
              type="submit"
              className={`px-3 py-2 bg-gradient-to-r from-cyan-600 to-cyan-800 text-white rounded hover:bg-gradient-to-l hover:from-cyan-600 hover:to-cyan-800 ${
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
  );
};

export default EmployeeProfile;
