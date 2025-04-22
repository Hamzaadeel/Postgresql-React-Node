import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("points")
export class Points {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  totalPoints: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.points)
  @JoinColumn({ name: "userId" })
  user: User;

  @UpdateDateColumn()
  updatedAt: Date;
}
