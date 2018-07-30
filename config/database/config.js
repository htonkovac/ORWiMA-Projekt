// sequelize cli needs this
require('dotenv').config()

module.exports = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  host: process.env.DB_HOST,
  dialect: 'postgres',

  operatorsAliases: true,

  // sequelize cli needs this
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres'

  }
}
