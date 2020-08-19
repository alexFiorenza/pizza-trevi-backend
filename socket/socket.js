const { io } = require('../index');
const { isFunction } = require('underscore');
io.on('connection', (client) => {
  console.log(`Socket with id ${client.id} has connected to server`);
});
