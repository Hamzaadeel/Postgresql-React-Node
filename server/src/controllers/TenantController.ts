import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Tenant } from "../entities/Tenant";
import { User } from "../entities/User";
import { ILike } from "typeorm";

// Extend Request type to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export class TenantController {
  static async getTenants(req: Request, res: Response) {
    try {
      const { search, sortBy, order } = req.query;
      const tenantRepository = AppDataSource.getRepository(Tenant);

      const queryOptions: any = {
        order: {},
      };

      if (search) {
        queryOptions.where = {
          name: ILike(`%${search}%`),
        };
      }

      // Determine sorting
      if (sortBy === "createdAt") {
        queryOptions.order.createdAt =
          (order as string)?.toUpperCase() || "DESC"; // Sort by createdAt with specified order
      } else if (sortBy === "totalEmployees") {
        // Sort by total employees logic will be handled after fetching tenants
      } else {
        queryOptions.order.name = "ASC"; // Default sort by name
      }

      const tenants = await tenantRepository.find(queryOptions);

      // Fetch employee counts for each tenant
      const tenantWithEmployeeCounts = await Promise.all(
        tenants.map(async (tenant) => {
          const employeeCount = await AppDataSource.getRepository(User).count({
            where: { tenantId: tenant.id },
          });
          return { ...tenant, employeeCount };
        })
      );

      // Sort by total employees if specified
      if (sortBy === "totalEmployees") {
        tenantWithEmployeeCounts.sort(
          (a, b) => b.employeeCount - a.employeeCount
        );
      }

      res.json(tenantWithEmployeeCounts);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      res.status(500).json({ message: "Error fetching tenants" });
    }
  }

  static async createTenant(req: AuthenticatedRequest, res: Response) {
    try {
      const { name } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!name) {
        return res.status(400).json({ message: "Tenant name is required" });
      }

      const tenantRepository = AppDataSource.getRepository(Tenant);

      // Check if tenant with same name exists
      const existingTenant = await tenantRepository.findOne({
        where: { name },
      });
      if (existingTenant) {
        return res
          .status(400)
          .json({ message: "Tenant with this name already exists" });
      }

      const newTenant = tenantRepository.create({
        name,
        createdBy: userId,
      });

      await tenantRepository.save(newTenant);
      res.status(201).json(newTenant);
    } catch (error) {
      console.error("Error creating tenant:", error);
      res.status(500).json({ message: "Error creating tenant" });
    }
  }

  static async updateTenant(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Tenant name is required" });
      }

      const tenantRepository = AppDataSource.getRepository(Tenant);
      const tenant = await tenantRepository.findOne({ where: { id } });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      // Check if new name is already taken by another tenant
      const existingTenant = await tenantRepository.findOne({
        where: { name },
      });
      if (existingTenant && existingTenant.id !== id) {
        return res
          .status(400)
          .json({ message: "Tenant with this name already exists" });
      }

      tenant.name = name;
      await tenantRepository.save(tenant);
      res.json(tenant);
    } catch (error) {
      console.error("Error updating tenant:", error);
      res.status(500).json({ message: "Error updating tenant" });
    }
  }

  static async deleteTenant(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const tenantRepository = AppDataSource.getRepository(Tenant);

      const tenant = await tenantRepository.findOne({ where: { id } });
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      await tenantRepository.remove(tenant);
      res.json({ message: "Tenant deleted successfully" });
    } catch (error) {
      console.error("Error deleting tenant:", error);
      res.status(500).json({ message: "Error deleting tenant" });
    }
  }
}
