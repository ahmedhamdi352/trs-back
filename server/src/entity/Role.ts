import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';
import {Permission} from './Permission';

@Entity()
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column({unique: true})
  name: string;

  @Column({default: false})
  default: boolean

  @OneToMany(() => User, (u) => u.role)
  user: User[];

  @ManyToMany(() => Permission)
  @JoinTable()
  permissions: Permission[];
}
