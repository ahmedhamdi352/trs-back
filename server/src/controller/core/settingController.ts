import { RequestHandler } from 'express';
import settingRepository from '../../repository/setting';
import DocumentCronJob from '../../cronjobs/document';
import documentController from './documentController';
import {EHttpStatusCode, appPermissions} from '../../helper';
import {User} from '../../entity/User';

class SettingContoller {
  public getSetting: RequestHandler = async (req, res) => {
    try {
      
      // Check If user has the authority to run this
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter((p) => p.name === appPermissions.viewSettings);
      if (!neededPermissions || !neededPermissions.length) return res.status(EHttpStatusCode.FORBIDDEN).json({ message: 'Request not permitted' });

      const { settingName } = req.params;
      if (!settingName) {
        return res.status(400).json({ error: 'Invalid arguments.' });
      }
      const setting = await settingRepository.get(settingName);
      if (setting) {
        setting.value = JSON.parse(setting.value);
        return res.json(setting);
      } else {
        return res.status(404).json({ error: 'Setting not found' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };

  public updateCronJobSettings: RequestHandler = async (req, res) => {
    try {
      
      // Check If user has the authority to run this
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter((p) => p.name === appPermissions.updateSettings);
      if (!neededPermissions || !neededPermissions.length) return res.status(EHttpStatusCode.FORBIDDEN).json({ message: 'Request not permitted' });

      const { name, value } = req.body;
      if (!name || !value) {
        return res.status(400).json({ error: 'Invalid arguments.' });
      }
      await settingRepository.update(name, value);
      const setting = await settingRepository.get(name);
      const parsedSetting = JSON.parse(setting.value);
      if (parsedSetting.enabled) {
        const currentJob = DocumentCronJob.getCurrentJob();
        DocumentCronJob.destroyJob(currentJob);
        DocumentCronJob.createJob(parsedSetting.hour, documentController.cronJobHandler);
      } else {
        const currentJob = DocumentCronJob.getCurrentJob();
        DocumentCronJob.destroyJob(currentJob);
      }
      if (setting) {
        setting.value = JSON.parse(setting.value);
        return res.json(setting);
      } else {
        return res.status(404).json({ error: 'Something went wrong' });
      }
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };

  public updateSettings: RequestHandler = async (req, res) => {
    try {
      
      // Check If user has the authority to run this
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter((p) => p.name === appPermissions.updateSettings);
      if (!neededPermissions || !neededPermissions.length) return res.status(EHttpStatusCode.FORBIDDEN).json({ message: 'Request not permitted' });

      const { name, value } = req.body;
      await settingRepository.update(name, value);
      const setting = await settingRepository.get(name);
      setting.value = JSON.parse(setting.value);
      return res.json(setting);
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
  };
}

export default new SettingContoller();
