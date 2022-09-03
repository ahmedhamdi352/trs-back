import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, BeforeInsert, BeforeUpdate, OneToMany, ManyToOne } from 'typeorm';
import { DocumentStatusHistory } from './DocumentStatusHistory';
import { Role } from './Role';
import { hashSync, genSaltSync, compareSync } from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import _ from 'lodash';
import config from '../config';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  internalId: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @BeforeInsert()
  updatePasswordBeforeInsert() {
    this.password = this.hashPassword(this.password);
  }

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Role, (role) => role.user)
  role: Role;

  @OneToMany(() => DocumentStatusHistory, (history) => history.user)
  docStatusHistory: DocumentStatusHistory[];

  // Functions
  public validatePassword = (password: string): boolean => {
    return compareSync(password, this.password);
  };

  public hashPassword = (pw: string): string => {
    const { saltRounds } = config;
    return hashSync(pw, genSaltSync(Number(saltRounds)));
  };
  public generateAuthToken = (): string => {
    const { jwt } = config;
    const role = this.role?.name || null;
    const rolePermissions = this.role?.permissions || [];
    const permissions = _.mapValues(_.keyBy(rolePermissions, 'name'), () => true);

    return jsonwebtoken.sign({ id: this.internalId, username: this.username, role, permissions, phone: this.phone }, jwt.secret, {
      expiresIn: jwt.expires,
    });
  };
}
