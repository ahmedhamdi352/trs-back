import { Event } from '../entity/event';
import { IEvent } from '../helper';
import { getRepository, FindOneOptions } from 'typeorm';

class UserRepository {
  async findOne(where = {}, select = []): Promise<Event> {
    if (select.length) {
      return await Event.findOne(where, { select });
    }
    return await Event.findOne(where);
  }

  async findAll(): Promise<Event[]> {
    return await Event.find({
      order: { internalId: 'ASC' },
    });
  }

  async update(criteria: any, updatedColumns: object) {
    return await Event.update(criteria, updatedColumns);
  }
  async create(user: IEvent): Promise<Event> {
    return await getRepository(Event).create(user).save();
  }
}

export default new UserRepository();
