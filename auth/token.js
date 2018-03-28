const jwt = require('jsonwebtoken');
const secret = require('../config/secret.json');
const util = require('util');
const verify = util.promisify(jwt.verify);

const { ErrMsg } = require('../routes/msg');
/**
 * 判断token是否可用
 */
module.exports = function() {
  return async function(ctx, next) {
    const token =
      ctx.header.authorization && ctx.header.authorization.split(' ')[1];
    try {
      let payload = token && (await verify(token, secret.sign));
      if (payload != null && payload.id != null) {
        ctx.user = {
          name: payload.name,
          id: payload.id
        };
      }
      await next();
    } catch (err) {
      ctx.response.status = 200;
      ctx.body = new ErrMsg(4000, '验证失败', err);
    }
  };
};
