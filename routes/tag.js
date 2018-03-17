const router = require('koa-router')();
const db = require('../db/index.js');
const uuid = require('node-uuid');
const querystring = require('querystring');
const { ErrMsg } = require('./msg');

// const passport = require('./passport_config');

router.prefix('/tags');
//  权限验证全部
const cbs = [];
router.use('/', async (ctx, next) => {
  if (cbs.indexOf(ctx.path) != -1 || ctx.isAuthenticated()) {
    return await next();
  } else {
    ctx.body = new ErrMsg(4000, '权限不足');
  }
});
router.post('/', async (ctx, next) => {
  ctx.set('Content-Type', 'text/plain;charset=utf-8');
  const params = ctx.request.body;
  let msg = new ErrMsg();
  let data = await db.Tag.create({
    id: uuid.v4(),
    status: 'normal',
    name: params.name
  });
  if (data) {
    msg.errMsg = '添加成功';
    msg.data = data;
  } else {
    msg.errCode = 1001;
    msg.errMsg = '添加失败';
  }
  ctx.body = msg;
});
router.delete('/:id', async (ctx, next) => {
  let msg = new ErrMsg();
  var id = ctx.params.id;
  if (id) {
    let sdata = await db.Tag.findOne({
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
router.put('/:id', async (ctx, next) => {
  const data = ctx.request.body || {};
  let msg = new ErrMsg();
  let tdata = await db.Tag.findById(ctx.params.id);
  if (tdata) {
    tdata.name = data.name;
    let res = await tdata.save();
    let msg = new ErrMsg(0, '修改成功', res);
    return (ctx.body = msg);
  } else {
    msg.errCode = 2000;
    msg.errMsg = '没有指定ID记录';
    return (ctx.body = msg);
  }
});
router.get('/', async (ctx, next) => {
  const params = querystring.parse(ctx.req._parsedUrl.query);
  let pageNum = params.pagenum * 1 || 1;
  let pageSize = params.pagesize * 1 || 20;
  let keyWord = params.keyword || '';
  let sort = params.sort || 'DESC';
  let order = params.order || 'updatedAt';
  let msg = new ErrMsg();
  const queryData = {
    offset: (pageNum - 1) * pageSize,
    limit: pageSize,
    order: [[order, sort]]
  };
  if (keyWord) {
    queryData.where = {
      title: {
        $like: `%${keyWord}%`
      }
    };
  }
  let sdata = await db.Tag.findAndCountAll(queryData);
  if (sdata) {
    msg.data = sdata;
  } else {
    msg.errCode = 2000;
    msg.errMsg = '没有指定ID记录';
  }
  ctx.body = msg;
});

router.get('/:id', async (ctx, next) => {
  let tdata = await db.Tag.findById(ctx.params.id);

  let msg = new ErrMsg();
  if (tdata) {
    msg.data = tdata;
  } else {
    msg.errCode = 2000;
    msg.errMsg = '没有指定ID记录';
  }
  ctx.body = msg;
});
module.exports = router;
