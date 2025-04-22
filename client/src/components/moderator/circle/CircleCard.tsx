import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { getCircleImageUrls } from "../../../services/api";

interface CircleCardProps {
  images?: string[];
  title: string;
  createdBy: string;
  totalEmployees: number;
  tenantName: string;
}

export function CircleCard({
  images = [],
  title,
  createdBy,
  totalEmployees,
  tenantName,
}: CircleCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Fetch signed URLs for the images
  useEffect(() => {
    const fetchImageUrls = async () => {
      if (images.length === 0) return;

      setIsLoadingImages(true);
      try {
        const urls = await getCircleImageUrls(images);
        setImageUrls(urls);
      } catch (error) {
        console.error("Error fetching circle image URLs:", error);
      } finally {
        setIsLoadingImages(false);
      }
    };

    fetchImageUrls();
  }, [images]);

  // Rotate through images
  useEffect(() => {
    if (imageUrls.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [imageUrls.length]);

  return (
    <div className="bg-white rounded-lg shadow-lg border overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-[200px] w-full overflow-hidden bg-gray-100">
        {isLoadingImages ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="animate-pulse">Loading images...</div>
          </div>
        ) : imageUrls.length > 0 ? (
          <>
            {imageUrls.map((url, index) => (
              <img
                key={url}
                src={url}
                alt={`${title} ${index + 1}`}
                loading="lazy"
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {imageUrls.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    index === currentImageIndex ? "bg-gray-800" : "bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No images available
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-2">Created by {createdBy}</p>
        <p className="text-sm text-gray-600 mb-3">Tenant: {tenantName}</p>

        <div className="flex items-center text-gray-700">
          <Users size={18} className="mr-2" />
          <span className="text-sm">{totalEmployees} members</span>
        </div>
      </div>
    </div>
  );
}

export default CircleCard;
