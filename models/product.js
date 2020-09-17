const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  type: String,
  price: Number,
  description: String,
  name: String,
  image: String,
  imageName: { type: String, default: null },
  top: Boolean,
  available: Boolean,
  flavors: String,
  state: Boolean,
});

module.exports = mongoose.model('Product', productSchema);
