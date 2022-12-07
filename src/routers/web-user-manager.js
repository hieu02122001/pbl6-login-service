const express = require('express');
const lodash = require('lodash');
const router = new express.Router();
const { User } = require('../models/_User');
const { UserManager } = require('../services/UserManager');
const { BusinessManager } = require('../services/BusinessManager');
const { auth } = require('../middleware/auth');
const { sendEmail } = require('../utilities/Utilities');

const PATH = '/api/v1';

const businessManager = new BusinessManager();
const userManager = new UserManager({
  businessManager
});

router.post(PATH + '/users', async (req, res) => {
  const PICK_FIELDS = ["firstName", "lastName", "email", "password", "phone", "avatar", "gender", "roleId", "businessId"];
  const userObj = lodash.pick(req.body, PICK_FIELDS);
  //
  try {
    const { user } = await userManager.createUser(userObj);
    //
    res.send(user);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.get(PATH + '/users', auth, async (req, res) => {
  const { query } = req;
  try {
    const criteria = {};
    // roleId
    if(query && query.roleId) {
      lodash.set(criteria, "roleId", query.roleId);
    }
    // businessId
    if(query && query.businessId) {
      lodash.set(criteria, "businessId", query.businessId);
    }
    // search: slug/phone/email
    if(query && query.search) {
      lodash.set(criteria, "search", query.search);
    }
    // pagination
    if(query && query.page) {
      lodash.set(criteria, "page", query.page);
    }
    //
    const users = await userManager.findUsers(criteria);
    //
    res.send(users);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.get(PATH + '/users/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userManager.getUser(id);
    //
    res.send(user);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.put(PATH + '/users/:id', auth, async (req, res) => {
  const PICK_FIELDS = ["firstName", "lastName", "email", "password", "phone", "avatar", "gender", "roleId"];
  const userObj = lodash.pick(req.body, PICK_FIELDS);
  const { id } = req.params;
  //
  try {
    const user = await userManager.updateUser(id, userObj);
    //
    res.send(user);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete(PATH + '/users/:id', auth, async (req, res) => {
  const { id } = req.params;
  //
  try {
    const user = await userManager.deleteUser(id);
    //
    res.send(user);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.post(PATH + '/users/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password, {role: "ADMIN"});
    //
    const userId = lodash.get(user, "_id");
    const token = await userManager.generateAuthToken(userId);
    user.refreshTokens = user.refreshTokens.concat({ token });
    await user.save();
    //
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post(PATH + '/users/client/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password, {role: "CLIENT"});
    //
    const userId = lodash.get(user, "_id");
    const token = await userManager.generateAuthToken(userId);
    user.refreshTokens = user.refreshTokens.concat({ token });
    await user.save();
    //
    res.send({ user, token });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post(PATH + '/client/sign-up', async (req, res) => {
  try {
    const PICK_FIELDS = ["firstName", "lastName", "email", "password", "phone", "avatar", "gender"];
    const userObj = lodash.pick(req.body, PICK_FIELDS);
    lodash.set(userObj, "roleId", "636723d347707eeadf80eb59");
    //
    const { user, token } = await userManager.createUser(userObj, { generateAuthToken: true });
    //
    res.send({ user, token });
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

// ------------------------------------------------------------------------------------

router.get(PATH + '/me', auth, async (req, res) => {
  const id = req.user._id;
  try {
    const user = await userManager.getUser(id);
    //
    res.send(user);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.post(PATH + '/me/logout', auth, async (req, res) => {
  try {
    req.user.refreshTokens = lodash.filter(req.user.refreshTokens, (item) => {
      return item.token !== req.token;
    });
    //
    await req.user.save();
    //
    res.send("Logout successfully");
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// ------------------------------------------------------------------------------------

router.post(PATH + '/reset-password', async (req, res) => {
  const { email } = req.body;
  try {
    if (email) {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error(`Not found user with email [${email}]`);
      }
      //
      res.send(await sendEmail(user._id));
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post(PATH + '/reset-password/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  //
  try {
    const user = await userManager.updateUser(id, { password });
    //
    res.send(user);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;