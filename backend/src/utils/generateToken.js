const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      userType: user.userType,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
};

module.exports = generateToken;
