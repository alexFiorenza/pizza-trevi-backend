const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { veriftyToken, verifyAdmin } = require('../middlewares/auth');
const _ = require('underscore');
const path = require('path');
const fs = require('fs');
const fileupload = require('../utils/fileupload');
const fileUpload = require('express-fileupload');
/*Get all products*/
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
/*Get one  product*/
router.get('/product/:id', (req, res) => {
  const params = req.params.id;

  Product.findOne({ _id: params }, (err, productFound) => {
    if (err) {
      return res.status(500).json({ ok: false, message: 'Internal error' });
    }
    if (!productFound) {
      return res
        .status(400)
        .json({ ok: false, message: 'There was no product' });
    }
    return res.status(200).json({ ok: true, message: productFound });
  });
});
/*Upload a new product*/
router.post('/product', veriftyToken, verifyAdmin, (req, res) => {
  const body = req.body;

  const data = _.pick(body, [
    'type',
    'description',
    'price',
    'name',
    'top',
    'available',
  ]);
  if (req.files !== null) {
    if (data.type && data.description && data.price >= 0 && data.name) {
      Product.create(data, (err, productCreated) => {
        if (err) {
          return res.status(500).json({ ok: false, message: 'Internal error' });
        }
        return fileupload(productCreated._id, req, res);
      });
    }
  } else {
    Object.assign(data, { image: null });

    if (data.type && data.description && data.price >= 0 && data.name) {
      Product.create(data, (err, productCreated) => {
        if (err) {
          return res.status(500).json({ ok: false, message: 'Internal error' });
        }
        return res
          .status(200)
          .json({ ok: true, message: 'Product was created', productCreated });
      });
    }
  }
});
/*Update a product*/
router.put('/product/:id', veriftyToken, verifyAdmin, (req, res) => {
  const params = req.params.id;
  const body = req.body;
  const dataToUpdate = _.pick(body, [
    'type',
    'price',
    'description',
    'name',
    'top',
    'available',
    'state',
  ]);
  if (req.files !== null) {
    Product.findByIdAndUpdate(
      params,
      dataToUpdate,
      { useFindAndModify: false, new: true },
      (err, objUpdated) => {
        console.log(objUpdated);
        if (err) {
          return res.status(500).json({ ok: false, message: 'Internal error' });
        }
        return fileupload(params, req, res);
      }
    );
  } else {
    Product.findByIdAndUpdate(
      params,
      dataToUpdate,
      { useFindAndModify: false, new: true },
      (err, objUpdated) => {
        if (err) {
          return res.status(500).json({ ok: false, message: 'Internal error' });
        }
        return res
          .status(200)
          .json({ ok: true, message: 'Product updated', objUpdated });
      }
    );
  }
});
/*Delete a product*/
router.delete('/product/:id', veriftyToken, verifyAdmin, (req, res) => {
  const query = req.query.disable;
  const id = req.params.id;
  Product.findById(id, (err, productFound) => {
    if (productFound.image != null) {
      fs.unlinkSync(path.join(__dirname, `../uploads/${productFound.image}`));
    }
  });
  Product.findByIdAndDelete(id, (err, productDeleted) => {
    if (err) {
      return res.status(500).json({ ok: false, message: 'Internal error' });
    }
    if (productDeleted) {
      return res.status(200).json({ ok: true, message: 'Product was deleted' });
    }
  });
});
/*Upload a image to a product*/
router.put('/upload/:id', veriftyToken, verifyAdmin, (req, res) => {
  const params = req.params.id;
  Product.findOne({ _id: params }, (err, productFound) => {
    if (err) {
      return res.status(500).json({ ok: false, message: 'An Internal error' });
    }
    if (!productFound) {
      return res
        .status(400)
        .json({ ok: false, message: 'There was no product' });
    }
    if (productFound.image != null) {
      fs.unlinkSync(path.join(__dirname, `../uploads/${productFound.image}`));
    }
    const image = req.files.image;
    const imageName = image.name.replace(/\s/g, '');
    const splitedName = imageName.split('.');
    const ext = splitedName[splitedName.length - 1];
    if (ext === 'jpeg' || ext === 'png' || ext === 'jpg') {
      const imageToStore = `${splitedName[0]}-${Date.now()}.${ext}`;
      Product.findOneAndUpdate(
        { _id: params },
        { image: imageToStore },
        { new: true },
        (err, productUpdated) => {
          if (err) {
            return res
              .status(500)
              .json({ ok: false, message: 'Internal error' });
          }
          image.mv(
            path.join(__dirname, `../uploads/${imageToStore}`),
            (err, imageStored) => {
              if (err) {
                return res
                  .status(500)
                  .json({ ok: false, message: 'Image couldnt be saved' });
              }
              return res
                .status(200)
                .json({ ok: true, message: productUpdated });
            }
          );
        }
      );
    }
  });
});
module.exports = router;
