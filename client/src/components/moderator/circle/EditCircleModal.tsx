import { useState, useEffect } from "react";
import { Circle } from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
interface EditCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (circleId: number, circleData: { name: string }) => Promise<void>;
  circle: Circle | null;
}

const EditCircleModal: React.FC<EditCircleModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  circle,
}) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (circle) {
      setName(circle.name);
    }
  }, [circle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circle) return;

    try {
      await onEdit(circle.id, { name });
      onClose();
    } catch (error) {
      console.error("Error updating circle:", error);
    }
  };

  if (!isOpen || !circle) return null;

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
            className="bg-white rounded-lg p-6 w-96 shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">Edit Circle</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">
                  Tenant
                </label>
                <input
                  type="text"
                  value={circle.tenant.name}
                  className="w-full p-2 border rounded bg-gray-100 text-sm"
                  disabled
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded hover:bg-gradient-to-l hover:from-emerald-600 hover:to-emerald-800"
                >
                  Update Circle
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditCircleModal;
