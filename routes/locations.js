const express = require('express')
const HttpStatus = require('http-status-codes')
const Location = require('../database/models').Location
const check = require('express-validator/check')
const invalidRequestHandler = require('../utils/invalidRequestHandler')

let router = express.Router()

/* POST create new Location */
router.post('/', [
  check.body([Location.reqBodyConstants.lng, Location.reqBodyConstants.lat]).isNumeric(),
  // check.body([Location.reqBodyConstants.working_hours]).isJSON()
], invalidRequestHandler, function (req, res, next) {
  return Location.create(Location.getObjectFromRequestBody(req.body))
    .then(loc => res.status(HttpStatus.CREATED).send(loc))
    .catch((err) => res.status(HttpStatus.BAD_REQUEST).json({ errors: ['Unable to create location', err] }))
})
/* GET get all locations */
router.get('/all', async (req, res) => {
  try {
    const result = await Location.findAndCountAll()
    return res.status(HttpStatus.OK).json({ count: result.count, locations: result.rows })
  } catch (err) {
    return res.status(HttpStatus.NOT_FOUND).json({ errors: ['No locations found'] })
  }
})

/* GET read one location by location_id */
router.get('/:location_id', [
  check.param('location_id').isInt()
], invalidRequestHandler, (req, res, next) => {
  Location.findById(req.params.location_id)
    .then(
      (loc) => {
        if (loc != null) {
          return res.status(HttpStatus.OK).json(loc)
        } else {
          return res.status(HttpStatus.NOT_FOUND).json({ errors: ['Location not found'] })
        }
      }
    ).catch(
      () => res.status(HttpStatus.NOT_FOUND).json({ errors: ['Location not found'] })
    )
})

/* PUT update one location by location_id */
router.put('/:location_id', [
  check.param('location_id').isInt(),
  check.body([Location.reqBodyConstants.lng,
  Location.reqBodyConstants.lat]).optional().isNumeric(),
  // check.body([Location.reqBodyConstants.working_hours]).optional().isJSON()

], invalidRequestHandler, async (req, res, next) => {
  try {
    let loc = await Location.findById(req.params.location_id)
    loc = await loc.update(loc.getUpdatedPropertiesFromRequestBody(req.body))
    // loc we save to DB is not the same as the loc in the DB because we use sequelize ORM so we have to requery the database
    loc = await Location.findById(req.params.location_id)
    return res.status(HttpStatus.OK).json(loc)
  } catch (err) {
    return res.status(HttpStatus.NOT_FOUND).json({ errors: [err] })
  }
})

/* DELETE one location by location_id */
router.delete('/:location_id', [
  check.param('location_id').isInt()
], invalidRequestHandler, (req, res, next) => {
  Location.findById(req.params.location_id)
    .then(
      (loc) => {
        if (loc != null) {
          return loc
            .destroy()
            .then(
              () => {
                return res.status(HttpStatus.OK).json(loc)
              })
            .catch(
              (err) => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ errors: [err] })
            )
        } else {
          return res.status(HttpStatus.NOT_FOUND).json({ errors: ['Location not found.'] })
        }
      }
    ).catch(
      (err) => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ errors: [err] })
    )
})

/* GET read all locations in radius */
router.get('/', [
  check.query([Location.queryConstants.lng, Location.queryConstants.lat]).optional().isNumeric(),
  check.query(Location.queryConstants.radius).optional().isInt()
], invalidRequestHandler,
  async (req, res, next) => {
    if (req.query[Location.queryConstants.lng] == null || req.query[Location.queryConstants.lat] == null) {
      req.query[Location.queryConstants.lng] = 15.952532
      req.query[Location.queryConstants.lat] = 45.8124106
    }

    if (req.query[Location.queryConstants.radius] == null) {
      req.query[Location.queryConstants.radius] = Location.defaults.radiusInMeters
    }

    try {
      let result = await Location.findAllLocationsWithinRadius(req.query)
      return res.status(HttpStatus.OK).json({ count: result.count, locations: result.rows })
    } catch (err) {
      console.error(err)
      return res.status(HttpStatus.NOT_FOUND).json({ errors: [err] })
    }
  })

module.exports = router
