// import { pub } from './producer';
import { sub } from './consumer';

// https://thecodebarbarian.com/node.js-task-scheduling-with-agenda-and-mongodb
sub().catch(error => {
  console.error(error);
  process.exit(-1);
});
