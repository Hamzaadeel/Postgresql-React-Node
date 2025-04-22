import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from "typeorm";
import { Challenge } from "./Challenge";

@Entity("challenge_images")
export class ChallengeImages {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Challenge, (challenge) => challenge.images)
  @JoinColumn({ name: "challengeId" })
  challenge: Challenge;

  @Column({ type: "text" })
  image_path: string; // Path to the image in S3
}
