import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Tenant } from "./Tenant";
import { User } from "./User";

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
}
