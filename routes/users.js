const router = require('koa-router')();
const db = require('../db/index.js');
const uuid = require('node-uuid');
const { ErrMsg } = require('./msg');

const passport = require('./passport_config');

router.prefix('/users');
router.all('/', async (ctx, next) => {
  if (ctx.isAuthenticated()) {
    return next();
  } else {
    ctx.body = new ErrMsg(4000, '权限不足');
  }
});
router.post('/', async (ctx, next) => {
  ctx.set('Content-Type', 'text/plain;charset=utf-8');
  const user = ctx.request.body;
  if (!user || !user.name || !user.password) {
    ctx.body = new ErrMsg(1001, '注册信息有误。');
    return;
  }
  user.id = uuid.v4();
  var sha1 = crypto.createHash('sha1');
  const pwd = sha1.update('wxexam' + user.password).digest('hex');
  user.password = pwd;

  let userinfo = await db.User.create(user);

  ctx.body = new ErrMsg({
    errCode: 0,
    errMsg: '注册成功',
    data: {
      name: userinfo.name,
      id: userinfo.id
    }
  });
});

router.delete('/', async (ctx, next) => {
  const data = {
    id: uuid.v4(),
    ...(ctx.request.body || {})
  };
  var debudem;
  let user = await db.User.findById(data.id);
  let msg = new ErrMsg();

  if (user) {
    user.status = 'deleted';
    // debudem = user.destroy();
    if (await user.save()) {
      msg.errMsg = '删除成功';
      msg.errCode = 0;
    } else {
      msg.errMsg = '删除失败';
      msg.errCode = 1000;
    }
  } else {
    msg.errMsg = '目标用户不存在。';
    msg.errCode = 1001;
  }

  ctx.body = msg;
});

router.put('/', async (ctx, next) => {
  const data = {
    id: uuid.v4(),
    ...(ctx.request.body || {})
  };

  let user = await db.User.findById(data.id);

  let msg = {
    errCode: 0,
    errMsg: ''
  };
  if (user) {
    for (let item in data) {
      user[item] = data[item];
    }
    if (await user.save()) {
      msg.errMsg = '更新成功';
      msg.errCode = 0;
    } else {
      msg.errMsg = '更新失败';
      msg.errCode = 1000;
    }
    msg.data = user;
  } else {
    msg.errMsg = '没有指定ID记录';
    msg.errCode = 2000;
  }

  ctx.body = msg;
});

router.get('/', async (ctx, next) => {
  let userinfo = await db.User.findAll();
  ctx.body = {
    errCode: 0,
    errMsg: '',
    data: userinfo
  };
});
router.get('/:id', async (ctx, next) => {
  let userinfo = await db.User.findById(ctx.params.id);
  let msg = new ErrMsg();
  if (userinfo) {
    msg.data = userinfo;
  } else {
    msg.errCode = 1000;
  }
  ctx.body = msg;
});
router.post('/login', async (ctx, next) => {
  const data = ctx.request.body;
  if (!data || !data.username || !data.password) {
    ctx.body = new ErrMsg(1001, '账号或密码错误。');
    return;
  }
  return passport.authenticate('local', function(err, user, info, status) {
    if (user) {
      ctx.body = info;
      return ctx.login(user);
    } else {
      ctx.body = info;
    }
  })(ctx, next);
  // var sha1 = crypto.createHash('sha1');
  // const pwd = sha1.update('wxexam' + data.password).digest('hex');

  // let userinfo = await db.sequelize
  //   .query(
  //     `select * from users where name='${data.name}' and password='${pwd}'`
  //   )
  //   .spread(res => {
  //     return res[0];
  //   });

  // if (userinfo) {
  //   if (userinfo.password !== pwd) {
  //     ctx.body = new ErrMsg(1001, '账号或密码错误。');
  //     return;
  //   } else {
  //     ctx.session.user = userinfo;
  //     //   userinfo.token = ctx.session;
  //     ctx.body = new ErrMsg(0, '登录成功', {
  //       id: userinfo.id,
  //       // token: ctx.session,
  //       name: userinfo.name
  //     });
  //   }
  // } else {
  //   ctx.body = new ErrMsg(1000, '账号不存在。');
  // }
});
module.exports = router;
