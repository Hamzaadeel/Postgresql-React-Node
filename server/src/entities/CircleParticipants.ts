import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User"; // Import the User entity
import { Circle } from "./Circle"; // Import the Circle entity

@Entity("circle_participants") // Name of the table in the database
export class CircleParticipants {
  @PrimaryGeneratedColumn()
  id: number; // Unique identifier for each record

  @ManyToOne(() => User, (user) => user.circleParticipants) // Many participants can belong to one user
  @JoinColumn({ name: "userId" }) // Foreign key column name
  user: User; // Reference to the User entity

  @ManyToOne(() => Circle, (circle) => circle.circleParticipants) // Many participants can belong to one circle
  @JoinColumn({ name: "circleId" }) // Foreign key column name
  circle: Circle; // Reference to the Circle entity
}
