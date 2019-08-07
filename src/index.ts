import dotenv from 'dotenv';
import Agenda from 'agenda';

// initialize configuration
dotenv.config();

// https://thecodebarbarian.com/node.js-task-scheduling-with-agenda-and-mongodb
const agenda = new Agenda({
  db: { address: process.env.MONGODB_URI, collection: 'jobs' },
  maxConcurrency: 5,
  defaultConcurrency: 1
});

async function run() {
  const jobTypes = process.env.JOB_TYPES
    ? process.env.JOB_TYPES.split(',')
    : [];

  jobTypes.forEach(type => {
    require('./jobs/' + type)(agenda);
  });

  // Wait for agenda to connect. Should never fail since connection failures
  // should happen in the `await MongoClient.connect()` call.
  await new Promise(resolve => agenda.once('ready', resolve));

  if (jobTypes.length) {
    agenda.start();

    // Schedule a job for 1 second from now and persist it to mongodb.
    // Jobs are uniquely defined by their name, in this case "hello"
    agenda.schedule(new Date(Date.now() + 1000), 'hello');
    agenda.every('10 seconds', 'hello');
    agenda.processEvery('10 seconds');
  }
}

async function graceful() {
  await agenda.stop();
  process.exit(0);
}

run().catch(error => {
  console.error(error);
  process.exit(-1);
});

process.on('SIGTERM', graceful);
process.on('SIGINT' , graceful);
