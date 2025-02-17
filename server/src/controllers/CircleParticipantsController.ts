import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { CircleParticipants } from "../entities/CircleParticipants"; // Import the CircleParticipants entity
import { User } from "../entities/User"; // Import the User entity
import { Circle } from "../entities/Circle"; // Import the Circle entity

export class CircleParticipantsController {
  // Add a user to a circle
  static async addUserToCircle(req: Request, res: Response) {
    const { userId, circleId } = req.body;

    try {
      const circleParticipantsRepository =
        AppDataSource.getRepository(CircleParticipants);

      // Check if the user and circle exist
      const user = await AppDataSource.getRepository(User).findOne({
        where: { id: userId },
      });
      const circle = await AppDataSource.getRepository(Circle).findOne({
        where: { id: circleId },
      });

      if (!user || !circle) {
        return res.status(404).json({ message: "User or Circle not found" });
      }

      const circleParticipant = circleParticipantsRepository.create({
        user,
        circle,
      });
      await circleParticipantsRepository.save(circleParticipant);
      res.status(201).json({ message: "User added to circle successfully" });
    } catch (error) {
      console.error("Error adding user to circle:", error);
      res.status(500).json({ message: "Error adding user to circle" });
    }
  }

  // Get participants of a circle
  static async getCircleParticipants(req: Request, res: Response) {
    const circleId = parseInt(req.params.circleId);

    try {
      const circleParticipantsRepository =
        AppDataSource.getRepository(CircleParticipants);
      const participants = await circleParticipantsRepository.find({
        where: { circle: { id: circleId } },
        relations: ["user"], // Include user details
      });

      res.json(participants);
    } catch (error) {
      console.error("Error fetching circle participants:", error);
      res.status(500).json({ message: "Error fetching circle participants" });
    }
  }

  // Remove a user from a circle
  static async removeUserFromCircle(req: Request, res: Response) {
    const { userId, circleId } = req.body;

    try {
      const circleParticipantsRepository =
        AppDataSource.getRepository(CircleParticipants);
      const participant = await circleParticipantsRepository.findOne({
        where: { user: { id: userId }, circle: { id: circleId } },
      });

      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }

      await circleParticipantsRepository.remove(participant);
      res.json({ message: "User removed from circle successfully" });
    } catch (error) {
      console.error("Error removing user from circle:", error);
      res.status(500).json({ message: "Error removing user from circle" });
    }
  }

  static async getParticipantsByCircle(req: Request, res: Response) {
    try {
      const circleId = parseInt(req.params.circleId);
      const participantsRepository =
        AppDataSource.getRepository(CircleParticipants);

      const participants = await participantsRepository.find({
        where: { circle: { id: circleId } },
        relations: {
          user: true,
        },
        select: {
          id: true,
          user: {
            id: true,
            name: true,
            email: true,
          },
        },
      });

      res.json(participants);
    } catch (error) {
      console.error("Error fetching circle participants:", error);
      res.status(500).json({ message: "Error fetching circle participants" });
    }
  }

  static async getParticipationsByUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const participantsRepository =
        AppDataSource.getRepository(CircleParticipants);

      const participations = await participantsRepository.find({
        where: { user: { id: userId } },
        relations: {
          circle: true,
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
      const { userId, circleId } = req.body;

      if (!userId || !circleId) {
        return res
          .status(400)
          .json({ message: "User ID and Circle ID are required" });
      }

      // Check if user exists
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if circle exists
      const circleRepository = AppDataSource.getRepository(Circle);
      const circle = await circleRepository.findOne({
        where: { id: circleId },
      });
      if (!circle) {
        return res.status(404).json({ message: "Circle not found" });
      }

      // Check if user is already a participant
      const participantsRepository =
        AppDataSource.getRepository(CircleParticipants);
      const existingParticipation = await participantsRepository.findOne({
        where: {
          user: { id: userId },
          circle: { id: circleId },
        },
      });

      if (existingParticipation) {
        return res
          .status(400)
          .json({ message: "User is already a participant in this circle" });
      }

      // Create new participation
      const newParticipation = participantsRepository.create({
        user,
        circle,
      });

      await participantsRepository.save(newParticipation);
      res.status(201).json(newParticipation);
    } catch (error) {
      console.error("Error adding participant:", error);
      res.status(500).json({ message: "Error adding participant" });
    }
  }

  static async removeParticipant(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const participantsRepository =
        AppDataSource.getRepository(CircleParticipants);

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
}
