const amqplib = require('amqplib');
const { BusinessManager } = require('../services/BusinessManager');
const { UserManager } = require('../services/UserManager');
const lodash = require('lodash');

const businessManager = new BusinessManager();
const userManager = new UserManager({businessManager});

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
  channel.consume(queue, async (msg) => {
    try {
      if (msg !== null) {
        const MAPPING_FUNCTION = {
          'BusinessUpdatedIntegrationEvent': userManager.attachBusinessToUserByRabbitMQ
        }
        const consumerFunction = MAPPING_FUNCTION[msg.fields.routingKey];
        if (consumerFunction) {
          await consumerFunction.call(userManager, JSON.parse(msg.content.toString()));
        }
        //
        channel.ack(msg);
      } else {
        console.log('Consumer cancelled by server');
      }
    } catch (error) {
      console.log({ message: error.message });
      channel.ack(msg);
    }
    
    
  });
};

module.exports = {
  consumer
}
