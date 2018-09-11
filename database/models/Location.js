'use strict'
const Sequelize = require('sequelize')
const uc = require('../../utils/UnitConversion')

const reqBodyConstants = {
  google_place_id: 'google_place_id',
  name: 'name',
  address: 'address',
  lng: 'longitude',
  lat: 'latitude',
  contact: 'contact',
  working_hours: 'working_hours',
  type: 'type',
  street: 'street',
  city: 'city',
  country: 'country',
  city_slug: 'city_slug',
  country_slug: 'country_slug',
  region: 'region',
  working_hours_note: 'working_hours_note'
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
    coordinates: DataTypes.GEOMETRY('POINT', defaults.SRID),
    contact: DataTypes.STRING,
    working_hours: DataTypes.JSONB,
    type: DataTypes.STRING,
    street: DataTypes.STRING,
    city: DataTypes.STRING,
    country: DataTypes.STRING,
    city_slug: DataTypes.STRING,
    country_slug: DataTypes.STRING,
    region: DataTypes.STRING,
    working_hours_note: DataTypes.STRING
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
      coordinates: [body[reqBodyConstants.lng], body[reqBodyConstants.lat]],
      contact: body[reqBodyConstants.contact],
      working_hours: body[reqBodyConstants.working_hours],
      type: body[reqBodyConstants.type],
      street: body[reqBodyConstants.street],
      city: body[reqBodyConstants.city],
      country: body[reqBodyConstants.country],
      city_slug: body[reqBodyConstants.city_slug],
      country_slug: body[reqBodyConstants.country_slug],
      region: body[reqBodyConstants.region],
      working_hours_note: body[reqBodyConstants.working_hours_note]
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
      coordinates: [body[reqBodyConstants.lng] || this.coordinates.coordinates[0], body[reqBodyConstants.lat] || this.cooridantes.coordinates[1]],
      contact: body[reqBodyConstants.contact] || this.contact,
      working_hours: body[reqBodyConstants.working_hours] || this.working_hours,
      type: body[reqBodyConstants.type] || this.type,
      street: body[reqBodyConstants.street] || this.street,
      city: body[reqBodyConstants.city] || this.city,
      country: body[reqBodyConstants.country] || this.country,
      city_slug: body[reqBodyConstants.city_slug] || this.city_slug,
      country_slug: body[reqBodyConstants.country_slug] || this.country_slug,
      region: body[reqBodyConstants.region] || this.region,
      working_hours_note: body[reqBodyConstants.working_hours_note] || this.working_hours_note
    }
  }

  Location.reqBodyConstants = reqBodyConstants
  Location.queryConstants = queryConstants
  Location.defaults = defaults
  return Location
}
