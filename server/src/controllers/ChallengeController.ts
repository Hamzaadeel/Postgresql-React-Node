import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Challenge } from "../entities/Challenge";
import { In, ILike } from "typeorm";
import { CircleParticipants } from "../entities/CircleParticipants";
import { NotificationController } from "./NotificationController";

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
      const { search, sortBy, circleIds, page, limit } = req.query;
      const challengeRepository = AppDataSource.getRepository(Challenge);

      const queryOptions: any = {
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
      switch (sortBy) {
        case "newest":
          queryOptions.order.createdAt = "DESC";
          break;
        case "oldest":
          queryOptions.order.createdAt = "ASC";
          break;
        case "points_highest":
          queryOptions.order.points = "DESC";
          break;
        case "points_lowest":
          queryOptions.order.points = "ASC";
          break;
        case "name":
          queryOptions.order.title = "ASC";
          break;
        default:
          queryOptions.order.createdAt = "DESC"; // Default sort
      }

      // Handle pagination
      if (page && limit) {
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        queryOptions.skip = (pageNum - 1) * limitNum;
        queryOptions.take = limitNum;
      }

      const [challenges, total] = await challengeRepository.findAndCount(
        queryOptions
      );

      res.json({
        challenges,
        total,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : total,
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
      const { title, description, circleId, points } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!title || !description || !circleId || points === undefined) {
        return res.status(400).json({
          message: "Title, description, circle ID, and points are required",
        });
      }

      const challengeRepository = AppDataSource.getRepository(Challenge);
      const circleParticipantsRepository =
        AppDataSource.getRepository(CircleParticipants);

      // Check if challenge with same title exists in the same circle
      const existingChallenge = await challengeRepository.findOne({
        where: { title, circleId },
      });
      if (existingChallenge) {
        return res.status(400).json({
          message: "Challenge with this title already exists in this circle",
        });
      }

      const newChallenge = challengeRepository.create({
        title,
        description,
        circleId,
        points,
        createdBy: userId,
      });

      const savedChallenge = await challengeRepository.save(newChallenge);

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

      res.status(201).json(completeChallenge);
    } catch (error) {
      console.error("Error creating challenge:", error);
      res.status(500).json({ message: "Error creating challenge" });
    }
  }

  static async updateChallenge(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { title, description, points } = req.body;

      if (!title && !description && points === undefined) {
        return res.status(400).json({
          message:
            "At least one field (title, description, or points) is required",
        });
      }

      const challengeRepository = AppDataSource.getRepository(Challenge);
      const challenge = await challengeRepository.findOne({
        where: { id },
        relations: {
          circle: true,
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

      // Fetch the complete challenge data with relations
      const completeChallenge = await challengeRepository.findOne({
        where: { id: updatedChallenge.id },
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

      const challenge = await challengeRepository.findOne({ where: { id } });
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      await challengeRepository.remove(challenge);
      res.json({ message: "Challenge deleted successfully" });
    } catch (error) {
      console.error("Error deleting challenge:", error);
      res.status(500).json({ message: "Error deleting challenge" });
    }
  }
}
