import { Gauge, Trophy, Users } from "lucide-react";
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
import ChallengeCardEmp from "./challenges/ChallengeCardEmp";

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

interface ChallengeImage {
  id: number;
  image_path: string;
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
        "http://13.218.202.231:5000/api/circles",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const participationsResponse = await axios.get<CircleParticipation[]>(
        `http://13.218.202.231:5000/api/circle-participants/user/${user.id}`,
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
          `http://13.218.202.231:5000/api/challenges/circles?ids=${circleIds.join(
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
          `http://13.218.202.231:5000/api/challenge-participants/user/${user.id}/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch images for each challenge
        const challengesWithImages = await Promise.all(
          challengesResponse.data.map(async (challenge) => {
            const imagesResponse = await axios.get<ChallengeImage[]>(
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
          })
        );

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
        {challengesToShow.map((challenge) => (
          <ChallengeCardEmp
            key={challenge.id}
            challenge={challenge}
            onView={() => navigate("/employee/challenges")}
            onJoin={() => navigate("/employee/challenges")}
            onSubmit={() => navigate("/employee/challenges")}
          />
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

      <motion.div className="rounded-xl px-4" variants={cardVariants}>
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
