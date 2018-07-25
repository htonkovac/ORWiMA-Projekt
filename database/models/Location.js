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
  WGS84_psudoMercator: 3857,
  WGS84: 4326,
  get radiusInKilometers() { return uc.metersToKilometers(this.radiusInMeters) },
  get SRID() { return this.WGS84 }

}

module.exports = (sequelize, DataTypes) => {
  let Location = sequelize.define('Location', {
    google_place_id: DataTypes.STRING,
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    coordinates: DataTypes.GEOMETRY('POINT', defaults.SRID)
  },
    {
      setterMethods: {
        coordinates(lngLat) {
          const point = {
            'type': 'Point', 'coordinates': lngLat, crs: { type: 'name', properties: { name: 'EPSG:' + defaults.SRID } }
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

  Location.findAllLocationsWithinRadius = (query) => {
    return Location.findAndCountAll({
      attributes: {
        include: [
          [
            Sequelize.fn('ST_Distance',
              Sequelize.col('coordinates'),
              Sequelize.fn('GEOGRAPHY', Sequelize.fn('ST_SetSRID', Sequelize.fn('ST_MakePoint', query[queryConstants.lng], query[queryConstants.lat]), defaults.SRID)
              )),
            'distance'
          ]
        ]
      },
      where: Sequelize.where(
        Sequelize.fn(
          'ST_DWithin',
          Sequelize.fn('GEOGRAPHY', Sequelize.col('coordinates')),
          Sequelize.fn('GEOGRAPHY', Sequelize.fn('ST_SetSRID', Sequelize.fn('ST_MakePoint', query[queryConstants.lng], query[queryConstants.lat]), defaults.SRID)),
          query[queryConstants.radius]
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
