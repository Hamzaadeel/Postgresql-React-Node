import { useState } from "react";
import { Tenant } from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
interface AddCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (circleData: { name: string; tenantId: number }) => Promise<void>;
  tenants: Tenant[];
}

const AddCircleModal: React.FC<AddCircleModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  tenants,
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    tenantId: number | "";
  }>({
    name: "",
    tenantId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.tenantId === "") {
      return; // Handle validation error
    }
    try {
      await onAdd({
        name: formData.name,
        tenantId: formData.tenantId as number,
      });
      onClose();
      // Reset form
      setFormData({
        name: "",
        tenantId: "",
      });
    } catch (error) {
      console.error("Error adding circle:", error);
    }
  };

  if (!isOpen) return null;

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
              Add New Circle
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
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 text-sm dark:text-gray-300 ">
                  Tenant
                </label>
                <select
                  value={formData.tenantId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tenantId: e.target.value ? Number(e.target.value) : "",
                    })
                  }
                  className="w-full p-2 border rounded text-sm overflow-y-auto"
                  required
                >
                  <option value="">Select a tenant</option>
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
                  className="px-4 py-2 border rounded hover:bg-gray-100 dark:bg-gray-100 dark:hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded hover:bg-gradient-to-l hover:from-emerald-600 hover:to-emerald-800"
                >
                  Add Circle
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddCircleModal;
