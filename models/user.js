const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  password: String,
  email: String,
  phone: String,
  direction: String,
  extraInfo: String,
  date: { type: Date, default: Date.now },
  role: String,
});

module.exports = mongoose.model('User', userSchema);
