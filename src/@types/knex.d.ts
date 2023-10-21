// eslint-disable-next-line
import { Knex } from "knex";

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id: string
      username: string
      password: string
      created_at: string
    }
    meals: {
      id: string
      name: string
      description: string
      is_on_diet: boolean
      meal_datetime: string
      created_at: string
      user_id: string
    }
  }
}
