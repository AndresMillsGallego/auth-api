'use strict';

require('dotenv').config();

const { db } = require('./src/models');
const { authDb } = require('./src/auth/models/index');
const server = require('./src/server.js');

const PORT = process.env.PORT || 3001;

authDb.sync(), db.sync()
  .then(() => {
    server.start(PORT);
  });