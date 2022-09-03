import { RequestHandler } from 'express';
import roleRepository from '../../repository/role';
import userRepoistory from '../../repository/user';
import { EHttpStatusCode, appPermissions } from '../../helper';
import { getManager, getRepository, Not } from 'typeorm';
import { Permission } from '../../entity/Permission';
import { Role } from '../../entity/Role';
import { User } from '../../entity/User';

class RoleController {
  public createRole: RequestHandler = async (req, res) => {
    try {
      // Check If user has the authority to run this
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter((p) => p.name === appPermissions.manageRoles);
      if (!neededPermissions || !neededPermissions.length) return res.status(EHttpStatusCode.FORBIDDEN).json({ message: 'Request not permitted' });
      const { name, permissions } = req.body;
      if (!name || !permissions || !permissions.length) return res.status(EHttpStatusCode.BAD_REQUEST).json({ error: 'Invalid arguments.' });
      const isRoleExist = await roleRepository.findOne({ name });
      if (isRoleExist) return res.status(EHttpStatusCode.CONFLICT).json({ message: 'Resource already exists' });
      const permissionsObjs = await getManager()
        .createQueryBuilder(Permission, 'permission')
        .where('permission.internalId IN (:...permissions)', { permissions })
        .getMany();
      const role = await getRepository(Role).create({ name: name, permissions: permissionsObjs }).save();
      return res.json(role);
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };

  public updateRole: RequestHandler = async (req, res) => {
    try {
      // Check If user has the authority to run this
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter((p) => p.name === appPermissions.manageRoles);
      if (!neededPermissions || !neededPermissions.length) return res.status(EHttpStatusCode.FORBIDDEN).json({ message: 'Request not permitted' });
      const roleId = req.params.roleId;
      const { name, permissions } = req.body;
      if (!name || !permissions || !permissions.length) return res.status(EHttpStatusCode.BAD_REQUEST).json({ error: 'Invalid arguments.' });
      const permissionsObjs = await getManager()
        .createQueryBuilder(Permission, 'permission')
        .where('permission.internalId IN (:...permissions)', { permissions })
        .getMany();
      const isRoleExist = await roleRepository.findOne({ name, internalId: Not(roleId) });
      if (isRoleExist) return res.status(EHttpStatusCode.CONFLICT).json({ message: 'Resource already exists' });
      const role = await roleRepository.update({ internalId: roleId }, { name, permissions: permissionsObjs });
      return res.json(role);
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };

  public assignRoleToUser: RequestHandler = async (req, res) => {
    try {
      // Check If user has the authority to run this
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter((p) => p.name === appPermissions.assignUserRoles);
      if (!neededPermissions || !neededPermissions.length) return res.status(EHttpStatusCode.FORBIDDEN).json({ message: 'Request not permitted' });

      const { userId, roleId } = req.body;
      if (!userId || !roleId) return res.status(EHttpStatusCode.BAD_REQUEST).json({ error: 'Invalid arguments.' });

      const user = await userRepoistory.findOne({ internalId: userId });
      const role = await roleRepository.findOne({ internalId: roleId });
      user.role = role;
      await user.save();
      return res.json(user);
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };

  public deleteRole: RequestHandler = async (req, res) => {
    try {
      // Check If user has the authority to run this
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter((p) => p.name === appPermissions.manageRoles);
      if (!neededPermissions || !neededPermissions.length) return res.status(EHttpStatusCode.FORBIDDEN).json({ message: 'Request not permitted' });

      const roleId = req.params.roleId;
      if (!roleId) return res.status(EHttpStatusCode.BAD_REQUEST).json({ error: 'Invalid arguments.' });

      const role = await roleRepository.findOne({ internalId: roleId }, ['user', 'permissions']);
      if (!role) return res.status(EHttpStatusCode.BAD_REQUEST).json({ error: 'Invalid Role ID.' });
      if (role.default) return res.status(EHttpStatusCode.BAD_REQUEST).json({ error: 'You cannot delete default role.' });
      if (role.user && role.user.length)
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json({ error: 'You cannot delete this role as it is assigned to some users', users: role.user.map((u) => u.username) });

      // Delete Role-permissions records
      role.permissions = role.permissions.filter((perm) => perm.internalId < 0);
      await getManager().save(role);
      // Delete the role entity
      role.remove();
      return res.json(role);
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };

  public getRoles: RequestHandler = async (req, res) => {
    try {
      // Check If user has the authority to run this
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter((p) => p.name === appPermissions.manageRoles);
      if (!neededPermissions || !neededPermissions.length) return res.status(EHttpStatusCode.FORBIDDEN).json({ message: 'Request not permitted' });

      const roles = await roleRepository.findAll();
      return res.json(roles);
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };

  public getPermissions: RequestHandler = async (req, res) => {
    try {
      // Check If user has the authority to run this
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter((p) => p.name === appPermissions.manageRoles);
      if (!neededPermissions || !neededPermissions.length) return res.status(EHttpStatusCode.FORBIDDEN).json({ message: 'Request not permitted' });

      const permissions = await getRepository(Permission).find({ order: { internalId: 'ASC' } });
      return res.json(permissions);
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };
}

export default new RoleController();
