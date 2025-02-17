import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { ChallengeParticipants } from "../entities/ChallengeParticipants";
import { User } from "../entities/User";
import { Challenge } from "../entities/Challenge";

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
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if challenge exists
      const challengeRepository = AppDataSource.getRepository(Challenge);
      const challenge = await challengeRepository.findOne({
        where: { id: challengeId },
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
      res.status(201).json(newParticipation);
    } catch (error) {
      console.error("Error adding participant:", error);
      res.status(500).json({ message: "Error adding participant" });
    }
  }

  static async updateParticipantStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!status || !["Pending", "Completed"].includes(status)) {
        return res.status(400).json({ message: "Valid status is required" });
      }

      const participantsRepository = AppDataSource.getRepository(
        ChallengeParticipants
      );
      const participation = await participantsRepository.findOne({
        where: { id },
        relations: ["challenge"],
      });

      if (!participation) {
        return res.status(404).json({ message: "Participation not found" });
      }

      participation.status = status;

      // If the challenge is being completed, award the points
      if (status === "Completed") {
        participation.earnedPoints = participation.challenge.points;
      }

      await participantsRepository.save(participation);

      res.json(participation);
    } catch (error) {
      console.error("Error updating participant status:", error);
      res.status(500).json({ message: "Error updating participant status" });
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
}
