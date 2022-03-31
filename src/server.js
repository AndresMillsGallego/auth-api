'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const notFoundHandler = require('./error-handlers/404.js');
const errorHandler = require('./error-handlers/500.js');
const logger = require('./middleware/logger.js');
const authRoutes = require('./auth/routes.js');

const v1Routes = require('./routes/v1');
const v2Routes = require('./routes/v2'); 

const app = express();


app.use(express.json());
app.use(cors());
app.use(logger);
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.use(authRoutes);

app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

app.use('*', notFoundHandler);
app.use(errorHandler);

module.exports = {
  server: app,
  start: (PORT) => {
    if (!PORT) { throw new Error('Missing Port'); }
    app.listen(PORT, () => console.log(`Jigglypuff is listening on port: ${PORT}`));
  },
};