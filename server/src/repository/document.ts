import { In } from 'typeorm';
import { Document } from '../entity/Document';
import { IDocument } from '../helper';

class DocumentRepository {
  async getAllDocuments(where = {}): Promise<Document[]> {
    return await Document.find({ where, relations: ['issuer', 'receiver', 'invoiceLines', 'taxTotals'], order: { createdAt: 'DESC' } });
  }
  async findOne(condition: IDocument): Promise<IDocument> {
    return await Document.findOne(condition, {
      relations: [
        'issuer',
        'issuerAddress',
        'receiver',
        'receiverAddress',
        'invoiceLines',
        'taxTotals',
        'invoiceLines.unitValue',
        'invoiceLines.taxableItems',
        'error',
      ],
    });
  }

  async updateDocuments(criteria: any, updatedColumns: object) {
    return Document.update(criteria, updatedColumns);
  }

  async getDocumentsByIds(ids: number[]): Promise<Document[]> {
    return await Document.findByIds(ids, {
      relations: [
        'issuer',
        'issuerAddress',
        'receiver',
        'receiverAddress',
        'invoiceLines',
        'taxTotals',
        'invoiceLines.unitValue',
        'invoiceLines.taxableItems',
      ],
    });
  }

  async getDocuments(select: any, where: any, relations = null) {
    if (relations) {
      return await Document.find({ select, where, relations });
    } else {
      return await Document.find({ select, where });
    }
  }
}

export default new DocumentRepository();
