import { Router } from 'express';
import { contactsController } from './contacts.controller';

const router = Router();

router.post(
  '/contacts',
  contactsController.validateCreateContact,
  contactsController.createContact,
);

router.get('/contacts', contactsController.getAllContacts);

router.get('/contacts/:contactId', contactsController.getContactById);

router.put(
  '/contacts/:contactId',
  contactsController.validateUpdateContact,
  contactsController.updateContact,
);

router.delete('/contacts/:contactId', contactsController.deleteContact);

export const contactsRouter = router;
