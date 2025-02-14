import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Circle } from "../entities/Circle";

// Extend Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export class CircleController {
  static async getCircles(req: Request, res: Response) {
    try {
      const circleRepository = AppDataSource.getRepository(Circle);
      const circles = await circleRepository.find({
        relations: {
          tenant: true,
          creator: true,
        },
        select: {
          id: true,
          name: true,
          tenantId: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
          tenant: {
            id: true,
            name: true,
          },
          creator: {
            id: true,
            name: true,
          },
        },
        order: {
          name: "ASC",
        },
      });
      res.json(circles);
    } catch (error) {
      console.error("Error fetching circles:", error);
      res.status(500).json({ message: "Error fetching circles" });
    }
  }

  static async createCircle(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, tenantId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!name || !tenantId) {
        return res
          .status(400)
          .json({ message: "Name and tenant ID are required" });
      }

      const circleRepository = AppDataSource.getRepository(Circle);

      // Check if circle with same name exists in the same tenant
      const existingCircle = await circleRepository.findOne({
        where: { name, tenantId },
      });
      if (existingCircle) {
        return res.status(400).json({
          message: "Circle with this name already exists in this tenant",
        });
      }

      const newCircle = circleRepository.create({
        name,
        tenantId,
        createdBy: userId,
      });

      const savedCircle = await circleRepository.save(newCircle);

      // Fetch the complete circle data with relations
      const completeCircle = await circleRepository.findOne({
        where: { id: savedCircle.id },
        relations: {
          tenant: true,
          creator: true,
        },
        select: {
          id: true,
          name: true,
          tenantId: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
          tenant: {
            id: true,
            name: true,
          },
          creator: {
            id: true,
            name: true,
          },
        },
      });

      res.status(201).json(completeCircle);
    } catch (error) {
      console.error("Error creating circle:", error);
      res.status(500).json({ message: "Error creating circle" });
    }
  }

  static async updateCircle(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Circle name is required" });
      }

      const circleRepository = AppDataSource.getRepository(Circle);
      const circle = await circleRepository.findOne({
        where: { id },
        relations: {
          tenant: true,
        },
      });

      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }

      // Check if new name is already taken by another circle in the same tenant
      const existingCircle = await circleRepository.findOne({
        where: { name, tenantId: circle.tenantId },
      });
      if (existingCircle && existingCircle.id !== id) {
        return res.status(400).json({
          message: "Circle with this name already exists in this tenant",
        });
      }

      circle.name = name;
      const updatedCircle = await circleRepository.save(circle);

      // Fetch the complete circle data with relations
      const completeCircle = await circleRepository.findOne({
        where: { id: updatedCircle.id },
        relations: {
          tenant: true,
          creator: true,
        },
        select: {
          id: true,
          name: true,
          tenantId: true,
          createdBy: true,
          createdAt: true,
          updatedAt: true,
          tenant: {
            id: true,
            name: true,
          },
          creator: {
            id: true,
            name: true,
          },
        },
      });

      res.json(completeCircle);
    } catch (error) {
      console.error("Error updating circle:", error);
      res.status(500).json({ message: "Error updating circle" });
    }
  }

  static async deleteCircle(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const circleRepository = AppDataSource.getRepository(Circle);

      const circle = await circleRepository.findOne({ where: { id } });
      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }

      await circleRepository.remove(circle);
      res.json({ message: "Circle deleted successfully" });
    } catch (error) {
      console.error("Error deleting circle:", error);
      res.status(500).json({ message: "Error deleting circle" });
    }
  }
}
