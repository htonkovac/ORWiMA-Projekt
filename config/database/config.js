module.exports = {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_TABLE_NAME,
    host: process.env.DB_URL,
    dialect: "pgsql",


    operatorsAliases: true

}