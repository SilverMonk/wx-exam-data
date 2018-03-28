const router = require('koa-router')();
const db = require('../db/index.js');
const moment = require('moment');
const querystring = require('querystring');
const uuid = require('node-uuid');
const { ErrMsg } = require('./msg');

router.prefix('/projects');
//  权限验证全部
const cbs = [''];
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
  if (!sdata || !sdata.p_site || !sdata.customer || !sdata.c_contect) {
    return (ctx.body = new ErrMsg(1001, '添加失败,缺少必输字段'));
  }
  sdata.id = uuid.v4();
  sdata.pno = moment().format('YYMMDDhh') + parseInt(Math.random() * 10000);
  sdata.status = 'normal';

  let info = await db.Project.create(sdata);
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
    let sdata = await db.Project.findOne({
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

  let pdata = await db.Project.findById(ctx.params.id);
  if (pdata) {
    pdata.customer = data.customer;
    pdata.p_site = data.p_site;
    pdata.designer = data.designer;
    pdata.c_contect = data.c_contect;
    pdata.d_contect = data.d_contect;
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
    queryData.where.title = {
      $like: `%${keyWord}%`
    };
  }
  let sdata = await db.Project.findAndCountAll(queryData);
  if (sdata) {
    msg.data = sdata;
  } else {
    msg.errCode = 2000;
    msg.errMsg = '没有指定ID记录';
  }
  ctx.body = msg;
});

router.get('/:id', async (ctx, next) => {
  let pdata = await db.Project.findById(ctx.params.id);
  let bdata = await db.Budget.findAll({
    where: {
      pid: pdata.id,
      status: { $not: 'deleted' }
    }
  });

  let msg = new ErrMsg();
  if (pdata) {
    pdata.budgetList = bdata;
    msg.data = pdata;
  } else {
    msg.errCode = 2000;
    msg.errMsg = '没有指定ID记录';
  }
  ctx.body = msg;
});
module.exports = router;
