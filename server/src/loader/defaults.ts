import async from 'async';
import winston from 'winston';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { Role } from '../entity/Role';
import { Permission } from '../entity/Permission';
import { appPermissions } from '../helper';
import { SalesMan } from '../entity/salesMan';
import { Client } from '../entity/Client';
import { Event } from '../entity/event';
import { Book } from '../entity/book';

export default async () => {
  winston.info('Checking Default Settings...');
  async.waterfall(
    [
      function (callback) {
        return createPermissions(callback);
      },
      function (callback) {
        return createRoles(callback);
      },
      function (callback) {
        return createUsers(callback);
      },
      // function (callback) {
      //   return createSalesMan(callback);
      // },
      // function (callback) {
      //   return createClients(callback);
      // },
      // function (callback) {
      //   return createEvents(callback);
      // },
      // // function (callback) {
      //   return createBook(callback);
      // },
    ],
    function (err) {
      if (err) winston.warn(err);
    }
  );
};

const createBook = async (callback) => {
  const repo = getRepository(Book);
  const clientRepo = getRepository(Client);
  const clientList = await clientRepo.find();
  const data = [
    {
      bookOwner: 'ahmed',
      bookPhone: '01025811913',
      numberOfClients: 1,
      numberOfRooms: 1,
      numberOfChairs: '1,2',
      totalPrice: 2000,
      paymentMethod: 'cash',
      remainingMoney: 200,
      event: { internalId: 1 },
      sales: { internalId: 1 },
      clients: clientList,
    },
  ];
  Promise.all(
    data.map(async (item) => {
      return repo.create(item).save();
    })
  )
    .then(function (result) {
      winston.info(`books are created successfully.`);
      return callback();
    })
    .catch(function (err) {
      console.log(err);
      winston.info(`Error in creating books.`);
      return callback();
    });
};

const createEvents = async (callback) => {
  const repo = getRepository(Event);
  const data = [
    {
      eventName: 'dahab',
      hotelName: 'ibis',
      startDate: new Date(),
      endDate: new Date(),
      numberOfBuses: 1,
      numberOfRooms: 2,
      busOnly: true,
      roomOnly: true,
    },
  ];

  Promise.all(
    data.map(async (item) => {
      const itemFound = await repo.findOne({ eventName: item.eventName });
      if (!itemFound) {
        return repo.create(item).save();
      }
    })
  )
    .then(function (result) {
      winston.info(`events are created successfully.`);
      return callback();
    })
    .catch(function (err) {
      console.log(err);
      winston.info(`Error in creating sales men.`);
      return callback();
    });
};

const createClients = async (callback) => {
  const repo = getRepository(Client);
  const data = [
    {
      name: 'test',
      address: 'ay 7aga',
      phone: '01025811971',
      userId: '29501010102055',
      isActive: true,
    },
  ];

  Promise.all(
    data.map(async (item) => {
      const itemFound = await repo.findOne({ userId: item.userId });
      if (!itemFound) {
        return repo.create(item).save();
      }
    })
  )
    .then(function (result) {
      winston.info(`Client are created successfully.`);
      return callback();
    })
    .catch(function (err) {
      console.log(err);
      winston.info(`Error in creating sales men.`);
      return callback();
    });
};

