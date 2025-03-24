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
}

// Define the response type for the login function
interface LoginResponse {
  user: User;
  token: string;
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
  userData: Partial<User>
): Promise<User> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    const response = await api.put<User>(`/users/${userId}`, userData);
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
    | "participants",
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
