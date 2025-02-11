import { useEffect, useState } from "react";
import { getUsers } from "../../services/api";
import { User } from "../../types/User";
import { Pencil, Trash } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);

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

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Users Management</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b text-left">ID</th>
            <th className="px-6 py-3 border-b text-left">Name</th>
            <th className="px-6 py-3 border-b text-left">Email</th>
            <th className="px-6 py-3 border-b text-left">Role</th>
            <th className="px-6 py-3 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 border">{user.id}</td>
              <td className="px-6 py-4 border">{user.name}</td>
              <td className="px-6 py-4 border">{user.email}</td>
              <td className="px-6 py-4 border">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </td>
              <td className="px-6 py-4 border">
                <button className="p-2 text-blue-500 hover:text-blue-700">
                  <Pencil className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-500 hover:text-red-700">
                  <Trash className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
