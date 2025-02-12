import axios from "axios";
import { User } from "../types/User"; // Import the User type

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
  limit: number
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
  limit: number
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
