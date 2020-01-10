import { CronJob } from 'cron'
import cleanupSrpChallenges from './cleanupSrpChallenges'
import connectToDatabase from '../db/database'

export default async function setupCronTasks() {
  const db = connectToDatabase()

  const jobs = [
    new CronJob(
      '*/15 * * * *', // Every 15 minutes
      () => cleanupSrpChallenges(db),
      null,
      true,
      'Europe/Paris'
    )
  ]
  return jobs
}
