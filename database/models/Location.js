'use strict';
module.exports = (sequelize, DataTypes) => {
  let Location = sequelize.define('Location', {
    google_place_id: DataTypes.STRING,
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    coordinates: DataTypes.GEOMETRY('POINT', 4326)
  }, {
      setterMethods: {
        coordinates(lat_lng) {
          const point = {
            "type": "Point", "coordinates": lat_lng, crs: { type: 'name', properties: { name: 'EPSG:4326' } }
          }
          this.setDataValue('coordinates', point);
        },
      }
    });
  Location.associate = function (models) {
    // associations can be defined here

  };


  Location.getObjectFromRequestBody = (body) => {
    return {
      google_place_id: body.google_place_id,
      name: body.name,
      address: body.address,
      coordinates: [body.lat, body.lng]
    }
  }

  Location.prototype.getUpdatedPropertiesFromRequestBody = (body) => {
    return {
      google_place_id: body.google_place_id |this.google_place_id,
      name: body.name || this.name,
      address: body.address || this.address,
      coordinates: [body.lat, body.lng] || this.coordinates
    }
  }
  return Location;
};