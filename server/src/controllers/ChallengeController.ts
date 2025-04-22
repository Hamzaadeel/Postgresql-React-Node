import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Challenge } from "../entities/Challenge";
import { In, ILike } from "typeorm";
import { CircleParticipants } from "../entities/CircleParticipants";
import { NotificationController } from "./NotificationController";
import { ChallengeImages } from "../entities/ChallengeImages";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Extend Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export class ChallengeController {
  static async getChallenges(req: Request, res: Response) {
    try {
      const { search, sortBy, circleIds, page = 1, limit = 10 } = req.query;
      const challengeRepository = AppDataSource.getRepository(Challenge);

      const queryOptions: any = {
        relations: {
          circle: true,
          creator: true,
          images: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          circleId: true,
          points: true,
          createdBy: true,
          createdAt: true,
          circle: {
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
          title: ILike(`%${search}%`),
        };
      }

      // Handle circle filtering
      if (circleIds) {
        const circleIdArray = (circleIds as string).split(",").map(Number);
        queryOptions.where = {
          ...queryOptions.where,
          circleId: In(circleIdArray),
        };
      }

      // Handle sorting
      if (sortBy) {
        switch (sortBy) {
          case "newest":
            queryOptions.order = { createdAt: "DESC" };
            break;
          case "oldest":
            queryOptions.order = { createdAt: "ASC" };
            break;
          case "points_highest":
            queryOptions.order = { points: "DESC" };
            break;
          case "points_lowest":
            queryOptions.order = { points: "ASC" };
            break;
          case "name":
            queryOptions.order = { title: "ASC" };
            break;
          case "participants":
            // We will sort after fetching the data
            break;
          default:
            queryOptions.order = { createdAt: "DESC" };
        }
      } else {
        queryOptions.order = { createdAt: "DESC" };
      }

      // Handle pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      queryOptions.skip = (pageNum - 1) * limitNum;
      queryOptions.take = limitNum;

      const [challenges, total] = await challengeRepository.findAndCount(
        queryOptions
      );

      // Add participant count to each challenge
      const challengesWithCount = await Promise.all(
        challenges.map(async (challenge) => {
          const participantCount = await AppDataSource.getRepository(
            "challenge_participants"
          )
            .createQueryBuilder("cp")
            .where("cp.challengeId = :challengeId", {
              challengeId: challenge.id,
            })
            .getCount();

          return {
            ...challenge,
            participantCount,
          };
        })
      );

      // Sort by participant count if requested
      if (sortBy === "participants") {
        challengesWithCount.sort(
          (a, b) => (b.participantCount || 0) - (a.participantCount || 0)
        );
      }

      console.log("Found challenges with images, total count:", total);

      res.json({
        challenges: challengesWithCount,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Error fetching challenges" });
    }
  }

  static async getChallengesByCircle(req: Request, res: Response) {
    try {
      const circleId = parseInt(req.params.circleId);
      const challengeRepository = AppDataSource.getRepository(Challenge);
      const challenges = await challengeRepository.find({
        where: { circleId },
        relations: {
          circle: true,
          creator: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          circleId: true,
          points: true,
          createdBy: true,
          createdAt: true,
          circle: {
            id: true,
            name: true,
          },
          creator: {
            id: true,
            name: true,
          },
        },
        order: {
          createdAt: "DESC",
        },
      });
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Error fetching challenges" });
    }
  }

  static async getChallengesByCircles(req: Request, res: Response) {
    try {
      const circleIds = req.query.ids?.toString().split(",").map(Number);

      if (!circleIds) {
        return res.status(400).json({ message: "Circle IDs are required" });
      }

      const challengeRepository = AppDataSource.getRepository(Challenge);
      const challenges = await challengeRepository.find({
        where: {
          circleId: In(circleIds),
        },
        relations: {
          circle: true,
          creator: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          circleId: true,
          points: true,
          createdBy: true,
          createdAt: true,
          circle: {
            id: true,
            name: true,
          },
          creator: {
            id: true,
            name: true,
          },
        },
        order: {
          createdAt: "DESC",
        },
      });

      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Error fetching challenges" });
    }
  }

  static async createChallenge(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description, circleIds, points, imagePaths } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (
        !title ||
        !description ||
        !circleIds ||
        !Array.isArray(circleIds) ||
        circleIds.length === 0 ||
        points === undefined
      ) {
        return res.status(400).json({
          message: "Title, description, circle IDs, and points are required",
        });
      }

      const challengeRepository = AppDataSource.getRepository(Challenge);
      const circleParticipantsRepository =
        AppDataSource.getRepository(CircleParticipants);
      const challengeImagesRepository =
        AppDataSource.getRepository(ChallengeImages);

      // Check if challenge with same title exists in any of the selected circles
      const existingChallenge = await challengeRepository.findOne({
        where: { title, circleId: In(circleIds) },
      });
      if (existingChallenge) {
        return res.status(400).json({
          message:
            "Challenge with this title already exists in one of the selected circles",
        });
      }

      // Create challenges for each selected circle
      const savedChallenges = [];
      for (const circleId of circleIds) {
        const newChallenge = challengeRepository.create({
          title,
          description,
          circleId,
          points,
          createdBy: userId,
        });

        const savedChallenge = await challengeRepository.save(newChallenge);

        // Save image paths if provided
        if (imagePaths && Array.isArray(imagePaths) && imagePaths.length > 0) {
          for (const path of imagePaths) {
            const challengeImage = challengeImagesRepository.create({
              challenge: savedChallenge,
              image_path: path,
            });
            await challengeImagesRepository.save(challengeImage);
          }
        }

        // Fetch circle participants to send notifications
        const circleParticipants = await circleParticipantsRepository.find({
          where: { circle: { id: circleId } },
          relations: ["user", "circle"],
        });

        // Send notifications to all circle participants except the creator
        for (const participant of circleParticipants) {
          if (participant.user.id !== userId) {
            await NotificationController.createNotification(
              participant.user.id,
              "New Challenge Available 🎇",
              `A new challenge "${title}" worth ${points} points has been added to circle "${participant.circle.name}"`
            );
          }
        }

        // Fetch the complete challenge data with relations
        const completeChallenge = await challengeRepository.findOne({
          where: { id: savedChallenge.id },
          relations: {
            circle: true,
            creator: true,
            images: true,
          },
          select: {
            id: true,
            title: true,
            description: true,
            circleId: true,
            points: true,
            createdBy: true,
            createdAt: true,
            circle: {
              id: true,
              name: true,
            },
            creator: {
              id: true,
              name: true,
            },
          },
        });

        if (completeChallenge) {
          savedChallenges.push(completeChallenge);
        }
      }

      res.status(201).json(savedChallenges);
    } catch (error) {
      console.error("Error creating challenge:", error);
      res.status(500).json({ message: "Error creating challenge" });
    }
  }

  static async updateChallenge(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { title, description, points, addImagePaths, removeImageIds } =
        req.body;

      if (
        !title &&
        !description &&
        points === undefined &&
        !addImagePaths &&
        !removeImageIds
      ) {
        return res.status(400).json({
          message:
            "At least one field (title, description, points, addImagePaths, or removeImageIds) is required",
        });
      }

      const challengeRepository = AppDataSource.getRepository(Challenge);
      const challenge = await challengeRepository.findOne({
        where: { id },
        relations: {
          circle: true,
          images: true,
        },
      });

      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      // Check if new title is already taken by another challenge in the same circle
      if (title && title !== challenge.title) {
        const existingChallenge = await challengeRepository.findOne({
          where: { title, circleId: challenge.circleId },
        });
        if (existingChallenge && existingChallenge.id !== id) {
          return res.status(400).json({
            message: "Challenge with this title already exists in this circle",
          });
        }
      }

      // Update fields if provided
      if (title) challenge.title = title;
      if (description) challenge.description = description;
      if (points !== undefined) challenge.points = points;

      const updatedChallenge = await challengeRepository.save(challenge);

      // Handle adding new images
      if (
        addImagePaths &&
        Array.isArray(addImagePaths) &&
        addImagePaths.length > 0
      ) {
        const challengeImagesRepository =
          AppDataSource.getRepository(ChallengeImages);
        for (const path of addImagePaths) {
          const challengeImage = challengeImagesRepository.create({
            challenge: updatedChallenge,
            image_path: path,
          });
          await challengeImagesRepository.save(challengeImage);
        }
      }

      // Handle removing images
      if (
        removeImageIds &&
        Array.isArray(removeImageIds) &&
        removeImageIds.length > 0
      ) {
        const challengeImagesRepository =
          AppDataSource.getRepository(ChallengeImages);

        for (const imageId of removeImageIds) {
          const image = await challengeImagesRepository.findOne({
            where: { id: imageId, challenge: { id: challenge.id } },
          });

          if (image) {
            try {
              // Delete from S3 first
              await ChallengeController.deleteS3File(image.image_path);
            } catch (s3Error) {
              console.error("Error deleting image from S3:", s3Error);
              // Continue even if S3 deletion fails
            }

            // Then delete from database
            await challengeImagesRepository.remove(image);
          }
        }
      }

      // Fetch the complete challenge data with relations
      const completeChallenge = await challengeRepository.findOne({
        where: { id: updatedChallenge.id },
        relations: {
          circle: true,
          creator: true,
          images: true,
        },
        select: {
          id: true,
          title: true,
          description: true,
          circleId: true,
          points: true,
          createdBy: true,
          createdAt: true,
          circle: {
            id: true,
            name: true,
          },
          creator: {
            id: true,
            name: true,
          },
        },
      });

      res.json(completeChallenge);
    } catch (error) {
      console.error("Error updating challenge:", error);
      res.status(500).json({ message: "Error updating challenge" });
    }
  }

  static async deleteChallenge(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const challengeRepository = AppDataSource.getRepository(Challenge);
      const challengeImagesRepository =
        AppDataSource.getRepository(ChallengeImages);

      const challenge = await challengeRepository.findOne({
        where: { id },
        relations: { images: true },
      });

      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      // Delete all images from S3 first
      if (challenge.images && challenge.images.length > 0) {
        for (const image of challenge.images) {
          try {
            await ChallengeController.deleteS3File(image.image_path);
          } catch (s3Error) {
            console.error("Error deleting image from S3:", s3Error);
            // Continue even if S3 deletion fails
          }
        }

        // Delete all challenge images from the database
        await challengeImagesRepository.remove(challenge.images);
      }

      // Then delete the challenge itself
      await challengeRepository.remove(challenge);
      res.json({ message: "Challenge deleted successfully" });
    } catch (error) {
      console.error("Error deleting challenge:", error);
      res.status(500).json({ message: "Error deleting challenge" });
    }
  }

  // Helper method to delete files from S3
  private static async deleteS3File(fileName: string): Promise<void> {
    try {
      console.log(`Attempting to delete challenge image: ${fileName}`);

      // If the path already includes 'challenge/', use it as is
      let key = fileName;
      if (!fileName.includes("/")) {
        key = `challenge/${fileName}`;
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
      console.log("Challenge image deleted from S3 successfully");
    } catch (error) {
      console.error("Error deleting image from S3:", error);
      throw error;
    }
  }

  static async getChallengeImages(req: Request, res: Response) {
    try {
      const challengeId = parseInt(req.params.id);
      const challengeImagesRepository =
        AppDataSource.getRepository(ChallengeImages);
      const images = await challengeImagesRepository.find({
        where: { challenge: { id: challengeId } },
      });
      res.json(images);
    } catch (error) {
      console.error("Error fetching challenge images:", error);
      res.status(500).json({ message: "Error fetching challenge images" });
    }
  }

  static async addChallengeImages(req: AuthenticatedRequest, res: Response) {
    try {
      const challengeId = parseInt(req.params.id);
      const { imagePaths } = req.body;

      if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
        return res.status(400).json({ message: "Image paths are required" });
      }

      const challengeRepository = AppDataSource.getRepository(Challenge);
      const challenge = await challengeRepository.findOne({
        where: { id: challengeId },
      });

      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      const challengeImagesRepository =
        AppDataSource.getRepository(ChallengeImages);
      const savedImages = [];

      for (const path of imagePaths) {
        const challengeImage = challengeImagesRepository.create({
          challenge: challenge,
          image_path: path,
        });
        const savedImage = await challengeImagesRepository.save(challengeImage);
        savedImages.push(savedImage);
      }

      res.status(201).json(savedImages);
    } catch (error) {
      console.error("Error adding challenge images:", error);
      res.status(500).json({ message: "Error adding challenge images" });
    }
  }

  static async deleteChallengeImage(req: Request, res: Response) {
    try {
      const imageId = parseInt(req.params.imageId);

      const challengeImagesRepository =
        AppDataSource.getRepository(ChallengeImages);
      const image = await challengeImagesRepository.findOne({
        where: { id: imageId },
      });

      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }

      // Delete from S3 first
      try {
        await ChallengeController.deleteS3File(image.image_path);
      } catch (s3Error) {
        console.error("Error deleting image from S3:", s3Error);
        // Continue even if S3 deletion fails
      }

      // Then delete from database
      await challengeImagesRepository.remove(image);

      res.json({ message: "Challenge image deleted successfully" });
    } catch (error) {
      console.error("Error deleting challenge image:", error);
      res.status(500).json({ message: "Error deleting challenge image" });
    }
  }
}
