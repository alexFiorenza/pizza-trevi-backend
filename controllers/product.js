const express = require('express');
const router = express.Router();
const Product = require('../models/product');

router.get('/product', (req, res) => {
  return res.status(200).json({
    ok: false,
    message: 'All is running correctly from product router',
  });
});

router.get('/products', (req, res) => {
  Product.find((err, productsFound) => {
    if (err) {
      return res.status(500).json({ ok: false, message: 'Internal error' });
    }
    if (!productsFound) {
      return res
        .status(400)
        .json({ ok: false, message: 'There was no product' });
    }
    return res.status(200).json({ ok: true, message: productsFound });
  });
});
module.exports = router;
