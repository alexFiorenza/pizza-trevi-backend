const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const userController = require('./controllers/users/user');
/*Middlewares*/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api', userController);
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