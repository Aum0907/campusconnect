module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    time: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false }, 
    rsvpCount: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    createdById: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } }
  });
  return Event;
};