require = require('esm')(module);
const { ContactsServer } = require('./api/server');

new ContactsServer().start();
