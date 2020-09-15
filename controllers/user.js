const express = require('express');
const router = express.Router();
const User = require('../models/user');
const _ = require('underscore');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { veriftyToken, verifyAdmin } = require('../middlewares/auth');

/*Register user*/
router.post('/register', (req, res) => {
  const saltRounds = 10;
  const body = req.body;
  const data = _.pick(body, [
    'name',
    'email',
    'direction',
    'phone',
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
    data.phone &&
    data.extraInfo
  ) {
    User.find({ email: data.email }, (err, userFound) => {
      if (err) {
        return res.status(500).json({ ok: false, message: 'Server error' });
      }

      if (userFound.length > 0) {
        return res
          .status(500)
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
/*Update user data*/
router.put('/user/:id', veriftyToken, (req, res) => {
  const id = req.params.id;
  const data = req.body;
  User.findByIdAndUpdate(id, data, { new: true }, (err, userUpdated) => {
    if (err) {
      return res.status(500).json({ ok: false, message: 'Server error' });
    }
    return res.status(200).json({ ok: true, message: userUpdated });
  });
});
/*Delete a user*/
router.delete('/user/:id', veriftyToken, (req, res) => {
  const id = req.params.id;
  User.findByIdAndDelete(id, (err, deletedDocument) => {
    if (err) {
      return res.status(500).json({ ok: false, message: 'Internal error' });
    }
    return res
      .status(200)
      .json({ ok: true, message: 'User deleted correctly' });
  });
});
/*LogIn logic*/
router.post('/login', (req, res) => {
  const body = req.body;
  const privateKey = process.env.JWT_PRIVATE;
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
        'name',
        'phone',
        'extraInfo',
        'role',
      ]);
      const token = jwt.sign(data, privateKey, { expiresIn: '24h' });
      return res.status(200).json({ ok: true, token });
    });
  });
});
/*Generate token*/
router.post('/token', (req, res) => {
  const privateKey = process.env.JWT_PRIVATE;
  const body = req.body;
  const data = _.pick(body, [
    'email',
    '_id',
    'direction',
    'name',
    'phone',
    'extraInfo',
    'role',
  ]);
  const token = jwt.sign(data, privateKey, { expiresIn: '48h' });
  return res.status(200).json({ token: token });
});
module.exports = router;
