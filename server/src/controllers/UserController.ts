import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const { name, email, role, password } = req.body; // Include password

      // Basic validation
      if (!name || !email || !role || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const userRepository = AppDataSource.getRepository(User);

      // Check if email already exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const newUser = userRepository.create({ name, email, role, password }); // Include password
      await userRepository.save(newUser);

      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  }

  static async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.password !== password) {
        // Note: In production, use proper password hashing
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Send user data (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error during login" });
    }
  }
}
