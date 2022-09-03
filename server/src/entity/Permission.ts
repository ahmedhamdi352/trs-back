import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";

@Entity()
export class Permission extends BaseEntity {

    @PrimaryGeneratedColumn()
    internalId: number;

    @Column()
    name: string;

}