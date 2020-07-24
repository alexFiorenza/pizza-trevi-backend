const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  type: String,
  price: Number,
  description: String,
  name: String,
  image: String,
  top: Boolean,
});

module.exports = mongoose.model('Product', productSchema);
