import crypto, { randomUUID } from 'node:crypto'
import { env } from '../env'
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { encryptPassword, verifyPassword } from '../utils/hashPassword'
import { Knex } from 'knex'

export async function userRoutes(app: FastifyInstance) {
  app.post('/sign-up', async (request, reply) => {
    const createUserBodySchema = z.object({
      username: z.string(),
      password: z.string(),
    })

    const { username, password } = createUserBodySchema.parse(request.body)
    console.log(`username: ${username}, password: ${password}`)

    // Encryption of password
    const passwordEncrypted = encryptPassword(env.SECRET_KEY, password)

    // Check user exists
    if (await checkUserExists(knex, username)) {
      return reply.status(403).send('"username" já cadastrado')
    }

    const sessionId = randomUUID()
    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days expires
    })

    await knex('users').insert({
      id: crypto.randomUUID(),
      username,
      password: passwordEncrypted,
      session_id: sessionId,
    })
    return reply.status(201).send()
  })

  app.post('/sign-in', async (request, reply) => {
    const loginUserBodySchema = z.object({
      username: z.string(),
      password: z.string(),
    })

    const { username, password } = loginUserBodySchema.parse(request.body)

    const sessionId = randomUUID()
    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days expires
    })

    const user = { password: encryptPassword(env.SECRET_KEY, password + '123') }

    const userSearched = await knex('users')
      .where('username', username)
      .select('password')
      .first()

    if (userSearched !== undefined) {
      user.password = userSearched.password
    }

    const storedPassword = user.password

    const passwordVerification = verifyPassword(
      storedPassword,
      password,
      env.SECRET_KEY,
    )

    if (passwordVerification) {
      await knex('users').where('username', username).update({
        session_id: sessionId,
      })
      return reply.status(200).send()
    }
    return reply.status(401).send('Invalid credentials.')
  })
}

async function checkUserExists(knex: Knex, username: string) {
  const userExists = await knex('users')
    .select('id')
    .where('username', username)

  return userExists[0]
}
