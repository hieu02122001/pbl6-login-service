const amqplib = require('amqplib');
const lodash = require('lodash');

function Consumer(params) { };

const consumer = async (severity) => {
  const exchange = 'booking';
  const queue = 'queue_user';
  
  const conn = await amqplib.connect('amqps://hjkeioll:7OgBFg1efmXxsPEsvbHwyVfmwBmNwmYq@porpoise.rmq.cloudamqp.com/hjkeioll');

  var channel = await conn.createChannel();

  channel.assertExchange(exchange, 'direct', {
    durable: true,
  });

  for (const item of severity) {
    channel.bindQueue(queue, exchange, item);
  }
  channel.consume(queue, (msg) => {
    if (msg !== null) {
      console.log('Event: ',  msg.fields.routingKey)
      console.log('Recieved:', msg.content.toString());
      
      channel.ack(msg);
    } else {
      console.log('Consumer cancelled by server');
    }
  });
};

module.exports = {
  consumer
}
