import express from 'express';
import { contactsRouter } from './contacts/contacts.router';
import path from 'path';
import morgan from 'morgan';
const PORT = 3000;

export class CrudServer {
  constructor() {
    this.server = null;
  }
  start() {
    this.initServer();
    this.initMiddleware();
    this.initRoutes();
    this.handleErrors();
    // this.initDatabase();
    this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddleware() {
    this.server.use(express.json());
    this.server.use('/static', express.static(path.join(__dirname, 'static')));
    this.server.use(morgan('tiny'));
  }

  initRoutes() {
    this.server.use('/api', contactsRouter);
  }

  handleErrors() {
    this.server.use((err, req, res, next) => {
      delete err.stack;

      // next(err);
      return res.status(err.status).send(`${err.status}: ${err.message}`);
    });
  }

  initDatabase() {}

  startListening() {
    this.server.listen(PORT, () => {
      console.log(`Server started listening on port: ${PORT}`);
    });
  }
}
