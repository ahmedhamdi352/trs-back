import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Document } from './Document';
@Entity()
export class DocumentTaxTotal extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column()
  taxType: string;

  @Column()
  amount: number;

  @ManyToOne(() => Document, (doc) => doc.taxTotals)
  document: Document;
}
