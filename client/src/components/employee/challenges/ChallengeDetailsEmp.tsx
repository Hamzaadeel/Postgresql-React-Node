import { X, Swords, User, Calendar } from "lucide-react";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useEffect } from "react";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <Swords className="w-8 h-8 mr-3 text-blue-600" />
            <h2 className="text-2xl font-bold">Challenge Details</h2>
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
          <div>
            <h3 className="text-xl font-semibold mb-2">{challenge.title}</h3>
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
          </div>

          {/* Description Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Description
            </h4>
            <p className="text-gray-700 whitespace-pre-wrap">
              {challenge.description}
            </p>
          </div>

          {/* Circle Information */}
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faUsers}
              className="w-5 h-5 mr-2 text-gray-500"
            />
            <div>
              <h4 className="text-sm font-semibold text-gray-500">Circle</h4>
              <p className="text-gray-700">{challenge.circle.name}</p>
            </div>
          </div>

          {/* Creator Information */}
          <div className="flex items-center">
            <User className="w-5 h-5 mr-2 text-gray-500" />
            <div>
              <h4 className="text-sm font-semibold text-gray-500">
                Created By
              </h4>
              <p className="text-gray-700">{challenge.creator.name}</p>
            </div>
          </div>

          {/* Creation Date */}
          <div className="flex items-center">
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
      </div>
    </div>
  );
};

export default ChallengeDetailsEmp;
