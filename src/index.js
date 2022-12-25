const express = require('express');
const lodash = require('lodash');
require('./models/database/mongoose');
const { consumer } = require('./config/Consumer')
const userRouter = require('./routers/web-user-manager');
const roleRouter = require('./routers/web-role-manager');
const packageRouter = require('./routers/web-package-manager');
const businessRouter = require('./routers/web-business-manager');
const subsRouter = require('./routers/web-subs-manager');
const { taskCheckSubs } = require('./utilities/Cron');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;
//
app.use(express.json());
//
app.use(userRouter);
app.use(businessRouter);
app.use(roleRouter);
app.use(packageRouter);
app.use(subsRouter);
//
taskCheckSubs.start();
//
const severity = [
  'PaymentSuccessIntegrationEvent'
]
consumer(severity);
//
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});