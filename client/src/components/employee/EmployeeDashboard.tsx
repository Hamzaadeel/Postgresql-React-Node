import { Gauge, Trophy, Users, ArrowRight } from "lucide-react";
import Leaderboards from "../common/Leaderboards";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Challenge,
  setChallenges,
  setLoading,
  setError,
} from "../../store/slices/challengeSlice";
import { setCircles } from "../../store/slices/circleSlice";
import Loader from "../common/Loader";

interface CircleParticipation {
  id: number;
  circle: {
    id: number;
    name: string;
  };
}

interface ChallengeParticipation {
  id: number;
  challengeId: number;
  status: "Pending" | "Completed";
}

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { challenges, loading } = useSelector(
    (state: RootState) => state.challenges
  );
  const { circles } = useSelector((state: RootState) => state.circles);

  useEffect(() => {
    fetchInitialData();
  }, [dispatch]);

  const fetchInitialData = async () => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      dispatch(setError("You need to be logged in."));
      dispatch(setLoading(false));
      return;
    }

    const user = JSON.parse(userString);

    try {
      dispatch(setLoading(true));

      // Fetch circles first
      const circlesResponse = await axios.get<any>(
        "http://localhost:5000/api/circles",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const participationsResponse = await axios.get<CircleParticipation[]>(
        `http://localhost:5000/api/circle-participants/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Process circles with participation status
      const tenantCircles = circlesResponse.data
        .filter((circle: any) => circle.tenantId === user.tenantId)
        .map((circle: any) => {
          const participation = participationsResponse.data.find(
            (p) => p.circle.id === circle.id
          );
          return {
            ...circle,
            isParticipant: !!participation,
            participationId: participation?.id,
          };
        });

      dispatch(setCircles(tenantCircles));

      // If user has joined circles, fetch challenges
      const joinedCircles = tenantCircles.filter(
        (circle: any) => circle.isParticipant
      );
      if (joinedCircles.length > 0) {
        const circleIds = joinedCircles.map((circle: any) => circle.id);

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

        const userChallengesResponse = await axios.get<
          ChallengeParticipation[]
        >(
          `http://localhost:5000/api/challenge-participants/user/${user.id}/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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

        const totalChallenges = challengesWithParticipation.length;
        dispatch(
          setChallenges({
            challenges: challengesWithParticipation,
            total: totalChallenges,
          })
        );
      } else {
        dispatch(setChallenges({ challenges: [], total: 0 }));
      }
    } catch (err: any) {
      console.error("Error:", err);
      dispatch(setError(err.response?.data?.message || "Error fetching data."));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const joinedCircles = circles.filter((circle) => circle.isParticipant);
  const availableChallenges = challenges.filter(
    (challenge) => !challenge.participationId || challenge.status === "Pending"
  );
  const completedChallenges = challenges.filter(
    (challenge) => challenge.status === "Completed"
  );

  const renderChallengesSection = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader />
        </div>
      );
    }

    if (joinedCircles.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Join a circle to view challenges
          </p>
          <button
            onClick={() => navigate("/employee/circles")}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            View Circles
          </button>
        </div>
      );
    }

    if (availableChallenges.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No challenges available
          </p>
        </div>
      );
    }

    const challengesToShow =
      availableChallenges.length >= 3
        ? availableChallenges.slice(0, 3)
        : [...availableChallenges, ...completedChallenges].slice(0, 3);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challengesToShow.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-white rounded-lg p-5 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-b from-sky-500 via-sky-600 to-sky-800 flex flex-col h-full dark:from-sky-600 dark:via-sky-700 dark:to-sky-900"
            onClick={() => navigate("/employee/challenges")}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-black dark:text-white">
                {challenge.title}
              </h3>
              {challenge.status && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    challenge.status === "Completed"
                      ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100"
                  }`}
                >
                  {challenge.status}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-50 mb-4 line-clamp-3 flex-grow">
              {challenge.description}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-50 mt-auto">
              <div className="flex items-center justify-between">
                <Users size={16} className="mr-1" />
                <span>{challenge.circle.name}</span>
              </div>
              <span className="text-blue-700 font-medium bg-blue-100 rounded-full p-2 text-xs dark:bg-blue-700 dark:text-blue-100">
                {challenge.points} points
              </span>
              {!challenge.participationId && (
                <button className="flex items-center p-2 bg-gradient-to-r from-cyan-600 to-cyan-800 text-white rounded-full hover:bg-gradient-to-l hover:from-cyan-600 hover:to-cyan-800 transition-colors">
                  Join
                  <ArrowRight size={16} className="ml-1" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
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

  const leaderboardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      <motion.h2
        className="text-2xl font-bold p-2 ml-3 flex items-center text-gray-800 dark:text-gray-100"
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
          },
        }}
      >
        <Gauge className="w-6 h-6 mr-2 mt-6 text-blue-500" />
        <span className="mt-6">Employee Dashboard</span>
      </motion.h2>

      <motion.div className="rounded-xl p-4" variants={cardVariants}>
        {renderChallengesSection()}
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={leaderboardVariants}
        className="mr-2 mb-2"
      >
        <Leaderboards />
      </motion.div>
    </motion.div>
  );
};

export default EmployeeDashboard;
