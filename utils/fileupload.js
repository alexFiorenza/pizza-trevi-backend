const Product = require('../models/product');
const path = require('path');
const fs = require('fs');
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
              return res
                .status(200)
                .json({ ok: true, message: 'Image updated' });
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
}
module.exports = fileUpload;
