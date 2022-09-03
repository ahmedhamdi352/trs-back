import { RequestHandler } from 'express';
import { ISaleMan } from '../../helper';
import { User } from '../../entity/User';
import ETAAuthController from '../ETA/authController';
import userRepository from '../../repository/client';
import taxAuthorityTokenRepository from '../../repository/taxAuthorityToken';
import { EHttpStatusCode, appPermissions } from '../../helper';
import { getRepository } from 'typeorm';
import { Role } from '../../entity/Role';

class UserController {
  public getAllUsers: RequestHandler = async (req, res) => {
    try {
      const users = await userRepository.findAll();
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

      const newUser = { ...req.body };
      const savedUser = await userRepository.create(newUser);
      const user = await userRepository.findOne(
        { internalId: savedUser.internalId },
        ['internalId', 'name', 'address', 'phone', 'userId', 'isActive']
      );
      console.log(user);
      return res.json(user);
    } catch (error) {
      console.log('catch_error', error);
      return res.status(500).json({
        error: error ? error : 'There might be a problem. Please, try again.',
      });
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
        const user = await userRepository.findOne({ internalId: userId }, [
          'internalId',
          'name',
          'address',
          'phone',
          'userId',
          'isActive',
        ]);
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
  public searchUser: RequestHandler = async (req, res) => {
    const phoneNumber = req.params.phoneNumber;
    const user = await userRepository.findOne({ phone: phoneNumber }, [
      'internalId',
      'name',
      'address',
      'phone',
      'userId',
      'isActive',
    ]);
    if (user) {
      return res.json(user);
    } else {
      return res
        .status(EHttpStatusCode.BAD_REQUEST)
        .json({ message: 'Not Found This User' });
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
