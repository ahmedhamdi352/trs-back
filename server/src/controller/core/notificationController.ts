import { RequestHandler } from 'express';
import notificationSubscribers from '../../repository/notificationSubscribers';
import { EHttpStatusCode } from '../../helper';

class NotificationContoller {
  public getSubscribers: RequestHandler = async (req, res) => {
    try {
      const subs = await notificationSubscribers.findAll();
      return res.json(subs);
    } catch (error) {
      return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
    }
  };

  public addSubscriber: RequestHandler = async (req, res) => {
    try {
      const isSubFound = await notificationSubscribers.findOne(req.body.email);
      if (isSubFound) {
        return res.status(EHttpStatusCode.CONFLICT).json({ message: 'Resource already exists' });
      }
      const sub = await notificationSubscribers.create(req.body);
      return res.json(sub);
    } catch (error) {
      return res.status(EHttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'INTERNAL_SERVER_ERROR' });
    }
  };

  public deleteSubscriber: RequestHandler = async (req, res) => {
    try {
      const subId = parseInt(req.params.id);
      const { affected } = await notificationSubscribers.delete(subId);
      if (!affected) {
        return res.status(EHttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'INTERNAL_SERVER_ERROR' });
      }
      return res.json({ internalId: subId });
    } catch (error) {
      return res.status(EHttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'INTERNAL_SERVER_ERROR' });
    }
  };
}

export default new NotificationContoller();
