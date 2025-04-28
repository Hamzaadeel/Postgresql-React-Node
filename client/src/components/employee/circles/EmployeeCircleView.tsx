import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Circle, getCircleImageUrls } from "../../../services/api";
import {
  Swords,
  Calendar,
  User,
  ArrowLeft,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Loader from "../../common/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import ChallengeCardEmp from "../challenges/ChallengeCardEmp";

interface ChallengeImage {
  id: number;
  image_path: string;
}

interface ChallengeParticipation {
  id: number;
  challengeId: number;
  status: "Pending" | "Completed";
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  points: number;
  createdAt: string;
  circleId: number;
  createdBy: number;
  creator: {
    id: number;
    name: string;
  };
  circle: {
    id: number;
    name: string;
  };
  images?: ChallengeImage[];
  participationId?: number;
  status?: "Pending" | "Completed";
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

const ImageCarousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  useEffect(() => {
    const fetchImageUrls = async () => {
      if (images.length === 0) return;

      setIsLoadingImages(true);
      try {
        const urls = await getCircleImageUrls(images);
        setImageUrls(urls);
      } catch (error) {
        console.error("Error fetching circle image URLs:", error);
      } finally {
        setIsLoadingImages(false);
      }
    };

    fetchImageUrls();
  }, [images]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  if (isLoadingImages) {
    return (
      <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading images...</div>
      </div>
    );
  }

  if (imageUrls.length === 0) {
    return (
      <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
        <FontAwesomeIcon icon={faUsers} className="w-16 h-16 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden group">
      {imageUrls.map((url, index) => (
        <img
          key={url}
          src={url}
          alt={`Circle image ${index + 1}`}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {imageUrls.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {imageUrls.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
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
          `http://13.218.202.231:5000/api/circles`,
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
        const circleParticipationsResponse = await axios.get<
          CircleParticipation[]
        >(
          `http://13.218.202.231:5000/api/circle-participants/user/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const isUserParticipant = circleParticipationsResponse.data.some(
          (p) => p.circle.id === parseInt(circleId!)
        );
        setIsParticipant(isUserParticipant);

        // Only fetch challenges if user is a participant
        if (isUserParticipant) {
          const challengesResponse = await axios.get<Challenge[]>(
            `http://13.218.202.231:5000/api/challenges/circle/${circleId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Fetch challenge participation status
          const challengeParticipationsResponse = await axios.get<
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

              const participation = challengeParticipationsResponse.data.find(
                (p) => p.challengeId === challenge.id
              );

              const updatedChallenge: Challenge = {
                ...challenge,
                images: imagesResponse.data,
                circle: circleData,
                participationId: participation?.id,
                status: participation?.status,
              };

              return updatedChallenge;
            })
          );

          setChallenges(challengesWithImages);
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
        "http://13.218.202.231:5000/api/circle-participants",
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
        `http://13.218.202.231:5000/api/challenges/circle/${circleId}`,
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
      className="p-8 bg-gray-100 dark:bg-gray-800 min-h-screen"
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
        className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-500 mb-6"
        variants={fadeInVariants}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Circles
      </motion.button>

      {/* Circle Details Card */}
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden mb-8 max-w-4xl mx-auto"
        variants={fadeInVariants}
      >
        <ImageCarousel
          images={circle.images?.map((img) => img.image_path) || []}
        />

        <div className="p-6 bg-gradient-to-b from-blue-100 via-blue-200 to-blue-300">
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
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-blue-100 transition-colors border border-blue-200"
                variants={fadeInVariants}
              >
                <UserPlus className="w-5 h-5" />
                <span>Join</span>
              </motion.button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-700" />
              <div>
                <p className="text-sm text-gray-700">Created By</p>
                <p className="font-medium">{circle.creator.name}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-700" />
              <div>
                <p className="text-sm text-gray-700">Created On</p>
                <p className="font-medium">
                  {new Date(circle.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Challenges Section */}
      <motion.div variants={fadeInVariants}>
        <div className="flex items-center mb-6">
          <Swords className="w-6 h-6 mr-2 text-blue-500" />
          <h2 className="text-xl font-bold dark:text-gray-100">
            Circle Challenges
          </h2>
        </div>

        {!isParticipant ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-700 font-medium">
              Join this circle to view and participate in its challenges
            </p>
            <motion.button
              onClick={handleJoinCircle}
              className="flex mx-auto mt-2 items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-blue-100 transition-colors border border-blue-200"
              variants={fadeInVariants}
            >
              <UserPlus className="w-5 h-5" />
              <span>Join</span>
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
              <ChallengeCardEmp
                key={challenge.id}
                challenge={challenge}
                onView={() => handleChallengeClick(challenge.id)}
                onJoin={() => handleChallengeClick(challenge.id)}
                onSubmit={() => handleChallengeClick(challenge.id)}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default EmployeeCircleView;
