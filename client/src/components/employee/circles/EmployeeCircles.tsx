import { useEffect, useState } from "react";
import axios from "axios";
import { Circle } from "../../../services/api";
import { Users, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import Loader from "../../common/Loader";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../../common/ConfirmationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import {
  CircleWithParticipation,
  setCircles,
  setLoading,
  setError,
  joinCircle,
  leaveCircle,
} from "../../../store/slices/circleSlice";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { CircleCardEmp } from "./CircleCardEmp";

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

const EmployeeCircles = () => {
  const dispatch = useDispatch();
  const { circles, loading, error, successMessage } = useSelector(
    (state: RootState) => state.circles
  );
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] =
    useState<CircleWithParticipation | null>(null);
  const navigate = useNavigate();
  const [joinedCurrentPage, setJoinedCurrentPage] = useState(1);
  const [availableCurrentPage, setAvailableCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(6);

  useEffect(() => {
    fetchCircles();
  }, [dispatch]);

  const fetchCircles = async () => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      dispatch(setError("You need to be logged in to view circles."));
      dispatch(setLoading(false));
      return;
    }

    const user = JSON.parse(userString);

    try {
      dispatch(setLoading(true));

      const circlesResponse = await axios.get<Circle[]>(
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

      dispatch(setCircles(tenantCircles));
    } catch (err: any) {
      console.error("Error:", err);
      dispatch(
        setError(err.response?.data?.message || "Error fetching circles.")
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleJoinCircle = async (circleId: number) => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      dispatch(setError("You need to be logged in to join circles."));
      return;
    }

    const user = JSON.parse(userString);

    try {
      const response = await axios.post<{ id: number }>(
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

      dispatch(joinCircle({ circleId, participationId: response.data.id }));
      toast.success("Successfully joined Circle!");
    } catch (err: any) {
      dispatch(
        setError(err.response?.data?.message || "Failed to join circle.")
      );
      setTimeout(() => dispatch(setError(null)), 3000);
    }
  };

  const handleLeaveCircle = async () => {
    if (!selectedCircle?.participationId || !selectedCircle.id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      dispatch(setError("You need to be logged in to leave circles."));
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
      dispatch(leaveCircle(selectedCircle.id));
      toast.success("Successfully left the circle!");
      setIsLeaveModalOpen(false);
      setSelectedCircle(null);
    } catch (err: any) {
      dispatch(
        setError(err.response?.data?.message || "Failed to leave circle.")
      );
      setTimeout(() => dispatch(setError(null)), 3000);
    }
  };

  const handleViewCircle = (circleId: number) => {
    navigate(`/employee/circles/${circleId}`);
  };

  const handleLeaveCircleClick = (circle: CircleWithParticipation) => {
    setSelectedCircle(circle);
    setIsLeaveModalOpen(true);
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

      {/* Your Circles Section */}
      <motion.div className="mb-12" variants={fadeInVariants}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faUsers}
              className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-300"
            />
            <h2 className="text-2xl font-bold dark:text-gray-100">
              Your Circles
            </h2>
          </div>
        </div>

        {joinedCircles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500  text-lg">
              You haven't joined any circles yet.
            </p>
            <p className="text-gray-400 mt-2">
              Join a circle below to get started!
            </p>
          </div>
        ) : (
          <>
            <motion.div
              title="View Circle Details"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
            >
              {currentJoinedCircles.map(
                (circle: CircleWithParticipation, index: number) => (
                  <motion.div
                    key={circle.id}
                    className="relative group"
                    variants={cardVariants}
                    custom={index}
                    onClick={() => handleViewCircle(circle.id)}
                  >
                    <div className="relative cursor-pointer">
                      <CircleCardEmp
                        images={
                          circle.images?.map((img) => img.image_path) || []
                        }
                        title={circle.name}
                        createdBy={circle.creator.name}
                        totalEmployees={circle.employeeCount || 0}
                        isParticipant={true}
                        onLeave={() => handleLeaveCircleClick(circle)}
                      />
                    </div>
                  </motion.div>
                )
              )}
            </motion.div>

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
                  title="Previous"
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
                  title="Next"
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
      </motion.div>

      {/* Available Circles Section */}
      <motion.div variants={fadeInVariants}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faUsers}
              className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-300"
            />
            <h2 className="text-2xl font-bold dark:text-gray-100">
              Available Circles
            </h2>
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
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              title="View Circle Details"
              initial="hidden"
              animate="visible"
            >
              {currentAvailableCircles.map(
                (circle: CircleWithParticipation, index: number) => (
                  <motion.div
                    key={circle.id}
                    className="relative group"
                    variants={cardVariants}
                    custom={index}
                    onClick={() => handleViewCircle(circle.id)}
                  >
                    <div className="relative cursor-pointer">
                      <CircleCardEmp
                        images={
                          circle.images?.map((img) => img.image_path) || []
                        }
                        title={circle.name}
                        createdBy={circle.creator.name}
                        totalEmployees={circle.employeeCount || 0}
                        isParticipant={false}
                        onJoin={() => handleJoinCircle(circle.id)}
                      />
                    </div>
                  </motion.div>
                )
              )}
            </motion.div>

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
                  title="Previous"
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
                  title="Next"
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
      </motion.div>

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
    </motion.div>
  );
};

export default EmployeeCircles;
