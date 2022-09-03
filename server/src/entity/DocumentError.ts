import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn } from 'typeorm';
import config from '../config';
// import { Document } from './Document';

let { dbConfig }: any = config;
let textColumnType = 'clob'
if (dbConfig.type == 'mysql')
  textColumnType = 'text'

@Entity()
export class DocumentError extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column()
  code: number;

  @Column()
  message: string;

  @Column()
  target: string;

  @Column(textColumnType)
  details: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  documentUUID: string;
}
