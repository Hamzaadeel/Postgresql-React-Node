import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export type UserRole = "moderator" | "employee"; // Define allowed roles

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: ["moderator", "employee"],
    default: "employee",
  })
  role: string;
}
