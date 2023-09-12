import { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { knex } from '../database'
import { z } from 'zod'

export async function mealRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isOnDiet: z.boolean(),
      mealDatetime: z.string().refine(
        (value) => {
          // RegEx pattern to match the format
          const pattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/

          // Test method to check if the value matches the pattern
          return pattern.test(value)
        },
        {
          message:
            'Invalid date and time format. It should be "YYYY-MM-DD HH:mm:ss".',
        },
      ),
    })

    const { name, description, isOnDiet, mealDatetime } =
      createMealBodySchema.parse(request.body)

    const sessionId = request.cookies.sessionId

    const user = await knex('users')
      .where('session_id', sessionId)
      .select('id')
      .first()

    if (user === undefined) {
      return reply.status(403).send('User not logged')
    }
    const userId = user.id

    await knex('meals').insert({
      id: crypto.randomUUID(),
      name,
      description,
      is_on_diet: isOnDiet,
      meal_datetime: mealDatetime,
      user_id: userId,
    })

    return reply.status(201).send()
  })
}
