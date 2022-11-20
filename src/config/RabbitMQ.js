const amqplib = require('amqplib');
function RabbitMQ(params) {};


RabbitMQ.prototype.createChannelRabbitMQ = async (severity, exchange, message) => {
  const conn = await amqplib.connect('amqps://hjkeioll:7OgBFg1efmXxsPEsvbHwyVfmwBmNwmYq@porpoise.rmq.cloudamqp.com/hjkeioll');

  var channel = await conn.createChannel();

  channel.publish(exchange, severity, Buffer.from(JSON.stringify(message)),{
    type: 'direct',
    persistent: true
  });
};

module.exports = { RabbitMQ };