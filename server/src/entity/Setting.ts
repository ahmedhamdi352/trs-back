import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import config from '../config';
// import { Document } from './Document';

let { dbConfig }: any = config;
let textColumnType = 'clob'
if (dbConfig.type == 'mysql')
  textColumnType = 'text'


@Entity()
export class Setting extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column()
  name: string;

  @Column(textColumnType)
  value: string;
}
