const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { veriftyToken, verifyAdmin } = require('../middlewares/auth');
const _ = require('underscore');
const path = require('path');
const fs = require('fs');
const fileupload = require('../utils/fileupload');
const { Storage } = require('@google-cloud/storage');
const PORT = process.env.PORT || 3000;
var gc;
if (PORT === 3000) {
  gc = new Storage({
    keyFilename: path.join(__dirname, '../pizza-in-trevi-57cb0ccabd46.json'),
    projectId: 'pizza-in-trevi',
  });
} else {
  gc = new Storage({
    keyFilename: path.join(__dirname, '../gcpconfig.json'),
    projectId: 'pizza-in-trevi',
  });
}
const fileUploadBucket = gc.bucket('pizzaintrevi-fileupload');
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
    if (productFound.imageName !== null) {
      const name = productFound.imageName;
      fileUploadBucket.file(name).delete();
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
    if (productFound.imageName !== null) {
      const name = productFound.imageName;
      fileUploadBucket.file(name).delete();
    }
    const image = req.files.image;
    const data = image.data;
    const imageName = image.name.replace(/\s/g, '');
    const splitedName = imageName.split('.');
    const ext = splitedName[splitedName.length - 1];
    if (ext === 'jpeg' || ext === 'png' || ext === 'jpg') {
      const imageToStore = `${splitedName[0]}-${Date.now()}.${ext}`;
      const file = fileUploadBucket.file(imageToStore);
      const fileStream = file.createWriteStream({
        resumable: false,
      });
      fileStream
        .on('finish', () => {
          const publicUrl = `https://storage.googleapis.com/${fileUploadBucket.name}/${file.name}`;

          Product.findOneAndUpdate(
            { _id: params },
            { $set: { image: publicUrl, imageName: imageToStore } },
            { new: true },
            (err, productUpdated) => {
              if (err) {
                return res
                  .status(500)
                  .json({ ok: false, message: 'Internal error' });
              }
              return res.status(200).json({
                ok: true,
                message: 'Image updated',
                product: productUpdated,
              });
            }
          );
        })
        .on('error', () => {
          return res.status(500).json({
            ok: false,
            message: 'Unable to upload image something went wrong',
          });
        })
        .end(data);
    }
  });
});
module.exports = router;
