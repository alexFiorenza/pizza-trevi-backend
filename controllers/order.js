const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const _ = require('underscore');
const { veriftyToken, verifyAdmin } = require('../middlewares/auth');

/*Get one order per id*/
router.get('/order/:id', veriftyToken, (req, res) => {
  const params = req.params.id;
  Order.findById(params)
    .populate('user', '_id name lastName direction extraInfo')
    .exec((err, orderFound) => {
      if (err) {
        return res.status(500).json({ ok: false, message: 'Internal error' });
      }
      return res.status(200).json({ ok: true, message: orderFound });
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
  const pickedData = _.pick(body, ['products', 'total', 'status']);
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
