const passport = require('koa-passport');
const LocalStrategy = require('passport-local');

const db = require('../db/index.js');
const uuid = require('node-uuid');
const { ErrMsg } = require('./msg');

const crypto = require('crypto');

passport.use(
  new LocalStrategy(function(username, password, done) {
    var sha1 = crypto.createHash('sha1');
    const pwd = sha1.update('wxexam' + password).digest('hex');
    db.User.findOne({ where: { name: username } }).then(res => {
      if (res) {
        if (res.password !== pwd) {
          return done(null, false, new ErrMsg(4001, '密码错误'));
        } else {
          var outUserInfo = {
            name: res.name,
            id: res.id
          };
          return done(null, res, new ErrMsg(0, '登录成功', outUserInfo));
        }
      } else {
        return done(null, false, new ErrMsg(4000, '未知用户'));
      }
    });
  })
);
// serializeUser 在用户登录验证成功以后将会把用户的数据存储到 session 中
passport.serializeUser(function(user, done) {
  done(null, user);
});

// deserializeUser 在每次请求的时候将从 session 中读取用户对象
passport.deserializeUser(function(user, done) {
  return done(null, user);
});

module.exports = passport;
