const router = require('koa-router')();

const db = require('../db/index.js');
const uuid = require('node-uuid');
const { ErrMsg } = require('./msg');

router.prefix('/wx');
//  权限验证全部
const cbs = [];
router.use('/', async (ctx, next) => {
  if (cbs.indexOf(ctx.path) != -1 || ctx.user != null) {
    return await next();
  } else {
    ctx.body = new ErrMsg(4000, '权限不足');
  }
});


module.exports = router;
