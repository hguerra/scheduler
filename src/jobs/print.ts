import { Scheduler } from './../scheduler';

module.exports = (scheduler: Scheduler) => {
  // `job` is an object representing the job that `producer.js` scheduled.
  // `job.attrs` contains the raw document that's stored in MongoDB, so
  // `job.attrs.data` is how you get the `data` that `producer.js` passes
  // to `schedule()`

  scheduler.agenda().then(agenda => {
    agenda.define('print', (job, done) => {
      scheduler.isCancelled(job).then(isCancelled => {
        if (isCancelled) {
          return;
        }

        console.log(job.attrs.data.message);
        done();
      });
    });
  });
};
