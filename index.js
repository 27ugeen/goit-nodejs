require = require('esm')(module);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
// const { ContactsServer } = require('./api/server');
const { UsersServer } = require('./api/server');

// new ContactsServer().start();
new UsersServer().start();
