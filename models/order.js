const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  total: Number,
  type: String,
  Instructions: String,
  products: [{}],
  status: String,
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
});
module.exports = mongoose.model('Order', orderSchema);
