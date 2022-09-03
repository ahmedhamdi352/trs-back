import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, OneToMany } from 'typeorm';
import { Company } from './Company';
import { Document } from './Document';

@Entity()
export class CompanyAddress extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column({ nullable: true })
  branchId: string;

  @Column()
  country: string;

  @Column()
  governate: string;

  @Column()
  regionCity: string;

  @Column()
  street: string;

  @Column()
  buildingNumber: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  floor: string;

  @Column({ nullable: true })
  room: string;

  @Column({ nullable: true })
  landmark: string;

  @Column({ nullable: true })
  additionalInformation: string;

  @ManyToOne(() => Company, (company) => company.addresses)
  company: Company;

  @OneToMany(() => Document, (doc) => doc.issuer)
  document: Document[];
}
