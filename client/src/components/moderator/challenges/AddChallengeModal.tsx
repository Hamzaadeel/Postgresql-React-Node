import { useState } from "react";
import { Circle } from "../../../services/api";

interface AddChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (challengeData: {
    title: string;
    description: string;
    circleIds: number[];
    points: number;
  }) => Promise<void>;
  circles: Circle[];
}

const AddChallengeModal = ({
  isOpen,
  onClose,
  onAdd,
  circles,
}: AddChallengeModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCircleIds, setSelectedCircleIds] = useState<number[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [showCirclesDropdown, setShowCirclesDropdown] = useState(false);

  const handleCircleToggle = (circleId: number) => {
    setSelectedCircleIds((prev) =>
      prev.includes(circleId)
        ? prev.filter((id) => id !== circleId)
        : [...prev, circleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCircleIds.length === 0) {
      alert("Please select at least one circle");
      return;
    }
    try {
      await onAdd({
        title,
        description,
        circleIds: selectedCircleIds,
        points,
      });
      // Reset form
      setTitle("");
      setDescription("");
      setSelectedCircleIds([]);
      setPoints(0);
    } catch (error) {
      console.error("Error adding challenge:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center overflow-y-auto max-h-screen justify-center z-50 h-full">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Add Challenge</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Circles</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCirclesDropdown((prev) => !prev)}
                className="w-full p-2 border rounded bg-white text-left flex justify-between items-center"
              >
                <span>
                  {selectedCircleIds.length > 0
                    ? selectedCircleIds
                        .map((id) => circles.find((c) => c.id === id)?.name)
                        .join(", ")
                    : "--Select Circle--"}
                </span>
                <span className="ml-2">&#9662;</span> {/* Down arrow */}
              </button>
              {showCirclesDropdown && (
                <div className="absolute z-10 bg-white border rounded shadow-lg mt-1 w-full max-h-40 overflow-y-auto">
                  {circles.map((circle) => (
                    <div key={circle.id} className="flex items-center p-2">
                      <input
                        type="checkbox"
                        id={`circle-${circle.id}`}
                        checked={selectedCircleIds.includes(circle.id)}
                        onChange={() => handleCircleToggle(circle.id)}
                        className="mr-2"
                      />
                      <label htmlFor={`circle-${circle.id}`}>
                        {circle.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Points</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min={0}
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Challenge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChallengeModal;
