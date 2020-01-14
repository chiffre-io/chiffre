import { CronJob } from 'cron'
import cleanupSrpChallenges from './cleanupSrpChallenges'
import { App } from '../types'

export default function setupCronTasks(app: App) {
  const jobs = [
    new CronJob(
      '*/15 * * * *', // Every 15 minutes
      () => cleanupSrpChallenges(app),
      null,
      true,
      'Europe/Paris'
    )
  ]
  return jobs
}
