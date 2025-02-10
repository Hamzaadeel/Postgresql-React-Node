import axios from "axios";
import { User } from "../types/User"; // Import the User type

// Define the user type
export interface UserData {
  name: string;
  email: string;
  role: string;
  password: string;
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
}): Promise<User> => {
  try {
    const response = await api.post<User>("/users/login", credentials);
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
