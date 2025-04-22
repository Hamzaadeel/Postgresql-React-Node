import { useState, useEffect } from "react";
import {
  Circle,
  uploadChallengeImages,
  getChallengeImageUrls,
} from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Award } from "lucide-react";
import { toast } from "react-toastify";

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
      addImagePaths?: string[];
      removeImageIds?: number[];
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImagePreviews, setUploadedImagePreviews] = useState<string[]>(
    []
  );
  const [existingImages, setExistingImages] = useState<
    { id: number; path: string; url: string }[]
  >([]);
  const [imagesToRemove, setImagesToRemove] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setUploadedImagePreviews([]);
      setImagesToRemove([]);
      setExistingImages([]);
    }
  }, [isOpen]);

  // Fetch challenge data when modal opens or challenge changes
  useEffect(() => {
    if (challenge && isOpen) {
      setTitle(challenge.title);
      setDescription(challenge.description);
      setSelectedCircleIds([challenge.circleId]);
      setPoints(challenge.points);
      fetchChallengeImages();
    }
  }, [challenge, isOpen]);

  const fetchChallengeImages = async () => {
    if (!challenge) return;

    setIsLoadingImages(true);
    try {
      console.log("Fetching challenge images for challenge:", challenge);
      // Only proceed if the challenge has images
      if (challenge.images && challenge.images.length > 0) {
        console.log("Challenge has images:", challenge.images);
        // Extract image paths from challenge.images
        const imagePaths = challenge.images.map((img) => img.image_path);
        console.log("Image paths extracted:", imagePaths);

        // Get signed URLs for the images
        const imageUrls = await getChallengeImageUrls(imagePaths);
        console.log("Received signed URLs:", imageUrls);

        // Map the images with their IDs, paths, and URLs
        const mappedImages = challenge.images.map((img, index) => ({
          id: img.id,
          path: img.image_path,
          url: imageUrls[index] || "",
        }));
        console.log("Mapped images with URLs:", mappedImages);

        setExistingImages(mappedImages.filter((img) => img.url)); // Only keep images with valid URLs
      } else {
        console.log("Challenge has no images");
        // Reset existing images if the challenge has no images
        setExistingImages([]);
      }
    } catch (error) {
      console.error("Error fetching challenge images:", error);
      toast.error("Failed to load challenge images");
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleCircleToggle = (circleId: number) => {
    setSelectedCircleIds((prev) =>
      prev.includes(circleId)
        ? prev.filter((id) => id !== circleId)
        : [...prev, circleId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Create object URLs for the new files for preview
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      setSelectedFiles((prev) => [...prev, ...newFiles]);
      setUploadedImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveSelectedFile = (index: number) => {
    // Remove the file from selectedFiles
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(uploadedImagePreviews[index]);

    // Remove the preview
    setUploadedImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (id: number) => {
    setImagesToRemove((prev) => [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge) return;

    if (selectedCircleIds.length === 0) {
      alert("Please select at least one circle");
      return;
    }

    try {
      setIsUploading(true);

      // Upload the selected files to S3
      let addImagePaths: string[] = [];

      if (selectedFiles.length > 0) {
        addImagePaths = await uploadChallengeImages(selectedFiles);
      }

      // Update the challenge with the new data and image paths
      await onEdit(challenge.id, {
        title,
        description,
        circleIds: selectedCircleIds,
        points,
        addImagePaths: addImagePaths.length > 0 ? addImagePaths : undefined,
        removeImageIds: imagesToRemove.length > 0 ? imagesToRemove : undefined,
      });

      // Clean up the object URLs
      uploadedImagePreviews.forEach((url) => URL.revokeObjectURL(url));

      // Reset the state
      setSelectedFiles([]);
      setUploadedImagePreviews([]);
      setImagesToRemove([]);

      onClose();
    } catch (error) {
      console.error("Error updating challenge:", error);
      toast.error("Failed to update challenge");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen || !challenge) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-4"
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
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl h-auto max-h-[80vh] overflow-y-auto shadow-lg m-4 relative"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>

            <h2 className="text-xl font-bold mb-4 dark:text-gray-100 flex items-center pr-8">
              <Award className="h-5 w-5 mr-2 text-emerald-500" />
              Edit Challenge
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm dark:text-gray-300">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  rows={4}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm dark:text-gray-300">
                  Circles
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCirclesDropdown((prev) => !prev)}
                    className="w-full p-2 border rounded text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-left flex justify-between items-center"
                  >
                    <span>
                      {selectedCircleIds.length > 0
                        ? selectedCircleIds
                            .map((id) => circles.find((c) => c.id === id)?.name)
                            .join(", ")
                        : "-- Select Circles --"}
                    </span>
                    <span className="ml-2">&#9662;</span>
                  </button>
                  {showCirclesDropdown && (
                    <div className="absolute z-10 bg-white dark:bg-gray-700 border rounded text-sm shadow-lg mt-1 w-full max-h-40 overflow-y-auto">
                      {circles.map((circle) => (
                        <div
                          key={circle.id}
                          className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <input
                            type="checkbox"
                            id={`circle-${circle.id}`}
                            checked={selectedCircleIds.includes(circle.id)}
                            onChange={() => handleCircleToggle(circle.id)}
                            className="mr-2"
                          />
                          <label
                            htmlFor={`circle-${circle.id}`}
                            className="dark:text-gray-200"
                          >
                            {circle.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm dark:text-gray-300">
                  Points
                </label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  min={0}
                  required
                />
              </div>

              {/* Existing Images */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm dark:text-gray-300">
                  Existing Images
                </label>
                {isLoadingImages ? (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Loading images...
                  </div>
                ) : existingImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {existingImages.map(
                      (image) =>
                        !imagesToRemove.includes(image.id) && (
                          <div
                            key={image.id}
                            className="relative rounded-lg overflow-hidden h-32 border border-gray-300 dark:border-gray-600"
                          >
                            <img
                              src={image.url}
                              alt="Challenge image"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveExistingImage(image.id)
                              }
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    No images uploaded yet
                  </div>
                )}
              </div>

              {/* Upload New Images */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 text-sm dark:text-gray-300">
                  Upload New Images
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center mb-2">
                  <input
                    type="file"
                    id="challenge-images"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="challenge-images"
                    className="cursor-pointer flex flex-col items-center justify-center text-gray-500 dark:text-gray-400"
                  >
                    <Upload className="h-8 w-8 mb-2" />
                    <span>Click to upload images</span>
                    <span className="text-xs">(or drag and drop)</span>
                  </label>
                </div>

                {/* Selected Images Preview */}
                {uploadedImagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {uploadedImagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative rounded-lg overflow-hidden h-32 border border-gray-300 dark:border-gray-600"
                      >
                        <img
                          src={preview}
                          alt={`Selected image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSelectedFile(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded hover:bg-gradient-to-l hover:from-emerald-600 hover:to-emerald-800 ${
                    isUploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isUploading ? "Updating..." : "Update Challenge"}
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
