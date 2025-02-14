import { useEffect, useState } from "react";
import { getUsers } from "../../../services/api";
import { User } from "../../../types/User";
import {
  Pencil,
  Trash,
  UserPlus,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import ConfirmationModal from "../../common/ConfirmationModal";
import Loader from "../../common/Loader";
import {
  signUp,
  updateUser,
  deleteUser,
  getTenants,
} from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { Tenant } from "../../../services/api";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchTenants();
  }, [currentPage, resultsPerPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(currentPage, resultsPerPage);
      setUsers(data);
      setTotalUsers(data.length);
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showErrorMessage("Error fetching users");
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

  const handleAddUser = async (userData: any) => {
    try {
      await signUp(userData);
      await fetchUsers();
      showSuccessMessage("User added successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showErrorMessage(error.response?.data?.message || "Error adding user");
      }
    }
  };

  const handleEditUser = async (userId: number, userData: Partial<User>) => {
    try {
      await updateUser(userId, userData);
      await fetchUsers();
      showSuccessMessage("User updated successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showErrorMessage(
          error.response?.data?.message || "Error updating user"
        );
      }
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id);
      await fetchUsers();
      showSuccessMessage("User deleted successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        showErrorMessage(
          error.response?.data?.message || "Error deleting user"
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

  const totalPages = Math.ceil(totalUsers / resultsPerPage);

  // Calculate the index of the first user to display
  const indexOfLastUser = currentPage * resultsPerPage;
  const indexOfFirstUser = indexOfLastUser - resultsPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser); // Slice the users array

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Users className="w-6 h-6 mr-2" />
          Users Management
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {loading && <Loader />}

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
              Email
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Tenant
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user, index) => {
            const userTenant = tenants.find((t) => t.id === user.tenantId);
            return (
              <tr key={user.id}>
                <td className="px-6 py-4 border-b">
                  {index + 1 + indexOfFirstUser}
                </td>
                <td className="px-6 py-4 border-b">{user.name}</td>
                <td className="px-6 py-4 border-b">{user.email}</td>
                <td className="px-6 py-4 border-b">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </td>
                <td className="px-6 py-4 border-b">
                  {userTenant ? userTenant.name : "None"}
                </td>
                <td className="px-6 py-4 border-b">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setIsEditModalOpen(true);
                    }}
                    className="p-2 text-blue-500 hover:text-blue-700"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
          totalUsers
        )} of ${totalUsers} users`}</span>
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

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddUser}
        tenants={tenants}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onEdit={handleEditUser}
        user={selectedUser}
        tenants={tenants}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete User: ${selectedUser?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default UserManagement;
