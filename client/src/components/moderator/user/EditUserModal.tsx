import { useState, useEffect } from "react";
import { User } from "../../../types/User";
import { Tenant } from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (userId: number, userData: Partial<User>) => Promise<void>;
  user: User | null;
  tenants: Tenant[];
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  user,
  tenants,
}) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "employee",
    tenantId: null,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await onEdit(user.id, formData);
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              duration: 0.2,
            }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
              Edit User
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 border rounded text-sm "
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-2 border rounded text-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm dark:text-gray-300">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="employee">Employee</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 text-sm dark:text-gray-300">
                  Tenant
                </label>
                <select
                  value={formData.tenantId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tenantId: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="">None</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded dark:bg-gray-100 dark:hover:bg-gray-300  hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded hover:bg-gradient-to-l hover:from-emerald-600 hover:to-emerald-800"
                >
                  Update User
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditUserModal;
