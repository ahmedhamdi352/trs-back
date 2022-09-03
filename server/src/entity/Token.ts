import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Company } from './Company';

@Entity()
export class Token extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column()
  pin: string;

  @Column({ nullable: true })
  port: string;

  @Column()
  clientID: string;

  @Column()
  clientSecret: string

  @Column({ nullable: true, length: 2000 })
  accessToken: string

  @OneToOne(() => Company, (company) => company.token)
  @JoinColumn()
  company: Company;
}