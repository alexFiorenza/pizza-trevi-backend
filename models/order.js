const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');
const orderSchema = new Schema({
  total: Number,
  type: String,
  instructions: String,
  products: [{}],
  status: String,
  date: { type: String },
  user: { type: Object },
  time: { type: Number },
  extraMoney: Number,
});
module.exports = mongoose.model('Order', orderSchema);