const createUsers = async (callback) => {
  const repo = getRepository(User);
  const adminRole = await getRepository(Role).findOne({ name: 'admin' });
  const saleRole = await getRepository(Role).findOne({ name: 'sales' });
  const financeRole = await getRepository(Role).findOne({ name: 'finance' });

  // await repo.clear();
  const users = [
    // {
    //   firstName: 'ahmed',
    //   lastName: 'hamdi',
    //   username: 'ahamdi',
    //   password: 'P@ssw0rd',
    //   email: 'ahmedhamdi352@gmail.com',
    //   phone: '01025811914',
    //   role: { internalId: saleRole.internalId },
    //   isActive: true,
    // },
    // {
    //   firstName: 'sam',
    //   lastName: 'hamdi',
    //   username: 'shamdi',
    //   password: 'P@ssw0rd',
    //   email: 'ahmedhamdi352@gmail.com',
    //   phone: '01025811910',
    //   role: { internalId: financeRole.internalId },
    //   isActive: true,
    // },
    // {
    //   firstName: 'sam',
    //   lastName: 'hamdi',
    //   username: 'test',
    //   password: 'P@ssw0rd',
    //   email: 'ahmedhamdi352@gmail.com',
    //   phone: '01025811911',
    //   role: { internalId: financeRole.internalId },
    //   isActive: true,
    // },
    {
      firstName: 'System',
      lastName: 'User',
      username: 'sysuserr',
      password: 'P@ssw0rd',
      email: 'ahmedhamdi351@gmail.com',
      phone: '01025811013',
      role: { internalId: adminRole.internalId },
      isActive: false,
    },
  ];

  Promise.all(
    users.map(async (u) => {
      const user = await repo.findOne({ username: u.username });
      if (!user) {
        return repo.create(u).save();
      }
    })
  )
    .then(function (result) {
      winston.info(`users are created successfully.`);
      return callback();
    })
    .catch(function (err) {
      console.log(err);
      winston.info(`Error in creating users.`);
      return callback();
    });
};

const createPermissions = async (callback) => {
  const repo = getRepository(Permission);
  const data = [
    {
      name: appPermissions.viewEvents,
    },
    {
      name: appPermissions.createEvent,
    },
    {
      name: appPermissions.updateEvent,
    },
    {
      name: appPermissions.viewClients,
    },
    {
      name: appPermissions.updateClients,
    },
    {
      name: appPermissions.viewSalesUsers,
    },
    {
      name: appPermissions.viewReceptionistUsers,
    },
    {
      name: appPermissions.viewFinanceUsers,
    },
    {
      name: appPermissions.viewSettings,
    },
    {
      name: appPermissions.viewFinance,
    },
    {
      name: appPermissions.bookEvent,
    },
    {
      name: appPermissions.deleteUsers,
    },
    {
      name: appPermissions.manageRoles,
    },
    {
      name: appPermissions.addUsers,
    },
    {
      name: appPermissions.updateUsers,
    },
  ];
  return Promise.all(
    data.map(async (element) => {
      const item = await repo.findOne({ name: element.name });
      if (!item) {
        return repo.create(element).save();
      }
    })
  )
    .then(function (result) {
      winston.info(`Permissions are created successfully.`);
      return callback();
    })
    .catch(function (err) {
      console.log(err);
      winston.info(`Error in creating permissions.`);
      return callback();
    });
};

const createSalesMan = async (callback) => {
  const repo = getRepository(SalesMan);
  const data = [
    {
      firstName: 'test',
      lastName: 'sales',
      username: 'testSalesMan',
      phone: '01025811971',
      isActive: true,
      percentage: 2,
    },
  ];

  Promise.all(
    data.map(async (item) => {
      const itemFound = await repo.findOne({ username: item.username });
      if (!itemFound) {
        return repo.create(item).save();
      }
    })
  )
    .then(function (result) {
      winston.info(`sales Men are created successfully.`);
      return callback();
    })
    .catch(function (err) {
      console.log(err);
      winston.info(`Error in creating sales men.`);
      return callback();
    });
};

const createRoles = async (callback) => {
  const repo = getRepository(Role);
  const permissionsRepo = getRepository(Permission);
  const permissionsList = await permissionsRepo.find();
  const data = [
    {
      name: 'admin',
      default: true,
      permissions: permissionsList,
    },
    {
      name: 'sales',
      default: true,
      permissions: permissionsList.filter((perm) =>
        ['viewEvents', 'bookEvent'].includes(perm.name)
      ),
    },
    {
      name: 'finance',
      default: true,
      permissions: permissionsList.filter((perm) =>
        [
          'viewFinance',
          'viewEvents',
          'viewSalesUsers',
          'viewReceptionistUsers',
          'viewFinanceUsers',
        ].includes(perm.name)
      ),
    },
  ];

  Promise.all(
    data.map(async (item) => {
      const itemFound = await repo.findOne({ name: item.name });
      if (!itemFound) {
        return repo.create(item).save();
      }
    })
  )
    .then(function (result) {
      winston.info(`Roles are created successfully.`);
      return callback();
    })
    .catch(function (err) {
      console.log(err);
      winston.info(`Error in creating roles.`);
      return callback();
    });
};
