import { ProjectMessage } from '../db/models/entities/ProjectMessageQueue'

export type MessageQueueResponse = Omit<
  ProjectMessage,
  'projectID' | 'performance'
>
