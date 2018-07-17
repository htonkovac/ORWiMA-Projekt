const express = require('express')
const HttpStatus = require('http-status-codes')
const Location = require('../database/models').Location
const sequelize = require('../database/models')
let router = express.Router()

/* POST create new Location */
router.post('/create', function (req, res, next) {
  if (!Location.requestContainsValidCoordinates(req.body)) {
    return res.status(HttpStatus.BAD_REQUEST).json({ err: 'Please provide valid coordinates, ' + Location.reqBodyConstants.lat + ' and ' + Location.reqBodyConstants.lng })
  }

  return Location.create(Location.getObjectFromRequestBody(req.body))
    .then(todo => res.status(HttpStatus.CREATED).send(todo))
    .catch(error => res.status(HttpStatus.BAD_REQUEST).json(error))
})

/* GET read one location by location_id */
router.get('/location/:location_id', (req, res, next) => {
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
      (err) => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ err })
    )
})

/* PUT update one location by location_id */
router.put('/location/:location_id', (req, res, next) => {
  if (Location.requestContainsCoordinates(req.body) && !Location.requestContainsValidCoordinates(req.body)) {
    return res.status(HttpStatus.BAD_REQUEST).json({ err: 'Please provide valid coordinates, "lat" and "lng"' })
  }

  Location.findById(req.params.location_id)
    .then(
      (loc) => {
        if (loc != null) {
          return loc.update(loc.getUpdatedPropertiesFromRequestBody(req.body))
            .then(
              () => res.status(HttpStatus.OK).json(loc))
            .catch(
              (err) => res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err))
        } else {
          return res.status(HttpStatus.NOT_FOUND).json({ err: 'Location of id ' + req.params.location_id + 'was not found.' })
        }
      }
    ).catch(
      (err) => res.status(HttpStatus.NOT_FOUND).json({ err })
    )
})

/* DELETE read one location by location_id */
router.delete('/location/:location_id', (req, res, next) => {
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
router.get('/locations', (req, res, next) => {
  console.log(req.query)
  if (!Location.IsLocationsQueryValid(req.query)) {
    return res.status(HttpStatus.BAD_REQUEST).json(
      { err: 'Get request query needs to contain: ' + Location.queryConstants.lng + ',' + Location.queryConstants.lat + ' and ' + Location.queryConstants.radius })
  }

  let attributes = Object.keys(Location.attributes)
  let location = sequelize.literal(`ST_GeomFromText('POINT(${req.query[Location.queryConstants.lng]} ${req.query[Location.queryConstants.lat]})')`)
  let distance = sequelize.fn('ST_Distance_Sphere', sequelize.literal('location'), location)
  attributes.push([distance, 'distance'])

  Location.findAll({
    attributes: attributes,
    order: 'distance',
    where: sequelize.where(distance, { $lte: res.query[Location.queryConstants.radius] }),
    logging: console.log
  })
    .then(function (instance) {
      return res.json(200, instance)
    })
})

module.exports = router
