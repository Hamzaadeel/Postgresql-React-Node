import { useEffect, useState } from "react";
import axios from "axios";
import { Circle } from "../../../services/api";
import {
  Users,
  ArrowRight,
  LogOut,
  UserPlus,
  Rocket,
  Target,
  Compass,
  Crown,
  Shield,
  Flag,
} from "lucide-react";
import Loader from "../../common/Loader";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../common/ConfirmationModal";

interface CircleWithParticipation extends Circle {
  isParticipant?: boolean;
  participationId?: number;
}

interface CircleParticipation {
  id: number;
  circle: Circle;
}

// Array of circle card styles with different colors and icons
const circleStyles = [
  { icon: Rocket, bgColor: "bg-blue-50", iconColor: "text-blue-600" },
  { icon: Target, bgColor: "bg-purple-50", iconColor: "text-purple-600" },
  { icon: Compass, bgColor: "bg-green-50", iconColor: "text-green-600" },
  { icon: Crown, bgColor: "bg-yellow-50", iconColor: "text-yellow-600" },
  { icon: Shield, bgColor: "bg-red-50", iconColor: "text-red-600" },
  { icon: Flag, bgColor: "bg-indigo-50", iconColor: "text-indigo-600" },
];

const EmployeeCircles = () => {
  const [circles, setCircles] = useState<CircleWithParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] =
    useState<CircleWithParticipation | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCircles();
  }, []);

  const fetchCircles = async () => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      setError("You need to be logged in to view circles.");
      setLoading(false);
      return;
    }

    const user = JSON.parse(userString);

    try {
      // Fetch all circles from user's tenant
      const circlesResponse = await axios.get<Circle[]>(
        "http://localhost:5000/api/circles",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch user's circle participations
      const participationsResponse = await axios.get<CircleParticipation[]>(
        `http://localhost:5000/api/circle-participants/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Filter circles by user's tenant and add participation status
      const tenantCircles = circlesResponse.data
        .filter((circle) => circle.tenantId === user.tenantId)
        .map((circle) => {
          const participation = participationsResponse.data.find(
            (p) => p.circle.id === circle.id
          );
          return {
            ...circle,
            isParticipant: !!participation,
            participationId: participation?.id,
          };
        });

      setCircles(tenantCircles);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Error fetching circles.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCircle = async (circleId: number) => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      setError("You need to be logged in to join circles.");
      return;
    }

    const user = JSON.parse(userString);

    try {
      await axios.post(
        "http://localhost:5000/api/circle-participants",
        {
          userId: user.id,
          circleId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Successfully joined the circle!");
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchCircles();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to join circle.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleLeaveCircle = async () => {
    if (!selectedCircle?.participationId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You need to be logged in to leave circles.");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/circle-participants/${selectedCircle.participationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Successfully left the circle!");
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchCircles();
      setIsLeaveModalOpen(false);
      setSelectedCircle(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to leave circle.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleViewCircle = (circleId: number) => {
    navigate(`/employee/circles/${circleId}`);
  };

  const getCircleStyle = (index: number) => {
    return circleStyles[index % circleStyles.length];
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

  const joinedCircles = circles.filter((circle) => circle.isParticipant);
  const availableCircles = circles.filter((circle) => !circle.isParticipant);

  return (
    <div className="p-8">
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Your Circles Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Users className="w-6 h-6 mr-2" />
          Your Circles
        </h2>
        {joinedCircles.length === 0 ? (
          <p className="text-gray-500">You haven't joined any circles yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {joinedCircles.map((circle, index) => {
              const style = getCircleStyle(index);
              const Icon = style.icon;
              return (
                <div
                  key={circle.id}
                  className={`border rounded-lg shadow-sm p-4 ${style.bgColor} transition-transform hover:scale-102`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${style.iconColor}`} />
                      <h3 className="text-lg font-semibold">{circle.name}</h3>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCircle(circle);
                        setIsLeaveModalOpen(true);
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                      title="Leave Circle"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleViewCircle(circle.id)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-50 transition-colors border border-blue-200"
                  >
                    <span>View Circle</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Circles Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <UserPlus className="w-6 h-6 mr-2" />
          Available Circles
        </h2>
        {availableCircles.length === 0 ? (
          <p className="text-gray-500">No available circles to join.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCircles.map((circle, index) => {
              const style = getCircleStyle(index);
              const Icon = style.icon;
              return (
                <div
                  key={circle.id}
                  className={`border rounded-lg shadow-sm p-4 ${style.bgColor} transition-transform hover:scale-102`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-5 h-5 ${style.iconColor}`} />
                      <h3 className="text-lg font-semibold">{circle.name}</h3>
                    </div>
                    <button
                      onClick={() => handleJoinCircle(circle.id)}
                      className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-50 transition-colors border border-blue-200 flex items-center space-x-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Join</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isLeaveModalOpen}
        onClose={() => {
          setIsLeaveModalOpen(false);
          setSelectedCircle(null);
        }}
        onConfirm={handleLeaveCircle}
        title="Leave Circle"
        message={`Are you sure you want to leave ${selectedCircle?.name}? You can always join again later.`}
      />
    </div>
  );
};

export default EmployeeCircles;
