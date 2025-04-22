import React, { useState } from "react";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";
import { Challenge } from "../../../store/slices/challengeSlice";
import ConfirmationModal from "../../common/ConfirmationModal";
import { createSubmission } from "../../../services/api";
import { toast } from "react-toastify";

interface SubmitChallengeProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
}

const SubmitChallenge: React.FC<SubmitChallengeProps> = ({
  isOpen,
  onClose,
  challenge,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Invalid file type. Please upload a JPG, PNG, PDF, DOC, DOCX, or TXT file."
        );
        return;
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error("File is too large. Maximum size is 5MB.");
        return;
      }

      setSelectedFile(file);
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
      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Invalid file type. Please upload a JPG, PNG, PDF, DOC, DOCX, or TXT file."
        );
        return;
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error("File is too large. Maximum size is 5MB.");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      await createSubmission(challenge.id, selectedFile);
      toast.success("Challenge submission uploaded successfully!");
      onClose();
      setSelectedFile(null);
    } catch (error) {
      console.error("Error submitting challenge:", error);
      toast.error("Failed to submit challenge. Please try again.");
    } finally {
      setLoading(false);
      setIsConfirmationOpen(false);
    }
  };

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
          <Upload className="w-6 h-6 mr-2 text-blue-500" />
          Submit Challenge
        </h2>

        <div className="mb-4">
          <h3 className="font-semibold text-lg dark:text-gray-100">
            {challenge.title}
          </h3>
          <p className="text-gray-600 text-sm mt-1 dark:text-gray-300">
            Points: {challenge.points}
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-500"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          />
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            {selectedFile
              ? selectedFile.name
              : "Drag and drop your proof of completion here, or click to select a file"}
          </p>
          <p className="text-sm italic text-gray-500">
            Supported formats: JPG, PNG, PDF, DOC, DOCX, TXT (Max size: 5MB)
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
            className={`px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-800 text-white rounded hover:bg-gradient-to-l hover:from-cyan-600 hover:to-cyan-800 transition-colors ${
              !selectedFile || loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-600"
            }`}
          >
            {loading ? "Submitting..." : "Submit Challenge"}
          </button>
        </div>

        <ConfirmationModal
          isOpen={isConfirmationOpen}
          onClose={() => setIsConfirmationOpen(false)}
          onConfirm={handleSubmit}
          confirmButtonColor="bg-blue-500"
          title="Submit Challenge"
          message={`Are you sure you want to submit your proof for "${challenge.title}"? This action cannot be undone.`}
        />
      </motion.div>
    </div>
  );
};

export default SubmitChallenge;
