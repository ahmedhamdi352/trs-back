import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity()
export class InvoiceLineUnitValue extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column()
  currencySold: string;

  @Column()
  amountEGP: number;

  @Column({ nullable: true })
  amountSold: number;

  @Column({ nullable: true })
  currencyExchangeRate: number;
}
