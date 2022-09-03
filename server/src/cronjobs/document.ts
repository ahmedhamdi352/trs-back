import cron from 'node-cron';
import settingRepository from '../repository/setting';
import documentController from '../controller/core/documentController';
import { ESettings } from '../helper';

export default class DocumentCronJob {
  public static currentJob: any;

  public static statJob(job: cron.ScheduledTask) {
    console.log('start job.');

    job.start();
  }
  public static stopJob(job: cron.ScheduledTask) {
    console.log('stop job.');
    job.stop();
  }

  public static destroyJob(job: cron.ScheduledTask) {
    if (job) {
      console.log('destroy job.');
      job.destroy();
    }
  }

  public static getCurrentJob() {
    return this.currentJob;
  }

  public static createJob(hour: number, job: any) {
    console.log('creating new job.');
    // 0 15 * * *
    let expression = `0 ${hour} * * *`;
    // let expression = Number(minutes) === 1 ? '* * * * *' : `*/${minutes} * * * *`;
    this.currentJob = cron.schedule(expression, async () => {
      console.log('job', new Date());
      job();
    });
  }

  // called only when server starts
  public static async init() {
    const setting = await settingRepository.get(ESettings.documentCronjob);
    if (setting) {
      const parsed = JSON.parse(setting.value);
      if (parsed.enabled) {
        DocumentCronJob.createJob(parsed.hour, documentController.cronJobHandler);
      }
    }
  }
}
