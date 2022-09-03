import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Document } from './Document';

@Entity()
export class DocumentStatusHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column()
  status: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.docStatusHistory)
  user: User;

  @CreateDateColumn()
  changedDate: Date;

  @ManyToOne(() => Document, (doc) => doc.statusHistory)
  document: Document;
}
