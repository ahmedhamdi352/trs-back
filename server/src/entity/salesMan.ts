import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import _ from 'lodash';
import { Book } from './book';

@Entity()
export class SalesMan extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  percentage: number;

  @OneToMany(() => Book, (u) => u.sales)
  book: Book[];
}
