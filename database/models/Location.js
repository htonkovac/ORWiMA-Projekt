'use strict'
const reqBodyConstants = {
  google_place_id: 'google_place_id',
  name: 'name',
  address: 'address',
  lat: 'latitude',
  lng: 'longitude'
}

const queryConstants = {
  lat: 'latitude',
  lng: 'longitude',
  radius: 'radius'
}

module.exports = (sequelize, DataTypes) => {
  let Location = sequelize.define('Location', {
    google_place_id: DataTypes.STRING,
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    coordinates: DataTypes.GEOMETRY('POINT', 4326)
  }, {
    setterMethods: {
      coordinates (latLng) {
        const point = {
          'type': 'Point', 'coordinates': latLng, crs: { type: 'name', properties: { name: 'EPSG:4326' } }
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
      coordinates: [body[reqBodyConstants.lat], body[reqBodyConstants.lng]]
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
    if (body[reqBodyConstants.lat] == null || body[reqBodyConstants.lng] == null) {
      return false
    }
    return true
  }

  Location.IsLocationsQueryValid = (query) => {
    if (typeof query[queryConstants.lat] === 'number' && typeof query[queryConstants.lng] === 'number' && typeof query[queryConstants.radius] === 'number') {
      return true
    }
    return false
  }

  Location.prototype.getUpdatedPropertiesFromRequestBody = function (body) {
    return {
      google_place_id: body[reqBodyConstants.google_place_id] || this.google_place_id,
      name: body[reqBodyConstants.name] || this.name,
      address: body[reqBodyConstants.address] || this.address,
      coordinates: [body[reqBodyConstants.lat] || this.coordinates.coordinates[0], body[reqBodyConstants.lng] || this.cooridantes.coordinates[1]]
    }
  }

  Location.reqBodyConstants = reqBodyConstants
  Location.queryConstants = queryConstants
  return Location
}
