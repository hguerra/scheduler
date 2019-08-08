import dotenv from 'dotenv';
import { Scheduler } from './scheduler';

// initialize configuration
dotenv.config();

// main
const scheduler = new Scheduler();

// pub
scheduler.agenda().then((agenda) => {
  const job = agenda.create('print', {
    message: 'Hello!'
  });

  job.repeatEvery('10 seconds', {
    skipImmediate: true
  });

  scheduler.pub(job).catch(error => {
    console.error(error);
    process.exit(-1);
  });
});

// sub
// scheduler.agenda().then(() => {
//   scheduler.sub().catch(error => {
//     console.error(error);
//     process.exit(-1);
//   });
// });

// cancel
// scheduler.agenda().then(() => {
//   scheduler.cancel('print').catch(() => {
//     process.exit(-1);
//   });
// });
