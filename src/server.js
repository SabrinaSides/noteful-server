const knex= require('knex')
const app = require('./app')
const { PORT, DATABASE_URL } = require('./config')

//connect to db using knex
const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
  ssl: true,
  dialectOptions: {
    ssl: { require: true },
  },
  logging: false,
})

app.set('db', db)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})