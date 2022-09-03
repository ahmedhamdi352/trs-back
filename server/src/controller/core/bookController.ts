import { RequestHandler } from 'express';
import { ISaleMan } from '../../helper';
import { User } from '../../entity/User';
import bookRepository from '../../repository/book';
import { EHttpStatusCode, appPermissions } from '../../helper';
import eventRepository from '../../repository/event';
import clientRepository from '../../repository/client';
import { Client } from '../../entity/Client';
import { getRepository } from 'typeorm';

class UserController {
  public getAllBooks: RequestHandler = async (req, res) => {
    try {
      const eventId = req.params.eventId;
      const books = await bookRepository.findAll({ event: eventId });
      return res.json(books);
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };

  public createBook: RequestHandler = async (req, res) => {
    try {
      // Check If user has the authority to run this
      const reqUser = req.user as User;
      const neededPermissions = reqUser.role.permissions.filter(
        (p) => p.name === appPermissions.createEvent
      );
      if (!neededPermissions || !neededPermissions.length)
        return res
          .status(EHttpStatusCode.FORBIDDEN)
          .json({ message: 'Request not permitted' });

      const newBook = { ...req.body };
      const savedBook = await bookRepository.create(newBook);
      const book = await bookRepository.findOne({
        internalId: savedBook.internalId,
      });
      const event = await eventRepository.findOne({
        internalId: req.body?.event,
      });

      const { raw } = await eventRepository.update(
        { internalId: event?.internalId },
        {
          ...event,
          remainingRooms:
            newBook.type !== 'busOnly'
              ? event.remainingRooms - book.numberOfRooms
              : event.remainingRooms,
          remainingChairs:
            newBook.type !== 'roomOnly'
              ? event.remainingChairs - book.numberOfClients
              : event.remainingChairs,
        }
      );
      return res.json(book);
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };
  public searchBook: RequestHandler = async (req, res) => {
    const phoneNumber = req.params.phone;
    const book = await bookRepository.findAll({ bookPhone: phoneNumber });
    if (book) {
      return res.json(book);
    } else {
      return res
        .status(EHttpStatusCode.BAD_REQUEST)
        .json({ message: 'Not Found This Book' });
    }
  };
  public deleteBook: RequestHandler = async (req, res) => {
    try {
      const eventId = req.params.eventId;
      const bookId = req.params.bookId;
      const book = await bookRepository.findOne({
        internalId: bookId,
      });

      const event = await eventRepository.findOne({
        internalId: eventId,
      });

      // console.log(book);

      const { raw } = await eventRepository.update(
        { internalId: event?.internalId },
        {
          ...event,
          remainingRooms:
            book.type !== 'busOnly'
              ? event.remainingRooms + book.numberOfRooms
              : event.remainingRooms,
          remainingChairs:
            book.type !== 'roomOnly'
              ? event.remainingChairs + book.numberOfClients
              : event.remainingChairs,
        }
      );
      if (!book)
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json({ error: 'Invalid Event ID.' });
      if (book && raw) {
        await book.remove();
        return res.json(book);
      }
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };
}
export default new UserController();
