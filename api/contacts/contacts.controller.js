import fs from 'fs';
import path from 'path';
import Joi from 'joi';
import createControllerProxy from '../helpers/controllerProxy';

const contactsPath = path.join(__dirname, '../../db/contacts.json');

const makeId = data => {
  const contacts = JSON.parse(data);
  const contactsId = contacts.map(({ id }) => id);
  const maxId = Math.max(...contactsId);
  const newId = maxId + 1;
  return newId;
};

class ContactsController {
  createContact(req, res, err) {
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
  }

  getAllContacts(req, res, next) {
    fs.readFile(contactsPath, 'utf8', (err, data) => {
      if (err) throw err;

      const contacts = JSON.parse(data);
      return res.status(200).json(contacts);
    });
  }

  getContactById(req, res, next) {
    const { contactId } = req.params;
    fs.readFile(contactsPath, 'utf8', (err, data) => {
      if (err) throw err;

      const contacts = JSON.parse(data);
      const queryContact = this.getContactFromArray(contacts, contactId);
      if (!queryContact) {
        return res.status(404).send('contact not found');
      }

      return res.status(200).send(queryContact);
    });
  }

  updateContact(req, res, next) {
    const { contactId } = req.params;

    fs.readFile(contactsPath, 'utf8', (err, data) => {
      if (err) throw err;

      const contacts = JSON.parse(data);
      const queryContact = this.getContactFromArray(contacts, contactId);
      if (!queryContact) {
        return res.status(404).send('contact not found');
      }
      const queryContactIdx = this.getContactIndexFromArray(
        contacts,
        contactId,
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
  }

  deleteContact(req, res, next) {
    const { contactId } = req.params;

    fs.readFile(contactsPath, 'utf8', (err, data) => {
      if (err) throw err;

      const contacts = JSON.parse(data);
      const queryContact = this.getContactFromArray(contacts, contactId);
      if (!queryContact) {
        return res.status(404).send('contact not found');
      }
      const newContacts = JSON.stringify(
        contacts.filter(({ id }) => id !== Number(contactId)),
      );

      fs.writeFile(contactsPath, newContacts, err => {
        if (err) throw err;
      });
      return res.status(200).send('contact deleted');
    });
  }

  getContactFromArray(contacts, contactId) {
    return contacts.find(({ id }) => id === Number(contactId));
  }

  getContactIndexFromArray(contacts, contactId) {
    return contacts.findIndex(contact => contact.id === Number(contactId));
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
