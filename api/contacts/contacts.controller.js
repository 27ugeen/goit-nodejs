import fs from 'fs';
import path from 'path';
import Joi from 'joi';
import { v4 } from 'uuid';
import { NotFound } from '../helpers/error.constructor';
import createControllerProxy from '../helpers/controllerProxy';

const contactsPath = path.join(__dirname, '../../db/contacts.json');

const makeId = data => {
  const contacts = JSON.parse(data);
  const contactsId = contacts.map(({ id }) => id);
  const maxId = Math.max(...contactsId);
  const newId = maxId + 1;
  return newId;
};

let contactsDB = [];

class ContactsController {
  createContact(req, res, err) {
    try {
      // const contactId = v4();
      // const newContact = {
      //   id: contactId,
      //   ...req.body,
      // };
      // contactsDB.push(newContact);

      // return res.status(201).json(newContact);
      fs.readFile(contactsPath, 'utf8', (err, data) => {
        if (err) throw err;

        const contacts = JSON.parse(data);
        const newId = makeId(data);
        const newContact = { id: newId, ...req.body };
        contacts.push(newContact);
        const newContacts = JSON.stringify(contacts);

        fs.writeFile(contactsPath, newContacts, err => {
          if (err) throw err;
        });

        return res.status(201).json(newContact);
      });
    } catch (err) {
      next(err);
    }
  }

  getAllContacts(req, res, next) {
    fs.readFile(contactsPath, 'utf8', (err, data) => {
      if (err) throw err;
      return res.status(200).json(JSON.parse(data));
    });
  }

  getContactById(req, res, next) {
    // try {
    //   const { contactId } = req.params;
    //   const searchContact = this.getContactFromArray(contactId);

    //   return res.status(200).send(searchContact);
    // } catch (err) {
    //   next(err);
    // }

    try {
      const { contactId } = req.params;

      fs.readFile(contactsPath, 'utf8', (err, data) => {
        if (err) throw err;
        const contacts = JSON.parse(data);
        const queryContact = contacts.find(
          ({ id }) => id === Number(contactId),
        );
        if (!queryContact) {
          // throw new NotFound('Contact not Found');
          return res.status(404).send({ message: 'Not found' });
        }
        return res.status(200).send(queryContact);
      });
    } catch (err) {
      next(err);
    }
  }

  updateContact(req, res, next) {
    try {
      // const { contactId } = req.params;
      // const searchContact = this.getContactFromArray(contactId);
      // const searchContactIndex = this.getContactIndexFromArray(contactId);
      // const updatedContact = {
      //   ...searchContact,
      //   ...req.body,
      // };
      // contactsDB[searchContactIndex] = updatedContact;

      // return res.status(200).json(updatedContact);
      const { contactId } = req.params;

      fs.readFile(contactsPath, 'utf8', (err, data) => {
        if (err) throw err;
        const contacts = JSON.parse(data);
        const queryContact = contacts.find(
          ({ id }) => id === Number(contactId),
        );
        if (!queryContact) {
          // throw new NotFound('Contact not Found');
          return res.status(404).send({ message: 'Not found' });
        }

        const queryContactIdx = contacts.findIndex(
          ({ id }) => id === Number(contactId),
        );

        const updatedContact = {
          ...queryContact,
          ...req.body,
        };
        contacts[queryContactIdx] = updatedContact;

        const newContacts = JSON.stringify(contacts);

        fs.writeFile(contactsPath, newContacts, err => {
          if (err) throw err;
        });

        return res.status(200).send(updatedContact);
      });
    } catch (err) {
      next(err);
    }
  }

  deleteContact(req, res, next) {
    try {
      const { contactId } = req.params;
      // const searchContactIndex = this.getContactIndexFromArray(contactId);
      // contactsDB.splice(searchContactIndex, 1);

      // return res.status(204).send();
      fs.readFile(contactsPath, 'utf8', (err, data) => {
        if (err) throw err;
        const contacts = JSON.parse(data);
        const queryContact = contacts.find(
          ({ id }) => id === Number(contactId),
        );
        if (!queryContact) {
          // throw new NotFound('Contact not Found');
          return res.status(404).send({ message: 'Not found' });
        }
        const newContacts = JSON.stringify(
          contacts.filter(({ id }) => id !== Number(contactId)),
        );

        fs.writeFile(contactsPath, newContacts, err => {
          if (err) throw err;
        });
        return res.status(200).send({ message: 'contact deleted' });
      });
    } catch (err) {
      next(err);
    }
  }

  getContactFromArray(contactId) {
    // const searchContact = contactsDB.find(contact => contact.id === contactId);
    // if (!searchContact) {
    //   throw new NotFound('Contact not Found');
    // }

    // return searchContact;
    fs.readFile(contactsPath, 'utf8', (err, data) => {
      if (err) throw err;
      const contacts = JSON.parse(data);
      const queryContact = contacts.find(({ id }) => id === contactId);
      if (!queryContact) {
        throw new NotFound('Contact not Found');
      }
      return queryContact;
    });
  }

  getContactIndexFromArray(contactId) {
    const searchContact = contactsDB.findIndex(
      contact => contact.id === contactId,
    );
    if (searchContact === -1) {
      throw new NotFound('Contact not Found');
    }

    return searchContact;
  }

  validateCreateContact(req, res, next) {
    const contactsRules = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
    });
    const validationResult = Joi.validate(req.body, contactsRules);
    if (validationResult.error) {
      return res.status(400).json(validationResult.error);
    }

    next();
  }

  validateUpdateContact(req, res, next) {
    const contactsRules = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
    });
    const validationResult = Joi.validate(req.body, contactsRules);
    if (validationResult.error) {
      return res.status(400).json(validationResult.error);
    }

    next();
  }
}

export const contactsController = createControllerProxy(
  new ContactsController(),
);
