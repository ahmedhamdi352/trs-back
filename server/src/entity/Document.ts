import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, CreateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Company } from './Company';
import { CompanyAddress } from './CompanyAddress';
import { InvoiceLine } from './InvoiceLine';
import { DocumentTaxTotal } from './DocumentTaxTotal';
import { DocumentStatusHistory } from './DocumentStatusHistory';
import { DocumentError } from './DocumentError';
import { EDocumentStatus } from '../helper';

@Entity()
export class Document extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column()
  createdBy: number;

  @Column({ nullable: true })
  uuid: string;

  @Column({ nullable: true })
  submissionUUID: string;

  @Column({ nullable: true })
  longId: string;

  @Column({ nullable: true, unique: true })
  docInternalId: string;

  @Column({ default: EDocumentStatus.pending })
  status: string;

  @Column()
  orgId: string;

  @Column()
  documentType: string;

  @Column()
  documentTypeVersion: string;

  @Column()
  dateTimeIssued: Date;

  @Column()
  taxpayerActivityCode: string;

  @Column()
  purchaseOrderReference: string;

  @Column()
  purchaseOrderDescription: string;

  @Column()
  salesOrderReference: string;

  @Column()
  salesOrderDescription: string;

  @Column()
  totalSalesAmount: number;

  @Column()
  totalDiscountAmount: number;

  @Column()
  netAmount: number;

  @Column()
  extraDiscountAmount: number;

  @Column()
  totalItemsDiscountAmount: number;

  @Column()
  totalAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Company, (issuer) => issuer.document)
  issuer: Company;

  @ManyToOne(() => CompanyAddress, (addr) => addr.document)
  issuerAddress: CompanyAddress;

  @ManyToOne(() => Company, (receiver) => receiver.document)
  receiver: Company;

  @ManyToOne(() => CompanyAddress, (addr) => addr.document)
  receiverAddress: CompanyAddress;

  @OneToMany(() => InvoiceLine, (invoiceLine) => invoiceLine.document)
  invoiceLines: InvoiceLine[];

  @OneToMany(() => DocumentTaxTotal, (taxTotal) => taxTotal.document)
  taxTotals: DocumentTaxTotal[];

  @OneToMany(() => DocumentStatusHistory, (history) => history.document)
  statusHistory: DocumentStatusHistory[];

  // @OneToMany(() => DocumentError, (err) => err.document)
  // error: DocumentError[];
  @OneToOne(() => DocumentError)
  @JoinColumn()
  error: DocumentError;
}
