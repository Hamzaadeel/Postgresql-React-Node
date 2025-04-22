import { useEffect, useState, useRef } from "react";
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
  ChevronDown,
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
import { motion } from "framer-motion";

const UserManagement = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error, totalUsers } = useAppSelector(
    (state) => state.users
  );
  const { tenants } = useAppSelector((state) => state.tenants);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const navigate = useNavigate();

  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const tenantDropdownRef = useRef<HTMLDivElement>(null);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRoleDropdownOpen(false);
      }
      if (
        tenantDropdownRef.current &&
        !tenantDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTenantDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchUsers(), fetchTenants()]);
    };
    initializeData();
  }, [
    currentPage,
    resultsPerPage,
    searchQuery,
    selectedRoles,
    selectedTenants,
  ]);

  const fetchUsers = async () => {
    dispatch(setLoading(true));
    try {
      const data = await getUsers(
        currentPage,
        resultsPerPage,
        searchQuery,
        selectedRoles.length > 0
          ? selectedRoles.map((role) => role.toLowerCase())
          : undefined,
        selectedTenants.length > 0 ? selectedTenants : undefined
      );
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
      <motion.div
        initial="hidden"
        animate="visible"
        variants={dashboardVariants}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center dark:text-gray-100">
            <Users className="w-6 h-6 mr-2" />
            Users Management
          </h2>
          <button
            title="Add User"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-4 py-2 rounded hover:bg-gradient-to-l hover:from-emerald-600 hover:to-emerald-800"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add User</span>
          </button>
        </div>

        {/* Search, Sort, and Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-between items-center">
              {/* Role Filter Dropdown */}
              <div
                className="relative mr-2 bg-white rounded-xl"
                ref={roleDropdownRef}
              >
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center justify-between min-w-[150px]"
                >
                  <span>
                    {selectedRoles.length === 0
                      ? "All Roles"
                      : `${selectedRoles.length} Role${
                          selectedRoles.length > 1 ? "s" : ""
                        } Selected`}
                  </span>
                  <ChevronDown
                    className="h-4 w-4 transition-transform duration-200"
                    style={{
                      transform: isRoleDropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                </button>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{
                    opacity: isRoleDropdownOpen ? 1 : 0,
                    y: isRoleDropdownOpen ? 0 : -10,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`absolute z-10 mt-2 w-48 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-lg border ${
                    isRoleDropdownOpen ? "block" : "hidden"
                  }`}
                >
                  <div className="p-2">
                    {/* Select All Checkbox for Roles */}
                    <label className="flex items-center p-2 dark:hover:text-gray-800 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedRoles.length === 2}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoles(["employee", "moderator"]);
                          } else {
                            setSelectedRoles([]);
                          }
                        }}
                        className="mr-2 "
                      />
                      Select All
                    </label>
                    <label className="flex items-center p-2 dark:hover:text-gray-800 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes("employee")}
                        onChange={(e) => {
                          setSelectedRoles(
                            e.target.checked
                              ? [...selectedRoles, "employee"]
                              : selectedRoles.filter((r) => r !== "employee")
                          );
                        }}
                        className="mr-2"
                      />
                      Employee
                    </label>
                    <label className="flex items-center p-2 dark:hover:text-gray-800 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes("moderator")}
                        onChange={(e) => {
                          setSelectedRoles(
                            e.target.checked
                              ? [...selectedRoles, "moderator"]
                              : selectedRoles.filter((r) => r !== "moderator")
                          );
                        }}
                        className="mr-2"
                      />
                      Moderator
                    </label>
                  </div>
                </motion.div>
              </div>

              {/* Tenant Filter Dropdown */}
              <div
                className="relative bg-white rounded-xl"
                ref={tenantDropdownRef}
              >
                <button
                  onClick={() => setIsTenantDropdownOpen(!isTenantDropdownOpen)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center justify-between min-w-[150px]"
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
                  className={`absolute z-10 mt-2 w-auto bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-lg border max-h-60 overflow-y-auto ${
                    isTenantDropdownOpen ? "block" : "hidden"
                  }`}
                >
                  <div className="p-2">
                    {/* Select All Checkbox for Tenants */}
                    <label className="flex items-center p-2 dark:hover:text-gray-800 rounded hover:bg-gray-50">
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
                <table className="min-w-full  bg-white">
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
                        <motion.tr
                          key={user.id}
                          variants={cardVariants}
                          custom={index}
                        >
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
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>

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
