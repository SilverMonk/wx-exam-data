const router = require('koa-router')();
const db = require('../db/index.js');
const uuid = require('node-uuid');
const { ErrMsg } = require('./msg');

router.prefix('/subjects');

router.post('/', async (ctx, next) => {
  ctx.set('Content-Type', 'text/plain;charset=utf-8');
  const sdata = ctx.request.body;
  if (!sdata) {
    return;
  }
  sdata.id = uuid.v4();

  let info = await db.Subject.create(sdata);
  let msg = new ErrMsg();
  if (info) {
    msg.errMsg = '添加成功';
    msg.data = info;
  } else {
    msg.errMsg = '添加失败';
    msg.errCode = 1001;
  }
  ctx.body = msg;
});

router.delete('/', async (ctx, next) => {
  // const data = {
  //   id: uuid.v4(),
  //   ...(ctx.request.body || {})
  // };
  var id = ctx.request.body.id;
  if (id) {
    let sdata = await db.Subject.findById(id);
    let msg = new ErrMsg();

    if (sdata) {
      sdata.status = 'deleted';
      if (await sdata.save()) {
        msg.errMsg = '删除成功';
        msg.errCode = 0;
      } else {
        msg.errMsg = '删除失败';
        msg.errCode = 1000;
      }
    }
  } else {
    msg.errMsg = '目标不存在。';
    msg.errCode = 2000;
  }

  ctx.body = msg;
});

router.put('/', async (ctx, next) => {
  const data = {
    id: uuid.v4(),
    ...(ctx.request.body || {})
  };

  let sdata = await db.Subject.findById(data.id);

  let msg = {
    errCode: 0,
    errMsg: ''
  };
  if (sdata) {
    for (let item in data) {
      sdata[item] = data[item];
    }
    if (await sdata.save()) {
      msg.errMsg = '更新成功';
      msg.errCode = 0;
    } else {
      msg.errMsg = '更新失败';
      msg.errCode = 1001;
    }
    msg.data = sdata;
  } else {
    msg.errMsg = '没有指定ID记录';
    msg.errCode = 2000;
  }

  ctx.body = msg;
});

router.get('/', async (ctx, next) => {
  let sdata = await db.Subject.findAll();
  let msg = new ErrMsg();
  if (sdata) {
    msg.data = sdata;
  } else {
    msg.errCode = 2000;
    msg.errMsg = '没有指定ID记录';
  }
  ctx.body = msg;
});
router.get('/:id', async (ctx, next) => {
  let sdata = await db.Subject.findById(ctx.params.id);
  let msg = new ErrMsg();
  if (sdata) {
    msg.data = sdata;
  } else {
    msg.errCode = 2000;
    msg.errMsg = '没有指定ID记录';
  }
  ctx.body = msg;
});
module.exports = router;
