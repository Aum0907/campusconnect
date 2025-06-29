module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false }, // Hashed password
    program: { type: DataTypes.STRING, allowNull: true },
    year: { type: DataTypes.INTEGER, allowNull: true },
    interests: { type: DataTypes.TEXT, allowNull: true, defaultValue: '' }
  });
  return User;
};