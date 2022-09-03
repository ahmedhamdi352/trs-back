import { SalesMan } from "../entity/salesMan";
import { ISaleMan } from "../helper";
import { getRepository, FindOneOptions } from "typeorm";

class UserRepository {
  async findOne(where = {}, select = []): Promise<SalesMan> {
    if (select.length) {
      return await SalesMan.findOne(where, { select });
    }
    return await SalesMan.findOne(where);
  }

  async findAll(): Promise<SalesMan[]> {
    return await SalesMan.find({
      order: { internalId: "ASC" },
    });
  }

  async update(criteria: any, updatedColumns: object) {
    return await SalesMan.update(criteria, updatedColumns);
  }
  async create(user: ISaleMan): Promise<SalesMan> {
    return await getRepository(SalesMan).create(user).save();
  }
}

export default new UserRepository();
