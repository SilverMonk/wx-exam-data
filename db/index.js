const Sequelize = require('sequelize');

const sequelize = new Sequelize('interior-finish', 'root', '5tgbhu8', {
  host: 'localhost',
  port: '3306',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  timezone: '+08:00' //东八时区
});

const User = sequelize.define(
  'user',
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    openid: {
      type: Sequelize.UUID
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
    identity: Sequelize.STRING(100),
    password: Sequelize.STRING(255),
    status: Sequelize.STRING(100)
  },
  { timestamps: true }
);

const Project = sequelize.define('project', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  pno: Sequelize.STRING(100),
  customer: Sequelize.STRING(100),
  p_site: Sequelize.STRING(300),
  designer: Sequelize.STRING(100),
  c_contect: Sequelize.STRING(100),
  d_contect: Sequelize.STRING(100),
  status: Sequelize.STRING(100)
});
const Product = sequelize.define('product', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  pname: Sequelize.STRING,
  unit: Sequelize.STRING(50),
  price: Sequelize.FLOAT,
  marks: Sequelize.STRING(2000),
  status: Sequelize.STRING(100)
});
const P_Group = sequelize.define('p_group', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  status: Sequelize.STRING(100),
  gname: Sequelize.STRING
});
const Budget = sequelize.define('budget', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  pid: Sequelize.UUID,
  bno: Sequelize.STRING(100),
  status: Sequelize.STRING(100),
  pname: Sequelize.STRING,
  quantity: Sequelize.INTEGER,
  unit: Sequelize.STRING(50),
  price: Sequelize.FLOAT,
  amount: Sequelize.FLOAT,
  marks: Sequelize.STRING(2000),
  group: Sequelize.UUID
});

module.exports = {
  sequelize,
  User,
  Project,
  Product,
  P_Group,
  Budget
};
