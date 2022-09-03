import { Role } from '../entity/Role';
import { IRole, IPermission } from '../helper';
import { getRepository, FindOneOptions } from 'typeorm';

class RoleRepository {
  async findOne(where = {}, relations = []): Promise<Role> {
    return await Role.findOne(where, { relations });
  }

  async findAll(): Promise<Role[]> {
    return await Role.find({
      select: ['internalId', 'name', 'default'],
      relations: ['permissions'],
      order: { internalId: 'ASC' },
    });
  }

  async update(criteria: any, updatedColumns: any) {
    const role = await this.findOne(criteria);
    role.name = updatedColumns.name;
    role.permissions = updatedColumns.permissions;
    return await role.save();
    // return await Role.update(criteria, updatedColumns)
  }
  async create(role: IRole): Promise<Role> {
    return await getRepository(Role).create(role).save();
  }
}

export default new RoleRepository();
