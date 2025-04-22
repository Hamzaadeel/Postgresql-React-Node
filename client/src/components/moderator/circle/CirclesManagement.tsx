import { useEffect, useState, useRef } from "react";
import { Circle } from "../../../services/api";
import {
  Pencil,
  Trash,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import AddCircleModal from "./AddCircleModal";
import EditCircleModal from "./EditCircleModal";
import ConfirmationModal from "../../common/ConfirmationModal";
import Loader from "../../common/Loader";
import {
  getCircles,
  createCircle,
  updateCircle as updateCircleApi,
  deleteCircle as deleteCircleApi,
  getTenants,
} from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  setCircles,
  addCircle,
  updateCircle,
  deleteCircle,
  setLoading,
  setError,
} from "../../../store/slices/circleSlice";
import { setTenants } from "../../../store/slices/tenantSlice";
import { RootState } from "../../../store/store";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { CircleCard } from "./CircleCard";

const CirclesManagement = () => {
  const dispatch = useAppDispatch();
  const { circles, loading, error, totalCircles } = useAppSelector(
    (state: RootState) => state.circles
  );
  const { tenants } = useAppSelector((state: RootState) => state.tenants);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "createdAt_desc" | "createdAt_asc" | "employees"
  >("name");
  const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);
  const tenantDropdownRef = useRef<HTMLDivElement>(null);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tenantDropdownRef.current &&
        !tenantDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTenantDropdownOpen(false);
      }
      const target = event.target as HTMLElement;
      if (!target.closest(".sort-dropdown")) {
        setIsSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchCircles(), fetchTenants()]);
    };
    initializeData();
  }, [
    currentPage,
    resultsPerPage,
    debouncedSearchQuery,
    sortBy,
    selectedTenants,
  ]);

  const fetchCircles = async () => {
    dispatch(setLoading(true));
    try {
      const data = await getCircles(
        currentPage,
        resultsPerPage,
        debouncedSearchQuery,
        sortBy,
        selectedTenants.length > 0 ? selectedTenants : undefined
      );
      dispatch(setCircles(data));
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error fetching circles")
        );
        setTimeout(() => {
          dispatch(setError(""));
        }, 5000);
      }
    } finally {
      dispatch(setLoading(false));
    }
  };
  const fetchTenants = async () => {
    try {
      const data = await getTenants(1, 100);
      dispatch(setTenants(data));
    } catch (error: any) {
      console.error("Error fetching tenants:", error);
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

  const handleAddCircle = async (circleData: {
    name: string;
    tenantId: number;
  }) => {
    try {
      const newCircle = await createCircle(circleData);
      dispatch(addCircle(newCircle));
      setIsAddModalOpen(false);
      toast.success("Circle added successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error adding circle")
        );
      }
    }
  };

  const handleEditCircle = async (
    circleId: number,
    circleData: { name: string }
  ) => {
    try {
      const updatedCircle = await updateCircleApi(circleId, circleData);
      dispatch(updateCircle(updatedCircle));
      setIsEditModalOpen(false);
      toast.success("Circle updated successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error updating circle")
        );
      }
    }
  };

  const handleDeleteCircle = async () => {
    if (!selectedCircle) return;
    try {
      await deleteCircleApi(selectedCircle.id);
      dispatch(deleteCircle(selectedCircle.id));
      setIsDeleteModalOpen(false);
      toast.success("Circle deleted successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error deleting circle")
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

  const totalPages = Math.ceil(totalCircles / resultsPerPage);
  const indexOfLastCircle = currentPage * resultsPerPage;
  const indexOfFirstCircle = indexOfLastCircle - resultsPerPage;
  const currentCircles = circles.slice(indexOfFirstCircle, indexOfLastCircle);

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

  return (
    <div className="p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={dashboardVariants}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center dark:text-gray-100">
            <FontAwesomeIcon icon={faUsers} className="w-6 h-6 mr-2" />
            Circles Management
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
              title="Add Circle"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-4 py-2 rounded hover:bg-gradient-to-l hover:from-emerald-600 hover:to-emerald-800"
            >
              <Plus className="w-5 h-5" />
              <span>Add Circle</span>
            </button>
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

        <div className="mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search circles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex space-x-4">
              {/* Search and Sort Controls */}
              <div className="ml-4 relative sort-dropdown">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white flex items-center justify-between min-w-[180px]"
                >
                  <span>
                    {sortBy === "name"
                      ? "Sort by Name"
                      : sortBy === "createdAt_desc"
                      ? "Sort by Date (Newest)"
                      : sortBy === "createdAt_asc"
                      ? "Sort by Date (Oldest)"
                      : "Sort by Total Employees"}
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
                  className={`absolute z-10 mt-2 w-48 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-lg border ${
                    isSortDropdownOpen ? "block" : "hidden"
                  }`}
                >
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSortBy("name");
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:text-gray-800 rounded"
                    >
                      Sort by Name
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("createdAt_desc");
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:text-gray-800 rounded"
                    >
                      Sort by Date (Newest)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("createdAt_asc");
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:text-gray-800 rounded"
                    >
                      Sort by Date (Oldest)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("employees");
                        setIsSortDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:text-gray-800 rounded"
                    >
                      Sort by Total Employees
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Tenant Filter Dropdown */}
              <div className="relative" ref={tenantDropdownRef}>
                <button
                  onClick={() => setIsTenantDropdownOpen(!isTenantDropdownOpen)}
                  className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center justify-between min-w-[150px]"
                >
                  <span>
                    {selectedTenants.length === 0
                      ? "All Tenants"
                      : `${selectedTenants.length} Tenant${
                          selectedTenants.length > 1 ? "s" : ""
                        } Selected`}
                  </span>
                  <ChevronDown
                    className="h-4 w-4 transition-transform duration-200"
                    style={{
                      transform: isTenantDropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                </button>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{
                    opacity: isTenantDropdownOpen ? 1 : 0,
                    y: isTenantDropdownOpen ? 0 : -10,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`absolute z-10 mt-2 w-fit min-w-40 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-lg border max-h-60 overflow-y-auto ${
                    isTenantDropdownOpen ? "block" : "hidden"
                  }`}
                >
                  <div className="p-2">
                    {/* Select All Checkbox for Tenants */}
                    <label className="flex items-center p-2 hover:bg-gray-50 dark:hover:text-gray-800 rounded">
                      <input
                        type="checkbox"
                        checked={selectedTenants.length === tenants.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTenants(tenants.map((t) => t.id));
                          } else {
                            setSelectedTenants([]);
                          }
                        }}
                        className="mr-2"
                      />
                      Select All
                    </label>
                    {tenants.map((tenant) => (
                      <label
                        key={tenant.id}
                        className="flex items-center p-2 hover:bg-gray-50 dark:hover:text-gray-800 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTenants.includes(tenant.id)}
                          onChange={(e) => {
                            setSelectedTenants(
                              e.target.checked
                                ? [...selectedTenants, tenant.id]
                                : selectedTenants.filter((t) => t !== tenant.id)
                            );
                          }}
                          className="mr-2"
                        />
                        {tenant.name}
                      </label>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <div>
            {circles.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                No circles found. Add a new circle to get started.
              </div>
            ) : (
              <>
                {viewMode === "table" ? (
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
                          Name
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                          Tenant
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                          Created By
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                          Total Employees
                        </th>
                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCircles.map((circle: Circle, index: number) => (
                        <motion.tr
                          key={circle.id}
                          variants={cardVariants}
                          custom={index}
                        >
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            {indexOfFirstCircle + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            <div className="flex items-center">
                              <FontAwesomeIcon
                                icon={faUsers}
                                className="w-5 h-5 mr-2 text-gray-500"
                              />
                              {circle.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            {circle.tenant.name}
                          </td>
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            {circle.creator.name}
                          </td>
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            {new Date(circle.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            {circle.employeeCount || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => {
                                  setSelectedCircle(circle);
                                  setIsEditModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit Circle"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCircle(circle);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Circle"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </motion.table>
                ) : (
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    initial="hidden"
                    animate="visible"
                    variants={dashboardVariants}
                  >
                    {currentCircles.map((circle: Circle, index: number) => (
                      <motion.div
                        key={circle.id}
                        variants={cardVariants}
                        custom={index}
                        className="relative group"
                      >
                        <CircleCard
                          title={circle.name}
                          createdBy={circle.creator.name}
                          totalEmployees={circle.employeeCount || 0}
                          tenantName={circle.tenant.name}
                          images={
                            circle.images?.map((img) => img.image_path) || []
                          }
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCircle(circle);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                            title="Edit Circle"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCircle(circle);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                            title="Delete Circle"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                <div className="flex justify-center items-center mb-4 mt-4">
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
                    totalCircles
                  )} of ${totalCircles} Circles`}</span>
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
              </>
            )}
          </div>
        )}
      </motion.div>

      <AddCircleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCircle}
        tenants={tenants}
      />

      <EditCircleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCircle(null);
        }}
        onEdit={handleEditCircle}
        circle={selectedCircle}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCircle(null);
        }}
        onConfirm={handleDeleteCircle}
        title="Delete Circle"
        message={`Are you sure you want to delete circle: ${selectedCircle?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default CirclesManagement;
