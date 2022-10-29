const jwt = require('jsonwebtoken');
const { User } = require('../models/_User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('token');
    const tokenDecoded = decodeToken(token);
    const user = await User.findOne({
      _id: tokenDecoded._id,
      'refreshTokens.token': tokenDecoded.token
    })
    //
    if (!user) {
      throw new Error();
    }
    //
    req.user = user;
    //
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate!" });
  }
}

const decodeToken = (token) => {
  token = token.replace('Bearer ', '');
  const decoded = jwt.verify(token, 'shibabooking');
  return {
    token,
    ...decoded
  }
}
module.exports = { auth }