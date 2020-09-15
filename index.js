const express = require('express');
const app = express();
let server = require('http').createServer(app);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const userController = require('./controllers/user');
const productController = require('./controllers/product');
const path = require('path');
const fileupload = require('express-fileupload');
const orderController = require('./controllers/order');
const cors = require('cors');
const socketIo = require('socket.io');
require('dotenv').config();

let uri;
if (PORT !== 3000) {
  uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@pizza-in-trevi.kqqrm.mongodb.net/${process.env.DB_DATABASE}?retryWrites=true&w=majority`;
} else {
  uri = 'mongodb://localhost:27017';
}
console.log(uri);
/*CORS*/
app.use(cors());
/*Middlewares*/
app.use(
  bodyParser.json({
    limit: '50mb',
  })
);
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true,
  })
);

app.use(express.static(path.join(__dirname, './uploads')));
app.use(fileupload());
app.get('/', (req, res) => {
  return res.status(200).json({ ok: true, message: 'Api working properly' });
});
app.use('/api', userController);
app.use('/api', productController);
app.use('/api', orderController);
module.exports.io = socketIo(server);
require('./socket/socket');
mongoose.connect(
  uri,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log('Correctly connected to db');
    server.listen(PORT, () => {
      console.log('Succesfully connected');
    });
  }
);
