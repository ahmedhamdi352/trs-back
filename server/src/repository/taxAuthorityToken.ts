import { Token } from '../entity/Token';
import { IToken } from '../helper';
import { getRepository, FindOneOptions } from 'typeorm';

class TaxAuthorityTokenRepository {
  async findOne(where = {}, relations = []): Promise<Token> {
    return await Token.findOne(where, { relations });
  }

  async findAll(): Promise<Token[]> {
    return await Token.find({
      select: ['internalId', 'clientID', 'clientSecret', 'pin', 'port', 'accessToken'],
      relations: ['company'],
      order: { internalId: 'ASC' },
    });
  }

  async update(criteria: any, updatedColumns: object) {
    return await Token.update(criteria, updatedColumns);
  }
  async create(token: IToken): Promise<Token> {
    return await getRepository(Token).create(token).save();
  }
}

export default new TaxAuthorityTokenRepository();
