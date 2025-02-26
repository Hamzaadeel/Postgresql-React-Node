import { Bell, Gauge, Trophy, Users, ArrowRight } from "lucide-react";
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

        dispatch(setChallenges(challengesWithParticipation));
      } else {
        dispatch(setChallenges([]));
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
        <div className="bg-white rounded-lg p-8 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-lg">
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
        <div className="bg-white rounded-lg p-8 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-lg">No challenges available</p>
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
            className="bg-white rounded-lg p-5 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-b from-sky-400 via-sky-600 to-sky-800 flex flex-col h-full"
            onClick={() => navigate("/employee/challenges")}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-black">{challenge.title}</h3>
              {challenge.status && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    challenge.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
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
              <span className="text-blue-700 font-medium bg-blue-100 rounded-full p-2 text-xs">
                {challenge.points} points
              </span>
            </div>
            <div className="flex items-center justify-between mt-auto">
              {!challenge.participationId && (
                <button className="flex items-center text-blue-500 hover:text-blue-600 transition-colors">
                  Join Challenge
                  <ArrowRight size={16} className="ml-1" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Dummy data for circle updates
  const circleUpdates = [
    {
      id: 1,
      type: "join",
      user: "Alex Kim",
      circle: "Frontend Circle",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "achievement",
      user: "Maria Garcia",
      circle: "Design Circle",
      achievement: "UI Master Badge",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "challenge",
      user: "John Smith",
      circle: "Backend Circle",
      challenge: "API Performance Sprint",
      time: "1 day ago",
    },
    {
      id: 4,
      type: "join",
      user: "Lisa Chen",
      circle: "DevOps Circle",
      time: "2 days ago",
    },
  ];

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

  return (
    <motion.div
      className="space-y-4 bg-gray-100"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      {/* Heading */}
      <motion.h2
        className="text-2xl font-bold p-2 pt-6 ml-3 flex items-center"
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
          },
        }}
      >
        <Gauge className="w-6 h-6 mr-2 text-blue-500" />
        Employee Dashboard
      </motion.h2>

      {/* Available Challenges */}
      <motion.div className="rounded-xl p-4" variants={cardVariants}>
        {renderChallengesSection()}
      </motion.div>

      {/* Grid Layout */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial="hidden"
        animate="visible"
      >
        {/* Leaderboard */}
        <motion.div variants={cardVariants}>
          <Leaderboards />
        </motion.div>

        {/* Circle Updates */}
        <motion.div
          className="bg-white rounded-xl shadow-md p-6 ml-4 mb-4"
          variants={fadeInVariants}
        >
          <div className="flex items-center justify-start mb-6">
            <Bell className="text-blue-500 w-6 h-6" />
            <h2 className="text-xl font-bold ml-2">Circle Updates</h2>
          </div>

          {/* List Items */}
          <motion.div className="space-y-4" variants={fadeInVariants}>
            {circleUpdates.map((update) => (
              <motion.div
                key={update.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                variants={cardVariants}
              >
                <div
                  className={`p-2 rounded-lg ${
                    update.type === "join"
                      ? "bg-green-100 text-green-600"
                      : update.type === "achievement"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {update.type === "join" ? (
                    <Users size={20} />
                  ) : update.type === "achievement" ? (
                    <Trophy size={20} />
                  ) : (
                    <Bell size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">{update.user}</span>
                    {update.type === "join" && ` joined ${update.circle}`}
                    {update.type === "achievement" &&
                      ` earned ${update.achievement} in ${update.circle}`}
                    {update.type === "challenge" &&
                      ` started ${update.challenge} in ${update.circle}`}
                  </p>
                  <span className="text-xs text-gray-500">{update.time}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EmployeeDashboard;
