const db = require('./index');
const uuid = require('node-uuid');

module.exports = {
  createObj: async (type, obj) => {
    var user = obj;
    user.id = uuid.v4();
    return await db[type].create(user);
  },
  getObjs: async type => {
    return await db[type].findAll();
  }
};
