import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { userRoutes } from './routes/users'
import { mealRoutes } from './routes/meals'

export const app = fastify()

app.register(cookie)
app.register(userRoutes)
app.register(mealRoutes, {
  prefix: 'meals',
})
