const express = require('express');
const router = new express.Router();
const { Task } = require('../models/_Task');

router.post('/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    //
    res.send(task);
  } catch(error) {
    res.status(400).send(error);
  }
});

router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({});
    //
    res.send(tasks);
  } catch(error) {
    res.status(400).send(error);
  }
});

router.get('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) {
      throw new Error("Not found!");
    }
    //
    res.send(task);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    if (!task) {
      throw new Error("Not found!");
    }
    //
    res.send(task);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      throw new Error("Not found!");
    }
    //
    res.send(task);
  } catch(error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;