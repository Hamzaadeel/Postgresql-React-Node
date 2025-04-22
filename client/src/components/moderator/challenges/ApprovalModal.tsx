import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Check, FileText } from "lucide-react";
import { getFileViewUrl } from "../../../services/api";

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: any;
  onApprove: (submissionId: number, feedback: string) => void;
  onReject: (submissionId: number, feedback: string) => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  submission,
  onApprove,
  onReject,
}) => {
  const [feedback, setFeedback] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (submission?.fileUrl) {
      loadFileUrl();
    }
  }, [submission]);

  const loadFileUrl = async () => {
    try {
      setLoading(true);
      setFileUrl(null); // Reset fileUrl state before loading

      if (!submission?.fileUrl) {
        console.error("No fileUrl provided in submission");
        return;
      }

      console.log("Loading file URL for submission:", {
        id: submission.id,
        fileUrl: submission.fileUrl,
        challengeTitle: submission.challenge.title,
      });

      const url = await getFileViewUrl(submission.fileUrl);
      console.log("Received file URL:", url);

      if (!url) {
        console.error("Received empty URL from getFileViewUrl");
        return;
      }

      // Validate the URL format
      try {
        new URL(url);
        setFileUrl(url);
      } catch (e) {
        console.error("Invalid URL format received:", url);
        throw new Error("Invalid URL format");
      }
    } catch (error) {
      console.error("Error loading file URL:", error);
      setFileUrl(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !submission) return null;

  const renderFilePreview = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!fileUrl) {
      return (
        <div className="mb-6 text-red-500">
          <div>Error loading file</div>
          <div className="text-sm mt-1">
            {submission?.fileUrl
              ? `File key: ${submission.fileUrl}`
              : "No file URL provided"}
          </div>
        </div>
      );
    }

    return (
      <div className="mb-6 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">
          Submitted File
        </h3>
        <div className="border rounded-lg p-4">
          {submission.fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? (
            <img
              src={fileUrl}
              alt="Submission"
              className="max-h-96 mx-auto"
              onError={(e) => {
                console.error("Error loading image:", e);
                e.currentTarget.src = ""; // Clear the src to show alt text
                e.currentTarget.alt = "Error loading image";
              }}
            />
          ) : (
            <div className="flex items-center justify-center">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-500 hover:text-blue-600"
              >
                <FileText className="w-6 h-6 mr-2" />
                View Document
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold dark:text-gray-100">
            Review Submission
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">
            Challenge Details
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            <strong>Challenge:</strong> {submission.challenge.title}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            <strong>Circle:</strong> {submission.challenge.circle.name}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            <strong>Employee:</strong> {submission.user.name}
          </p>
        </div>

        {renderFilePreview()}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            rows={4}
            placeholder="Enter your feedback..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              onReject(submission.id, feedback);
              onClose();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Reject
          </button>
          <button
            onClick={() => {
              onApprove(submission.id, feedback);
              onClose();
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
          >
            <Check className="w-4 h-4 mr-2" />
            Approve
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ApprovalModal;
