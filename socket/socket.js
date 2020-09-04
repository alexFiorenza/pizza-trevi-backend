const { io } = require('../index');
const { isFunction } = require('underscore');
const Order = require('./../models/order');
io.on('connection', (client) => {
  // client.handshake.query
  client.on('orderCreated', (data, callback) => {
    Order.create(data.order, (err, dataStored) => {
      if (err) {
        callback({ ok: false, message: 'Internal error' });
        return err;
      }
      io.emit('orderCreatedAdmin', dataStored);
      callback({ ok: true, message: 'Data stored succesfully' });
    });
  });
  client.on('adminResponseOrder', (data) => {
    Order.findByIdAndUpdate(
      { _id: data._id },
      data,
      { new: true },
      (err, dataUpdated) => {
        if (err) {
          return res.status(200).json({ ok: false, message: 'Internal error' });
        }
        return io.emit('updatedOrder', dataUpdated);
      }
    );
  });
  client.on('disconnect', () => {});
});
