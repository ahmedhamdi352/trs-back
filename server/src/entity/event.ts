import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { Book } from './book';
import _ from 'lodash';

@Entity()
export class Event extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column()
  eventName: string;

  @Column()
  hotelName: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  numberOfBuses: number;

  @Column()
  numberOfRooms: number;

  @Column({ nullable: true })
  remainingRooms: number;

  @Column({ nullable: true })
  remainingChairs: number;

  @Column({ default: true })
  busOnly: boolean;

  @Column({ default: true })
  roomOnly: boolean;

  @Column({ nullable: true })
  color: string;

  @Column({ default: true })
  typeOfAccommodation: string;

  @OneToMany(() => Book, (u) => u.event)
  book: Book[];
}
