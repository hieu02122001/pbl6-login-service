const express = require('express');
const router = new express.Router();
const { User } = require('../models/_User');

router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    //
    res.send(user);
  } catch(error) {
    res.status(400).send(error);
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    //
    res.send(users);
  } catch(error) {
    res.status(400).send(error);
  }
});

router.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (lodash.isNil(user)) {
      throw new Error("Not found!");
    }
    //
    res.send(user);
  } catch(error) {
    res.status(400).send(error.message);
  }
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    if (lodash.isNil(user)) {
      throw new Error("Not found!");
    }
    //
    res.send(user);
  } catch(error) {
    res.status(400).send(error.message);
  }
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (lodash.isNil(user)) {
      throw new Error("Not found!");
    }
    //
    res.send(user);
  } catch(error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;