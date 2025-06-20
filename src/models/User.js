const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_admin'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  // 实例方法
  User.prototype.setPassword = async function(password) {
    const saltRounds = 12;
    this.passwordHash = await bcrypt.hash(password, saltRounds);
  };

  User.prototype.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.passwordHash);
  };

  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.passwordHash;
    return {
      id: values.id,
      username: values.username,
      isAdmin: values.isAdmin,
      createdAt: values.createdAt,
      updatedAt: values.updatedAt
    };
  };

  // 关联关系
  User.associate = function(models) {
    User.hasMany(models.Notification, {
      foreignKey: 'authorId',
      as: 'notifications',
      onDelete: 'CASCADE'
    });
  };

  return User;
};

