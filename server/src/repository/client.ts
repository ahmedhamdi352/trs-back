import { Client } from "../entity/Client";
import { ISaleMan } from "../helper";
import { getRepository, FindOneOptions } from "typeorm";

class UserRepository {
  async findOne(where = {}, select = []): Promise<Client> {
    if (select.length) {
      return await Client.findOne(where, { select });
    }
    return await Client.findOne(where);
  }

  async findAll(): Promise<Client[]> {
    return await Client.find({
      order: { internalId: "ASC" },
    });
  }

  async update(criteria: any, updatedColumns: object) {
    return await Client.update(criteria, updatedColumns);
  }
  async create(user: ISaleMan): Promise<Client> {
    return await getRepository(Client).create(user).save();
  }
}

export default new UserRepository();
