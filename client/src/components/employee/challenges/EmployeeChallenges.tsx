import { useEffect, useState } from "react";
import axios from "axios";
import {
  Swords,
  Trophy,
  Target,
  Flag,
  Award,
  Crown,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import Loader from "../../common/Loader";
import ConfirmationModal from "../../common/ConfirmationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ChallengeDetailsEmp from "./ChallengeDetailsEmp";

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

interface ChallengeWithParticipation extends Challenge {
  participationId?: number;
  status?: "Pending" | "Completed";
}

interface CircleParticipation {
  id: number;
  circle: {
    id: number;
    name: string;
  };
}

const challengeStyles = [
  {
    icon: Trophy,
    iconColor: "text-blue-600",
    pointsColor: "text-blue-700",
  },
  {
    icon: Target,
    iconColor: "text-purple-600",
    pointsColor: "text-purple-700",
  },
  {
    icon: Flag,
    iconColor: "text-green-600",
    pointsColor: "text-green-700",
  },
  {
    icon: Award,
    iconColor: "text-yellow-600",
    pointsColor: "text-yellow-700",
  },
  {
    icon: Crown,
    iconColor: "text-red-600",
    pointsColor: "text-red-700",
  },
];

const EmployeeChallenges = () => {
  const [challenges, setChallenges] = useState<ChallengeWithParticipation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] =
    useState<ChallengeWithParticipation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [joinedCurrentPage, setJoinedCurrentPage] = useState(1);
  const [availableCurrentPage, setAvailableCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(6);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      setError("You need to be logged in to view challenges.");
      setLoading(false);
      return;
    }

    const user = JSON.parse(userString);

    try {
      // First, get all challenges from user's circles
      const participationsResponse = await axios.get<CircleParticipation[]>(
        `http://localhost:5000/api/circle-participants/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const circleIds = participationsResponse.data.map(
        (participation) => participation.circle.id
      );

      // If user hasn't joined any circles, show empty state
      if (circleIds.length === 0) {
        setChallenges([]);
        setLoading(false);
        return;
      }

      // Get all challenges from user's circles
      const challengesResponse = await axios.get<Challenge[]>(
        `http://localhost:5000/api/challenges/circles?ids=${circleIds.join(
          ","
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Get user's challenge participations to check status
      const userChallengesResponse = await axios.get<
        {
          id: number;
          challengeId: number;
          status: "Pending" | "Completed";
        }[]
      >(
        `http://localhost:5000/api/challenge-participants/user/${user.id}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Combine challenges with participation status
      const challengesWithParticipation = challengesResponse.data.map(
        (challenge) => {
          const participation = userChallengesResponse.data.find(
            (p) => p.challengeId === challenge.id
          );
          return {
            ...challenge,
            participationId: participation?.id,
            status: participation?.status,
          };
        }
      );

      setChallenges(challengesWithParticipation);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Error fetching challenges.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId: number) => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      setError("You need to be logged in to join challenges.");
      return;
    }

    const user = JSON.parse(userString);

    try {
      await axios.post(
        "http://localhost:5000/api/challenge-participants",
        {
          userId: user.id,
          challengeId,
          status: "Pending",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Successfully joined the challenge!");
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchChallenges();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to join challenge.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSubmitChallenge = async () => {
    if (!selectedChallenge?.participationId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You need to be logged in to submit challenges.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/challenge-participants/${selectedChallenge.participationId}`,
        {
          status: "Completed",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Challenge completed successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchChallenges();
      setIsSubmitModalOpen(false);
      setSelectedChallenge(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit challenge.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const getChallengeStyle = (index: number) => {
    return challengeStyles[index % challengeStyles.length];
  };

  const handleCardClick = (challenge: ChallengeWithParticipation) => {
    setSelectedChallenge(challenge);
    setIsDetailsModalOpen(true);
  };

  const handleResultsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setResultsPerPage(Number(event.target.value));
    setJoinedCurrentPage(1);
    setAvailableCurrentPage(1);
  };

  // Calculate pagination for joined challenges
  const indexOfLastJoinedChallenge = joinedCurrentPage * resultsPerPage;
  const indexOfFirstJoinedChallenge =
    indexOfLastJoinedChallenge - resultsPerPage;
  const currentJoinedChallenges = challenges
    .filter((challenge) => challenge.participationId)
    .slice(indexOfFirstJoinedChallenge, indexOfLastJoinedChallenge);
  const totalJoinedPages = Math.ceil(
    challenges.filter((challenge) => challenge.participationId).length /
      resultsPerPage
  );

  // Calculate pagination for available challenges
  const indexOfLastAvailableChallenge = availableCurrentPage * resultsPerPage;
  const indexOfFirstAvailableChallenge =
    indexOfLastAvailableChallenge - resultsPerPage;
  const currentAvailableChallenges = challenges
    .filter((challenge) => !challenge.participationId)
    .slice(indexOfFirstAvailableChallenge, indexOfLastAvailableChallenge);
  const totalAvailablePages = Math.ceil(
    challenges.filter((challenge) => !challenge.participationId).length /
      resultsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center h-screen mt-6">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  const joinedChallenges = challenges.filter(
    (challenge) => challenge.participationId
  );
  const availableChallenges = challenges.filter(
    (challenge) => !challenge.participationId
  );

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          {successMessage}
        </div>
      )}

      {/* Your Challenges Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Swords className="w-8 h-8 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold">Your Challenges</h2>
          </div>
        </div>

        {joinedChallenges.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Swords className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg">
              You haven't joined any challenges yet.
            </p>
            <p className="text-gray-400 mt-2">
              Join a challenge below to start earning points!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentJoinedChallenges.map((challenge, index) => {
                const style = getChallengeStyle(index);
                const Icon = style.icon;
                return (
                  <div
                    key={challenge.id}
                    className={`relative group bg-white border rounded-lg shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
                    onClick={() => handleCardClick(challenge)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${style.iconColor}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold">
                          {challenge.title}
                        </h3>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold`}
                      >
                        {challenge.points} pts
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {challenge.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faUsers}
                          className="w-4 h-4 mr-2"
                        />
                        <span>{challenge.circle.name}</span>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-sm ${
                          challenge.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {challenge.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center items-center mt-6 space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Show:</span>
                <select
                  value={resultsPerPage}
                  onChange={handleResultsPerPageChange}
                  className="border rounded p-2 text-sm text-gray-600 bg-white"
                >
                  <option value={3}>3 </option>
                  <option value={6}>6 </option>
                  <option value={9}>9 </option>
                  <option value={12}>12 </option>
                  <option value={15}>15 </option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Showing {currentJoinedChallenges.length} of{" "}
                  {joinedChallenges.length} challenges
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setJoinedCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={joinedCurrentPage === 1}
                  className={`p-2 rounded ${
                    joinedCurrentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-slate-700 text-white hover:bg-slate-800"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-500">
                  Page {joinedCurrentPage} of {totalJoinedPages}
                </span>
                <button
                  onClick={() =>
                    setJoinedCurrentPage((prev) =>
                      Math.min(prev + 1, totalJoinedPages)
                    )
                  }
                  disabled={joinedCurrentPage === totalJoinedPages}
                  className={`p-2 rounded ${
                    joinedCurrentPage === totalJoinedPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-slate-700 text-white hover:bg-slate-800"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Available Challenges Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Swords className="w-8 h-8 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold">Available Challenges</h2>
          </div>
        </div>

        {availableChallenges.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Swords className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg">
              No available challenges at the moment.
            </p>
            <p className="text-gray-400 mt-2">
              Check back later for new challenges!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentAvailableChallenges.map((challenge, index) => {
                const style = getChallengeStyle(index);
                const Icon = style.icon;
                return (
                  <div
                    key={challenge.id}
                    className={`relative group bg-white border rounded-lg shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
                    onClick={() => handleCardClick(challenge)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${style.iconColor}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold">
                          {challenge.title}
                        </h3>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold`}
                      >
                        {challenge.points} pts
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {challenge.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faUsers}
                          className="w-4 h-4 mr-2"
                        />
                        <span>{challenge.circle.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinChallenge(challenge.id);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Join</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center items-center mt-6 space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Show:</span>
                <select
                  value={resultsPerPage}
                  onChange={handleResultsPerPageChange}
                  className="border rounded p-2 text-sm text-gray-600 bg-white"
                >
                  <option value={3}>3 </option>
                  <option value={6}>6 </option>
                  <option value={9}>9 </option>
                  <option value={12}>12 </option>
                  <option value={15}>15 </option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Showing {currentAvailableChallenges.length} of{" "}
                  {availableChallenges.length} challenges
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setAvailableCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={availableCurrentPage === 1}
                  className={`p-2 rounded ${
                    availableCurrentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-slate-700 text-white hover:bg-slate-800"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-500">
                  Page {availableCurrentPage} of {totalAvailablePages}
                </span>
                <button
                  onClick={() =>
                    setAvailableCurrentPage((prev) =>
                      Math.min(prev + 1, totalAvailablePages)
                    )
                  }
                  disabled={availableCurrentPage === totalAvailablePages}
                  className={`p-2 rounded ${
                    availableCurrentPage === totalAvailablePages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-slate-700 text-white hover:bg-slate-800"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Challenge Details Modal */}
      <ChallengeDetailsEmp
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        challenge={selectedChallenge}
      />

      {/* Submit Challenge Modal */}
      <ConfirmationModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleSubmitChallenge}
        title="Submit Challenge"
        message="Are you sure you want to submit this challenge as completed? This action cannot be undone."
        confirmButtonColor="bg-blue-600"
      />
    </div>
  );
};

export default EmployeeChallenges;
