import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import _ from 'lodash';

@Entity()
export class Client extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ unique: true })
  userId: string;

  @Column({ unique: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;
}
