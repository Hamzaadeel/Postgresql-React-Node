import { useEffect, useState } from "react";
import axios from "axios";
import { Swords, ChevronLeft, ChevronRight } from "lucide-react";
import Loader from "../../common/Loader";
import ChallengeDetailsEmp from "./ChallengeDetailsEmp";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import {
  Challenge,
  setChallenges,
  setLoading,
  setError,
  joinChallenge,
  // submitChallenge,
} from "../../../store/slices/challengeSlice";
import { motion } from "framer-motion";
import SubmitChallenge from "./SubmitChallenge";
import { toast } from "react-toastify";
import ChallengeCardEmp from "./ChallengeCardEmp";

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

interface ChallengeParticipationResponse {
  id: number;
  userId: number;
  challengeId: number;
  status: "Pending" | "Completed";
}

const EmployeeChallenges = () => {
  const dispatch = useDispatch();
  const {
    challenges,
    loading: reduxLoading,
    error: reduxError,
  } = useSelector((state: RootState) => state.challenges);
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
  }, [dispatch]);

  const fetchChallenges = async () => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      dispatch(setError("You need to be logged in to view challenges."));
      dispatch(setLoading(false));
      return;
    }

    const user = JSON.parse(userString);

    try {
      dispatch(setLoading(true));

      // First, get the user's circle participations
      const participationsResponse = await axios.get<CircleParticipation[]>(
        `http://13.218.202.231:5000/api/circle-participants/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const circleIds = participationsResponse.data.map(
        (participation) => participation.circle.id
      );

      if (circleIds.length === 0) {
        dispatch(setChallenges({ challenges: [], total: 0 }));
        dispatch(setLoading(false));
        return;
      }

      // Fetch challenges with images included
      console.log("Fetching challenges with includeImages=true");
      const challengesResponse = await axios.get<Challenge[]>(
        `http://13.218.202.231:5000/api/challenges/circles?ids=${circleIds.join(
          ","
        )}&includeImages=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Raw API response:", challengesResponse);
      console.log("API response data:", challengesResponse.data);

      // Get user's challenge participations
      const userChallengesResponse = await axios.get<
        {
          id: number;
          challengeId: number;
          status: "Pending" | "Completed";
        }[]
      >(
        `http://13.218.202.231:5000/api/challenge-participants/user/${user.id}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Get challenge images in a separate call if needed
      const challengesWithImages = await Promise.all(
        challengesResponse.data.map(async (challenge) => {
          try {
            const imagesResponse = await axios.get<
              { id: number; image_path: string }[]
            >(
              `http://13.218.202.231:5000/api/challenges/${challenge.id}/images`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            return {
              ...challenge,
              images: imagesResponse.data,
            };
          } catch (error) {
            console.error(
              `Error fetching images for challenge ${challenge.id}:`,
              error
            );
            return {
              ...challenge,
              images: [],
            };
          }
        })
      );

      console.log("Challenges with images:", challengesWithImages);

      // Combine challenge data with participation status
      const challengesWithParticipation = challengesWithImages.map(
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

      const totalChallenges = challengesWithParticipation.length;
      console.log(
        "Dispatching challenges to Redux store:",
        challengesWithParticipation
      );
      dispatch(
        setChallenges({
          challenges: challengesWithParticipation,
          total: totalChallenges,
        })
      );
    } catch (err: any) {
      console.error("Error:", err);
      dispatch(
        setError(err.response?.data?.message || "Error fetching challenges.")
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleJoinChallenge = async (challengeId: number) => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      dispatch(setError("You need to be logged in to join challenges."));
      return;
    }

    const user = JSON.parse(userString);

    try {
      const response = await axios.post<ChallengeParticipationResponse>(
        "http://13.218.202.231:5000/api/challenge-participants",
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

      dispatch(
        joinChallenge({ challengeId, participationId: response.data.id })
      );
      toast.success("Successfully joined the challenge!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      dispatch(
        setError(err.response?.data?.message || "Failed to join challenge.")
      );
      setTimeout(() => dispatch(setError(null)), 3000);
    }
  };

  // const handleSubmitChallenge = async (file: File) => {
  //   if (!selectedChallenge?.participationId || !selectedChallenge.id) return;

  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     dispatch(setError("You need to be logged in to submit challenges."));
  //     return;
  //   }

  //   try {
  //     // Create form data for file upload
  //     const formData = new FormData();
  //     formData.append("proof", file);
  //     formData.append("status", "Completed");

  //     // Upload file and update status
  //     await axios.put(
  //       `http://13.218.202.231:5000/api/challenge-participants/${selectedChallenge.participationId}`,
  //       formData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     dispatch(submitChallenge({ challengeId: selectedChallenge.id }));
  //     toast.success("Challenge completed successfully!");
  //     setTimeout(() => setSuccessMessage(null), 3000);
  //     setIsSubmitModalOpen(false);
  //     setSelectedChallenge(null);
  //   } catch (err: any) {
  //     dispatch(
  //       setError(err.response?.data?.message || "Failed to submit challenge.")
  //     );
  //     setTimeout(() => dispatch(setError(null)), 3000);
  //   }
  // };

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

  const fadeInVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  if (reduxLoading) {
    return (
      <div className="flex justify-center h-screen mt-6">
        <Loader />
      </div>
    );
  }

  if (reduxError) {
    return <div className="p-8 text-red-600">{reduxError}</div>;
  }

  const joinedChallenges = challenges.filter(
    (challenge) => challenge.participationId
  );
  const availableChallenges = challenges.filter(
    (challenge) => !challenge.participationId
  );

  return (
    <motion.div
      className="p-8 bg-gray-100 dark:bg-gray-800 min-h-screen"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          {successMessage}
        </div>
      )}

      {/* Your Challenges Section */}
      <motion.div variants={fadeInVariants}>
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Swords className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-300" />
              <h2 className="text-2xl font-bold dark:text-gray-100">
                Your Challenges
              </h2>
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
                {currentJoinedChallenges.map((challenge) => (
                  <ChallengeCardEmp
                    key={challenge.id}
                    challenge={challenge}
                    onView={() => handleCardClick(challenge)}
                    onSubmit={(challenge) => {
                      setSelectedChallenge(challenge);
                      setIsSubmitModalOpen(true);
                    }}
                  />
                ))}
              </div>

              <div className="flex justify-center items-center mt-6 space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-300">
                    Show Results:
                  </span>
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
                  <span className="text-sm text-gray-500 dark:text-gray-300">
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
                        ? "bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                        : "bg-slate-800 text-white dark:bg-slate-100 dark:text-gray-800"
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-300">
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
                        ? "bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                        : "bg-slate-800 text-white dark:bg-slate-100 dark:text-gray-800"
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Available Challenges Section */}
      <motion.div variants={fadeInVariants}>
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Swords className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-300" />
              <h2 className="text-2xl font-bold dark:text-gray-100">
                Available Challenges
              </h2>
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
                {currentAvailableChallenges.map((challenge) => (
                  <ChallengeCardEmp
                    key={challenge.id}
                    challenge={challenge}
                    onView={() => handleCardClick(challenge)}
                    onJoin={handleJoinChallenge}
                  />
                ))}
              </div>

              <div className="flex justify-center items-center mt-6 space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-300">
                    Show Results:
                  </span>
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
                  <span className="text-sm text-gray-500 dark:text-gray-300">
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
                        ? "bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                        : "bg-slate-800 text-white dark:bg-slate-100 dark:text-gray-800"
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-300">
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
                        ? "bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                        : "bg-slate-800 text-white dark:bg-slate-100 dark:text-gray-800"
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Challenge Details Modal */}
      <ChallengeDetailsEmp
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        challenge={selectedChallenge}
      />

      {/* Submit Challenge Modal */}
      <SubmitChallenge
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          // Refresh challenges after submission
          fetchChallenges();
        }}
        challenge={selectedChallenge!}
      />
    </motion.div>
  );
};

export default EmployeeChallenges;
