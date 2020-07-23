const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const _ = require('underscore');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
router.get('/', (req, res) => {
  return res
    .status(200)
    .send({ ok: true, message: 'Message from user controller' });
});
/*Register user*/
router.post('/register', (req, res) => {
  const saltRounds = 10;
  const body = req.body;
  const data = _.pick(body, ['name', 'email', 'direction', 'lastName']);
  const hashedPassword = bcrypt.hashSync(body.password, saltRounds);
  Object.assign(data, {
    password: hashedPassword,
    role: 'USER',
  });
  if (
    data.password &&
    data.name &&
    data.email &&
    data.direction &&
    data.lastName
  ) {
    User.create(data, (err, user) => {
      if (err) {
        console.log(err);
      }
      return res.status(200).json({ ok: true, message: user });
    });
  } else {
    res.status(400).json({ ok: false, message: 'Data not provided' });
  }
});
router.post('/login', (req, res) => {
  //   const privatekey = fs.readFileSync(
  //     path.join(__dirname, '../../middlewares/private.key'),
  //     'utf8'
  //   );
  //   console.log(privatekey);
});

module.exports = router;
