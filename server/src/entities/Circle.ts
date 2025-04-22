import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Tenant } from "./Tenant";
import { User } from "./User";
import { CircleParticipants } from "./CircleParticipants";
import { CircleImages } from "./CircleImages";

@Entity("circles")
export class Circle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  tenantId: number;

  @Column()
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdBy" })
  creator: User;

  @OneToMany(
    () => CircleParticipants,
    (circleParticipants) => circleParticipants.circle
  )
  circleParticipants: CircleParticipants[];

  @OneToMany(() => CircleImages, (image) => image.circle)
  images: CircleImages[];
}
