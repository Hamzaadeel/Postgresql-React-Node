import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Points } from "../entities/Points";
import { ChallengeParticipants } from "../entities/ChallengeParticipants";
import { User } from "../entities/User";

export class PointsController {
  static async getTotalPoints(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const pointsRepository = AppDataSource.getRepository(Points);
      const challengeParticipantsRepository = AppDataSource.getRepository(
        ChallengeParticipants
      );

      // Get all completed challenges and their earned points
      const completedChallenges = await challengeParticipantsRepository.find({
        where: {
          user: { id: parseInt(userId) },
          status: "Completed",
        },
      });

      // Calculate total points from completed challenges
      const totalEarnedPoints = completedChallenges.reduce(
        (sum, challenge) => sum + (challenge.earnedPoints || 0),
        0
      );

      // Get or create points record
      let userPoints = await pointsRepository.findOne({
        where: { userId: parseInt(userId) },
      });

      if (!userPoints) {
        userPoints = pointsRepository.create({
          userId: parseInt(userId),
          totalPoints: totalEarnedPoints,
        });
        await pointsRepository.save(userPoints);
      } else {
        // Update total points if different
        if (userPoints.totalPoints !== totalEarnedPoints) {
          userPoints.totalPoints = totalEarnedPoints;
          await pointsRepository.save(userPoints);
        }
      }

      res.json({ totalPoints: userPoints.totalPoints });
    } catch (error) {
      console.error("Error fetching total points:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getLeaderboard(req: Request, res: Response) {
    try {
      const pointsRepository = AppDataSource.getRepository(Points);
      const tenantId = req.query.tenantId; // Get tenant ID from query parameters

      const leaderboard = await pointsRepository
        .createQueryBuilder("points")
        .leftJoinAndSelect("points.user", "user")
        .where("user.tenantId = :tenantId", { tenantId }) // Filter by tenant ID
        .select(["points.id", "points.totalPoints", "user.id", "user.name"])
        .orderBy("points.totalPoints", "DESC")
        .take(5)
        .getMany();

      // Format the response
      const formattedLeaderboard = leaderboard.map((entry) => ({
        id: entry.id,
        name: entry.user.name,
        totalPoints: entry.totalPoints,
      }));

      res.json(formattedLeaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Error fetching leaderboard" });
    }
  }
}
