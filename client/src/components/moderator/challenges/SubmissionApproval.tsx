import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Swords, X } from "lucide-react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Loader from "../../common/Loader";
import {
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission,
} from "../../../services/api";
import ApprovalModal from "./ApprovalModal";

interface Submission {
  id: number;
  challengeId: number;
  userId: number;
  status: string;
  createdAt: string;
  fileUrl: string;
  challenge: {
    title: string;
    circle: {
      name: string;
    };
  };
  user: {
    name: string;
    email: string;
  };
}

const SubmissionApproval = ({
  searchQuery,
  sortBy,
}: {
  searchQuery: string;
  sortBy: string;
}) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardVariants = {
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

  const fetchPendingSubmissions = async () => {
    try {
      const data = await getPendingSubmissions();
      setSubmissions(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: number, feedback: string) => {
    try {
      await approveSubmission(submissionId, feedback);
      setSubmissions(submissions.filter((sub) => sub.id !== submissionId));
      toast.success("Submission approved successfully!");
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      toast.error(
        err.response?.data?.message || "Failed to approve submission"
      );
    }
  };

  const handleReject = async (submissionId: number, feedback: string) => {
    try {
      await rejectSubmission(submissionId, feedback);
      setSubmissions(submissions.filter((sub) => sub.id !== submissionId));
      toast.success("Submission rejected successfully!");
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      toast.error(err.response?.data?.message || "Failed to reject submission");
    }
  };

  const openModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-8">Error: {error}</div>;
  }

  // Filter submissions based on search query
  const filteredSubmissions = submissions.filter((submission) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      submission.challenge.title.toLowerCase().includes(searchLower) ||
      submission.challenge.circle.name.toLowerCase().includes(searchLower) ||
      submission.user.name.toLowerCase().includes(searchLower)
    );
  });

  // Sort submissions based on selected sort option
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "challenge_name":
        return a.challenge.title.localeCompare(b.challenge.title);
      case "circle_name":
        return a.challenge.circle.name.localeCompare(b.challenge.circle.name);
      case "employee_name":
        return a.user.name.localeCompare(b.user.name);
      default:
        return 0;
    }
  });

  return (
    <div>
      {sortedSubmissions.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No pending submissions found.
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={dashboardVariants}
        >
          <table className="min-w-full bg-white ">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Challenge
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Circle
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSubmissions.map((submission, index) => (
                <motion.tr
                  key={submission.id}
                  variants={cardVariants}
                  custom={index}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-600">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-600">
                    <div className="leading-5 text-gray-900  flex items-center">
                      <Swords className="w-5 h-5 mr-2 text-gray-500" />
                      {submission.challenge.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-600">
                    <div className=" leading-5 text-gray-900 ">
                      {submission.challenge.circle.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-600">
                    <div className=" leading-5 text-gray-900 ">
                      {submission.user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-600">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-600">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => openModal(submission)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Review & Approve"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openModal(submission)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Review & Reject"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      <ApprovalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSubmission(null);
        }}
        submission={selectedSubmission}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default SubmissionApproval;
