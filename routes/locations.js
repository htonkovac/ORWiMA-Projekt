const express = require('express');
const HttpStatus = require('http-status-codes');
const Location = require('../database/models').Location;
const sequelize = require('../database/models').sequelize;
let router = express.Router();

/* POST create new Location */
router.post('/create', function (req, res, next) {

    if (!validateCooridnates(req.body)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ err: 'Please provide valid coordinates, "lat" and "lng"' })
    }

    return Location.create(Location.getObjectFromRequestBody(req.body))
        .then(todo => res.status(HttpStatus.CREATED).send(todo))
        .catch(error => res.status(HttpStatus.BAD_REQUEST).json(error))
});
/* GET read one location by location_id */
router.get('/location/:location_id', (req, res, next) => {

    Location.findById(req.params.location_id)
        .then(
            (loc) => {
                if (loc != null) {
                    return res.status(HttpStatus.OK).json(loc)
                }
                return res.status(HttpStatus.NOT_FOUND).json(null)
            }
        ).catch(
            (err) => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ err: "internal server error" })
        );


});

/* POST update one location by location_id */
router.post('/location/:location_id', (req, res, next) => {

    if (!validateCooridnates(req.body)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ err: 'Please provide valid coordinates, "lat" and "lng"' });
    }

    Location.findById(req.params.location_id)
        .then(
            (loc) => {
                if (loc != null) {
                    loc.update(
                        loc.getUpdatedPropertiesFromRequestBody(body)
                    )
                        .then(
                            () => res.status(HttpStatus.OK).json(loc))
                        .catch(
                            (err) => res.status(HttpStatus.NOT_FOUND).send(err))


                    return res.status(HttpStatus.OK).json(loc)
                }
                return res.status(HttpStatus.NOT_FOUND).json({ err: "Location of id ${location_id} was not found." })
            }
        ).catch(
            (err) => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ err: "internal server error" })
        );


});

module.exports = router;

function validateCooridnates(body) {
    if (body.lat == null || body.lng == null || isNaN(body.lng) || isNaN(body.lat)) {
        return false;
    }
    return true;
}