const router = require('koa-router')();
const db = require('../db/index.js');
const uuid = require('node-uuid');
const querystring = require('querystring');
const { ErrMsg } = require('./msg');

router.prefix('/answers');
//  权限验证全部
const cbs = [];
router.use('/', async (ctx, next) => {
  if (cbs.indexOf(ctx.path) != -1 || ctx.isAuthenticated()) {
    return await next();
  } else {
    ctx.body = new ErrMsg(4000, '权限不足');
  }
});

router.delete('/:id', async (ctx, next) => {
  let msg = new ErrMsg();
  var id = ctx.params.id;
  if (id) {
    let sdata = await db.Answer.findOne({
      where: { id, status: { $not: 'deleted' } }
    });

    if (sdata) {
      sdata.status = 'deleted';
      if (await sdata.save()) {
        msg.errMsg = '删除成功';
        msg.errCode = 0;
      } else {
        msg.errMsg = '删除失败';
        msg.errCode = 1000;
      }
    } else {
      msg.errMsg = '目标不存在或已被删除。';
      msg.errCode = 2001;
    }
  } else {
    msg.errMsg = '未指定ID';
    msg.errCode = 2000;
  }
  ctx.body = msg;
});

module.exports = router;
