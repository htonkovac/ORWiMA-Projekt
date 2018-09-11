'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      google_place_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      name: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      coordinates: {
        type: Sequelize.GEOMETRY('POINT', 4326)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      contact: {
        type: Sequelize.STRING, allowNull: true
      },
      working_hours: {
        type: Sequelize.JSONB, allowNull: true
      },
      type: {
        type: Sequelize.STRING, allowNull: true
      },
      street: {
        type: Sequelize.STRING, allowNull: true
      },
      city: {
        type: Sequelize.STRING, allowNull: true
      },
      country: {
        type: Sequelize.STRING, allowNull: true
      },
      city_slug: {
        type: Sequelize.STRING, allowNull: true
      },
      country_slug: {
        type: Sequelize.STRING, allowNull: true
      },
      region: {
        type: Sequelize.STRING, allowNull: true
      },
      working_hours_note: {
        type: Sequelize.STRING, allowNull: true
      }

    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Locations')
  }
}
