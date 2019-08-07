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

export async function sub() {
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
  }
}

async function graceful() {
  await agenda.stop();
  process.exit(0);
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);
