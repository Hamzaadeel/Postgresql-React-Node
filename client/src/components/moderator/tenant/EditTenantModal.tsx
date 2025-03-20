import { useState, useEffect } from "react";
import { Tenant } from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
interface EditTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (tenantId: number, tenantData: { name: string }) => Promise<void>;
  tenant: Tenant | null;
}

const EditTenantModal: React.FC<EditTenantModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  tenant,
}) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (tenant) {
      setName(tenant.name);
    }
  }, [tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;

    try {
      await onEdit(tenant.id, { name });
      onClose();
    } catch (error) {
      console.error("Error updating tenant:", error);
    }
  };

  if (!isOpen || !tenant) return null;

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
            {" "}
            <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
              Edit Tenant
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded dark:bg-gray-100 dark:hover:bg-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded hover:bg-gradient-to-l hover:from-emerald-600 hover:to-emerald-800"
                >
                  Update Tenant
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditTenantModal;
