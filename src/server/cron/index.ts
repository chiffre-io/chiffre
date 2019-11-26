import { CronJob } from 'cron'
import cleanupSrpChallenges from './cleanupSrpChallenges'
import database from '../db/database'

export default async function setupCronTasks() {
  const jobs = [
    new CronJob(
      '*/15 * * * *', // Every 15 minutes
      () => cleanupSrpChallenges(database),
      null,
      true,
      'Europe/Paris'
    )
  ]
  return jobs
}
