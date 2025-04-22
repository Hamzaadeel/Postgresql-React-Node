import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Circle } from "../entities/Circle";
import { User } from "../entities/User";
import { NotificationController } from "./NotificationController";
import { ILike, In } from "typeorm";
import { CircleParticipants } from "../entities/CircleParticipants";
import { CircleImages } from "../entities/CircleImages";
import S3Controller from "./S3Controller";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

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
      const { search, sortBy, tenants } = req.query;
      const circleRepository = AppDataSource.getRepository(Circle);

      const queryOptions: any = {
        relations: {
          tenant: true,
          creator: true,
          images: true,
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
          images: {
            id: true,
            image_path: true,
          },
        },
        where: {},
        order: {},
      };

      // Handle search
      if (search) {
        queryOptions.where = {
          name: ILike(`%${search}%`),
        };
      }

      // Handle tenant filtering
      if (tenants) {
        const tenantArray = (tenants as string).split(",").map(Number);
        queryOptions.where = {
          ...queryOptions.where,
          tenantId: In(tenantArray),
        };
      }

      // Handle sorting
      if (sortBy === "createdAt_desc") {
        queryOptions.order.createdAt = "DESC";
      } else if (sortBy === "createdAt_asc") {
        queryOptions.order.createdAt = "ASC";
      } else if (sortBy === "employees") {
        // We will sort after fetching the data and counting employees
      } else {
        queryOptions.order.name = "ASC"; // Default sort by name
      }

      const circles = await circleRepository.find(queryOptions);

      // Add employee count to each circle
      const circlesWithCount = await Promise.all(
        circles.map(async (circle) => {
          const participantCount = await AppDataSource.getRepository(
            CircleParticipants
          ).count({ where: { circle: { id: circle.id } } });

          return {
            ...circle,
            employeeCount: participantCount,
          };
        })
      );

      // Sort by employee count if requested
      if (sortBy === "employees") {
        circlesWithCount.sort(
          (a, b) => (b.employeeCount || 0) - (a.employeeCount || 0)
        );
      }

      res.json(circlesWithCount);
    } catch (error) {
      console.error("Error fetching circles:", error);
      res.status(500).json({ message: "Error fetching circles" });
    }
  }

  static async getCircleImages(req: Request, res: Response) {
    try {
      const circleId = parseInt(req.params.id);
      const circleImagesRepository = AppDataSource.getRepository(CircleImages);
      const images = await circleImagesRepository.find({
        where: { circle: { id: circleId } },
      });

      res.json(images);
    } catch (error) {
      console.error("Error fetching circle images:", error);
      res.status(500).json({ message: "Error fetching circle images" });
    }
  }

  static async addCircleImages(req: AuthenticatedRequest, res: Response) {
    try {
      const circleId = parseInt(req.params.id);
      const { imagePaths } = req.body;

      if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
        return res.status(400).json({ message: "Image paths are required" });
      }

      const circleRepository = AppDataSource.getRepository(Circle);
      const circle = await circleRepository.findOne({
        where: { id: circleId },
      });

      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }

      const circleImagesRepository = AppDataSource.getRepository(CircleImages);
      const savedImages = [];

      for (const path of imagePaths) {
        const circleImage = circleImagesRepository.create({
          circle: circle,
          image_path: path,
        });
        const savedImage = await circleImagesRepository.save(circleImage);
        savedImages.push(savedImage);
      }

      res.status(201).json(savedImages);
    } catch (error) {
      console.error("Error adding circle images:", error);
      res.status(500).json({ message: "Error adding circle images" });
    }
  }

  // Helper method to delete files from S3
  private static async deleteS3File(fileName: string): Promise<void> {
    try {
      console.log(`Attempting to delete circle image: ${fileName}`);

      // If the path already includes 'circle/', use it as is
      let key = fileName;
      if (!fileName.includes("/")) {
        key = `circle/${fileName}`;
      }

      const s3Client = new S3Client({
        region: process.env.AWS_REGION || "",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
      });

      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || "",
        Key: key,
      });

      await s3Client.send(command);
      console.log("Circle image deleted from S3 successfully");
    } catch (error) {
      console.error("Error deleting image from S3:", error);
      throw error;
    }
  }

  static async deleteCircleImage(req: Request, res: Response) {
    try {
      const imageId = parseInt(req.params.imageId);

      const circleImagesRepository = AppDataSource.getRepository(CircleImages);
      const image = await circleImagesRepository.findOne({
        where: { id: imageId },
      });

      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }

      // Delete from S3 first
      try {
        await CircleController.deleteS3File(image.image_path);
      } catch (s3Error) {
        console.error("Error deleting image from S3:", s3Error);
        // Continue even if S3 deletion fails
      }

      // Then delete from database
      await circleImagesRepository.remove(image);

      res.json({ message: "Circle image deleted successfully" });
    } catch (error) {
      console.error("Error deleting circle image:", error);
      res.status(500).json({ message: "Error deleting circle image" });
    }
  }

  static async createCircle(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, tenantId, imagePaths } = req.body;
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
      const userRepository = AppDataSource.getRepository(User);
      const circleImagesRepository = AppDataSource.getRepository(CircleImages);

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

      // Get all employees in the tenant
      const employees = await userRepository.find({
        where: {
          tenantId,
          role: "employee",
        },
      });

      // Send notification to all employees
      for (const employee of employees) {
        await NotificationController.createNotification(
          employee.id,
          "New Circle Available 🎉",
          `"${name}" has been created. Join now!✨`
        );
      }

      // Save image paths if provided
      if (imagePaths && Array.isArray(imagePaths) && imagePaths.length > 0) {
        for (const path of imagePaths) {
          const circleImage = circleImagesRepository.create({
            circle: savedCircle,
            image_path: path,
          });
          await circleImagesRepository.save(circleImage);
        }
      }

      // Fetch the complete circle data with relations
      const completeCircle = await circleRepository.findOne({
        where: { id: savedCircle.id },
        relations: {
          tenant: true,
          creator: true,
          images: true,
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

  static async updateCircle(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name, addImagePaths, removeImageIds } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Circle name is required" });
      }

      const circleRepository = AppDataSource.getRepository(Circle);
      const circle = await circleRepository.findOne({
        where: { id },
        relations: {
          tenant: true,
          images: true,
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

      // Handle adding new images
      if (
        addImagePaths &&
        Array.isArray(addImagePaths) &&
        addImagePaths.length > 0
      ) {
        const circleImagesRepository =
          AppDataSource.getRepository(CircleImages);
        for (const path of addImagePaths) {
          const circleImage = circleImagesRepository.create({
            circle: updatedCircle,
            image_path: path,
          });
          await circleImagesRepository.save(circleImage);
        }
      }

      // Handle removing images
      if (
        removeImageIds &&
        Array.isArray(removeImageIds) &&
        removeImageIds.length > 0
      ) {
        const circleImagesRepository =
          AppDataSource.getRepository(CircleImages);

        for (const imageId of removeImageIds) {
          const image = await circleImagesRepository.findOne({
            where: { id: imageId, circle: { id: circle.id } },
          });

          if (image) {
            try {
              // Delete from S3 first
              await CircleController.deleteS3File(image.image_path);
            } catch (s3Error) {
              console.error("Error deleting image from S3:", s3Error);
              // Continue even if S3 deletion fails
            }

            // Then delete from database
            await circleImagesRepository.remove(image);
          }
        }
      }

      // Fetch the complete updated circle data with relations
      const completeCircle = await circleRepository.findOne({
        where: { id: updatedCircle.id },
        relations: {
          tenant: true,
          creator: true,
          images: true,
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
      const circleImagesRepository = AppDataSource.getRepository(CircleImages);

      const circle = await circleRepository.findOne({
        where: { id },
        relations: { images: true },
      });

      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }

      // Delete all images from S3 first
      if (circle.images && circle.images.length > 0) {
        for (const image of circle.images) {
          try {
            await CircleController.deleteS3File(image.image_path);
          } catch (s3Error) {
            console.error("Error deleting image from S3:", s3Error);
            // Continue even if S3 deletion fails
          }
        }

        // Delete all circle images from the database
        await circleImagesRepository.remove(circle.images);
      }

      // Then delete the circle itself
      await circleRepository.remove(circle);
      res.json({ message: "Circle deleted successfully" });
    } catch (error) {
      console.error("Error deleting circle:", error);
      res.status(500).json({ message: "Error deleting circle" });
    }
  }
}
