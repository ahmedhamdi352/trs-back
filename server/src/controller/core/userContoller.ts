import { RequestHandler } from 'express';
import { IUser } from '../../helper';
import { User } from '../../entity/User';
import ETAAuthController from '../ETA/authController';
import userRepository from '../../repository/user';
import taxAuthorityTokenRepository from '../../repository/taxAuthorityToken';
import { EHttpStatusCode, appPermissions } from '../../helper';
import { getRepository } from 'typeorm';
import { Role } from '../../entity/Role';

class UserController {
  public login: RequestHandler = async (req, res) => {
    try {
      const { username, password } = req.body;
      let user = await userRepository.findOne({ username, isActive: true }, [
        'role',
        'role.permissions',
      ]);
      console.log(user);
      if (user) {
        const isPasswordMatch = user.validatePassword(password);
        if (isPasswordMatch) {
          const userToken = user.generateAuthToken();
          const taxAuthorityTokens =
            await taxAuthorityTokenRepository.findAll();
          for (const token of taxAuthorityTokens) {
            const accessToken = await ETAAuthController.generateAccessToken(
              token.clientID,
              token.clientSecret
            );
            if (accessToken) {
              await taxAuthorityTokenRepository.update(
                { internalId: token.internalId },
                { accessToken }
              );
            } else
              return res
                .status(503)
                .json({ error: 'Failed to authenticate to tax authority' });
          }
          return res.json({
            token: 'Bearer ' + userToken,
          });
        } else {
          return res.status(400).json({ error: 'Invalid user credential' });
        }
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };

  public changePassword: RequestHandler = async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const { internalId } = req.user as IUser;
      const user = await userRepository.findOne({ internalId });
      if (user) {
        const isPasswordMatch = user.validatePassword(oldPassword);
        if (isPasswordMatch) {
          user.password = user.hashPassword(newPassword);
          const userSaved = await user.save();
          if (userSaved) {
            return res.json({ msg: 'User updated' });
          } else {
            return res
              .status(400)
              .json({ error: 'Something wrong when updating user' });
          }
        } else {
          return res.status(400).json({ error: 'Incorrect old password' });
        }
      } else {
        return res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };

  public getAllUsers: RequestHandler = async (req, res) => {
    try {
      const financeRole = await getRepository(Role).findOne({
        name: 'finance',
      });

      const users = await userRepository.findAll({
        role: { internalId: financeRole.internalId },
      });
      return res.json(users);
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };

  public getAllAdmins: RequestHandler = async (req, res) => {
    try {
      const AdminRole = await getRepository(Role).findOne({ name: 'admin' });

      const users = await userRepository.findAll({
        role: { internalId: AdminRole.internalId },
      });
      return res.json(users);
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };

  public getAllreceptionist: RequestHandler = async (req, res) => {
    try {
      const AdminRole = await getRepository(Role).findOne({ name: 'sales' });

      const users = await userRepository.findAll({
        role: { internalId: AdminRole.internalId },
      });
      return res.json(users);
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };

  public getAllfinance: RequestHandler = async (req, res) => {
    try {
      const AdminRole = await getRepository(Role).findOne({ name: 'finance' });

      const users = await userRepository.findAll({
        role: { internalId: AdminRole.internalId },
      });
      return res.json(users);
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };

  public createUser: RequestHandler = async (req, res) => {
    try {
      // Check If user has the authority to run this
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter(
        (p) => p.name === appPermissions.addUsers
      );
      if (!neededPermissions || !neededPermissions.length)
        return res
          .status(EHttpStatusCode.FORBIDDEN)
          .json({ message: 'Request not permitted' });

      console.log(req.body, 'body');
      const newUser = { ...req.body, role: { internalId: req.body.role } };
      const savedUser = await userRepository.create(newUser);
      const user = await userRepository.findOne(
        { internalId: savedUser.internalId },
        ['role']
      );
      return res.json(user);
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };
  public updateUser: RequestHandler = async (req, res) => {
    try {
      const reqUser = req.user as User;
      const userId = req.params.userId;
      const neededPermissions = reqUser.role.permissions.filter(
        (p) => p.name === appPermissions.updateUsers
      );
      if (!neededPermissions || !neededPermissions.length)
        return res
          .status(EHttpStatusCode.FORBIDDEN)
          .json({ message: 'Request not permitted' });
      const { raw } = await userRepository.update(
        { internalId: userId },
        { ...req.body }
      );
      if (raw) {
        const user = await userRepository.findOne(
          { internalId: userId },
          ['role'],
          [
            'internalId',
            'firstName',
            'lastName',
            'email',
            'username',
            'phone',
            'isActive',
            'role',
          ]
        );
        return res.json(user);
      } else {
        return res
          .status(500)
          .json({ error: 'There might be a problem. Please, try again.' });
      }
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };
  public deleteUser: RequestHandler = async (req, res) => {
    try {
      const reqUser = req.user as User;
      const userId = req.params.userId;
      const neededPermissions = reqUser.role.permissions.filter(
        (p) => p.name === appPermissions.deleteUsers
      );
      if (!neededPermissions || !neededPermissions.length)
        return res
          .status(EHttpStatusCode.FORBIDDEN)
          .json({ message: 'Request not permitted' });
      const user = await userRepository.findOne({ internalId: userId });
      if (!user)
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json({ error: 'Invalid User ID.' });
      if (user) {
        user.remove();
        return res.json(user);
      } else {
        return res
          .status(500)
          .json({ error: 'There might be a problem. Please, try again.' });
      }
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };
}
export default new UserController();
