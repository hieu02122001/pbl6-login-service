const express = require('express');
const lodash = require('lodash');
require('./models/database/mongoose');
const userRouter = require('./routers/web-user-manager');
const roleRouter = require('./routers/web-role-manager');
const taskRouter = require('./routers/Task');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;
//
app.use(express.json());
//
app.use(userRouter);
app.use(roleRouter);
app.use(taskRouter);
//
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});