import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Challenge } from "./Challenge";

@Entity("challenge_participants")
export class ChallengeParticipants {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Challenge)
  @JoinColumn({ name: "challengeId" })
  challenge: Challenge;

  @Column({
    type: "enum",
    enum: ["Pending", "Completed"],
    default: "Pending",
  })
  status: string;

  @Column({ type: "int", default: 0 })
  earnedPoints: number;
}
