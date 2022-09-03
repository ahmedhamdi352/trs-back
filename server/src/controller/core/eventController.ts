import { RequestHandler } from 'express';
import { ISaleMan } from '../../helper';
import { User } from '../../entity/User';
import eventRepository from '../../repository/event';
import bookRepository from '../../repository/book';
import { EHttpStatusCode, appPermissions } from '../../helper';
import { isEmpty } from 'lodash';
import moment from 'moment';
class UserController {
  public getAllEvents: RequestHandler = async (req, res) => {
    try {
      const events = await eventRepository.findAll();
      return res.json(events);
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };

  public createEvent: RequestHandler = async (req, res) => {
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

      const newEvent = { ...req.body };
      console.log(newEvent);
      const savedEvent = await eventRepository.create(newEvent);
      const event = await eventRepository.findOne({
        internalId: savedEvent.internalId,
      });
      return res.json(event);
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };
  public searchEvent: RequestHandler = async (req, res) => {
    try {
      const data = { ...req.body };
      const searchDate = moment(data?.startDate).format('YYYY-MM-DD');
      console.log(data?.startDate);
      const events = await eventRepository.findAll();
      console.log(
        events.filter((item) => {
          const date = moment(item.startDate).format('YYYY-MM-DD');
          return moment(date).isSameOrAfter(searchDate);
        })
      );
      return res.json(
        events.filter((item) => {
          const date = moment(item.startDate).format('YYYY-MM-DD');
          return moment(date).isSameOrAfter(searchDate);
        })
      );
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };
  public updateEvent: RequestHandler = async (req, res) => {
    try {
      const reqUser = req.user as User;
      const eventId = req.params.eventId;
      const neededPermissions = reqUser.role.permissions.filter(
        (p) => p.name === appPermissions.updateEvent
      );
      if (!neededPermissions || !neededPermissions.length)
        return res
          .status(EHttpStatusCode.FORBIDDEN)
          .json({ message: 'Request not permitted' });
      const { raw } = await eventRepository.update(
        { internalId: eventId },
        { ...req.body }
      );
      if (raw) {
        const event = await eventRepository.findOne({ internalId: eventId }, [
          'internalId',
          'eventName',
          'hotelName',
          'startDate',
          'endDate',
          'busOnly',
          'roomOnly',
          'numberOfBuses',
          'numberOfRooms',
          'typeOfAccommodation',
          'color',
        ]);
        return res.json(event);
      } else {
        return res
          .status(500)
          .json({ error: 'There might be a problem. Please, try again.' });
      }
    } catch (error) {
      console.log('catch_error', error);
      return res
        .status(500)
        .json({ error: 'There might be a problem. Please, try again.' });
    }
  };
  public deleteEvent: RequestHandler = async (req, res) => {
    try {
      const reqUser = req.user as User;
      const eventId = req.params.eventId;
      const neededPermissions = reqUser.role.permissions.filter(
        (p) => p.name === appPermissions.createEvent
      );
      if (!neededPermissions || !neededPermissions.length)
        return res
          .status(EHttpStatusCode.FORBIDDEN)
          .json({ message: 'Request not permitted' });
      const books = await bookRepository.findAll({ event: eventId });
      if (!isEmpty(books)) {
        await books.map(async (item) => {
          await item.remove();
        });
      }
      const event = await eventRepository.findOne({ internalId: eventId });
      if (!event)
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json({ error: 'Invalid Event ID.' });
      if (event) {
        event.remove();
        return res.json(event);
      } else {
        return res
          .status(500)
          .json({ error: 'There might be a problem. Please, try again.' });
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
