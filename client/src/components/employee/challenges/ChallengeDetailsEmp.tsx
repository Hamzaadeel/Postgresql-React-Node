import { X, Swords, User, Calendar } from "lucide-react";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useEffect } from "react";
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

interface ChallengeWithParticipation extends Challenge {
  participationId?: number;
  status?: "Pending" | "Completed";
}

interface ChallengeDetailsEmpProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: ChallengeWithParticipation | null;
}

const ChallengeDetailsEmp = ({
  isOpen,
  onClose,
  challenge,
}: ChallengeDetailsEmpProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !challenge) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} // Fade out on exit
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0, scale: 0.5 }} // Shrink & fade out
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              duration: 0.2,
            }}
            className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <Swords className="w-8 h-8 mr-3 text-blue-600" />
                <motion.h2
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }} // Slide up on exit
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-2xl font-bold"
                >
                  Challenge Details
                </motion.h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Title Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }} // Fade & drop out
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <h3 className="text-xl font-semibold mb-2">
                  {challenge.title}
                </h3>
                <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {challenge.points} Points
                </div>
                {challenge.status && (
                  <div
                    className={`inline-block ml-2 px-3 py-1 rounded-full text-sm ${
                      challenge.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : challenge.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    Status: {challenge.status}
                  </div>
                )}
              </motion.div>

              {/* Description Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Description
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {challenge.description}
                </p>
              </motion.div>

              {/* Circle Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex items-center"
              >
                <FontAwesomeIcon
                  icon={faUsers}
                  className="w-5 h-5 mr-2 text-gray-500"
                />
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">
                    Circle
                  </h4>
                  <p className="text-gray-700">{challenge.circle.name}</p>
                </div>
              </motion.div>

              {/* Creator Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex items-center"
              >
                <User className="w-5 h-5 mr-2 text-gray-500" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">
                    Created By
                  </h4>
                  <p className="text-gray-700">{challenge.creator.name}</p>
                </div>
              </motion.div>

              {/* Creation Date */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex items-center"
              >
                <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">
                    Created On
                  </h4>
                  <p className="text-gray-700">
                    {new Date(challenge.createdAt).toLocaleDateString()} at{" "}
                    {new Date(challenge.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 flex justify-end">
              <motion.button
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} // Fade out on exit
                transition={{ duration: 0.2 }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChallengeDetailsEmp;
