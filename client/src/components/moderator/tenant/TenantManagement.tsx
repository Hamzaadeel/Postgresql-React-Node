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
  updateTenant as updateTenantApi,
  deleteTenant as deleteTenantApi,
  getUsers,
} from "../../../services/api";
import { Tenant } from "../../../services/api";
import AddTenantModal from "./AddTenantModal";
import EditTenantModal from "./EditTenantModal";
import ConfirmationModal from "../../common/ConfirmationModal";
import Loader from "../../common/Loader";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  setTenants,
  addTenant as addTenantAction,
  updateTenant as updateTenantAction,
  deleteTenant as deleteTenantAction,
  setLoading,
  setError,
} from "../../../store/slices/tenantSlice";
import { setUsers } from "../../../store/slices/userSlice";
import { motion } from "framer-motion";

const TenantManagement = () => {
  const dispatch = useAppDispatch();
  const {
    tenants,
    loading: tenantsLoading,
    error: tenantsError,
    totalTenants,
  } = useAppSelector((state) => state.tenants);
  const { users } = useAppSelector((state) => state.users);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchTenants(), fetchUsers()]);
    };
    initializeData();
  }, [currentPage, resultsPerPage]);

  const fetchTenants = async () => {
    dispatch(setLoading(true));
    try {
      const data = await getTenants(currentPage, resultsPerPage);
      dispatch(setTenants(data));
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error fetching tenants")
        );
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers(1, 100);
      dispatch(setUsers(data));
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
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  const closeSuccessMessage = () => {
    setSuccessMessage("");
  };

  const handleAddTenant = async (tenantData: { name: string }) => {
    try {
      const newTenant = await createTenant(tenantData);
      dispatch(addTenantAction(newTenant));
      setIsAddModalOpen(false);
      showSuccessMessage("Tenant added successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error adding tenant")
        );
      }
    }
  };

  const handleEditTenant = async (
    tenantId: number,
    tenantData: { name: string }
  ) => {
    try {
      const updatedTenant = await updateTenantApi(tenantId, tenantData);
      dispatch(updateTenantAction(updatedTenant));
      setIsEditModalOpen(false);
      showSuccessMessage("Tenant updated successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error updating tenant")
        );
      }
    }
  };

  const handleDeleteTenant = async () => {
    if (!selectedTenant) return;
    try {
      await deleteTenantApi(selectedTenant.id);
      dispatch(deleteTenantAction(selectedTenant.id));
      setIsDeleteModalOpen(false);
      showSuccessMessage("Tenant deleted successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error deleting tenant")
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

  const totalPages = Math.ceil(totalTenants / resultsPerPage);
  const indexOfLastTenant = currentPage * resultsPerPage;
  const indexOfFirstTenant = indexOfLastTenant - resultsPerPage;
  const currentTenants = tenants.slice(indexOfFirstTenant, indexOfLastTenant);

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
          <h2 className="text-2xl font-bold flex items-center">
            <Building2 className="w-6 h-6 mr-2" />
            Tenant Management
          </h2>
          <button
            title="Add Tenant"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-4 py-2 rounded hover:bg-gradient-to-l hover:from-emerald-600 hover:to-emerald-800"
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

        {tenantsError && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in-out">
            <span>{tenantsError}</span>
          </div>
        )}

        {tenantsLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <div>
            {tenants.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                No tenants found. Add a new tenant to get started.
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
                      <motion.tr
                        key={tenant.id}
                        variants={cardVariants}
                        custom={index}
                      >
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                          {indexOfFirstTenant + index + 1}
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
                          {tenant.employeeCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setIsEditModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Tenant"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setIsDeleteModalOpen(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Tenant"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Pagination Controls */}
            {tenants.length > 0 && (
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
                )} of ${totalTenants} Tenants`}</span>
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
            )}
          </div>
        )}
      </motion.div>

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
