import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { ChallengeParticipants } from "../entities/ChallengeParticipants";
import { User } from "../entities/User";
import { Challenge } from "../entities/Challenge";
import { Points } from "../entities/Points";
import { NotificationController } from "./NotificationController";
import { Circle } from "../entities/Circle";
import { Submissions } from "../entities/Submissions";

export class ChallengeParticipantsController {
  static async getParticipantsByChallenge(req: Request, res: Response) {
    try {
      const challengeId = parseInt(req.params.challengeId);
      const participantsRepository = AppDataSource.getRepository(
        ChallengeParticipants
      );

      const participants = await participantsRepository.find({
        where: { challenge: { id: challengeId } },
        relations: {
          user: true,
        },
        select: {
          id: true,
          status: true,
          user: {
            id: true,
            name: true,
            email: true,
          },
        },
      });

      res.json(participants);
    } catch (error) {
      console.error("Error fetching challenge participants:", error);
      res
        .status(500)
        .json({ message: "Error fetching challenge participants" });
    }
  }

  static async getParticipationsByUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const participantsRepository = AppDataSource.getRepository(
        ChallengeParticipants
      );

      const participations = await participantsRepository.find({
        where: {
          user: { id: userId },
        },
        relations: {
          challenge: true,
        },
        select: {
          id: true,
          status: true,
          challenge: {
            id: true,
            title: true,
            description: true,
            points: true,
            circle: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json(participations);
    } catch (error) {
      console.error("Error fetching user participations:", error);
      res.status(500).json({ message: "Error fetching user participations" });
    }
  }

  static async addParticipant(req: Request, res: Response) {
    try {
      const { userId, challengeId } = req.body;

      if (!userId || !challengeId) {
        return res
          .status(400)
          .json({ message: "User ID and Challenge ID are required" });
      }

      // Check if user exists
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: userId },
        select: ["id", "name"],
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if challenge exists and get creator info
      const challengeRepository = AppDataSource.getRepository(Challenge);
      const challenge = await challengeRepository.findOne({
        where: { id: challengeId },
        relations: ["circle", "creator"],
        select: {
          id: true,
          title: true,
          createdBy: true,
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
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      // Check if user is already participating
      const participantsRepository = AppDataSource.getRepository(
        ChallengeParticipants
      );
      const existingParticipation = await participantsRepository.findOne({
        where: {
          user: { id: userId },
          challenge: { id: challengeId },
        },
      });

      if (existingParticipation) {
        return res
          .status(400)
          .json({ message: "User is already participating in this challenge" });
      }

      // Create new participation
      const newParticipation = participantsRepository.create({
        user: { id: userId },
        challenge: { id: challengeId },
        status: "Pending",
      });

      await participantsRepository.save(newParticipation);

      // Send notification to the challenge creator (moderator)
      await NotificationController.createNotification(
        challenge.creator.id,
        "New Challenge Participant 🔥",
        `${user.name} has joined your challenge "${challenge.title}" in circle "${challenge.circle.name}"`
      );

      // Check if points entry already exists for the user
      const pointsRepository = AppDataSource.getRepository(Points);
      let userPoints = await pointsRepository.findOne({
        where: { userId: userId },
      });

      if (!userPoints) {
        userPoints = pointsRepository.create({
          userId: userId,
          totalPoints: 0,
        });
        await pointsRepository.save(userPoints);
      }

      res.status(201).json(newParticipation);
    } catch (error) {
      console.error("Error adding participant:", error);
      res.status(500).json({ message: "Error adding participant" });
    }
  }

  static async updateParticipantStatus(req: Request, res: Response) {
    try {
      const submissionId = parseInt(req.params.id);
      const { status, feedback } = req.body;

      if (!status || !["Approved", "Rejected", "Pending"].includes(status)) {
        return res.status(400).json({ message: "Valid status is required" });
      }

      const submissionsRepository = AppDataSource.getRepository(Submissions);
      const participantsRepository = AppDataSource.getRepository(
        ChallengeParticipants
      );

      // First, find the submission
      const submission = await submissionsRepository.findOne({
        where: { id: submissionId },
        relations: {
          challenge: {
            circle: true,
          },
          user: true,
        },
      });

      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      // Then find the corresponding challenge participant
      const participation = await participantsRepository.findOne({
        where: {
          challenge: { id: submission.challenge.id },
          user: { id: submission.user.id },
        },
        relations: {
          challenge: {
            circle: true,
            creator: true,
          },
          user: true,
        },
      });

      if (!participation) {
        return res
          .status(404)
          .json({ message: "Challenge participation not found" });
      }

      const previousStatus = participation.status;

      // Update submission status and feedback
      submission.status = status;
      submission.feedback = feedback;

      // Update participation status based on submission status
      participation.status = status === "Approved" ? "Completed" : "Pending";

      // If the challenge is being approved and wasn't completed before
      if (status === "Approved" && previousStatus !== "Completed") {
        participation.earnedPoints = participation.challenge.points;

        // Send notification to the user
        await NotificationController.createNotification(
          participation.user.id,
          "Challenge Approved ✨",
          `Your submission for "${
            participation.challenge.title
          }" has been approved! You earned ${
            participation.earnedPoints
          } points.${feedback ? ` Feedback: ${feedback}` : ""}`
        );

        // Update points in the Points table
        const pointsRepository = AppDataSource.getRepository(Points);
        let userPoints = await pointsRepository.findOne({
          where: { userId: participation.user.id },
        });

        if (!userPoints) {
          userPoints = pointsRepository.create({
            userId: participation.user.id,
            totalPoints: participation.earnedPoints,
          });
        } else {
          userPoints.totalPoints += participation.earnedPoints;
        }
        await pointsRepository.save(userPoints);
      } else if (status === "Rejected") {
        // Send rejection notification to the user
        await NotificationController.createNotification(
          participation.user.id,
          "Challenge Submission Rejected",
          `Your submission for "${
            participation.challenge.title
          }" was not approved.${feedback ? ` Feedback: ${feedback}` : ""}`
        );
      }

      // Save both records
      await Promise.all([
        participantsRepository.save(participation),
        submissionsRepository.save(submission),
      ]);

      res.json({
        message: `Submission ${status.toLowerCase()} successfully`,
        participation,
        submission,
      });
    } catch (error) {
      console.error("Error updating submission status:", error);
      res.status(500).json({ message: "Error updating submission status" });
    }
  }

  static async removeParticipant(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const participantsRepository = AppDataSource.getRepository(
        ChallengeParticipants
      );

      const participation = await participantsRepository.findOne({
        where: { id },
      });
      if (!participation) {
        return res.status(404).json({ message: "Participation not found" });
      }

      await participantsRepository.remove(participation);
      res.json({ message: "Participant removed successfully" });
    } catch (error) {
      console.error("Error removing participant:", error);
      res.status(500).json({ message: "Error removing participant" });
    }
  }

  static async getUserChallengeStatus(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);

      // Validate userId
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const participantsRepository = AppDataSource.getRepository(
        ChallengeParticipants
      );

      const participations = await participantsRepository.find({
        where: {
          user: { id: userId },
        },
        relations: {
          challenge: true,
        },
        select: {
          id: true,
          status: true,
          earnedPoints: true,
          challenge: {
            id: true,
            title: true,
            description: true,
            points: true,
            circle: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Map the response to include challengeId at the top level
      const formattedParticipations = participations.map((participation) => ({
        id: participation.id,
        challengeId: participation.challenge.id,
        status: participation.status,
        earnedPoints: participation.earnedPoints,
      }));

      // Return empty array if no participations found
      res.json(formattedParticipations || []);
    } catch (error) {
      console.error("Error fetching user challenge status:", error);
      res.status(500).json({ message: "Error fetching user challenge status" });
    }
  }

  static async getPendingSubmissions(req: Request, res: Response) {
    try {
      const submissionsRepository = AppDataSource.getRepository(Submissions);

      const pendingSubmissions = await submissionsRepository.find({
        where: { status: "Pending" },
        relations: {
          user: true,
          challenge: {
            circle: true,
          },
        },
        select: {
          id: true,
          status: true,
          fileUrl: true,
          user: {
            id: true,
            name: true,
            email: true,
          },
          challenge: {
            id: true,
            title: true,
            circle: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json(pendingSubmissions);
    } catch (error) {
      console.error("Error fetching pending submissions:", error);
      res.status(500).json({ message: "Error fetching pending submissions" });
    }
  }

  static async approveSubmission(req: Request, res: Response) {
    try {
      const submissionId = parseInt(req.params.id);
      const { feedback } = req.body;

      // Set the status and pass along the feedback
      req.body = {
        status: "Approved",
        feedback: feedback || "",
      };

      await ChallengeParticipantsController.updateParticipantStatus(req, res);
    } catch (error) {
      console.error("Error approving submission:", error);
      res.status(500).json({ message: "Error approving submission" });
    }
  }

  static async rejectSubmission(req: Request, res: Response) {
    try {
      const submissionId = parseInt(req.params.id);
      const { feedback } = req.body;

      // Set the status and pass along the feedback
      req.body = {
        status: "Rejected",
        feedback: feedback || "",
      };

      await ChallengeParticipantsController.updateParticipantStatus(req, res);
    } catch (error) {
      console.error("Error rejecting submission:", error);
      res.status(500).json({ message: "Error rejecting submission" });
    }
  }
}
