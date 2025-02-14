import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Trash,
  Plus,
  ChevronLeft,
  ChevronRight,
  Swords,
} from "lucide-react";
import { Circle } from "../../../services/api";
import AddChallengeModal from "./AddChallengeModal";
import EditChallengeModal from "./EditChallengeModal";
import ConfirmationModal from "../../common/ConfirmationModal";
import Loader from "../../common/Loader";
import ChallengeDetailsView from "./ChallengeDetailsView";

interface Challenge {
  id: number;
  title: string;
  description: string;
  circleId: number;
  points: number;
  createdBy: number;
  createdAt: string;
  circle: {
    id: number;
    name: string;
  };
  creator: {
    id: number;
    name: string;
  };
}

const ChallengesManagement = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isDetailsViewOpen, setIsDetailsViewOpen] = useState(false);
  const [selectedChallengeForDetails, setSelectedChallengeForDetails] =
    useState<Challenge | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChallenges();
    fetchCircles();
  }, [currentPage, resultsPerPage]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/challenges", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError();
          return;
        }
        throw new Error("Failed to fetch challenges");
      }
      const data = await response.json();
      setChallenges(data);
    } catch (error) {
      showErrorMessage("Error fetching challenges");
    } finally {
      setLoading(false);
    }
  };

  const fetchCircles = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/circles", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch circles");
      }
      const data = await response.json();
      setCircles(data);
    } catch (error) {
      console.error("Error fetching circles:", error);
    }
  };

  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");
    setTimeout(() => {
      setErrorMessage("");
    }, 5000);
  };

  const closeSuccessMessage = () => {
    setSuccessMessage("");
  };

  const closeErrorMessage = () => {
    setErrorMessage("");
  };

  const handleAddChallenge = async (challengeData: {
    title: string;
    description: string;
    circleIds: number[];
    points: number;
  }) => {
    try {
      const { circleIds, ...commonData } = challengeData;

      // Create an array of promises for each circle
      const promises = circleIds.map((circleId) =>
        fetch("http://localhost:5000/api/challenges", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ ...commonData, circleId }),
        })
      );

      // Wait for all challenges to be created
      const responses = await Promise.all(promises);

      // Check if any request failed
      const failedResponses = responses.filter((response) => !response.ok);
      if (failedResponses.length > 0) {
        if (failedResponses.some((response) => response.status === 401)) {
          handleAuthError();
          return;
        }
        throw new Error("Failed to add one or more challenges");
      }

      await fetchChallenges();
      setIsAddModalOpen(false);
      showSuccessMessage("Challenges added successfully!");
    } catch (error: any) {
      showErrorMessage(error.message || "Error adding challenges");
    }
  };

  const handleEditChallenge = async (
    challengeId: number,
    challengeData: {
      title: string;
      description: string;
      circleIds: number[];
      points: number;
    }
  ) => {
    try {
      const { circleIds, ...commonData } = challengeData;

      // First, update the original challenge
      const originalResponse = await fetch(
        `http://localhost:5000/api/challenges/${challengeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ ...commonData, circleId: circleIds[0] }),
        }
      );

      if (!originalResponse.ok) {
        if (originalResponse.status === 401) {
          handleAuthError();
          return;
        }
        throw new Error("Failed to update challenge");
      }

      // If there are additional circles selected, create new challenges for them
      if (circleIds.length > 1) {
        const additionalCircleIds = circleIds.slice(1);
        const createPromises = additionalCircleIds.map((circleId) =>
          fetch("http://localhost:5000/api/challenges", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ ...commonData, circleId }),
          })
        );

        const responses = await Promise.all(createPromises);
        const failedResponses = responses.filter((response) => !response.ok);
        if (failedResponses.length > 0) {
          throw new Error(
            "Failed to create additional challenges. Challenge might already exist."
          );
        }
      }

      await fetchChallenges();
      setIsEditModalOpen(false);
      showSuccessMessage("Challenge(s) updated successfully!");
    } catch (error: any) {
      showErrorMessage(error.message || "Error updating challenge");
    }
  };

  const handleDeleteChallenge = async () => {
    if (!selectedChallenge) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/challenges/${selectedChallenge.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError();
          return;
        }
        throw new Error("Failed to delete challenge");
      }

      await fetchChallenges();
      setIsDeleteModalOpen(false);
      showSuccessMessage("Challenge deleted successfully!");
    } catch (error: any) {
      showErrorMessage(error.message || "Error deleting challenge");
    }
  };

  const handleRowClick = (challenge: Challenge) => {
    setSelectedChallengeForDetails(challenge);
    setIsDetailsViewOpen(true);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(challenges.length / resultsPerPage);
  const indexOfLastChallenge = currentPage * resultsPerPage;
  const indexOfFirstChallenge = indexOfLastChallenge - resultsPerPage;
  const currentChallenges = challenges.slice(
    indexOfFirstChallenge,
    indexOfLastChallenge
  );

  const handleResultsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setResultsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Swords className="w-6 h-6 mr-2" />
          Challenges Management
        </h2>
        <button
          title="Add Challenge"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <Plus className="w-5 h-5" />
          <span>Add Challenge</span>
        </button>
      </div>

      {successMessage && (
        <div className="fixed top-4 opacity-95 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in-out flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={closeSuccessMessage} className="ml-2 text-white">
            X
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in-out flex justify-between items-center">
          <span>{errorMessage}</span>
          <button onClick={closeErrorMessage} className="ml-2 text-white">
            X
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                No.
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Circle
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentChallenges.map((challenge, index) => (
              <tr
                key={challenge.id}
                onClick={() => handleRowClick(challenge)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  {indexOfFirstChallenge + index + 1}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <div className="flex items-center">
                    <Swords className="w-5 h-5 mr-2 text-gray-500" />
                    {challenge.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  {challenge.circle.name}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  {challenge.points}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  {challenge.creator.name}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  {new Date(challenge.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChallenge(challenge);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Challenge"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChallenge(challenge);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Challenge"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add pagination controls */}
      <div className="flex justify-center items-center mb-4 mt-4">
        <span className="text-md">Show results:</span>
        <select
          value={resultsPerPage}
          onChange={handleResultsPerPageChange}
          className="border rounded p-2 mx-2"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>{`Showing ${Math.min(
          resultsPerPage * currentPage,
          challenges.length
        )} of ${challenges.length} Challenges`}</span>
        <div className="flex items-center ml-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-2 py-2 rounded-l ${
              currentPage === 1
                ? "bg-gray-300 text-gray-500"
                : "bg-slate-800 text-white"
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-2 py-2 rounded-r ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-500"
                : "bg-slate-800 text-white"
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <AddChallengeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddChallenge}
        circles={circles}
      />

      <EditChallengeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedChallenge(null);
        }}
        onEdit={handleEditChallenge}
        challenge={selectedChallenge}
        circles={circles}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedChallenge(null);
        }}
        onConfirm={handleDeleteChallenge}
        title="Delete Challenge"
        message={`Are you sure you want to delete challenge: ${selectedChallenge?.title}? This action cannot be undone.`}
      />

      <ChallengeDetailsView
        isOpen={isDetailsViewOpen}
        onClose={() => {
          setIsDetailsViewOpen(false);
          setSelectedChallengeForDetails(null);
        }}
        challenge={selectedChallengeForDetails}
      />
    </div>
  );
};

export default ChallengesManagement;
