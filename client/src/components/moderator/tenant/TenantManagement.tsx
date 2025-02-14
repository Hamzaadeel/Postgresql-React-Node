import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Trash,
  Building2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getTenants,
  createTenant,
  updateTenant,
  deleteTenant,
  getUsers,
} from "../../../services/api";
import { Tenant } from "../../../services/api";
import AddTenantModal from "./AddTenantModal";
import EditTenantModal from "./EditTenantModal";
import ConfirmationModal from "../../common/ConfirmationModal";
import Loader from "../../common/Loader";
import { User } from "../../../types/User";

const TenantManagement = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [totalTenants, setTotalTenants] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const totalPages = Math.ceil(totalTenants / resultsPerPage);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTenants();
    fetchUsers();
  }, [currentPage, resultsPerPage]);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await getTenants(currentPage, resultsPerPage);
      setTenants(data);
      setTotalTenants(data.length);
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showErrorMessage("Error fetching tenants");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers(1, 100);
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
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

  const handleAddTenant = async (tenantData: { name: string }) => {
    try {
      await createTenant(tenantData);
      await fetchTenants();
      setIsAddModalOpen(false);
      showSuccessMessage("Tenant added successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showErrorMessage(
          error.response?.data?.message || "Error adding tenant"
        );
      }
    }
  };

  const handleEditTenant = async (
    tenantId: number,
    tenantData: { name: string }
  ) => {
    try {
      await updateTenant(tenantId, tenantData);
      await fetchTenants();
      setIsEditModalOpen(false);
      showSuccessMessage("Tenant updated successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showErrorMessage(
          error.response?.data?.message || "Error updating tenant"
        );
      }
    }
  };

  const handleDeleteTenant = async () => {
    if (!selectedTenant) return;
    try {
      await deleteTenant(selectedTenant.id);
      await fetchTenants();
      setIsDeleteModalOpen(false);
      showSuccessMessage("Tenant deleted successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showErrorMessage(
          error.response?.data?.message || "Error deleting tenant"
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

  // Calculate the index of the first tenant to display
  const indexOfLastTenant = currentPage * resultsPerPage;
  const indexOfFirstTenant = indexOfLastTenant - resultsPerPage;
  const currentTenants = tenants.slice(indexOfFirstTenant, indexOfLastTenant);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Building2 className="w-6 h-6 mr-2" />
          Tenant Management
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <Plus className="w-5 h-5" />
          <span>Add Tenant</span>
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
            {currentTenants.map((tenant, index) => {
              const creator = users.find(
                (user) => user.id === tenant.createdBy
              );
              return (
                <tr key={tenant.id}>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2 text-gray-500" />
                      {tenant.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    {creator ? creator.name : "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    {tenant.employeeCount}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Pagination Controls */}
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
        <span className="mr-2">{`Showing ${Math.min(
          resultsPerPage * currentPage,
          totalTenants
        )} of ${totalTenants} tenants`}</span>
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

      <AddTenantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTenant}
      />

      <EditTenantModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTenant(null);
        }}
        onEdit={handleEditTenant}
        tenant={selectedTenant}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTenant(null);
        }}
        onConfirm={handleDeleteTenant}
        title="Delete Tenant"
        message={`Are you sure you want to delete tenant: ${selectedTenant?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default TenantManagement;
