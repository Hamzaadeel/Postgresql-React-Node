import { useState, useEffect } from "react";
import { Circle } from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
interface Challenge {
  id: number;
  title: string;
  description: string;
  circleId: number;
  points: number;
  createdBy: number;
  createdAt: string;
  circle: {
    id: number;
    name: string;
  };
  creator: {
    id: number;
    name: string;
  };
}

interface EditChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (
    challengeId: number,
    challengeData: {
      title: string;
      description: string;
      circleIds: number[];
      points: number;
    }
  ) => Promise<void>;
  challenge: Challenge | null;
  circles: Circle[];
}

const EditChallengeModal = ({
  isOpen,
  onClose,
  onEdit,
  challenge,
  circles,
}: EditChallengeModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCircleIds, setSelectedCircleIds] = useState<number[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [showCirclesDropdown, setShowCirclesDropdown] = useState(false);

  useEffect(() => {
    if (challenge) {
      setTitle(challenge.title);
      setDescription(challenge.description);
      setSelectedCircleIds([challenge.circleId]);
      setPoints(challenge.points);
    }
  }, [challenge]);

  const handleCircleToggle = (circleId: number) => {
    setSelectedCircleIds((prev) =>
      prev.includes(circleId)
        ? prev.filter((id) => id !== circleId)
        : [...prev, circleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    if (selectedCircleIds.length === 0) {
      alert("Please select at least one circle");
      return;
    }

    try {
      await onEdit(challenge.id, {
        title,
        description,
        circleIds: selectedCircleIds,
        points,
      });
    } catch (error) {
      console.error("Error updating challenge:", error);
    }
  };

  if (!isOpen || !challenge) return null;

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
            <h2 className="text-xl font-bold mb-4">Edit Challenge</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  rows={4}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm">
                  Circles
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCirclesDropdown((prev) => !prev)}
                    className="w-full p-2 border rounded text-sm bg-white text-left flex justify-between items-center"
                  >
                    <span>
                      {selectedCircleIds.length > 0
                        ? selectedCircleIds
                            .map((id) => circles.find((c) => c.id === id)?.name)
                            .join(", ")
                        : "-- Select Circles --"}
                    </span>
                    <span className="ml-2">&#9662;</span> {/* Down arrow */}
                  </button>
                  {showCirclesDropdown && (
                    <div className="absolute z-10 bg-white border rounded text-sm shadow-lg mt-1 w-full max-h-40 overflow-y-auto">
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
                <label className="block text-gray-700 mb-2 text-sm">
                  Points
                </label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-full p-2 border rounded text-sm"
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
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded hover:bg-gradient-to-l hover:from-emerald-600 hover:to-emerald-800"
                >
                  Update Challenge
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditChallengeModal;
