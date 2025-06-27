module.exports = (sequelize, DataTypes) => {
  const EventRSVP = sequelize.define('EventRSVP', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
    eventId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Events', key: 'id' } },
    status: { type: DataTypes.STRING, defaultValue: 'going', allowNull: false }
  }, {
    indexes: [{ unique: true, fields: ['userId', 'eventId'] }] 
  });
  return EventRSVP;
};