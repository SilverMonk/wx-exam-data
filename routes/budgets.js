const router = require('koa-router')();
const db = require('../db/index.js');
const moment = require('moment');
const uuid = require('node-uuid');
const querystring = require('querystring');
const { ErrMsg } = require('./msg');

// 接口根路径
router.prefix('/budgets');
//  权限验证全部
const cbs = [];
router.use('/', async (ctx, next) => {
  if (cbs.indexOf(ctx.path) != -1 || ctx.user != null) {
    return await next();
  } else {
    ctx.body = new ErrMsg(4000, '权限不足');
  }
});
router.post('/', async (ctx, next) => {
  ctx.set('Content-Type', 'text/plain;charset=utf-8');
  const sdata = ctx.request.body;
  // 字段验证后
  if (
    !sdata ||
    !sdata.pname ||
    !sdata.price ||
    // !sdata.quantity ||
    // !sdata.unit ||
    !sdata.group
  ) {
    return (ctx.body = new ErrMsg(1001, '添加失败,缺少必输字段'));
  }
  sdata.id = uuid.v4();
  sdata.unit == sdata.unit || '件';
  sdata.quantity == sdata.quantity || 1;
  sdata.bno = moment().format('YYMMDDhhmmss') + parseInt(Math.random() * 100);
  sdata.status = 'normal';

  // 分组
  let tempg = await db.P_Group.findOne({
    where: { gname: sdata.group, status: { $not: 'deleted' } }
  });
  if (tempg) {
    sdata.group = tempg.id;
  } else {
    let newg = await db.P_Group.create({
      id: uuid.v4(),
      status: 'normal',
      gname: sdata.group
    });
    sdata.group = newg.id;
  }

  let info = await db.Budget.create(sdata);
  if (info) {
    ctx.body = new ErrMsg(0, '添加成功', info);
  } else {
    ctx.body = new ErrMsg(1001, '添加失败');
  }
});

router.delete('/:id', async (ctx, next) => {
  let msg = new ErrMsg();
  var id = ctx.params.id;
  if (id) {
    let sdata = await db.Budget.findOne({
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

  let pdata = await db.Budget.findById(ctx.params.id);
  if (pdata) {
    // 更新字段
    pdata.pname = data.pname;
    pdata.unit = data.unit;
    pdata.price = data.price;
    pdata.marks = data.marks;
    pdata = await pdata.save();
    if (pdata) {
      ctx.body = new ErrMsg(0, '修改成功', pdata);
    } else {
      ctx.body = new ErrMsg(1001, '修改失败');
    }
  } else {
    ctx.body = new ErrMsg(2000, '没有指定ID记录');
  }
});
// 分页列表
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
    order: [[order, sort]],
    where: {
      status: { $not: 'deleted' }
    }
  };
  if (keyWord) {
    // 过滤查询 关键字字段
    queryData.where.panme = {
      $like: `%${keyWord}%`
    };
  }
  let sdata = await db.Budget.findAndCountAll(queryData);
  if (sdata) {
    msg.data = sdata;
  } else {
    msg.errCode = 2000;
    msg.errMsg = '没有指定ID记录';
  }
  ctx.body = msg;
});

router.get('/:id', async (ctx, next) => {
  let pdata = await db.Budget.findOne({
    where: {
      id: ctx.params.id,
      status: { $not: 'deleted' }
    }
  });

  let msg = new ErrMsg();
  if (pdata) {
    msg.data = pdata;
  } else {
    msg.errCode = 2000;
    msg.errMsg = '没有指定ID记录';
  }
  ctx.body = msg;
});
module.exports = router;
