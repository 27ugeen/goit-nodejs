const fs = require('fs');
const path = require('path');

const contactsPath = path.join(__dirname, './db/contacts.json');

// ================================
const makeId = data => {
  const contacts = JSON.parse(data);
  const contactsId = contacts.map(({ id }) => id);
  const maxId = Math.max(...contactsId);
  const newId = maxId + 1;
  return newId;
};

const writeNewContacts = (contactsPath, newContacts, err) => {
  fs.writeFile(contactsPath, newContacts, err => {
    if (err) throw err;
    // listContacts();
    console.table(JSON.parse(newContacts));
  });
};
// ===============================

const listContacts = () => {
  fs.readFile(contactsPath, 'utf8', (err, data) => {
    if (err) throw err;
    console.table(JSON.parse(data));
    return JSON.parse(data);
  });
};

const getContactById = contactId => {
  fs.readFile(contactsPath, 'utf8', (err, data) => {
    if (err) throw err;
    const contacts = JSON.parse(data);
    const queryContact = contacts.find(({ id }) => id === contactId);
    console.table(queryContact);
    return queryContact;
  });
};

const removeContact = contactId => {
  fs.readFile(contactsPath, 'utf8', (err, data) => {
    if (err) throw err;
    const contacts = JSON.parse(data);
    const newContacts = JSON.stringify(
      contacts.filter(({ id }) => id !== contactId),
    );

    writeNewContacts(contactsPath, newContacts, err);
  });
};

const addContact = (name, email, phone) => {
  fs.readFile(contactsPath, 'utf8', (err, data) => {
    if (err) throw err;

    const contacts = JSON.parse(data);
    const newId = makeId(data);
    const newContact = { id: newId, name, email, phone };
    contacts.push(newContact);
    const newContacts = JSON.stringify(contacts);

    writeNewContacts(contactsPath, newContacts, err);
  });
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
