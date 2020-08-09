const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const veriftyToken = (req, res, next) => {
  const token = req.headers.authorization.replace(/['"]+/g, '');
  const privateKey = fs.readFileSync(
    path.join(__dirname, './private.key'),
    'utf8'
  );
  jwt.verify(token, privateKey, (err, decoded) => {
    if (err) {
      next(new Error('Invalid Token'));
      return res.status(500).json({ ok: false, message: 'There was an error' });
    }
    const payload = decoded;
    req.user = payload;
  });
  next();
};
const verifyAdmin = (req, res, next) => {
  const user = req.user;
  if (user.role === 'ADMIN') {
    next();
  } else {
    next(new Error('You dont have permission'));
  }
};

module.exports = {
  veriftyToken,
  verifyAdmin,
};
