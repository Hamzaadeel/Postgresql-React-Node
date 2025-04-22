import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Challenge } from "./Challenge";

@Entity("challenge_participants")
export class ChallengeParticipants {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Challenge, { eager: true })
  @JoinColumn({ name: "challengeId" })
  challenge: Challenge;

  @Column({
    type: "enum",
    enum: ["Pending", "Completed", "Rejected"],
    default: "Pending",
  })
  status: "Pending" | "Completed" | "Rejected";

  @Column({ type: "int", nullable: true })
  earnedPoints: number;
}
