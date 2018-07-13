const Sequelize = require('sequelize');
const database = require('./database');

const sequelize = new Sequelize(database.db_table_name , database.db_user, database.db_password, {
  host: database.db_url,
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
});

module.exports = sequelize
