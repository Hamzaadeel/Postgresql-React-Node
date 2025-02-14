import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import {
  getCircles,
  createCircle,
  updateCircle,
  deleteCircle,
  getTenants,
} from "../../../services/api";
import { Circle, Tenant } from "../../../services/api";
import AddCircleModal from "./AddCircleModal";
import EditCircleModal from "./EditCircleModal";
import ConfirmationModal from "../../common/ConfirmationModal";
import Loader from "../../common/Loader";

const CirclesManagement = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCircles();
    fetchTenants();
  }, [currentPage, resultsPerPage]);

  const fetchCircles = async () => {
    setLoading(true);
    try {
      const data = await getCircles();
      setCircles(data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showErrorMessage("Error fetching circles");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const data = await getTenants(1, 100); // Get all tenants
      setTenants(data);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  };

  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage("");
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  const showErrorMessage = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage("");
    setTimeout(() => {
      setErrorMessage("");
    }, 5000);
  };

  const closeSuccessMessage = () => {
    setSuccessMessage("");
  };

  const closeErrorMessage = () => {
    setErrorMessage("");
  };

  const handleAddCircle = async (circleData: {
    name: string;
    tenantId: number;
  }) => {
    try {
      await createCircle(circleData);
      await fetchCircles();
      setIsAddModalOpen(false);
      showSuccessMessage("Circle added successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showErrorMessage(
          error.response?.data?.message || "Error adding circle"
        );
      }
    }
  };

  const handleEditCircle = async (
    circleId: number,
    circleData: { name: string }
  ) => {
    try {
      await updateCircle(circleId, circleData);
      await fetchCircles();
      setIsEditModalOpen(false);
      showSuccessMessage("Circle updated successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showErrorMessage(
          error.response?.data?.message || "Error updating circle"
        );
      }
    }
  };

  const handleDeleteCircle = async () => {
    if (!selectedCircle) return;
    try {
      await deleteCircle(selectedCircle.id);
      await fetchCircles();
      setIsDeleteModalOpen(false);
      showSuccessMessage("Circle deleted successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showErrorMessage(
          error.response?.data?.message || "Error deleting circle"
        );
      }
    }
  };

  // Calculate pagination values
  const totalPages = Math.ceil(circles.length / resultsPerPage);
  const indexOfLastCircle = currentPage * resultsPerPage;
  const indexOfFirstCircle = indexOfLastCircle - resultsPerPage;
  const currentCircles = circles.slice(indexOfFirstCircle, indexOfLastCircle);

  const handleResultsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setResultsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <FontAwesomeIcon icon={faUsers} className="w-6 h-6 mr-2" />
          Circles Management
        </h2>
        <button
          title="Add Circle"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <Plus className="w-5 h-5" />
          <span>Add Circle</span>
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

      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in-out flex justify-between items-center">
          <span>{errorMessage}</span>
          <button onClick={closeErrorMessage} className="ml-2 text-white">
            X
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                No.
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Tenant
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
            {currentCircles.map((circle, index) => (
              <tr key={circle.id}>
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
                  {circle.creator.name}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  {circle.tenant.name}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  {new Date(circle.createdAt).toLocaleDateString()}
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
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add pagination controls */}
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
          circles.length
        )} of ${circles.length} circles`}</span>
        <div className="flex items-center ml-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
