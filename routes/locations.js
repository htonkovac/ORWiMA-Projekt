const express = require('express')
const HttpStatus = require('http-status-codes')
const Location = require('../database/models').Location
const check = require('express-validator/check').check
const uc = require('../utils/UnitConversion')
const invalidRequestHandler = require('../utils/invalidRequestHandler')

let router = express.Router()

/* POST create new Location */
router.post('/create', [
  check([Location.reqBodyConstants.lng, Location.reqBodyConstants.lat]).isNumeric()
], invalidRequestHandler, function (req, res, next) {
  return Location.create(Location.getObjectFromRequestBody(req.body))
    .then(loc => res.status(HttpStatus.CREATED).send(loc))
    .catch(() => res.status(HttpStatus.BAD_REQUEST).json({err: 'error'}))
})

/* GET read one location by location_id */
router.get('/location/:location_id', [
  check('location_id').isInt()
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
router.put('/location/:location_id', [
  check('location_id').isInt(),
  check([Location.reqBodyConstants.lng,
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
router.delete('/location/:location_id', [
  check('location_id').isInt()
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

// /* GET read all locations in radius */
// router.get('/locations', (req, res, next) => {
//   console.log(req.query)
//   if (!Location.IsLocationsQueryValid(req.query)) {
//     return res.status(HttpStatus.BAD_REQUEST).json(
//       { err: 'Get request query needs to contain: ' + Location.queryConstants.lng + ',' + Location.queryConstants.lat + ' and ' + Location.queryConstants.radius })
//   }

//   let attributes = Object.keys(Location.attributes)
//   let location = sequelize.literal(`ST_GeomFromText('POINT(${req.query[Location.queryConstants.lng]} ${req.query[Location.queryConstants.lat]})')`)
//   let distance = sequelize.fn('ST_Distance_Sphere', sequelize.literal('location'), location)
//   attributes.push([distance, 'distance'])

//   Location.findAll({
//     attributes: attributes,
//     order: 'distance',
//     where: sequelize.where(distance, { $lte: res.query[Location.queryConstants.radius] }),
//     logging: console.log
//   })
//     .then(function (instance) {
//       return res.json(200, instance)
//     })
// })

/* GET read all locations in radius */
router.get('/locations', [
  check([Location.reqBodyConstants.lng, Location.reqBodyConstants.lat]).isNumeric(),
  check(Location.reqBodyConstants.radius).optional().isNumeric()
], async (req, res, next) => {
  if (req.query[Location.queryConstants.radius] == null) {
    req.query[Location.queryConstants.radius] = Location.defaults.radiusInMeters
  } else {
    req.query[Location.queryConstants.radius] = uc.kilometersToMeters(req.query[Location.queryConstants.radius])
  }
  try {
    let result = await Location.findAllLocationsWithinRadius(req.query)
    return res.status(HttpStatus.OK).json({count: result.count, locations: result.rows})
  } catch (err) {
    return res.status(HttpStatus.NOT_FOUND).send()
  }
})

module.exports = router
