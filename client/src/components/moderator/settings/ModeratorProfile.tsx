import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, PencilIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  updateUser,
  updateProfilePicture,
} from "../../../store/slices/authSlice";
import {
  updateUser as updateUserApi,
  getProfilePictureUrl,
} from "../../../services/api";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ProfilePictureModal from "../../common/ProfilePictureModal";

const ModeratorProfile = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] =
    useState(false);
  const navigate = useNavigate();
  const [originalName, setOriginalName] = useState(user?.name || "");
  const [originalEmail, setOriginalEmail] = useState(user?.email || "");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
  const [fetchingProfilePicture, setFetchingProfilePicture] = useState(false);

  // Function to fetch and set the profile picture URL
  const fetchProfilePictureUrl = async (path: string | undefined) => {
    if (!path) return;

    setFetchingProfilePicture(true);
    try {
      console.log("Fetching profile picture URL for path:", path);
      const url = await getProfilePictureUrl(path);
      if (url) {
        console.log("Received signed URL:", url);
        setProfilePictureUrl(url);
      } else {
        console.warn("No signed URL returned for path:", path);
      }
    } catch (error) {
      console.error("Error fetching profile picture URL:", error);
    } finally {
      setFetchingProfilePicture(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setName(user.name);
    setEmail(user.email);
    setOriginalName(user.name);
    setOriginalEmail(user.email || "");

    // Fetch the profile picture URL using the path stored in the user object
    if (user.profilePicture) {
      fetchProfilePictureUrl(user.profilePicture);
    } else if (user.profile_picture_path) {
      // Try with profile_picture_path if profilePicture isn't available
      fetchProfilePictureUrl(user.profile_picture_path);
    }

    // Log the entire user object
    console.log("Current User Object:", user);
    console.log(
      "Profile Picture Path:",
      user.profilePicture || user.profile_picture_path
    );
  }, [user, navigate]);

  const isProfileUpdated = name !== originalName || email !== originalEmail;

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

  const handleProfilePictureUpdate = async (profilePicturePath: string) => {
    try {
      if (!user) {
        throw new Error("User not found");
      }

      setLoading(true);

      // Update the profile picture in Redux and localStorage
      dispatch(
        updateProfilePicture({
          userId: user.id,
          profilePictureUrl: profilePicturePath,
        })
      );

      // Fetch and display the new profile picture URL
      await fetchProfilePictureUrl(profilePicturePath);

      console.log("Received profile picture path:", profilePicturePath);
      console.log("Updated user in Redux:", {
        ...user,
        profilePicture: profilePicturePath,
      });

      setIsProfilePictureModalOpen(false);
      toast.success("Profile picture updated successfully!");
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      toast.error(err.message || "Failed to update profile picture");
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
          className="bg-white rounded-lg shadow-md p-6 relative"
        >
          {/* Profile Picture */}
          <div className="absolute top-6 right-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-2 border-gray-300 overflow-hidden">
                {fetchingProfilePicture ? (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100 animate-pulse">
                    <span className="text-xs text-gray-400">Loading...</span>
                  </div>
                ) : profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsProfilePictureModalOpen(true)}
                title="Edit Profile Picture"
                className="absolute -bottom-2 right-0 p-2 bg-emerald-500 rounded-full shadow-lg hover:bg-emerald-600 transition-colors group-hover:scale-110"
              >
                <PencilIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            {/* Name Input */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-4 pr-28"
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
              className="mb-6 pr-28"
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
                className={`px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded hover:bg-gradient-to-l hover:from-emerald-600 hover:to-emerald-800 transition-colors ${
                  loading || !isProfileUpdated
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={loading || !isProfileUpdated}
                whileHover={!loading && isProfileUpdated ? { scale: 1.05 } : {}}
                whileTap={!loading && isProfileUpdated ? { scale: 0.95 } : {}}
              >
                {loading ? "Updating..." : "Update Profile"}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>

      <ProfilePictureModal
        isOpen={isProfilePictureModalOpen}
        onClose={() => setIsProfilePictureModalOpen(false)}
        onSubmit={handleProfilePictureUpdate}
        currentProfilePicture={
          profilePictureUrl ||
          (user?.profile_picture_path ? user.profile_picture_path : undefined)
        }
      />
    </motion.div>
  );
};

export default ModeratorProfile;
