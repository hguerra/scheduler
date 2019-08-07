import dotenv from 'dotenv';
import Agenda from 'agenda';

// initialize configuration
dotenv.config();

const agenda = new Agenda({
  db: { address: process.env.MONGODB_URI, collection: 'jobs' },
  maxConcurrency: 5,
  defaultConcurrency: 1
});

export async function pub() {
  // Wait for agenda to connect. Should never fail since connection failures
  // should happen in the `await MongoClient.connect()` call.
  await new Promise(resolve => agenda.once('ready', resolve));

  // Schedule a job and persist it to mongodb.
  // The third parameter to `schedule()` is an object that can contain
  // arbitrary data. This data will be stored in the `data` property
  // in the document in mongodb
  const job = agenda.create('print', {
    message: 'Hello!'
  });

  job.repeatEvery('10 seconds', {
    skipImmediate: true
  });
  await job.save();

  console.log('Job successfully saved');
}

async function graceful() {
  await agenda.stop();
  process.exit(0);
}

process.on('SIGTERM', graceful);
process.on('SIGINT', graceful);
