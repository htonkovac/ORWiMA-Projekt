const express = require('express')
const HttpStatus = require('http-status-codes')
const Location = require('../database/models').Location
const check = require('express-validator/check')
const invalidRequestHandler = require('../utils/invalidRequestHandler')
const sequelize = require('./../database/models/index').sequelize
let router = express.Router()

/* GET get all countries */
router.get('/countries', async (req, res) => {
    try {
      const result = await sequelize.query('SELECT DISTINCT country, country_slug FROM "Locations" WHERE country IS NOT NULL', { type: sequelize.QueryTypes.SELECT})
    
      return res.status(HttpStatus.OK).json({result})
    } catch (err) {
      console.error(err)
      return res.status(HttpStatus.NOT_FOUND).json({ errors: ['No countires found']})
    }
  })

  /* GET get all cities */
router.get('/cities/:country_slug', async (req, res) => {
  try {
    const result = await sequelize.query('SELECT DISTINCT city, city_slug, country, country_slug FROM "Locations" WHERE country_slug = :country_slug', { replacements: {country_slug: req.params.country_slug}, type: sequelize.QueryTypes.SELECT})
  
    return res.status(HttpStatus.OK).json({result})
  } catch (err) {
    console.error(err)
    return res.status(HttpStatus.NOT_FOUND).json({ errors: ['No cities found']})
  }
}) 

/* get all locations in a city */
router.get('/locations/:city_slug', async (req, res) => {
  try {
    const result = await sequelize.query('SELECT * FROM "Locations" WHERE city_slug = :city_slug', { replacements: {city_slug: req.params.city_slug}, type: sequelize.QueryTypes.SELECT})
  
    return res.status(HttpStatus.OK).json({result})
  } catch (err) {
    console.error(err)
    return res.status(HttpStatus.NOT_FOUND).json({ errors: ['No locations found']})
  }
}) 
  module.exports = router