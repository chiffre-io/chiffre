import Knex from 'knex'
import { testUserCredentials } from './01-users'
import { formatEmitterEmbedScript } from '~/src/server/emitterScript'
import {
  Project,
  PROJECTS_TABLE
} from '~/src/server/db/models/projects/Projects'

export const testProject = {
  projectID: 'c0ffeeb0-dead-f00d-baad-cafebaadcafe',
  key: 'QSBU_0eqn8fBlRuZYuSqcFJe7cxqLTZ5-E5CJYW4Pwk=',
  publicKey: 'AAa5jWhVoFoxunJ_8RzvCT2DbaX1C6eRIo9YBhU7tUY=',
  secretKey: 'mZRAvkB8hZkFU6u_1aQC3GNd6AosZYQjVt0uTNHtnAo=',
  creator: testUserCredentials.userID
}

export const seed = async (knex: Knex) => {
  if (process.env.NODE_ENV === 'production') {
    return
  }
  try {
    const { projectID, creator } = testProject
    const project: Project = {
      id: projectID,
      publicKey: testProject.publicKey,
      encrypted: 'invalid',
      creator
    }
    await knex.insert(project).into(PROJECTS_TABLE)
    const emitter = await formatEmitterEmbedScript(knex, projectID)
    console.log(emitter)
  } catch (error) {
    console.error(error)
  }
}
