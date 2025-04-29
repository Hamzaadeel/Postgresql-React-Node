import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ILike, In } from "typeorm";
import S3Controller from "./S3Controller";
import { Tenant } from "../entities/Tenant";

export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const { search, roles, tenants } = req.query;
      const userRepository = AppDataSource.getRepository(User);

      let whereConditions = [];

      // Handle search across multiple fields
      if (search) {
        whereConditions.push([
          { name: ILike(`%${search}%`) },
          { email: ILike(`%${search}%`) },
        ]);
      }

      // Handle role filtering
      if (roles) {
        const roleArray = (roles as string)
          .split(",")
          .map((role) => role.toLowerCase());
        whereConditions.push({ role: In(roleArray) });
      }

      // Handle tenant filtering
      if (tenants) {
        const tenantArray = (tenants as string).split(",").map(Number);
        whereConditions.push({ tenantId: In(tenantArray) });
      }

      const queryOptions: any = {
        order: { name: "ASC" },
      };

      // Combine all conditions with AND
      if (whereConditions.length > 0) {
        queryOptions.where =
          whereConditions.length === 1
            ? whereConditions[0]
            : whereConditions.reduce((acc, condition) => {
                if (Array.isArray(condition)) {
                  // OR conditions (for search)
                  return { ...acc, ...{ $or: condition } };
                }
                // AND conditions (for filters)
                return { ...acc, ...condition };
              }, {});
      }

      const users = await userRepository.find(queryOptions);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          message: "Name, email, and password are required",
        });
      }

      const tenantRepository = AppDataSource.getRepository(Tenant);
      const defaultTenant = await tenantRepository.findOne({
        where: { id: 1 },
      });

      if (!defaultTenant) {
        return res.status(500).json({ message: "Default tenant not found" });
      }

      const userRepository = AppDataSource.getRepository(User);
      const existingUser = await userRepository.findOne({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = userRepository.create({
        name,
        email,
        password: hashedPassword,
        role,
        tenant: defaultTenant, // 👈 use the tenant entity directly
      });

      await userRepository.save(newUser);
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name, email, role, tenantId } = req.body;

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id } });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if email is being changed and if it's already taken
      if (email && email !== user.email) {
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      // Update user properties
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (tenantId) user.tenantId = tenantId;

      await userRepository.save(user);

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  }

  static async updatePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = parseInt(req.params.id);

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;

      await userRepository.save(user);
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Error updating password" });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({ where: { id } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await userRepository.remove(user);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user" });
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
      const user = await userRepository.findOne({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          role: true,
          profile_picture_path: true,
          tenantId: true,
        },
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.role) {
        return res.status(400).json({ message: "User role not defined" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET ||
          "a7eb8932ca3d1092e1470d665cc35072c45e1edf80dc4a1e1a9871d3f5fcf4c1",
        { expiresIn: "24h" }
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error during login" });
    }
  }

  static async updateProfilePicture(req: Request, res: Response) {
    console.log("Update profile picture request received:", req.body);
    try {
      // Log the entire request body
      console.log("Request body:", req.body);

      const userId = (req as any).user.id; // Get user ID from JWT token
      const { profilePicturePath } = req.body; // Get the new profile picture path

      // Log the profile picture path being sent
      if (profilePicturePath === undefined) {
        console.warn("Profile picture path being sent is undefined");
      } else {
        console.log("Profile picture path being sent:", profilePicturePath);
      }

      if (!userId || !profilePicturePath) {
        return res.status(400).json({
          message: "User ID and profile picture path are required",
          received: { userId, profilePicturePath },
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // If the user already has a profile picture, include it in the response
      // so the client can handle deletion if needed
      const oldProfilePicturePath = user.profile_picture_path;

      // Update profile picture path
      user.profile_picture_path = profilePicturePath;
      console.log("Updating user profile_picture_path to:", profilePicturePath);

      // Save the updated user
      const updatedUser = await userRepository.save(user);
      console.log(
        "User saved with profile_picture_path:",
        updatedUser.profile_picture_path
      );

      // Return updated user without password
      const { password: _, ...userWithoutPassword } = updatedUser;

      // Return both the updated user and the old profile picture path
      res.json({
        ...userWithoutPassword,
        oldProfilePicturePath,
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({
        message: "Error updating profile picture",
        error: error.message,
      });
    }
  }
}
