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
  CheckCircle,
} from "lucide-react";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import Loader from "../../common/Loader";
import ConfirmationModal from "../../common/ConfirmationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Challenge {
  id: number;
  title: string;
  description: string;
  points: number;
  circle: {
    id: number;
    name: string;
  };
  createdAt: string;
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

// Array of challenge card styles with different colors and icons
const challengeStyles = [
  {
    icon: Trophy,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    pointsColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  {
    icon: Target,
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    pointsColor: "text-purple-700",
    borderColor: "border-purple-200",
  },
  {
    icon: Flag,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    pointsColor: "text-green-700",
    borderColor: "border-green-200",
  },
  {
    icon: Award,
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    pointsColor: "text-yellow-700",
    borderColor: "border-yellow-200",
  },
  {
    icon: Crown,
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    pointsColor: "text-red-700",
    borderColor: "border-red-200",
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
    <div className="p-8 h-screen">
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Your Challenges Section */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <Swords className="w-8 h-8 mr-3 text-blue-600" />
          <h2 className="text-2xl font-bold">Your Challenges</h2>
        </div>

        {joinedChallenges.length === 0 ? (
          <div className="text-center py-8">
            <Swords className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              You haven't joined any challenges yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedChallenges.map((challenge, index) => {
              const style = getChallengeStyle(index);
              const Icon = style.icon;
              return (
                <div
                  key={challenge.id}
                  className={`rounded-lg shadow-sm p-6 ${style.bgColor} border ${style.borderColor} transition-transform hover:scale-102`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Icon className={`w-6 h-6 ${style.iconColor} mr-3`} />
                      <h3 className="text-lg font-semibold">
                        {challenge.title}
                      </h3>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full bg-white ${style.pointsColor} text-sm font-semibold`}
                    >
                      {challenge.points} Points
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {challenge.description}
                  </p>

                  <div className="mb-2">
                    <span
                      className={`px-3 py-1 rounded-full bg-white text-sm font-semibold ${
                        challenge.status === "Completed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {challenge.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-200">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="w-4 h-4 text-gray-500 mr-2"
                      />
                      <span className="text-sm text-gray-600">
                        {challenge.circle.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {challenge.status === "Completed" ? (
                        <span className="flex items-center text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedChallenge(challenge);
                            setIsSubmitModalOpen(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-1 bg-white text-blue-600 rounded hover:bg-blue-50 transition-colors border border-blue-200"
                        >
                          <span>Submit</span>
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Challenges Section */}
      <div>
        <div className="flex items-center mb-6">
          <Trophy className="w-8 h-8 mr-3 text-purple-600" />
          <h2 className="text-2xl font-bold">Available Challenges</h2>
        </div>

        {availableChallenges.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              No available challenges at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableChallenges.map((challenge, index) => {
              const style = getChallengeStyle(index);
              const Icon = style.icon;
              return (
                <div
                  key={challenge.id}
                  className={`rounded-lg shadow-sm p-6 ${style.bgColor} border ${style.borderColor} transition-transform hover:scale-102`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Icon className={`w-6 h-6 ${style.iconColor} mr-3`} />
                      <h3 className="text-lg font-semibold">
                        {challenge.title}
                      </h3>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full bg-white ${style.pointsColor} text-sm font-semibold`}
                    >
                      {challenge.points} Points
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {challenge.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-200">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="w-4 h-4 text-gray-500 mr-2"
                      />
                      <span className="text-sm text-gray-600">
                        {challenge.circle.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleJoinChallenge(challenge.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-white text-blue-600 rounded hover:bg-blue-50 transition-colors border border-blue-200"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Join Challenge</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setSelectedChallenge(null);
        }}
        onConfirm={handleSubmitChallenge}
        title="Submit Challenge"
        message={`Are you sure you want to submit the challenge "${selectedChallenge?.title}"? This will mark it as completed.`}
        confirmButtonColor="bg-green-600"
      />
    </div>
  );
};

export default EmployeeChallenges;
