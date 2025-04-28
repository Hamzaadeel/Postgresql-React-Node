import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: [isProduction ? "dist/entities/*.js" : "src/entities/*.ts"],
  migrations: [isProduction ? "dist/migrations/*.js" : "src/migrations/*.ts"],
  subscribers: [],
});

AppDataSource.initialize()
  .then(() => console.log("📦 Database connected successfully!"))
  .catch((error) => console.error("Database connection error:", error));
