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

@Entity("submissions")
export class Submissions {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Challenge)
  @JoinColumn({ name: "challengeId" })
  challenge: Challenge;

  @Column({ type: "text" })
  fileUrl: string;

  @Column({
    type: "enum",
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  })
  status: "Pending" | "Approved" | "Rejected";

  @Column({ type: "text", nullable: true })
  feedback: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
