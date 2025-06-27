const { Sequelize, DataTypes } = require('sequelize');
const config = require(__dirname + '/../config/database.js')['development'];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: config.logging,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user')(sequelize, DataTypes);
db.Event = require('./event')(sequelize, DataTypes);
db.EventRSVP = require('./eventRSVP')(sequelize, DataTypes);

// User and Event (User creates events)
db.User.hasMany(db.Event, { foreignKey: 'createdById', as: 'createdEvents' });
db.Event.belongsTo(db.User, { foreignKey: 'createdById', as: 'creator' });

// User and EventRSVP (User RSVPs to events)
db.User.hasMany(db.EventRSVP, { foreignKey: 'userId', as: 'rsvps' });
db.EventRSVP.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Event and EventRSVP (Event has many RSVPs)
db.Event.hasMany(db.EventRSVP, { foreignKey: 'eventId', as: 'rsvps' });
db.EventRSVP.belongsTo(db.Event, { foreignKey: 'eventId', as: 'event' });

module.exports = db;