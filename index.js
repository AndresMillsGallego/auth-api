'use strict';

require('dotenv').config();

const { db } = require('./src/models/index');
const { authDb } = require('./src/auth/models/index');
const server = require('./src/server.js');

const PORT = process.env.PORT || 3001;

authDb.sync()
  .then(() => {
    db.sync()
      .then(() => {
        server.start(PORT);

      });
  });