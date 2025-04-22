import React, { useState, useEffect } from "react";
import { Eye, Pencil, Trash, Swords, Award } from "lucide-react";
import { getChallengeImageUrls } from "../../../services/api";
import { motion } from "framer-motion";

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
  participantCount?: number;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onView: (challenge: Challenge) => void;
  onEdit: (challenge: Challenge) => void;
  onDelete: (challenge: Challenge) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onView,
  onEdit,
  onDelete,
}) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImageUrls = async () => {
      if (challenge.images && challenge.images.length > 0) {
        try {
          setIsLoading(true);
          const imagePaths = challenge.images.map((img) => img.image_path);
          const urls = await getChallengeImageUrls(imagePaths);
          setImageUrls(urls);
        } catch (error) {
          console.error("Error fetching challenge image URLs:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchImageUrls();
  }, [challenge]);

  // Change image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5000 milliseconds = 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [imageUrls.length]);

  // Truncate description for card view
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image Carousel */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : imageUrls.length > 0 ? (
          <>
            <motion.img
              key={imageUrls[currentImageIndex]}
              src={imageUrls[currentImageIndex]}
              alt={`Challenge ${challenge.title}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <Swords className="w-12 h-12 opacity-30" />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">
            {challenge.title}
          </h3>
          <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded-full text-xs flex items-center">
            <Award className="w-3 h-3 mr-1" />
            {challenge.points} pts
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
          {truncateDescription(challenge.description)}
        </p>

        <div className="mt-auto">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span className="font-semibold">Circle:</span>{" "}
            {challenge.circle.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span className="font-semibold">Created by:</span>{" "}
            {challenge.creator.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            <span className="font-semibold">Participants:</span>{" "}
            {challenge.participantCount || 0}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => onView(challenge)}
              className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(challenge)}
              className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              title="Edit Challenge"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(challenge)}
              className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              title="Delete Challenge"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChallengeCard;
