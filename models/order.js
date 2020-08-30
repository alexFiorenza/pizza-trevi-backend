const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  total: Number,
  type: String,
  instructions: String,
  products: [{}],
  status: String,
  date: { type: Date, default: Date.now },
  user: { type: Object },
});
module.exports = mongoose.model('Order', orderSchema);
