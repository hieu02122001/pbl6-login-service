const express = require('express');
const lodash = require('lodash');
const router = new express.Router();
const { User } = require('../models/_User');
const { UserManager } = require('../services/UserManager');
const { auth } = require('../middleware/auth');

const PATH = '/api/v1';

const userManager = new UserManager();

router.post(PATH + '/users', async (req, res) => {
  const PICK_FIELDS = ["firstName", "lastName", "email", "password", "phone", "avatar", "gender", "roleId"];
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
  try {
    const users = await userManager.findUsers();
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

router.post(PATH + '/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
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

router.post(PATH + '/sign-up', async (req, res) => {
  try {
    const PICK_FIELDS = ["firstName", "lastName", "email", "password", "phone", "avatar", "gender", "roleId"];
    const userObj = lodash.pick(req.body, PICK_FIELDS);
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
  try {
    res.send(req.user);
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


module.exports = router;