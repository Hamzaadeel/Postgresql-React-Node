import { useState, useEffect } from "react";
import { Tenant } from "../../../services/api";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Edit Tenant</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
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
              className="px-4 py-2 border rounded hover:bg-gray-100"
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
      </div>
    </div>
  );
};

export default EditTenantModal;
