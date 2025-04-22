import React, { useState, useEffect } from "react";
import { Eye, UserPlus, Upload, Swords, CircleDollarSign } from "lucide-react";
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
  participationId?: number;
  status?: "Pending" | "Completed";
}

interface ChallengeCardEmpProps {
  challenge: Challenge;
  onView: (challenge: Challenge) => void;
  onJoin?: (challengeId: number) => void;
  onSubmit?: (challenge: Challenge) => void;
}

const ChallengeCardEmp: React.FC<ChallengeCardEmpProps> = ({
  challenge,
  onView,
  onJoin,
  onSubmit,
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
          console.log("Image paths to fetch:", imagePaths);

          // Make sure paths are properly formatted
          const formattedPaths = imagePaths.map((path) => {
            return path.startsWith("challenge/") ? path : `challenge/${path}`;
          });
          console.log("Formatted image paths:", formattedPaths);

          const urls = await getChallengeImageUrls(formattedPaths);
          console.log("Fetched image URLs:", urls);
          setImageUrls(urls);
        } catch (error) {
          console.error("Error fetching challenge image URLs:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log("No images available for this challenge");
        setIsLoading(false);
      }
    };

    fetchImageUrls();
  }, [challenge]);

  // Change image every 5 seconds
  useEffect(() => {
    if (imageUrls.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [imageUrls.length]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger if the event is directly on the card or one of the allowed elements
    // This prevents triggering when clicking on action buttons
    if (
      e.currentTarget === e.target ||
      !(e.target as Element).closest('button[data-action="true"]')
    ) {
      onView(challenge);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full cursor-pointer"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
    >
      {/* Image Carousel */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
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
          <div className="flex items-center justify-center h-full text-gray-400 ">
            <Swords className="w-12 h-12 opacity-30" />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800  line-clamp-1">
            {challenge.title}
          </h3>
          <div className="flex items-center gap-2">
            {challenge.status && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  challenge.status === "Completed"
                    ? "bg-green-100 text-green-800  "
                    : "bg-yellow-100 text-yellow-800  "
                }`}
              >
                {challenge.status}
              </span>
            )}
            <div className="bg-emerald-100 text-emerald-800   px-2 py-0.5 rounded-full text-xs flex items-center">
              <CircleDollarSign className="w-3 h-3 mr-1" />
              {challenge.points} pts
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500  mb-3 line-clamp-2">
          {challenge.description}
        </p>

        <div className="mt-auto">
          <div className="text-xs text-gray-500  mb-1">
            <span className="font-semibold">Circle:</span>{" "}
            {challenge.circle.name}
          </div>
          <div className="text-xs text-gray-500  mb-3">
            <span className="font-semibold">Created by:</span>{" "}
            {challenge.creator.name}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-2">
            <button
              data-action="true"
              onClick={(e) => {
                e.stopPropagation();
                onView(challenge);
              }}
              className="p-1.5 text-gray-600 hover:text-gray-900  "
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>

            {!challenge.participationId && onJoin && (
              <button
                data-action="true"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin(challenge.id);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-800 text-white rounded hover:bg-gradient-to-l hover:from-cyan-600 hover:to-cyan-800 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Join</span>
              </button>
            )}

            {challenge.participationId &&
              challenge.status !== "Completed" &&
              onSubmit && (
                <button
                  data-action="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubmit(challenge);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-800 text-white rounded hover:bg-gradient-to-l hover:from-cyan-600 hover:to-cyan-800 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Submit</span>
                </button>
              )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChallengeCardEmp;
