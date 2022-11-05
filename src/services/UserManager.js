const lodash = require('lodash');
const { User } = require('../models/_User');

function UserManager(params) {

};

//

UserManager.prototype.findUsers = async function(criteria, more) {
  const users = await User.find({});
  const output = {
    rows: users,
    count: users.length
  }
  return output;
};

UserManager.prototype.createUser = async function(userObj, more) {
  const user = new User(userObj);
  const output = {};
  //
  if (more && more.generateAuthToken === true) {
    const token = await user.generateAuthToken();
    user.refreshTokens = user.refreshTokens.concat({ token });
    //
    output.token = token;
  };
  //
  await user.save();
  output.user = user;
  //
  return output;
};

module.exports = { UserManager };