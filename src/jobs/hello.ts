import Agenda from 'agenda';

module.exports = (agenda: Agenda) => {
  // Define a "job", an arbitrary function that agenda can execute
  agenda.define('hello', () => {
    console.log('Hello, World!');
  });
};
