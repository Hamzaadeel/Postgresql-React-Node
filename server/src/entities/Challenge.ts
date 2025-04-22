import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Circle } from "./Circle";
import { User } from "./User";
import { ChallengeImages } from "./ChallengeImages";

@Entity("challenges")
export class Challenge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column("text")
  description: string;

  @Column()
  circleId: number;

  @Column()
  points: number;

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Circle)
  @JoinColumn({ name: "circleId" })
  circle: Circle;

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdBy" })
  creator: User;

  @OneToMany(() => ChallengeImages, (image) => image.challenge)
  images: ChallengeImages[];
}
