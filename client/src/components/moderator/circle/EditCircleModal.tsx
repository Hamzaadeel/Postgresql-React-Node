import { useState, useEffect } from "react";
import {
  Circle,
  getCircleImageUrls,
  uploadCircleImages,
} from "../../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";

interface EditCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (
    circleId: number,
    circleData: {
      name: string;
      addImagePaths?: string[];
      removeImageIds?: number[];
    }
  ) => Promise<void>;
  circle: Circle | null;
}

const EditCircleModal: React.FC<EditCircleModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  circle,
}) => {
  const [name, setName] = useState("");
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

  // Fetch circle data when modal opens or circle changes
  useEffect(() => {
    if (circle && isOpen) {
      setName(circle.name);
      fetchCircleImages();
    }
  }, [circle, isOpen]);

  const fetchCircleImages = async () => {
    if (!circle) return;

    setIsLoadingImages(true);
    try {
      console.log("Fetching circle images for circle:", circle);
      // Only proceed if the circle has images
      if (circle.images && circle.images.length > 0) {
        console.log("Circle has images:", circle.images);
        // Extract image paths from circle.images
        const imagePaths = circle.images.map((img) => img.image_path);
        console.log("Image paths extracted:", imagePaths);

        // Get signed URLs for the images
        const imageUrls = await getCircleImageUrls(imagePaths);
        console.log("Received signed URLs:", imageUrls);

        // Map the images with their IDs, paths, and URLs
        const mappedImages = circle.images.map((img, index) => ({
          id: img.id,
          path: img.image_path,
          url: imageUrls[index] || "",
        }));
        console.log("Mapped images with URLs:", mappedImages);

        setExistingImages(mappedImages.filter((img) => img.url)); // Only keep images with valid URLs
      } else {
        console.log("Circle has no images");
        // Reset existing images if the circle has no images
        setExistingImages([]);
      }
    } catch (error) {
      console.error("Error fetching circle images:", error);
      toast.error("Failed to load circle images");
    } finally {
      setIsLoadingImages(false);
    }
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
    if (!circle) return;

    try {
      setIsUploading(true);

      // Upload the selected files to S3
      let addImagePaths: string[] = [];

      if (selectedFiles.length > 0) {
        addImagePaths = await uploadCircleImages(selectedFiles);
      }

      // Update the circle with the new name and image paths
      await onEdit(circle.id, {
        name,
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
      console.error("Error updating circle:", error);
      toast.error("Failed to update circle");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen || !circle) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto pt-12"
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
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-xl h-auto max-h-[80vh] overflow-y-auto shadow-lg m-4 relative"
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
              <ImageIcon className="h-5 w-5 mr-2 text-emerald-500" />
              Edit Circle
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm dark:text-gray-300">
                  Tenant
                </label>
                <input
                  type="text"
                  value={circle.tenant.name}
                  className="w-full p-2 border rounded italic text-gray-600 bg-gray-300 text-sm"
                  disabled
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
                              alt="Circle image"
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
                    id="circle-images"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="circle-images"
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
                  {isUploading ? "Updating..." : "Update Circle"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditCircleModal;
