import { MongoClient, Db } from 'mongodb';
import Agenda, { Job } from 'agenda';

const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1/agenda';
const DEFAULT_MONGODB_DATABASE = 'agenda';
const DEFAULT_MONGODB_COLLECTION = 'jobs';

/**
 * Based on: https://thecodebarbarian.com/node.js-task-scheduling-with-agenda-and-mongodb
 */
export class Scheduler {
  private mongodbUri: string = null;
  private databaseName: string = null;
  private collectionName: string = null;

  private client: MongoClient = null;
  private db: Db = null;

  private options: object = null;
  private ag: Agenda = null;

  constructor(
    mongodbUri: string = null,
    mongodbDatabase: string = null,
    mongodbCollection: string = null,
    maxConcurrency = 5,
    defaultConcurrency = 1
  ) {
    this.mongodbUri = mongodbUri || process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
    this.databaseName = mongodbDatabase || process.env.MONGODB_DATABASE || DEFAULT_MONGODB_DATABASE;
    this.collectionName = mongodbCollection || process.env.MONGODB_COLLECTION || DEFAULT_MONGODB_COLLECTION;

    this.options = {
      maxConcurrency,
      defaultConcurrency
    };
  }

  public agenda(): Promise<Agenda> {
    return new Promise((resolve, reject) => {

      if (this.ag === null) {
        this.connectDb(this.mongodbUri, this.databaseName)
          .then(() => {

            const agenda = new Agenda(this.options).mongo(
              this.db,
              this.collectionName
            );

            const stop = async () => {
              await agenda.stop();
              process.exit(0);
            };

            process.on('SIGTERM', stop);
            process.on('SIGINT', stop);

            this.ag = agenda;
            resolve(this.ag);
          })
          .catch(err => {
            console.error(err);
            reject(err);
          });

      } else {
        resolve(this.ag);
      }

    });
  }

  /**
   * pub
   *
   * https://github.com/agenda/agenda#creating-jobs
   */
  public async pub(job: Job) {
    // Wait for agenda to connect. Should never fail since connection failures
    // should happen in the `await MongoClient.connect()` call.
    await new Promise(resolve => this.ag.once('ready', resolve));
    // Schedule a job and persist it to mongodb.
    await job.save();
    console.log('Job successfully saved.');
  }

  /**
   * Cancel the job, which deletes the document from the 'jobs' collection
   */
  public async cancel(name: string) {
    await new Promise((resolve, reject) => {
      this.ag
        .cancel({ name })
        .then(() => {
          resolve();
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  /**
   * isCancelled
   * @param job Job
   */
  public async isCancelled(job: Job): Promise<boolean> {
    const count = await this.db
      .collection(this.collectionName)
      .countDocuments({ _id: job.attrs._id });
    return !(count > 0);
  }

  /**
   * sub
   */
  public async sub() {
    const jobTypes = this.loadJobs();

    // Wait for agenda to connect. Should never fail since connection failures
    // should happen in the `await MongoClient.connect()` call.
    await new Promise(resolve => this.ag.once('ready', resolve));

    if (jobTypes.length) {
      this.ag.start();
    }
  }

  private loadJobs() {
    const jobTypes = process.env.JOB_TYPES
      ? process.env.JOB_TYPES.split(',')
      : [];

    jobTypes.forEach(type => {
      require('./jobs/' + type)(this);
    });

    return jobTypes;
  }

  private async connectDb(uri: string, dbname: string) {
    this.client = await MongoClient.connect(uri);
    this.db = this.client.db(dbname);
  }
}
