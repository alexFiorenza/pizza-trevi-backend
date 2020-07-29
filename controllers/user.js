const express = require('express');
const router = express.Router();
const User = require('../models/user');
const _ = require('underscore');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

/*Register user*/
router.post('/register', (req, res) => {
  const saltRounds = 10;
  const body = req.body;
  const data = _.pick(body, [
    'name',
    'email',
    'direction',
    'lastName',
    'extraInfo',
  ]);
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
    User.find({ email: data.email }, (err, userFound) => {
      if (err) {
        return res.status(500).json({ ok: false, message: 'Server error' });
      }

      if (userFound === undefined) {
        return res
          .status(400)
          .json({ ok: false, message: 'There is a user with that email' });
      } else {
        User.create(data, (err, user) => {
          if (err) {
            return res.status(500).json({ ok: false, message: 'Server error' });
          }
          return res.status(200).json({ ok: true, message: user });
        });
      }
    });
  } else {
    res.status(400).json({ ok: false, message: 'Data not provided' });
  }
});
/*LogIn logic*/
router.post('/login', (req, res) => {
  const body = req.body;
  const privateKey = fs.readFileSync(
    path.join(__dirname, '../middlewares/private.key'),
    'utf8'
  );
  const dataPicked = _.pick(body, ['email', 'password']);
  User.findOne({ email: dataPicked.email }, (err, userFound) => {
    if (err) {
      return res.status(500).json({ ok: false, message: 'Server error' });
    }
    if (!userFound) {
      return res.status(404).json({ ok: false, message: 'user not found' });
    }
    bcrypt.compare(dataPicked.password, userFound.password, (err, equal) => {
      if (err) {
        return res.status(500).json({ ok: false, message: 'Server error' });
      }
      if (!equal) {
        return res
          .status(400)
          .json({ ok: false, message: 'incorrect password' });
      }
      const data = _.pick(userFound, [
        'email',
        '_id',
        'direction',
        'lastName',
        'role',
      ]);
      const token = jwt.sign(data, privateKey, { expiresIn: '48h' });
      return res.status(200).json({ ok: true, token });
    });
  });
});

module.exports = router;
