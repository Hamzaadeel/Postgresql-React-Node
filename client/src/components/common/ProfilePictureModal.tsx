import React, { useState, useEffect } from "react";
import { Upload, Image } from "lucide-react";
import { motion } from "framer-motion";
import ConfirmationModal from "./ConfirmationModal";
import {
  deleteFromS3,
  uploadProfilePicture,
  getProfilePictureUrl,
} from "../../services/api";
import { toast } from "react-toastify";

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (profilePictureUrl: string) => void;
  currentProfilePicture?: string;
}

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentProfilePicture,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // State to store the signed URL for the current profile picture
  const [signedProfilePictureUrl, setSignedProfilePictureUrl] = useState<
    string | null
  >(null);

  // If the currentProfilePicture is a path not a URL, convert it to a signed URL for display
  useEffect(() => {
    if (isOpen && currentProfilePicture) {
      // If it doesn't look like a URL (doesn't start with http), it might be a path that needs to be converted
      if (!currentProfilePicture.startsWith("http")) {
        // Fetch the signed URL for display
        const fetchSignedUrl = async () => {
          try {
            const signedUrl = await getProfilePictureUrl(currentProfilePicture);
            if (signedUrl) {
              setSignedProfilePictureUrl(signedUrl);
              console.log("Fetched signed URL for profile picture:", signedUrl);
            }
          } catch (error) {
            console.error(
              "Error fetching signed URL for profile picture:",
              error
            );
          }
        };

        fetchSignedUrl();
      } else {
        // It's already a URL, use it directly
        setSignedProfilePictureUrl(currentProfilePicture);
      }
    }
  }, [isOpen, currentProfilePicture]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    console.log("Submitting profile picture...");
    if (!selectedFile) {
      console.log("no file detected");
      return;
    }
    setLoading(true);
    try {
      // If there's an existing profile picture, delete it first
      if (currentProfilePicture) {
        console.log("Current profile picture exists:", currentProfilePicture);
        try {
          // Determine if it's a full URL or just a path/key
          let fileToDelete;

          if (currentProfilePicture.startsWith("http")) {
            // It's a URL - extract the key/filename
            const urlParts = currentProfilePicture.split("/");
            const fileName = urlParts[urlParts.length - 1];

            // Check if it contains a query string and remove it
            const fileNameWithoutQuery = fileName.split("?")[0];
            fileToDelete = fileNameWithoutQuery;
          } else if (currentProfilePicture.includes("profile/")) {
            // It's already a path/key like "profile/filename.jpg"
            fileToDelete = currentProfilePicture;
          } else {
            // Assume it's just a filename
            fileToDelete = `profile/${currentProfilePicture}`;
          }

          console.log("Attempting to delete file:", fileToDelete);
          await deleteFromS3(fileToDelete);
          console.log("Old profile picture deleted successfully");
        } catch (error) {
          console.error("Error deleting old profile picture:", error);
          // Continue with upload even if delete fails
        }
      }

      // Use the uploadProfilePicture API function to handle the entire process
      const profilePicturePath = await uploadProfilePicture(selectedFile);
      console.log(
        "Profile picture path updated in database:",
        profilePicturePath
      );

      // Call the parent component's onSubmit with the S3 key
      await onSubmit(profilePicturePath);

      onClose();
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture. Please try again.");
    } finally {
      setLoading(false);
      setIsConfirmationOpen(false);
    }
  };

  // Log the current profile picture URL
  console.log("Current Profile Picture in Modal:", currentProfilePicture);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center dark:text-gray-100">
          <Image className="w-6 h-6 mr-2 text-emerald-500" />
          Update Profile Picture
        </h2>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-emerald-500 bg-emerald-50"
              : "border-gray-300 hover:border-emerald-500"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() =>
            document.getElementById("profile-picture-upload")?.click()
          }
        >
          <input
            type="file"
            id="profile-picture-upload"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
          />
          {previewUrl || signedProfilePictureUrl ? (
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
              <img
                src={previewUrl || signedProfilePictureUrl || ""}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          )}
          <p className="text-gray-600">
            {selectedFile
              ? selectedFile.name
              : "Drag and drop your profile picture here, or click to select"}
          </p>
          <p className="text-sm italic text-gray-500">
            (Supported formats: .jpg, .jpeg, .png)
          </p>
          {selectedFile && (
            <p className="text-sm text-gray-500 mt-2">
              File size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:bg-gray-100 dark:hover:bg-gray-300 rounded transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => setIsConfirmationOpen(true)}
            disabled={!selectedFile || loading}
            className={`px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded hover:bg-gradient-to-l hover:from-emerald-600 hover:to-emerald-800 transition-colors ${
              !selectedFile || loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-emerald-600"
            }`}
          >
            {loading ? "Updating..." : "Update Picture"}
          </button>
        </div>

        <ConfirmationModal
          isOpen={isConfirmationOpen}
          onClose={() => setIsConfirmationOpen(false)}
          onConfirm={handleSubmit}
          confirmButtonColor="bg-emerald-500"
          title="Update Profile Picture"
          message="Are you sure you want to update your profile picture? This action cannot be undone."
        />
      </motion.div>
    </div>
  );
};

export default ProfilePictureModal;
