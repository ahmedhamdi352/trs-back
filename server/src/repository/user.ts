import { User } from "../entity/User";
import { IUser } from "../helper";
import { getRepository, FindOneOptions } from "typeorm";

class UserRepository {
  async findOne(where = {}, relations = [], select = []): Promise<User> {
    if (select.length) {
      return await User.findOne(where, { relations, select });
    }
    return await User.findOne(where, { relations });
  }

  async findAll(where: {}): Promise<User[]> {
    return await User.find({
      where,
      select: [
        "internalId",
        "firstName",
        "lastName",
        "email",
        "username",
        "phone",
        "isActive",
      ],
      relations: ["role"],
      order: { internalId: "ASC" },
    });
  }

  async update(criteria: any, updatedColumns: object) {
    return await User.update(criteria, updatedColumns);
  }
  async create(user: IUser): Promise<User> {
    return await getRepository(User).create(user).save();
  }
}

export default new UserRepository();
