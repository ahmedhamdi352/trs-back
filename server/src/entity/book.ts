import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  JoinTable,
  ManyToMany,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { DocumentStatusHistory } from './DocumentStatusHistory';
import { Role } from './Role';
import { hashSync, genSaltSync, compareSync } from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import _ from 'lodash';
import config from '../config';
import { Client } from './Client';
import { Event } from './event';
import { SalesMan } from './salesMan';

@Entity()
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column()
  bookOwner: string;

  @Column()
  bookPhone: string;

  @Column()
  numberOfClients: number;

  @Column({ default: 'normal', nullable: true })
  type: string;

  @Column({ nullable: true })
  numberOfRooms: number;

  @Column({ nullable: true })
  numberOfChairs: string;

  @Column()
  totalPrice: number;

  @Column({ default: 0 })
  remainingMoney: number;

  @Column()
  paymentMethod: string;

  @ManyToMany(() => Client)
  @JoinTable()
  clients: Client[];

  @ManyToOne(() => Event, (event) => event.book)
  event: Event;

  @ManyToOne(() => SalesMan, (salesMan) => salesMan.book)
  sales: SalesMan;
}
