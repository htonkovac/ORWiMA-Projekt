const express = require('express')
const HttpStatus = require('http-status-codes')
const Location = require('../database/models').Location
const check = require('express-validator/check')
const uc = require('../utils/UnitConversion')
const invalidRequestHandler = require('../utils/invalidRequestHandler')

let router = express.Router()

/* POST create new Location */
router.post('/', [
  check.body([Location.reqBodyConstants.lng, Location.reqBodyConstants.lat]).isNumeric()
], invalidRequestHandler, function (req, res, next) {
  return Location.create(Location.getObjectFromRequestBody(req.body))
    .then(loc => res.status(HttpStatus.CREATED).send(loc))
    .catch(() => res.status(HttpStatus.BAD_REQUEST).json({err: 'error'}))
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
          return res.status(HttpStatus.NOT_FOUND).json(null)
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
    Location.reqBodyConstants.lat]).optional().isNumeric()
], invalidRequestHandler, async (req, res, next) => {
  try {
    let loc = await Location.findById(req.params.location_id)
    loc = await loc.update(loc.getUpdatedPropertiesFromRequestBody(req.body))
    // loc we save to DB is not the same as the loc in the DB because we use sequelize ORM so we have to requery the database
    loc = await Location.findById(req.params.location_id)
    return res.status(HttpStatus.OK).json(loc)
  } catch (err) {
    return res.status(HttpStatus.NOT_FOUND).json({ err })
  }
})

/* DELETE read one location by location_id */
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
              (err) => res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err)
            )
        } else {
          return res.status(HttpStatus.NOT_FOUND).json({ err: 'Location not found.' })
        }
      }
    ).catch(
      (err) => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ err })
    )
})

/* GET read all locations in radius */
router.get('/', [
  check.query([Location.queryConstants.lng, Location.queryConstants.lat]).isNumeric(),
  check.query(Location.queryConstants.radius).optional().isInt()
], invalidRequestHandler, async (req, res, next) => {
  if (req.query[Location.queryConstants.radius] == null) {
    req.query[Location.queryConstants.radius] = Location.defaults.radiusInMeters
  }

  try {
    let result = await Location.findAllLocationsWithinRadius(req.query)
    return res.status(HttpStatus.OK).json({count: result.count, locations: result.rows})
  } catch (err) {
    console.error(err)
    return res.status(HttpStatus.NOT_FOUND).send(err)
  }
})

module.exports = router
