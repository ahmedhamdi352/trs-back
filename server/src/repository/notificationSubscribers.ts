import { getRepository } from 'typeorm';
import { NotificationSubscribers } from '../entity/NotificationSubscribers';
import { INotificationSub } from '../helper';
class NotificationSubsRepository {
  async findOne(email: string) {
    return NotificationSubscribers.findOne({ email });
  }
  async findAll() {
    return NotificationSubscribers.find({ order: { internalId: 'DESC' } });
  }
  async create(sub: INotificationSub): Promise<NotificationSubscribers> {
    return await getRepository(NotificationSubscribers).create(sub).save();
  }
  async delete(id: number) {
    return await getRepository(NotificationSubscribers).delete(id);
  }
}

export default new NotificationSubsRepository();
