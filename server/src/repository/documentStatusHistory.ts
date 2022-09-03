import { getRepository } from 'typeorm';
import { DocumentStatusHistory } from '../entity/DocumentStatusHistory';
import SocketIO from '../loader/socket';

class DocumentHistoryRepository {
  async createStatus(docId: number, status: string, userId: number | null, description = 'Status changed.') {
    try {
      const repo = getRepository(DocumentStatusHistory);
      SocketIO.getIO().emit('doc:update-status', { docId, status });
      return repo.create({ status, description, document: { internalId: docId }, user: { internalId: userId } }).save();
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }
}

export default new DocumentHistoryRepository();
