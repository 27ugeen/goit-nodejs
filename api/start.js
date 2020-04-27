require = require('esm')(module);
const { ContactsServer } = require('./server');

new ContactsServer().start();
