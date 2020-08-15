const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const userController = require('./controllers/user');
const productController = require('./controllers/product');
const path = require('path');
const fileupload = require('express-fileupload');
const orderController = require('./controllers/order');
const cors = require('cors');
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
app.use('/api', userController);
app.use('/api', productController);
app.use('/api', orderController);
mongoose.connect(
  'mongodb://localhost:27017/pizzatrevi',
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log('Correctly connected to db');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  }
);
