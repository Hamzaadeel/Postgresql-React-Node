import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Submissions } from "../entities/Submissions";
import { Challenge } from "../entities/Challenge";
import { User } from "../entities/User";
import { NotificationController } from "./NotificationController";

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
  };
}

class SubmissionsController {
  async createSubmission(req: AuthenticatedRequest, res: Response) {
    try {
      const { challengeId, fileUrl } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Validate input
      if (!challengeId || !fileUrl) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const submissionsRepository = AppDataSource.getRepository(Submissions);
      const challengeRepository = AppDataSource.getRepository(Challenge);
      const userRepository = AppDataSource.getRepository(User);

      // Get challenge and user
      const challenge = await challengeRepository.findOne({
        where: { id: challengeId },
        relations: ["creator"],
      });
      const user = await userRepository.findOne({
        where: { id: userId },
      });

      if (!challenge || !user) {
        return res.status(404).json({ error: "Challenge or user not found" });
      }

      // Check if submission already exists
      const existingSubmission = await submissionsRepository.findOne({
        where: {
          challenge: { id: challengeId },
          user: { id: userId },
        },
      });

      if (existingSubmission) {
        // Update existing submission
        existingSubmission.fileUrl = fileUrl;
        existingSubmission.status = "Pending";
        await submissionsRepository.save(existingSubmission);

        // Send notification to challenge creator
        await NotificationController.createNotification(
          challenge.creator.id,
          "New Challenge Submission 📝",
          `${user.name} has updated their submission for challenge "${challenge.title}"`
        );

        return res.json(existingSubmission);
      }

      // Create new submission
      const submission = submissionsRepository.create({
        challenge,
        user,
        fileUrl,
        status: "Pending",
      });

      await submissionsRepository.save(submission);

      // Send notification to challenge creator
      await NotificationController.createNotification(
        challenge.creator.id,
        "New Challenge Submission 📝",
        `${user.name} has submitted proof for challenge "${challenge.title}"`
      );

      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ error: "Failed to create submission" });
    }
  }
}

export default new SubmissionsController();
