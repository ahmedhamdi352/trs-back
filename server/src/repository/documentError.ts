import { getRepository } from 'typeorm';
import { DocumentError } from '../entity/DocumentError';

class DocumentErrorRepository {
  async saveDocumentError(errorId, documentUUID, details: any, target = 'Document', message = 'Validation Failed', code = 400) {
    try {
      if (errorId) {
        return getRepository(DocumentError).save({ internalId: errorId, documentUUID, details, target, message, code });
      }
      return getRepository(DocumentError).save({ details, documentUUID, target, message, code });
    } catch (error) {
      throw error;
    }
  }
}

export default new DocumentErrorRepository();
