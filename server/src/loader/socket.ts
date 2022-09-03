import config from '../config';
const { clientURL } = config;

export default class SocketIO {
  private static io: any;
  public static init(httpServer: any) {
    this.io = require('socket.io')(httpServer, {
      cookie: false,
      cors: { origin: clientURL, methods: ['GET', 'POST'], allowedHeaders: ['Authorization'], credentials: true },
    });
  }
  public static getIO() {
    if (!this.io) {
      throw new Error('No socket connection');
    }
    return this.io;
  }
}
