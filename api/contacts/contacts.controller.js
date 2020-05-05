import Joi from 'joi';
import { contactsModel } from './contacts.model';
import { NotFound } from '../helpers/error.constructor';
import createControllerProxy from '../helpers/controllerProxy';

class ContactsController {
  async createContact(req, res, next) {
    try {
      const contacts = await contactsModel.findAllContacts();

      if (contacts.find(({ email }) => email === req.body.email)) {
        return res.status(400).json('this email is not unique');
      }

      if (!req.body.email.includes(`@`)) {
        return res.status(400).json(`an email must include '@'`);
      }

      const newContact = await contactsModel.createContact(req.body);

      return res.status(201).json(newContact);
    } catch (err) {
      next(err);
    }
  }

  async getAllContacts(req, res, next) {
    try {
      const contacts = await contactsModel.findAllContacts();
      // console.log(contacts);
      return res.status(200).json(contacts);
    } catch (err) {
      next(err);
    }
  }

  async getContactById(req, res, next) {
    try {
      const { contactId } = req.params;

      const queryContact = await this.getContactFromArray(contactId);
      return res.status(200).json(queryContact);
    } catch (err) {
      next(err);
    }
  }

  async updateContact(req, res, next) {
    try {
      const { contactId } = req.params;

      await this.getContactFromArray(contactId);
      const updatedContact = await contactsModel.updateContactById(
        contactId,
        req.body,
      );
      return res.status(200).json(updatedContact);
    } catch (err) {
      next(err);
    }
  }

  async deleteContact(req, res, next) {
    try {
      const { contactId } = req.params;

      await this.getContactFromArray(contactId);
      await contactsModel.deleteContactById(contactId);
      return res.status(200).send('contact deleted');
    } catch (err) {
      next(err);
    }
  }

  async getContactFromArray(contactId) {
    const contactFound = await contactsModel.findContactById(contactId);
    if (!contactFound) {
      throw new NotFound('Contact not found');
    }
    return contactFound;
  }

  validateCreateContact(req, res, next) {
    const contactsRules = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
    });
    const validationResult = Joi.validate(req.body, contactsRules);
    if (validationResult.error) {
      return res.status(400).json(validationResult.error.message);
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
      return res.status(400).json(validationResult.error.message);
    }

    next();
  }
}

export const contactsController = createControllerProxy(
  new ContactsController(),
);
