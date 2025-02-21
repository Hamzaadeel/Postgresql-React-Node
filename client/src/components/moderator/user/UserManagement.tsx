import { useEffect, useState } from "react";
import { getUsers } from "../../../services/api";
import { User } from "../../../types/User";
import {
  Pencil,
  Trash,
  UserPlus,
  Users,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import ConfirmationModal from "../../common/ConfirmationModal";
import Loader from "../../common/Loader";
import {
  signUp,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  getTenants,
} from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  setUsers,
  addUser,
  updateUser,
  deleteUser,
  setLoading,
  setError,
} from "../../../store/slices/userSlice";
import { setTenants } from "../../../store/slices/tenantSlice";

const UserManagement = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error, totalUsers } = useAppSelector(
    (state) => state.users
  );
  const { tenants } = useAppSelector((state) => state.tenants);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchUsers(), fetchTenants()]);
    };
    initializeData();
  }, [currentPage, resultsPerPage]);

  const fetchUsers = async () => {
    dispatch(setLoading(true));
    try {
      const data = await getUsers(currentPage, resultsPerPage);
      dispatch(setUsers(data));
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error fetching users")
        );
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

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  const closeSuccessMessage = () => {
    setSuccessMessage("");
  };

  const handleAddUser = async (userData: any) => {
    try {
      const newUser = (await signUp(userData)) as User;
      dispatch(addUser(newUser));
      setIsAddModalOpen(false);
      showSuccessMessage("User added successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error adding user")
        );
      }
    }
  };

  const handleEditUser = async (userId: number, userData: Partial<User>) => {
    try {
      const updatedUser = await updateUserApi(userId, userData);
      dispatch(updateUser(updatedUser));
      setIsEditModalOpen(false);
      showSuccessMessage("User updated successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error updating user")
        );
      }
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await deleteUserApi(selectedUser.id);
      dispatch(deleteUser(selectedUser.id));
      setIsDeleteModalOpen(false);
      showSuccessMessage("User deleted successfully!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        dispatch(
          setError(error.response?.data?.message || "Error deleting user")
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
  const indexOfLastUser = currentPage * resultsPerPage;
  const indexOfFirstUser = indexOfLastUser - resultsPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Users className="w-6 h-6 mr-2" />
          Users Management
        </h2>
        <button
          title="Add User"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add User</span>
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <div>
          {users.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              No users found. Add a new user to get started.
            </div>
          ) : (
            <>
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
                    const userTenant = tenants.find(
                      (t) => t.id === user.tenantId
                    );
                    return (
                      <tr key={user.id}>
                        <td className="px-6 py-4 border-b">
                          {index + 1 + indexOfFirstUser}
                        </td>
                        <td className="px-6 py-4 border-b">
                          <UserIcon className="w-5 h-5 inline-block mr-2" />
                          {user.name}
                        </td>
                        <td className="px-6 py-4 border-b">{user.email}</td>
                        <td className="px-6 py-4 border-b">
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
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
                            title="Edit User"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete User"
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
                )} of ${totalUsers} Users`}</span>
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
