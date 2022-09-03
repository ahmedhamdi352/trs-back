import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { CompanyAddress } from './CompanyAddress';
import { Document } from './Document';
import { Token } from './Token';

@Entity()
export class Company extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  taxNumber: string;

  @OneToMany(() => CompanyAddress, (addr) => addr.company)
  addresses: CompanyAddress[];

  @OneToMany(() => Document, (doc) => doc.issuer)
  document: Document[];

  @OneToOne(() => Token, (token) => token.company)
  token: Token;
}
