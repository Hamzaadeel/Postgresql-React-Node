import { useEffect, useState } from "react";
import axios from "axios";
import { Circle } from "../../../services/api";
import {
  Users,
  LogOut,
  UserPlus,
  Rocket,
  Target,
  Compass,
  Crown,
  Shield,
  Flag,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Loader from "../../common/Loader";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../common/ConfirmationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

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
  const [joinedCurrentPage, setJoinedCurrentPage] = useState(1);
  const [availableCurrentPage, setAvailableCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(6);

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

  const handleLeaveCircleClick = (circle: CircleWithParticipation) => {
    setSelectedCircle(circle);
    setIsLeaveModalOpen(true);
  };

  const getCircleStyle = (index: number) => {
    return circleStyles[index % circleStyles.length];
  };

  const handleResultsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setResultsPerPage(Number(event.target.value));
    setJoinedCurrentPage(1);
    setAvailableCurrentPage(1);
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

  // Calculate pagination for joined circles
  const indexOfLastJoinedCircle = joinedCurrentPage * resultsPerPage;
  const indexOfFirstJoinedCircle = indexOfLastJoinedCircle - resultsPerPage;
  const currentJoinedCircles = joinedCircles.slice(
    indexOfFirstJoinedCircle,
    indexOfLastJoinedCircle
  );
  const totalJoinedPages = Math.ceil(joinedCircles.length / resultsPerPage);

  // Calculate pagination for available circles
  const indexOfLastAvailableCircle = availableCurrentPage * resultsPerPage;
  const indexOfFirstAvailableCircle =
    indexOfLastAvailableCircle - resultsPerPage;
  const currentAvailableCircles = availableCircles.slice(
    indexOfFirstAvailableCircle,
    indexOfLastAvailableCircle
  );
  const totalAvailablePages = Math.ceil(
    availableCircles.length / resultsPerPage
  );

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          {successMessage}
        </div>
      )}

      {/* Your Circles Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faUsers}
              className="w-8 h-8 mr-3 text-blue-600"
            />
            <h2 className="text-2xl font-bold">Your Circles</h2>
          </div>
        </div>

        {joinedCircles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg">
              You haven't joined any circles yet.
            </p>
            <p className="text-gray-400 mt-2">
              Join a circle below to get started!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentJoinedCircles.map((circle, index) => {
                const style = getCircleStyle(index);
                const Icon = style.icon;
                return (
                  <div
                    key={circle.id}
                    className={`relative group  border rounded-lg shadow-sm p-6 ${style.bgColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
                    onClick={() => handleViewCircle(circle.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${style.iconColor}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold">{circle.name}</h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveCircleClick(circle);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Leave Circle"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <User className="w-4 h-4 mr-2" />
                      <span>Created by {circle.creator.name}</span>
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
                  Showing {currentJoinedCircles.length} of{" "}
                  {joinedCircles.length} circles
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

      {/* Available Circles Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faUsers}
              className="w-8 h-8 mr-3 text-blue-600"
            />
            <h2 className="text-2xl font-bold">Available Circles</h2>
          </div>
        </div>

        {availableCircles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg">
              No available circles to join.
            </p>
            <p className="text-gray-400 mt-2">
              Check back later for new circles!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentAvailableCircles.map((circle, index) => {
                const style = getCircleStyle(index);
                const Icon = style.icon;
                return (
                  <div
                    key={circle.id}
                    className={`relative group  border rounded-lg shadow-sm p-6 ${style.bgColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer`}
                    onClick={() => handleViewCircle(circle.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${style.iconColor}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold">{circle.name}</h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinCircle(circle.id);
                        }}
                        className="flex items-center space-x-2 px-4 py-2  text-blue-600 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Join</span>
                      </button>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <User className="w-4 h-4 mr-2" />
                      <span>Created by {circle.creator.name}</span>
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
                  Showing {currentAvailableCircles.length} of{" "}
                  {availableCircles.length} circles
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
