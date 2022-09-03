import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { InvoiceLine } from './InvoiceLine';

@Entity()
export class InvoiceLineTaxableItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column()
  taxType: string;

  @Column()
  amount: number;

  @Column()
  subType: string;

  @Column()
  rate: number;

  @ManyToOne(() => InvoiceLine, (invoiceLine) => invoiceLine.taxableItems)
  invoiceLine: InvoiceLine;
}
