import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from "typeorm";
import { Circle } from "./Circle";

@Entity("circle_images")
export class CircleImages {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Circle, (circle) => circle.images)
  @JoinColumn({ name: "circleId" })
  circle: Circle;

  @Column({ type: "text" })
  image_path: string; // Path to the image in S3
}
