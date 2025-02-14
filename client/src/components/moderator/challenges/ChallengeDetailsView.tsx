import { X, Swords, Circle, User, Calendar } from "lucide-react";

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

interface ChallengeDetailsViewProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge | null;
}

const ChallengeDetailsView = ({
  isOpen,
  onClose,
  challenge,
}: ChallengeDetailsViewProps) => {
  if (!isOpen || !challenge) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
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
            <Circle className="w-5 h-5 mr-2 text-gray-500" />
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

export default ChallengeDetailsView;
