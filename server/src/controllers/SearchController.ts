import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Challenge } from "../entities/Challenge";
import { Circle } from "../entities/Circle";
import { Tenant } from "../entities/Tenant";
import { User } from "../entities/User";
import { ILike } from "typeorm";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export class SearchController {
  static async globalSearch(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { query } = req.query;
      const limit = 5;
      const userRole = req.user?.role;

      if (!query || typeof query !== "string") {
        res.status(400).json({ message: "Search query is required" });
        return;
      }

      if (!userRole) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const searchPromises = [];

      // Both Employee and Moderator can search challenges and circles
      searchPromises.push(
        AppDataSource.getRepository(Challenge).find({
          where: [
            { title: ILike(`%${query}%`) },
            { description: ILike(`%${query}%`) },
          ],
          relations: ["circle"],
          take: limit,
          select: {
            id: true,
            title: true,
            description: true,
            points: true,
            circle: {
              id: true,
              name: true,
            },
          },
        })
      );

      searchPromises.push(
        AppDataSource.getRepository(Circle).find({
          where: { name: ILike(`%${query}%`) },
          relations: ["tenant"],
          take: limit,
          select: {
            id: true,
            name: true,
            tenant: {
              id: true,
              name: true,
            },
          },
        })
      );

      // Only Moderator can search tenants and users
      if (userRole === "Moderator") {
        searchPromises.push(
          AppDataSource.getRepository(Tenant).find({
            where: { name: ILike(`%${query}%`) },
            take: limit,
            select: {
              id: true,
              name: true,
            },
          })
        );

        searchPromises.push(
          AppDataSource.getRepository(User).find({
            where: [
              { name: ILike(`%${query}%`) },
              { email: ILike(`%${query}%`) },
            ],
            take: limit,
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          })
        );
      }

      const results = await Promise.all(searchPromises);
      const [challenges, circles, ...rest] = results;
      const [tenants = [], users = []] = userRole === "Moderator" ? rest : [];

      const response: any = {
        challenges: challenges.map((c) => ({
          ...c,
          type: "challenge",
          displayName: c.title,
          subtitle: `${c.points} points - ${c.circle.name}`,
        })),
        circles: circles.map((c) => ({
          ...c,
          type: "circle",
          displayName: c.name,
          subtitle: `Tenant: ${c.tenant.name}`,
        })),
      };

      // Only include tenant and user results for Moderators
      if (userRole === "Moderator") {
        response.tenants = tenants.map((t) => ({
          ...t,
          type: "tenant",
          displayName: t.name,
          subtitle: "Tenant",
        }));
        response.users = users.map((u) => ({
          ...u,
          type: "user",
          displayName: u.name,
          subtitle: `${u.role} - ${u.email}`,
        }));
      }

      res.json(response);
    } catch (error) {
      console.error("Error in global search:", error);
      res.status(500).json({ message: "Error performing search" });
    }
  }
}
