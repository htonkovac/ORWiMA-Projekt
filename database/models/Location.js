'use strict'
const Sequelize = require('sequelize')
const uc = require('../../utils/UnitConversion')

const reqBodyConstants = {
  google_place_id: 'google_place_id',
  name: 'name',
  address: 'address',
  lng: 'longitude',
  lat: 'latitude'
}

const queryConstants = {
  lng: 'longitude',
  lat: 'latitude',
  radius: 'radius'
}

const defaults = {
  radiusInMeters: 10000,
  radiusInKilometers: uc.metersToKilometers(this.radiusInMeters)
}

module.exports = (sequelize, DataTypes) => {
  let Location = sequelize.define('Location', {
    google_place_id: DataTypes.STRING,
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    coordinates: DataTypes.GEOMETRY('POINT', 4326)
  },
  {
    setterMethods: {
      coordinates (lngLat) {
        const point = {
          'type': 'Point', 'coordinates': lngLat, crs: { type: 'name', properties: { name: 'EPSG:4326' } }
        }
        this.setDataValue('coordinates', point)
      }
    }
  })

  Location.getObjectFromRequestBody = (body) => {
    return {
      google_place_id: body[reqBodyConstants.google_place_id],
      name: body[reqBodyConstants.name],
      address: body[reqBodyConstants.address],
      coordinates: [body[reqBodyConstants.lng], body[reqBodyConstants.lat]]
    }
  }

  Location.requestContainsValidCoordinates = (body) => {
    if (!Location.requestContainsCoordinates(body) ||
      typeof body[reqBodyConstants.lng] !== 'number' ||
      typeof body[reqBodyConstants.lat] !== 'number') {
      return false
    }
    return true
  }

  Location.requestContainsCoordinates = (body) => {
    if (body[reqBodyConstants.lng] == null || body[reqBodyConstants.lat] == null) {
      return false
    }
    return true
  }

  Location.IsLocationsQueryValid = (query) => {
    if (query[queryConstants.radius] != null && typeof query[queryConstants.radius] !== 'number') {
      return false
    }

    if (typeof query[queryConstants.lng] === 'number' && typeof query[queryConstants.lat] === 'number') {
      return true
    }
    return false
  }

  Location.findAllLocationsWithinRadius = (query) => {
    return Location.findAll({
      attributes: {
        include: [
          [
            Sequelize.fn(
              'ST_Distance',
              Sequelize.col('coordinates'),
              Sequelize.fn('ST_MakePoint', query[queryConstants.lng], query[queryConstants.lat])
            ),
            'distance'
          ]
        ]
      },
      where: Sequelize.where(
        Sequelize.fn(
          'ST_DWithin',
          Sequelize.col('location'),
          Sequelize.fn('ST_MakePoint', query[queryConstants.lng], query[queryConstants.lat]),
          defaultDistance
        ),
        true
      ),
      order: Sequelize.literal('distance ASC')
    })
  }

  Location.prototype.getUpdatedPropertiesFromRequestBody = function (body) {
    return {
      google_place_id: body[reqBodyConstants.google_place_id] || this.google_place_id,
      name: body[reqBodyConstants.name] || this.name,
      address: body[reqBodyConstants.address] || this.address,
      coordinates: [body[reqBodyConstants.lng] || this.coordinates.coordinates[0], body[reqBodyConstants.lat] || this.cooridantes.coordinates[1]]
    }
  }

  Location.reqBodyConstants = reqBodyConstants
  Location.queryConstants = queryConstants
  Location.defaults = defaults
  return Location
}
