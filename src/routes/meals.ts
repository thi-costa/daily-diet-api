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
  app.get('/', async (request, reply) => {
    const sessionId = request.cookies.sessionId

    const user = await knex('users')
      .where('session_id', sessionId)
      .select('id')
      .first()

    if (user === undefined) {
      return reply.status(403).send('User not logged')
    }
    const userId = user.id

    const meals = await knex('meals')
      .where({
        user_id: userId,
      })
      .select()

    return { meals }
  })
  app.get('/:id', async (request, reply) => {
    const sessionId = request.cookies.sessionId

    const user = await knex('users')
      .where('session_id', sessionId)
      .select('id')
      .first()

    if (user === undefined) {
      return reply.status(403).send('User not logged')
    }

    const userId = user.id

    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getMealsParamsSchema.parse(request.params)

    const meal = await knex('meals')
      .where({
        user_id: userId,
        id,
      })
      .first()

    if (meal === undefined) {
      return reply.status(404).send('Meal does not exist')
    }

    return meal
  })
  app.get('/summary', async (request, reply) => {
    const sessionId = request.cookies.sessionId

    const user = await knex('users')
      .where('session_id', sessionId)
      .select('id')
      .first()

    if (user === undefined) {
      return reply.status(403).send('User not logged')
    }

    const userId = user.id

    const totalMeals = (await knex('meals')
      .where({ user_id: userId })
      .count('id as count')
      .first()) ?? { count: 0 }
    const totalDietMeals = (await knex('meals')
      .where('user_id', userId)
      .where('is_on_diet', 1)
      .count('id as count')
      .first()) ?? { count: 0 }
    const totalNonDietMeals = (await knex('meals')
      .where('user_id', userId)
      .where('is_on_diet', 0)
      .count('id as count')
      .first()) ?? { count: 0 }
    const bestDietSequence = await knex('meals')
      .select('id', 'meal_datetime')
      .where('user_id', userId)
      .where('is_on_diet', 1)
      .orderBy('meal_datetime', 'asc')

    const summary = {
      totalMeals: totalMeals.count,
      totalDietMeals: totalDietMeals.count,
      totalNonDietMeals: totalNonDietMeals.count,
      bestDietSequence,
    }

    return { summary }
  })
  app.patch('/:id', async (request, reply) => {
    const sessionId = request.cookies.sessionId

    const user = await knex('users')
      .where('session_id', sessionId)
      .select('id')
      .first()

    if (user === undefined) {
      return reply.status(403).send('User not logged')
    }

    const userId = user.id

    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getMealsParamsSchema.parse(request.params)

    const getMealsBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      is_on_diet: z.boolean().optional(),
      meal_datetime: z.string().optional(),
    })
    const updatedData = getMealsBodySchema.parse(request.body)

    await knex('meals')
      .where({
        user_id: userId,
        id,
      })
      .update(updatedData)

    return updatedData
  })
  app.delete('/:id', async (request, reply) => {
    const sessionId = request.cookies.sessionId

    const user = await knex('users')
      .where('session_id', sessionId)
      .select('id')
      .first()
    console.log('user logged')

    if (user === undefined) {
      return reply.status(403).send('User not logged')
    }

    const userId = user.id
    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getMealsParamsSchema.parse(request.params)
    console.log('id_meal: ' + id)

    const meal = await knex('meals')
      .where({
        user_id: userId,
        id,
      })
      .del()

    console.log('Meal deleted: ' + meal)
    if (meal === 0) {
      return reply.status(404).send('Meal does not exist')
    }

    return reply.status(204).send()
  })
}
