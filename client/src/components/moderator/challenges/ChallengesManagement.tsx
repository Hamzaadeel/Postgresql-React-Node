import { useEffect, useState, useRef } from "react";
import {
  Pencil,
  Trash,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Swords,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  setChallenges,
  addChallenge,
  updateChallenge,
  deleteChallenge,
  setLoading,
  setError,
  Challenge,
} from "../../../store/slices/challengeSlice";
import {
  getChallenges,
  createChallenge,
  updateChallenge as updateChallengeApi,
  deleteChallenge as deleteChallengeApi,
  getCircles,
} from "../../../services/api";
import { setCircles } from "../../../store/slices/circleSlice";
import { RootState } from "../../../store/store";
import AddChallengeModal from "./AddChallengeModal";
import EditChallengeModal from "./EditChallengeModal";
import ChallengeDetailsView from "./ChallengeDetailsView";
import ConfirmationModal from "../../common/ConfirmationModal";
import Loader from "../../common/Loader";
import { motion } from "framer-motion";

const ChallengesManagement = () => {
  const dispatch = useAppDispatch();
  const { challenges, loading, error, totalChallenges } = useAppSelector(
    (state: RootState) => state.challenges
  );
  const { circles } = useAppSelector((state: RootState) => state.circles);

  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "points_highest" | "points_lowest" | "name"
  >("newest");
  const [selectedCircles, setSelectedCircles] = useState<number[]>([]);
  const [isCircleDropdownOpen, setIsCircleDropdownOpen] = useState(false);
  const circleDropdownRef = useRef<HTMLDivElement>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardVariants = {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        circleDropdownRef.current &&
        !circleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCircleDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchChallenges(), fetchCircles()]);
    };
    initializeData();
  }, [
    currentPage,
    resultsPerPage,
    debouncedSearchQuery,
    sortBy,
    selectedCircles,
  ]);

  const fetchChallenges = async () => {
    dispatch(setLoading(true));
    try {
      const data = await getChallenges(
        currentPage,
        resultsPerPage,
        debouncedSearchQuery,
        sortBy,
        selectedCircles.length > 0 ? selectedCircles : undefined
      );
      dispatch(
        setChallenges({
          challenges: data.challenges,
          total: data.total,
        })
      );
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error fetching challenges")
        );
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchCircles = async () => {
    try {
      const data = await getCircles(1, 100);
      dispatch(setCircles(data));
    } catch (error: any) {
      console.error("Error fetching circles:", error);
    }
  };

  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  const closeSuccessMessage = () => {
    setSuccessMessage("");
  };

  const handleAddChallenge = async (challengeData: any) => {
    console.log("Challenge Data:", challengeData);

    if (
      !challengeData.title ||
      !challengeData.points ||
      !challengeData.circleIds ||
      challengeData.circleIds.length === 0
    ) {
      dispatch(setError("Title, points, and circle are required."));
      setTimeout(() => {
        dispatch(setError(""));
      }, 5000);
      return;
    }

    const newChallengeData = {
      title: challengeData.title,
      description: challengeData.description,
      points: challengeData.points,
      circleId: challengeData.circleIds[0],
    };

    try {
      const newChallenge = await createChallenge(newChallengeData);
      dispatch(addChallenge(newChallenge as Challenge));
      setIsAddModalOpen(false);
      showSuccessMessage("Challenge added successfully!");
    } catch (error: any) {
      if (error.response) {
        console.error("Error adding challenge:", error.response.data);
        if (error.response.status === 401) {
          handleAuthError();
        } else {
          dispatch(
            setError(error.response.data.message || "Error adding challenge")
          );
        }
      } else {
        console.error("Error adding challenge:", error);
        dispatch(setError("Error adding challenge"));
      }
    }
  };

  const handleEditChallenge = async (
    challengeId: number,
    challengeData: any
  ) => {
    try {
      const updatedChallenge = await updateChallengeApi(
        challengeId,
        challengeData
      );
      dispatch(updateChallenge(updatedChallenge as Challenge));
      setIsEditModalOpen(false);
      showSuccessMessage("Challenge updated successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error updating challenge")
        );
      }
    }
  };

  const handleDeleteChallenge = async () => {
    if (!selectedChallenge) return;
    try {
      await deleteChallengeApi(selectedChallenge.id);
      dispatch(deleteChallenge(selectedChallenge.id));
      setIsDeleteModalOpen(false);
      showSuccessMessage("Challenge deleted successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error deleting challenge")
        );
      }
    }
  };

  const handleResultsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setResultsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalChallenges / resultsPerPage);
  const indexOfLastChallenge = currentPage * resultsPerPage;
  const indexOfFirstChallenge = indexOfLastChallenge - resultsPerPage;
  const currentChallenges = challenges.slice(
    indexOfFirstChallenge,
    indexOfLastChallenge
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".sort-dropdown")) {
        setIsSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={dashboardVariants}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Swords className="w-6 h-6 mr-2" />
            Challenges Management
          </h2>
          <button
            title="Add Challenge"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-4 py-2 rounded hover:bg-gradient-to-l hover:from-emerald-600 hover:to-emerald-800"
          >
            <Plus className="w-5 h-5" />
            <span>Add Challenge</span>
          </button>
        </div>

        {successMessage && (
          <div className="fixed top-4 opacity-95 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in-out flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={closeSuccessMessage} className="ml-2 text-white">
              X
            </button>
          </div>
        )}

        {error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in-out">
            <span>{error}</span>
          </div>
        )}

        {/* Search and Sort Controls */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="ml-4 relative sort-dropdown">
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white flex items-center justify-between min-w-[180px]"
            >
              <span>
                {sortBy === "name"
                  ? "Sort by Name"
                  : sortBy === "newest"
                  ? "Sort by Date (Newest)"
                  : sortBy === "oldest"
                  ? "Sort by Date (Oldest)"
                  : sortBy === "points_highest"
                  ? "Sort by Points (Highest)"
                  : "Sort by Points (Lowest)"}
              </span>
              <ChevronDown
                className="h-4 w-4 transition-transform duration-200"
                style={{
                  transform: isSortDropdownOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              />
            </button>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{
                opacity: isSortDropdownOpen ? 1 : 0,
                y: isSortDropdownOpen ? 0 : -10,
              }}
              transition={{ duration: 0.2 }}
              className={`absolute z-10 mt-2 w-48 bg-white rounded-lg shadow-lg border ${
                isSortDropdownOpen ? "block" : "hidden"
              }`}
            >
              <div className="p-2">
                <button
                  onClick={() => {
                    setSortBy("name");
                    setIsSortDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
                >
                  Sort by Name
                </button>
                <button
                  onClick={() => {
                    setSortBy("newest");
                    setIsSortDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
                >
                  Sort by Date (Newest)
                </button>
                <button
                  onClick={() => {
                    setSortBy("oldest");
                    setIsSortDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
                >
                  Sort by Date (Oldest)
                </button>
                <button
                  onClick={() => {
                    setSortBy("points_highest");
                    setIsSortDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
                >
                  Sort by Points (Highest)
                </button>
                <button
                  onClick={() => {
                    setSortBy("points_lowest");
                    setIsSortDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
                >
                  Sort by Points (Lowest)
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <div>
            {challenges.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                No challenges found. Add a new challenge to get started.
              </div>
            ) : (
              <>
                <motion.table
                  className="min-w-full bg-white"
                  initial="hidden"
                  animate="visible"
                  variants={dashboardVariants}
                >
                  <thead>
                    <tr>
                      <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        No.
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Circle
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentChallenges.map(
                      (challenge: Challenge, index: number) => (
                        <motion.tr
                          key={challenge.id}
                          variants={cardVariants}
                          custom={index}
                        >
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            {indexOfFirstChallenge + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            <div className="flex items-center">
                              <Swords className="w-5 h-5 mr-2 text-gray-500" />
                              {challenge.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            {challenge.circle.name}
                          </td>
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            {challenge.points}
                          </td>
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            {challenge.creator.name}
                          </td>
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            {new Date(challenge.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  setSelectedChallenge(challenge);
                                  setIsDetailsModalOpen(true);
                                }}
                                className="text-gray-600 hover:text-gray-900"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedChallenge(challenge);
                                  setIsEditModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit Challenge"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedChallenge(challenge);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Challenge"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    )}
                  </tbody>
                </motion.table>

                <div className="flex justify-center items-center mb-4 mt-4">
                  <span className="text-md">Show results:</span>
                  <select
                    value={resultsPerPage}
                    onChange={handleResultsPerPageChange}
                    className="border rounded p-2 mx-2"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>{`Showing ${Math.min(
                    resultsPerPage * currentPage,
                    totalChallenges
                  )} of ${totalChallenges} Challenges`}</span>
                  <div className="flex items-center ml-4">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-2 py-2 rounded-l ${
                        currentPage === 1
                          ? "bg-gray-300 text-gray-500"
                          : "bg-slate-800 text-white"
                      }`}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-2 py-2 rounded-r ${
                        currentPage === totalPages
                          ? "bg-gray-300 text-gray-500"
                          : "bg-slate-800 text-white"
                      }`}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>

      <AddChallengeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddChallenge}
        circles={circles}
      />

      <EditChallengeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedChallenge(null);
        }}
        onEdit={handleEditChallenge}
        challenge={selectedChallenge}
        circles={circles}
      />

      <ChallengeDetailsView
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedChallenge(null);
        }}
        challenge={selectedChallenge}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedChallenge(null);
        }}
        onConfirm={handleDeleteChallenge}
        title="Delete Challenge"
        message={`Are you sure you want to delete challenge: ${selectedChallenge?.title}? This action cannot be undone.`}
      />
    </div>
  );
};

export default ChallengesManagement;
