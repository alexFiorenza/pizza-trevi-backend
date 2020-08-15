const Product = require('../models/product');
const path = require('path');
const fs = require('fs');
function fileUpload(id, req, res) {
  const params = id;
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
}
module.exports = fileUpload;
