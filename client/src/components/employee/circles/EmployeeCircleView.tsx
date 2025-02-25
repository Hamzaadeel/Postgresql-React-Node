import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Circle } from "../../../services/api";
import { Swords, Calendar, User, ArrowLeft, UserPlus } from "lucide-react";
import Loader from "../../common/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

interface Challenge {
  id: number;
  title: string;
  description: string;
  points: number;
  createdAt: string;
  creator: {
    id: number;
    name: string;
  };
}

interface CircleParticipation {
  id: number;
  circle: Circle;
}

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

const EmployeeCircleView = () => {
  const { circleId } = useParams();
  const navigate = useNavigate();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCircleAndChallenges = async () => {
      try {
        const token = localStorage.getItem("token");
        const userString = localStorage.getItem("user");
        if (!token || !userString) {
          navigate("/login");
          return;
        }
        const user = JSON.parse(userString);

        // Fetch circle details
        const circleResponse = await axios.get<Circle[]>(
          `http://localhost:5000/api/circles`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const circleData = circleResponse.data.find(
          (c: Circle) => c.id === parseInt(circleId!)
        );

        if (!circleData) {
          setError("Circle not found");
          setLoading(false);
          return;
        }

        setCircle(circleData);

        // Check if user is a participant
        const participationsResponse = await axios.get<CircleParticipation[]>(
          `http://localhost:5000/api/circle-participants/user/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const isUserParticipant = participationsResponse.data.some(
          (p) => p.circle.id === parseInt(circleId!)
        );
        setIsParticipant(isUserParticipant);

        // Only fetch challenges if user is a participant
        if (isUserParticipant) {
          const challengesResponse = await axios.get<Challenge[]>(
            `http://localhost:5000/api/challenges/circle/${circleId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setChallenges(challengesResponse.data);
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Error fetching circle details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCircleAndChallenges();
  }, [circleId, navigate]);

  const handleJoinCircle = async () => {
    try {
      const token = localStorage.getItem("token");
      const userString = localStorage.getItem("user");
      if (!token || !userString) {
        navigate("/login");
        return;
      }
      const user = JSON.parse(userString);

      await axios.post(
        "http://localhost:5000/api/circle-participants",
        {
          userId: user.id,
          circleId: parseInt(circleId!),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Successfully joined the circle!");
      setIsParticipant(true);

      // Fetch challenges after joining
      const challengesResponse = await axios.get<Challenge[]>(
        `http://localhost:5000/api/challenges/circle/${circleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setChallenges(challengesResponse.data);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to join circle");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleChallengeClick = (challengeId: number) => {
    navigate(`/employee/challenges?selected=${challengeId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error || !circle) {
    return (
      <div className="p-8">
        <div className="text-red-600">{error || "Circle not found"}</div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-8 bg-gray-100 min-h-screen"
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
    >
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          {successMessage}
        </div>
      )}

      {/* Back Button */}
      <motion.button
        onClick={() => navigate("/employee/circles")}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        variants={fadeInVariants}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Circles
      </motion.button>

      {/* Circle Details Card */}
      <motion.div
        className="bg-white rounded-lg shadow-md p-6 mb-8"
        variants={fadeInVariants}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faUsers}
              className="w-6 h-6 mr-3 text-blue-600"
            />
            <h1 className="text-2xl font-bold">{circle.name}</h1>
          </div>
          {!isParticipant && (
            <motion.button
              onClick={handleJoinCircle}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              variants={fadeInVariants}
            >
              <UserPlus className="w-5 h-5" />
              <span>Join Circle</span>
            </motion.button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center">
            <User className="w-5 h-5 mr-2 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Created By</p>
              <p className="font-medium">{circle.creator.name}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Created On</p>
              <p className="font-medium">
                {new Date(circle.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Challenges Section */}
      <motion.div variants={fadeInVariants}>
        <div className="flex items-center mb-6">
          <Swords className="w-6 h-6 mr-2 text-blue-500" />
          <h2 className="text-xl font-bold">Circle Challenges</h2>
        </div>

        {!isParticipant ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-700 font-medium">
              Join this circle to view and participate in its challenges
            </p>
            <motion.button
              onClick={handleJoinCircle}
              className="mt-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              variants={fadeInVariants}
            >
              <UserPlus className="w-5 h-5" />
              <span>Join Circle</span>
            </motion.button>
          </div>
        ) : challenges.length === 0 ? (
          <p className="text-gray-500">
            No challenges available in this circle.
          </p>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
          >
            {challenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                onClick={() => handleChallengeClick(challenge.id)}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg cursor-pointer"
                variants={cardVariants}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">{challenge.title}</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {challenge.points} pts
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {challenge.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>{challenge.creator.name}</span>
                  </div>
                  <span>
                    {new Date(challenge.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default EmployeeCircleView;
