import axios from "axios";
import { User } from "../types/User";
import { Challenge } from "../store/slices/challengeSlice";
// Define the user type
export interface UserData {
  name: string;
  email: string;
  role: string;
  password: string;
}

// Define the tenant type
export interface Tenant {
  id: number;
  name: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  employeeCount?: number;
}

// Define the circle type
export interface Circle {
  id: number;
  name: string;
  tenantId: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  tenant: Tenant;
  creator: {
    id: number;
    name: string;
  };
  employeeCount?: number;
  images?: {
    id: number;
    image_path: string;
  }[];
}

// Define the response type for the login function
interface LoginResponse {
  user: User;
  token: string;
}

interface Submission {
  id: number;
  challengeId: number;
  userId: number;
  status: string;
  createdAt: string;
  fileUrl: string;
  challenge: {
    title: string;
    circle: {
      name: string;
    };
  };
  user: {
    name: string;
    email: string;
  };
}

interface ProfilePictureResponse {
  profile_picture_path: string;
  id: number;
  name: string;
  email: string;
  role: string;
  tenantId: number;
  oldProfilePicturePath?: string;
}

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signUp = async (userData: UserData) => {
  try {
    const response = await api.post("/users", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (credentials: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>("/users/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUsers = async (
  page: number,
  limit: number,
  search?: string,
  roles?: string[],
  tenants?: number[]
): Promise<User[]> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    const response = await api.get<User[]>("/users", {
      params: {
        page,
        limit,
        search,
        roles: roles?.join(","),
        tenants: tenants?.join(","),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (
  userId: number,
  userData: Partial<User> | FormData
): Promise<User> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    const response = await api.put<User>(`/users/${userId}`, userData, {
      headers:
        userData instanceof FormData
          ? {
              "Content-Type": "multipart/form-data",
            }
          : {
              "Content-Type": "application/json",
            },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId: number): Promise<void> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    await api.delete(`/users/${userId}`);
  } catch (error) {
    throw error;
  }
};

// Tenant-related API calls
export const getTenants = async (
  page: number,
  limit: number,
  search?: string,
  sortBy?: "name" | "createdAt_desc" | "createdAt_asc" | "totalEmployees"
): Promise<Tenant[]> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    const response = await api.get<Tenant[]>("/tenants", {
      params: {
        page,
        limit,
        search,
        sortBy:
          sortBy === "createdAt_desc"
            ? "createdAt"
            : sortBy === "createdAt_asc"
            ? "createdAt"
            : sortBy,
        order:
          sortBy === "createdAt_desc"
            ? "desc"
            : sortBy === "createdAt_asc"
            ? "asc"
            : undefined,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTenant = async (tenantData: {
  name: string;
}): Promise<Tenant> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    const response = await api.post<Tenant>("/tenants", tenantData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTenant = async (
  tenantId: number,
  tenantData: { name: string }
): Promise<Tenant> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    const response = await api.put<Tenant>(`/tenants/${tenantId}`, tenantData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTenant = async (tenantId: number): Promise<void> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    await api.delete(`/tenants/${tenantId}`);
  } catch (error) {
    throw error;
  }
};

// Circle-related API calls
export const getCircles = async (
  page: number,
  limit: number,
  search?: string,
  sortBy?: "name" | "createdAt_asc" | "createdAt_desc" | "employees",
  tenants?: number[]
): Promise<Circle[]> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    const response = await api.get<Circle[]>("/circles", {
      params: {
        page,
        limit,
        search,
        sortBy,
        tenants: tenants?.join(","),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCircle = async (circleData: {
  name: string;
  tenantId: number;
}): Promise<Circle> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    const response = await api.post<Circle>("/circles", circleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCircle = async (
  circleId: number,
  circleData: { name: string }
): Promise<Circle> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    const response = await api.put<Circle>(`/circles/${circleId}`, circleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCircle = async (circleId: number): Promise<void> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    await api.delete(`/circles/${circleId}`);
  } catch (error) {
    throw error;
  }
};

// Challenge endpoints
export const getChallenges = async (
  page?: number,
  limit?: number,
  search?: string,
  sortBy?:
    | "newest"
    | "oldest"
    | "points_highest"
    | "points_lowest"
    | "name"
    | "participants"
    | "challenge_name"
    | "circle_name"
    | "employee_name",
  circleIds?: number[]
): Promise<{
  challenges: Challenge[];
  total: number;
  page: number;
  limit: number;
}> => {
  let url = "/challenges";
  const params = new URLSearchParams();

  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  if (search) params.append("search", search);
  if (sortBy) params.append("sortBy", sortBy);
  if (circleIds && circleIds.length > 0)
    params.append("circleIds", circleIds.join(","));

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await api.get<{
    challenges: Challenge[];
    total: number;
    page: number;
    limit: number;
  }>(url);
  return response.data;
};

export const createChallenge = async (challengeData: any) => {
  const response = await api.post("/challenges", challengeData);
  return response.data;
};

export const updateChallenge = async (
  challengeId: number,
  challengeData: any
) => {
  const response = await api.put(`/challenges/${challengeId}`, challengeData);
  return response.data;
};

export const deleteChallenge = async (challengeId: number) => {
  const response = await api.delete(`/challenges/${challengeId}`);
  return response.data;
};

export const updatePassword = async (
  userId: number,
  data: { currentPassword: string; newPassword: string }
) => {
  const response = await api.put(`/users/${userId}/password`, data);
  return response.data;
};

// S3-related API calls
export const getUploadUrl = async (
  fileName: string,
  fileType: string,
  type: "submissions" | "profile" | "circle" | "challenge" = "submissions"
): Promise<{ uploadUrl: string; key: string }> => {
  try {
    const response = await api.post<{ uploadUrl: string; key: string }>(
      "/images/upload-url",
      {
        fileName,
        fileType,
        type,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadToS3 = async (
  uploadUrl: string,
  file: File
): Promise<void> => {
  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error(
        `S3 upload failed: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("S3 upload error:", error);
    throw error;
  }
};

export const getFileViewUrl = async (key: string): Promise<string> => {
  try {
    const response = await api.get<{ viewUrl: string }>(
      `/images/view-url?key=${encodeURIComponent(key)}`
    );
    return response.data.viewUrl;
  } catch (error) {
    console.error("Error getting file view URL:", error);
    throw error;
  }
};

export const createSubmission = async (
  challengeId: number,
  file: File
): Promise<void> => {
  try {
    // 1. Get the S3 upload URL
    const fileName = `${Date.now()}-${file.name}`;
    const { uploadUrl, key } = await getUploadUrl(fileName, file.type);

    // 2. Upload the file to S3
    await uploadToS3(uploadUrl, file);

    // 3. Create the submission record with the file key
    await api.post("/submissions", {
      challengeId,
      fileUrl: key, // Store only the S3 key
    });
  } catch (error) {
    console.error("Error creating submission:", error);
    throw error;
  }
};

export const getDownloadUrl = async (
  fileName: string
): Promise<{ downloadUrl: string }> => {
  try {
    console.log("File name for download URL:", fileName);
    const response = await api.get<{ downloadUrl: string }>(
      `/images/download-url/${fileName}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching download URL:", error);
    throw error;
  }
};

// Helper function to extract filename from S3 URL or key
export const getFileNameFromUrl = (url: string): string | null => {
  try {
    if (!url) return null;

    // For full S3 URLs
    if (url.includes("amazonaws.com")) {
      const urlParts = url.split("/");
      return urlParts[urlParts.length - 1];
    }

    // For S3 keys (like "profile/filename.jpg")
    if (url.includes("/")) {
      // Just return the entire key as it's stored in S3
      return url;
    }

    // For simple filenames
    return url;
  } catch (error) {
    console.error("Error extracting filename from URL:", error);
    return null;
  }
};

export const deleteFromS3 = async (filePath: string): Promise<void> => {
  try {
    console.log("Deleting file from S3:", filePath);

    // Check if it's a full path or just a filename
    let fileName = filePath;

    // For S3 keys like "profile/filename.jpg", we need to send the correct path
    // The api.delete('/images/:fileName') endpoint expects a properly formatted fileName
    // If it already has "profile/" or "submissions/" prefix, use as is
    if (!fileName.includes("/")) {
      // If it's just a filename without a folder prefix, assume it's in the profile folder
      fileName = `profile/${fileName}`;
    }

    // Make the delete request
    await api.delete(`/images/${encodeURIComponent(fileName)}`);
    console.log("File deleted successfully from S3");
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw error;
  }
};

export const getPendingSubmissions = async (): Promise<Submission[]> => {
  const response = await api.get<Submission[]>(
    "/challenge-participants/pending"
  );
  return response.data;
};

export const approveSubmission = async (
  submissionId: number,
  feedback: string
): Promise<void> => {
  await api.put(`/challenge-participants/submissions/${submissionId}/approve`, {
    feedback,
  });
};

export const rejectSubmission = async (
  submissionId: number,
  feedback: string
): Promise<void> => {
  await api.put(`/challenge-participants/submissions/${submissionId}/reject`, {
    feedback,
  });
};

export const uploadProfilePicture = async (file: File): Promise<string> => {
  try {
    console.log("Starting profile picture upload");
    // 1. Get the S3 upload URL with explicit profile type
    const fileName = `${Date.now()}-${file.name}`;
    console.log("Getting upload URL for profile picture:", fileName);
    const { uploadUrl, key } = await getUploadUrl(
      fileName,
      file.type,
      "profile"
    );
    console.log("Received upload URL and key:", { key });

    // 2. Upload the file to S3
    await uploadToS3(uploadUrl, file);
    console.log("File uploaded to S3");

    // 3. Update the user's profile picture path in the database
    console.log("Preparing to update profile picture with key:", key);
    const response = await api.put<ProfilePictureResponse>(
      `/users/profile-picture`,
      {
        profilePicturePath: key,
      }
    );
    console.log("Profile picture path updated in database");

    // 4. If there was an old profile picture and we received its path in the response,
    // we could delete it here, but we're already handling this in the ProfilePictureModal component

    return response.data.profile_picture_path;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

export const getProfilePictureUrl = async (
  key: string | null
): Promise<string | null> => {
  try {
    if (!key) return null;

    const response = await api.get<{ viewUrl: string }>(
      `/images/view-url?key=${encodeURIComponent(key)}`
    );
    return response.data.viewUrl;
  } catch (error) {
    console.error("Error getting profile picture URL:", error);
    return null;
  }
};

export const uploadCircleImages = async (files: File[]): Promise<string[]> => {
  try {
    console.log("Starting circle images upload");
    const imagePaths: string[] = [];

    // Process each file sequentially
    for (const file of files) {
      // 1. Get the S3 upload URL with explicit circle type
      const fileName = `${Date.now()}-${file.name}`;
      console.log("Getting upload URL for circle image:", fileName);
      const { uploadUrl, key } = await getUploadUrl(
        fileName,
        file.type,
        "circle"
      );
      console.log("Received upload URL and key:", { key });

      // 2. Upload the file to S3
      await uploadToS3(uploadUrl, file);
      console.log("File uploaded to S3");

      // Add the image path to the array
      imagePaths.push(key);
    }

    return imagePaths;
  } catch (error) {
    console.error("Error uploading circle images:", error);
    throw error;
  }
};

export const getCircleImageUrls = async (
  imagePaths: string[]
): Promise<string[]> => {
  try {
    if (!imagePaths || imagePaths.length === 0) return [];

    console.log("Getting signed URLs for paths:", imagePaths);

    // Get signed URLs for all images
    const imageUrls = await Promise.all(
      imagePaths.map(async (path) => {
        try {
          // Ensure the path has the correct prefix
          const processedPath = path.startsWith("circle/")
            ? path
            : `circle/${path}`;
          console.log("Getting URL for path:", processedPath);

          const response = await api.get<{ viewUrl: string }>(
            `/images/view-url?key=${encodeURIComponent(processedPath)}`
          );
          console.log("Received URL:", response.data.viewUrl);
          return response.data.viewUrl;
        } catch (error) {
          console.error(`Error getting URL for image ${path}:`, error);
          return "";
        }
      })
    );

    // Filter out any empty URLs
    const filteredUrls = imageUrls.filter((url) => url !== "");
    console.log("Final filtered URLs:", filteredUrls);
    return filteredUrls;
  } catch (error) {
    console.error("Error getting circle image URLs:", error);
    return [];
  }
};

export const deleteCircleImage = async (imagePath: string): Promise<void> => {
  try {
    console.log("Deleting circle image:", imagePath);
    await deleteFromS3(imagePath);
    console.log("Circle image deleted successfully");
  } catch (error) {
    console.error("Error deleting circle image:", error);
    throw error;
  }
};

// Challenge image functions
export const uploadChallengeImages = async (
  files: File[]
): Promise<string[]> => {
  try {
    console.log("Starting challenge images upload");
    const imagePaths: string[] = [];

    // Process each file sequentially
    for (const file of files) {
      // 1. Get the S3 upload URL with explicit challenge type
      const fileName = `${Date.now()}-${file.name}`;
      console.log("Getting upload URL for challenge image:", fileName);
      const { uploadUrl, key } = await getUploadUrl(
        fileName,
        file.type,
        "challenge"
      );
      console.log("Received upload URL and key:", { key });

      // 2. Upload the file to S3
      await uploadToS3(uploadUrl, file);
      console.log("File uploaded to S3");

      // Add the image path to the array
      imagePaths.push(key);
    }

    return imagePaths;
  } catch (error) {
    console.error("Error uploading challenge images:", error);
    throw error;
  }
};

export const getChallengeImageUrls = async (
  imagePaths: string[]
): Promise<string[]> => {
  try {
    if (!imagePaths || imagePaths.length === 0) {
      console.log("No image paths provided to getChallengeImageUrls");
      return [];
    }

    console.log("Getting signed URLs for challenge paths:", imagePaths);

    // Get signed URLs for all images
    const imageUrls = await Promise.all(
      imagePaths.map(async (path) => {
        try {
          // Ensure the path has the correct prefix
          const processedPath = path.startsWith("challenge/")
            ? path
            : `challenge/${path}`;
          console.log("Getting URL for challenge path:", processedPath);

          const response = await api.get<{ viewUrl: string }>(
            `/images/view-url?key=${encodeURIComponent(processedPath)}`
          );

          if (!response.data || !response.data.viewUrl) {
            console.error("Invalid response format:", response);
            return "";
          }

          console.log("Received challenge URL:", response.data.viewUrl);
          return response.data.viewUrl;
        } catch (error) {
          console.error(
            `Error getting URL for challenge image ${path}:`,
            error
          );
          console.error("Full error object:", JSON.stringify(error, null, 2));
          return "";
        }
      })
    );

    // Filter out any empty URLs
    const filteredUrls = imageUrls.filter((url) => url !== "");
    console.log("Final filtered challenge URLs:", filteredUrls);

    if (filteredUrls.length === 0) {
      console.warn("No valid URLs were generated for any of the images");
    }

    return filteredUrls;
  } catch (error) {
    console.error("Error getting challenge image URLs:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    return [];
  }
};
