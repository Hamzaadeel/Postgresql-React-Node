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
            className="bg-white dark:bg-gray-800 rounded-lg max-h-[512px] overflow-y-auto p-6 w-1/2 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <Swords className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold dark:text-gray-100">
                Challenge Details
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300 top-0 right-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Title Section */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">
                  {challenge.title}
                </h3>
                <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {challenge.points} Points
                </div>
              </div>

              {/* Description Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-100 uppercase mb-2">
                  Description
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap dark:text-gray-300 text-sm">
                  {challenge.description}
                </p>
              </div>

              {/* Circle Information */}
              <div className="flex items-center ">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-100"
                />
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-100">
                    Circle
                  </h4>
                  <p className="text-gray-700 text-sm dark:text-gray-300">
                    {challenge.circle.name}
                  </p>
                </div>
              </div>

              {/* Creator Information */}
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-100" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-100">
                    Created By
                  </h4>
                  <p className="text-gray-700 text-sm dark:text-gray-300">
                    {challenge.creator.name}
                  </p>
                </div>
              </div>

              {/* Creation Date */}
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-100" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-100">
                    Created On
                  </h4>
                  <p className="text-gray-700 text-sm dark:text-gray-300">
                    {new Date(challenge.createdAt).toLocaleDateString()} at{" "}
                    {new Date(challenge.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChallengeDetailsEmp;
