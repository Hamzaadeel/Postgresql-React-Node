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
  ClipboardCheck,
  LayoutGrid,
  TableIcon,
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
import { toast } from "react-toastify";
import SubmissionApproval from "./SubmissionApproval";
import ChallengeCard from "./ChallengeCard";

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
    | "newest"
    | "oldest"
    | "points_highest"
    | "points_lowest"
    | "name"
    | "participants"
    | "challenge_name"
    | "circle_name"
    | "employee_name"
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
  const [activeTab, setActiveTab] = useState<"challenges" | "approvals">(
    "challenges"
  );
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

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

  useEffect(() => {
    // Reset sortBy when switching tabs to avoid invalid sort options
    if (activeTab === "challenges") {
      if (
        ![
          "newest",
          "oldest",
          "points_highest",
          "points_lowest",
          "name",
          "participants",
        ].includes(sortBy)
      ) {
        setSortBy("newest");
      }
    } else {
      if (
        ![
          "newest",
          "oldest",
          "challenge_name",
          "circle_name",
          "employee_name",
        ].includes(sortBy)
      ) {
        setSortBy("newest");
      }
    }
  }, [activeTab]);

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

      // Ensure data has the expected format, provide defaults if not
      const challenges = data?.challenges || [];
      const total = data?.total || 0;

      dispatch(
        setChallenges({
          challenges: challenges,
          total: total,
        })
      );
    } catch (error: any) {
      console.error("Error fetching challenges:", error);
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error fetching challenges")
        );
        // Set empty challenges array on error
        dispatch(setChallenges({ challenges: [], total: 0 }));
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
      circleIds: challengeData.circleIds,
      imagePaths: challengeData.imagePaths,
    };

    try {
      const newChallenges = await createChallenge(newChallengeData);
      dispatch(addChallenge(newChallenges as Challenge | Challenge[]));
      setIsAddModalOpen(false);
      toast.success("Challenge added successfully!");
      // Refresh the challenges to ensure correct pagination
      fetchChallenges();
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
      toast.success("Challenge updated successfully!");
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
      toast.success("Challenge deleted successfully!");
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

  // Remove client-side pagination - we're using server-side pagination
  // The currentChallenges should just be the challenges from the server
  const currentChallenges = challenges;

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

  const handleViewChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsDetailsModalOpen(true);
  };

  const handleEditChallengeClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsEditModalOpen(true);
  };

  const handleDeleteChallengeClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsDeleteModalOpen(true);
  };

  // Add circle filter dropdown JSX after the search input
  const renderFilters = () => (
    <div className="flex items-center space-x-4 mb-4">
      {/* Search Input */}
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search challenges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Circle Filter Dropdown */}
      <div className="relative" ref={circleDropdownRef}>
        <button
          onClick={() => setIsCircleDropdownOpen(!isCircleDropdownOpen)}
          className="px-4 py-2 border rounded-lg flex items-center space-x-2 hover:bg-gray-50"
        >
          <span>
            {selectedCircles.length
              ? `${selectedCircles.length} Circles`
              : "Filter by Circle"}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isCircleDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isCircleDropdownOpen && (
          <div className="absolute z-10 mt-2 w-64 bg-white border rounded-lg shadow-lg">
            <div className="p-2">
              {circles.map((circle) => (
                <label
                  key={circle.id}
                  className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCircles.includes(circle.id)}
                    onChange={() => {
                      setSelectedCircles((prev) =>
                        prev.includes(circle.id)
                          ? prev.filter((id) => id !== circle.id)
                          : [...prev, circle.id]
                      );
                    }}
                    className="mr-2"
                  />
                  <span>{circle.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center space-x-2 border rounded-lg p-1">
        <button
          onClick={() => setViewMode("table")}
          className={`p-2 rounded ${
            viewMode === "table"
              ? "bg-emerald-100 text-emerald-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <TableIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode("card")}
          className={`p-2 rounded ${
            viewMode === "card"
              ? "bg-emerald-100 text-emerald-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={dashboardVariants}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center dark:text-gray-100">
            <Swords className="w-6 h-6 mr-2" />
            Challenges Management
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                setViewMode(viewMode === "table" ? "card" : "table")
              }
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
              title={`Switch to ${
                viewMode === "table" ? "card" : "table"
              } view`}
            >
              {viewMode === "table" ? (
                <LayoutGrid className="w-5 h-5" />
              ) : (
                <TableIcon className="w-5 h-5" />
              )}
            </button>
            <button
              title="Add Challenge"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-4 py-2 rounded hover:bg-gradient-to-l hover:from-emerald-600 hover:to-emerald-800"
            >
              <Plus className="w-5 h-5" />
              <span>Add Challenge</span>
            </button>
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className="mb-6 flex justify-between items-center">
          {renderFilters()}

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
                  : sortBy === "points_lowest"
                  ? "Sort by Points (Lowest)"
                  : sortBy === "participants"
                  ? "Sort by Total Participants"
                  : sortBy === "challenge_name"
                  ? "Sort by Challenge Name"
                  : sortBy === "circle_name"
                  ? "Sort by Circle Name"
                  : "Sort by Employee Name"}
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
              className={`absolute z-10 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border ${
                isSortDropdownOpen ? "block" : "hidden"
              }`}
            >
              <div className="p-2">
                {activeTab === "challenges" ? (
                  <>
                    <button
                      onClick={() => {
                        setSortBy("name");
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:text-gray-100 dark:hover:text-gray-800 rounded"
                    >
                      Sort by Name
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("newest");
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:text-gray-100 dark:hover:text-gray-800 rounded"
                    >
                      Sort by Date (Newest)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("oldest");
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:text-gray-100 dark:hover:text-gray-800 rounded"
                    >
                      Sort by Date (Oldest)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("points_highest");
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:text-gray-100 dark:hover:text-gray-800 rounded"
                    >
                      Sort by Points (Highest)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("points_lowest");
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:text-gray-100 dark:hover:text-gray-800 rounded"
                    >
                      Sort by Points (Lowest)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("participants");
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:text-gray-100 dark:hover:text-gray-800 rounded"
                    >
                      Sort by Total Participants
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setSortBy("newest");
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:text-gray-100 dark:hover:text-gray-800 rounded"
                    >
                      Sort by Date (Newest)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("oldest");
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:text-gray-100 dark:hover:text-gray-800 rounded"
                    >
                      Sort by Date (Oldest)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("challenge_name");
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:text-gray-100 dark:hover:text-gray-800 rounded"
                    >
                      Sort by Challenge Name
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("circle_name");
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:text-gray-100 dark:hover:text-gray-800 rounded"
                    >
                      Sort by Circle Name
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("employee_name");
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:text-gray-100 dark:hover:text-gray-800 rounded"
                    >
                      Sort by Employee Name
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
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

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("challenges")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "challenges"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              } flex items-center space-x-2`}
            >
              <Swords className="w-5 h-5" />
              <span>Challenges</span>
            </button>
            <button
              onClick={() => setActiveTab("approvals")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "approvals"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              } flex items-center space-x-2`}
            >
              <ClipboardCheck className="w-5 h-5" />
              <span>Approvals</span>
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === "challenges" ? (
          loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : (
            <div>
              {!challenges || challenges.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  No challenges found. Add a new challenge to get started.
                </div>
              ) : viewMode === "table" ? (
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
                          Total Participants
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
                              {index + 1}
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
                              {new Date(
                                challenge.createdAt
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                              {challenge.participantCount || 0}
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
                </>
              ) : (
                // Card View
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={dashboardVariants}
                >
                  {currentChallenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      variants={cardVariants}
                      custom={index}
                    >
                      <ChallengeCard
                        challenge={challenge}
                        onView={handleViewChallenge}
                        onEdit={handleEditChallengeClick}
                        onDelete={handleDeleteChallengeClick}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Pagination Controls */}
              <div className="flex justify-center items-center mb-4 mt-8">
                <span className="text-md dark:text-gray-100">
                  Show results:
                </span>
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
                <span className="dark:text-gray-100">{`Showing ${Math.min(
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
                        ? "bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                        : "bg-slate-800 text-white dark:bg-slate-100 dark:text-gray-800"
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
                        ? "bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                        : "bg-slate-800 text-white dark:bg-slate-100 dark:text-gray-800"
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          <SubmissionApproval searchQuery={searchQuery} sortBy={sortBy} />
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
