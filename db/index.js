const Sequelize = require('sequelize');

const sequelize = new Sequelize('wx-exam', 'winson', '2wsxdr5tgb', {
  // 'root', '5tgbhu8', {
  // host: 'localhost',
  host: 'sh-cdb-qvfh765u.sql.tencentcdb.com',
  port: '63926',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

const User = sequelize.define(
  'user',
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    name: Sequelize.STRING(100),
    nickname: Sequelize.STRING(100),
    pic: Sequelize.STRING(255),
    sex: Sequelize.ENUM('0', '1'),
    birthday: Sequelize.DATEONLY,
    qq: Sequelize.STRING(20),
    tel: {
      type: Sequelize.STRING(20),
      validate: {
        isNumeric: true
      }
    },
    email: {
      type: Sequelize.STRING(50),
      validate: {
        isEmail: true
      }
    },
    password: Sequelize.STRING(255),
    status: Sequelize.STRING(100)
  },
  { timestamps: true }
);

const Subject = sequelize.define('subject', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  title: Sequelize.STRING(100),
  tag: {
    type: Sequelize.UUID
  },
  right: {
    type: Sequelize.UUID
  },
  status: Sequelize.STRING(100)
});

const Answer = sequelize.define('answer', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  content: Sequelize.STRING(300),
  sid: {
    type: Sequelize.UUID
  }
});
const CouponType = sequelize.define('coupon_type', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  name: Sequelize.STRING(100),
  status: Sequelize.STRING(100)
});
const CouponKey = sequelize.define('coupon_key', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  status: Sequelize.STRING(100),
  key: Sequelize.STRING(300)
});
const Tag = sequelize.define('tag', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  name: Sequelize.STRING(100)
});

module.exports = {
  sequelize,
  User,
  Subject,
  Answer,
  CouponType,
  CouponKey,
  Tag
};
