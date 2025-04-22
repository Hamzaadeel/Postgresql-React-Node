import { useState, useEffect } from "react";
import {
  X,
  Swords,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "framer-motion";
import { getChallengeImageUrls } from "../../../services/api";

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
  images?: {
    id: number;
    image_path: string;
  }[];
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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && challenge?.images && challenge.images.length > 0) {
      const fetchImageUrls = async () => {
        try {
          setIsLoading(true);
          const imagePaths =
            challenge?.images?.map((img) => img.image_path) || [];
          const urls = await getChallengeImageUrls(imagePaths);
          setImageUrls(urls);
        } catch (error) {
          console.error("Error fetching challenge image URLs:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchImageUrls();
    } else {
      setImageUrls([]);
    }
  }, [isOpen, challenge]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imageUrls.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  if (!isOpen || !challenge) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
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
            className="bg-white dark:bg-gray-800 rounded-lg max-h-[90vh] overflow-y-auto p-6 w-full max-w-3xl shadow-lg m-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Swords className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold dark:text-gray-100">
                  Challenge Details
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image Carousel */}
            {(isLoading || imageUrls.length > 0) && (
              <div className="mb-6 relative h-64 md:h-80 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                  </div>
                ) : (
                  <>
                    <img
                      src={imageUrls[currentImageIndex]}
                      alt={`Challenge ${challenge.title}`}
                      className="w-full h-full object-contain"
                    />

                    {imageUrls.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
                        >
                          <ChevronRight size={24} />
                        </button>

                        {/* Image pagination dots */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                          {imageUrls.map((_, index) => (
                            <div
                              key={index}
                              className={`w-3 h-3 rounded-full ${
                                index === currentImageIndex
                                  ? "bg-white"
                                  : "bg-gray-400 bg-opacity-50"
                              } cursor-pointer`}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

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
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
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

export default ChallengeDetailsView;
