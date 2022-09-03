import { Company } from '../entity/Company';
import { ICompany } from '../helper';
import { getRepository, FindOneOptions } from 'typeorm';

class CompanyRepository {
  async findOne(where = {}, relations = []): Promise<Company> {
    return await Company.findOne(where, { relations });
  }

  async findAll(): Promise<Company[]> {
    return await Company.find({
      select: ['internalId', 'name', 'type', 'taxNumber'],
      order: { internalId: 'ASC' },
    });
  }

  async update(criteria: any, updatedColumns: object) {
    return await Company.update(criteria, updatedColumns);
  }
  async create(company: ICompany): Promise<Company> {
    return await getRepository(Company).create(company).save();
  }
}

export default new CompanyRepository();
