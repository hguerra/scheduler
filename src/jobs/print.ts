import Agenda from 'agenda';

module.exports = (agenda: Agenda) => {
  // `job` is an object representing the job that `producer.js` scheduled.
  // `job.attrs` contains the raw document that's stored in MongoDB, so
  // `job.attrs.data` is how you get the `data` that `producer.js` passes
  // to `schedule()`
  agenda.define('print', (job, done) => {
    console.log(job.attrs.data.message);
    done();
  });
};
