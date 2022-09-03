import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { InvoiceLineTaxableItem } from './InvoiceLineTaxableItem';
import { InvoiceLineUnitValue } from './InvoiceLineUnitValue';
import { Document } from './Document';

@Entity()
export class InvoiceLine extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column()
  description: string;

  @Column()
  itemType: string;

  @Column()
  itemCode: string;

  @Column()
  unitType: string;

  @Column()
  quantity: number;

  @Column()
  salesTotal: number;

  @Column()
  total: number;

  @Column()
  valueDifference: number;

  @Column()
  totalTaxableFees: number;

  @Column()
  netTotal: number;

  @Column()
  itemsDiscount: number;

  @Column()
  internalCode: string;

  @ManyToOne(() => Document, (doc) => doc.invoiceLines)
  document: Document;

  @OneToOne(() => InvoiceLineUnitValue)
  @JoinColumn()
  unitValue: InvoiceLineUnitValue;

  @OneToMany(() => InvoiceLineTaxableItem, (taxableItem) => taxableItem.invoiceLine)
  taxableItems: InvoiceLineTaxableItem[];
}
