import { Book } from '../entity/book';
import { IBook } from '../helper';
import { getRepository, FindOneOptions } from 'typeorm';

class BookRepository {
  async findOne(where = {}, select = []): Promise<Book> {
    if (select.length) {
      return await Book.findOne(where, { select });
    }
    return await Book.findOne(where);
  }

  async findBook(where = {}): Promise<Book[]> {
    return await Book.find({
      where,
      select: [
        'internalId',
        'bookOwner',
        'bookPhone',
        'numberOfChairs',
        'numberOfRooms',
        'numberOfClients',
        'totalPrice',
        'remainingMoney',
        'paymentMethod',
      ],
      relations: ['event'],
    });
  }

  async findAll(where: {}): Promise<Book[]> {
    return await Book.find({
      where,
      select: [
        'internalId',
        'bookOwner',
        'bookPhone',
        'numberOfChairs',
        'numberOfRooms',
        'numberOfClients',
        'totalPrice',
        'remainingMoney',
        'paymentMethod',
        // 'clients',
      ],
      relations: ['clients', 'sales', 'event'],
      order: { internalId: 'ASC' },
    });
  }

  async update(criteria: any, updatedColumns: object) {
    return await Book.update(criteria, updatedColumns);
  }

  async create(book: IBook): Promise<Book> {
    return await getRepository(Book).create(book).save();
  }
}

export default new BookRepository();
