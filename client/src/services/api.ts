import axios from "axios";
import { User } from "../types/User"; // Import the User type

// Define the user type
export interface UserData {
  name: string;
  email: string;
  role: string;
  password: string;
}

// Define the response type for the login function
interface LoginResponse {
  user: User;
  token: string;
}

const api = axios.create({
  baseURL: "http://localhost:5000/api",
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
    // Store the token in localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      // Set the token in axios default headers for subsequent requests
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get<User[]>("/users");
    return response.data;
  } catch (error) {
    throw error;
  }
};
