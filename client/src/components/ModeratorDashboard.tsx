import { useEffect, useState } from "react";
import { getUsers } from "../services/api";
import { User } from "../types/User";
import { useNavigate } from "react-router-dom";

const ModeratorDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Users List</h2>
      <button
        onClick={handleLogout}
        className="mb-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b">ID</th>
            <th className="px-6 py-3 border-b">Name</th>
            <th className="px-6 py-3 border-b">Email</th>
            <th className="px-6 py-3 border-b">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 border-b">{user.id}</td>
              <td className="px-6 py-4 border-b">{user.name}</td>
              <td className="px-6 py-4 border-b">{user.email}</td>
              <td className="px-6 py-4 border-b">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ModeratorDashboard;
