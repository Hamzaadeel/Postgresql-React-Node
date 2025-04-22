import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Tenant } from "./Tenant";
import { CircleParticipants } from "./CircleParticipants";
import { Points } from "./Points";

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

  @ManyToOne(() => Tenant, (tenant) => tenant.users)
  tenant: Tenant;

  @Column({ nullable: true })
  tenantId: number;

  @OneToMany(
    () => CircleParticipants,
    (circleParticipants) => circleParticipants.user
  )
  circleParticipants: CircleParticipants[];

  @OneToMany(() => Points, (points) => points.user)
  points: Points[];

  @Column({ nullable: true })
  profile_picture_path: string;
}
