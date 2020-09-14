const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const _ = require('underscore');
const { veriftyToken, verifyAdmin } = require('../middlewares/auth');
const moment = require('moment');
/*Get all orders */
router.get('/orders', veriftyToken, (req, res) => {
  Order.find({})
    .sort({ field: 'desc' })
    .exec((err, orderFound) => {
      if (err) {
        return res.status(500).json({ ok: false, message: 'Internal error' });
      }
      return res.status(200).json({ ok: true, message: orderFound });
    });
});
/*Get one order per userid*/
router.get('/order/:id', veriftyToken, (req, res) => {
  const params = req.params.id;
  const query = req.query;
  if (query.inprogress === 'true') {
    Order.find({
      $and: [
        { 'user._id': params },
        { $or: [{ status: 'pendiente' }, { status: 'activo' }] },
      ],
    }).exec((err, orderFound) => {
      if (err) {
        return res.status(500).json({ ok: false, message: 'Internal error' });
      }
      return res.status(200).json({ ok: true, message: orderFound });
    });
  } else {
    Order.find({ 'user._id': params })
      .sort({ _id: -1 })
      .exec((err, orderFound) => {
        if (err) {
          return res.status(500).json({ ok: false, message: 'Internal error' });
        }
        return res.status(200).json({ ok: true, message: orderFound });
      });
  }
});
/*Get orders per date and status*/
router.get('/orders/date', veriftyToken, (req, res) => {
  const date = moment().subtract(10, 'days').calendar();
  Order.find({ $or: [{ status: 'activo' }, { status: 'pendiente' }] })
    .sort({ field: 'desc' })
    .exec((err, orderFound) => {
      if (err) {
        return res.status(500).json({ ok: false, message: 'Internal error' });
      }
      let orders = [];
      orderFound.forEach((p) => {
        const orderDay = moment(p.date).subtract(10, 'days').calendar();
        if (orderDay === date) {
          orders.push(p);
        }
      });
      return res.status(200).json({ ok: true, message: orders });
    });
});

router.put('/order/:id', veriftyToken, verifyAdmin, (req, res) => {
  const params = req.params.id;
  const body = req.body;
  const dataPicked = _.pick(body, ['status']);
  Order.findByIdAndUpdate(
    params,
    dataPicked,
    { new: true, useFindAndModify: false },
    (err, orderFound) => {
      if (err) {
        return res.status(500).json({ ok: false, message: 'Internal error' });
      }
      return res.status(200).json({ ok: true, message: orderFound });
    }
  );
});
/*Make an order*/
router.post('/order', veriftyToken, (req, res) => {
  const body = req.body;
  const user = req.user;
  const pickedData = _.pick(body, [
    'products',
    'total',
    'status',
    'instructions',
    'extraMoney',
  ]);
  const data = {
    total: pickedData.total,
    products: pickedData.products,
    status: pickedData.status,
    user,
  };
  Order.create(data, (err, dataStored) => {
    if (err) {
      return res.status(500).json({ ok: true, message: 'Internal error' });
    }
    return res.status(200).json({ ok: true, message: dataStored });
  });
});

module.exports = router;
