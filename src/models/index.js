const { Sequelize } = require('sequelize');
const path = require('path');

// 初始化数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || './database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true,
    freezeTableName: true
  }
});

// 导入模型
const User = require('./User')(sequelize);
const Notification = require('./Notification')(sequelize);
const Attachment = require('./Attachment')(sequelize);

// 设置关联关系
const models = {
  User,
  Notification,
  Attachment
};

// 执行关联
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// 数据库初始化函数
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 同步数据库表
    await sequelize.sync({ alter: true });
    console.log('数据库表同步完成');
    
    // 创建默认管理员用户
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      const admin = await User.build({
        username: 'admin',
        isAdmin: true
      });
      await admin.setPassword('admin123');
      await admin.save();
      console.log('创建默认管理员用户: admin / admin123');
    }
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Notification,
  Attachment,
  initDatabase
};

