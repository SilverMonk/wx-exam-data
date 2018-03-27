const router = require('koa-router')();
const db = require('../db/index.js');
const uuid = require('node-uuid');
const querystring = require('querystring');
const { ErrMsg } = require('./msg');

const util = require('util');
const jwt = require('jsonwebtoken');
const secret = require('../config/secret.json');
const verify = util.promisify(jwt.verify);

router.prefix('/subjects');
// //  权限验证全部
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
  if (!sdata) {
    return;
  }
  sdata.id = uuid.v4();
  sdata.status = 'normal';

  await db.sequelize
    .transaction(async t => {
      let info = await db.Subject.create(sdata);
      if (sdata.answers) {
        sdata.answers.map(async item => {
          var ans = {
            id: uuid.v4(),
            content: item,
            status: 'normal',
            sid: info.id
          };
          await db.Answer.create(ans);
        });
      }
      return info;
    })
    .then(res => {
      debugger;
      let msg = new ErrMsg(0, '添加成功', res);
      return (ctx.body = msg);
    })
    .catch(err => {
      let msg = new ErrMsg(1001, '添加失败', err);
      return (ctx.body = msg);
    });
});

router.delete('/:id', async (ctx, next) => {
  let msg = new ErrMsg();
  var id = ctx.params.id;
  if (id) {
    let sdata = await db.Subject.findOne({
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
  let qdata = await db.Subject.findById(ctx.params.id);

  if (qdata) {
    let adata = await db.Answer.findAll({
      where: {
        sid: qdata.id,
        status: { $not: 'deleted' }
      }
    });
    await db.sequelize
      .transaction(async t => {
        qdata.title = data.title;
        qdata.tag = data.tag;
        qdata.standard = data.standard;
        let tempQdata = await qdata.save();
        data.answers.map(async (item, index) => {
          if (adata[index]) {
            adata[index].content = item;
            await adata[index].save();
          } else {
            var ans = {
              id: uuid.v4(),
              content: item,
              status: 'normal',
              sid: qdata.id
            };
            adata[index] = await db.Answer.create(ans);
          }
        });
      })
      .then(res => {
        let msg = new ErrMsg(0, '修改成功', res);
        return (ctx.body = msg);
      })
      .catch(err => {
        let msg = new ErrMsg(1001, '修改失败', err);
        return (ctx.body = msg);
      });
  } else {
    msg.errCode = 2000;
    msg.errMsg = '没有指定ID记录';
    return (ctx.body = msg);
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
    order: [[order, sort]]
  };
  if (keyWord) {
    queryData.where = {
      title: {
        $like: `%${keyWord}%`
      }
    };
  }
  let sdata = await db.Subject.findAndCountAll(queryData);
  if (sdata) {
    msg.data = sdata;
  } else {
    msg.errCode = 2000;
    msg.errMsg = '没有指定ID记录';
  }
  ctx.body = msg;
});

router.get('/:id', async (ctx, next) => {
  let qdata = await db.Subject.findById(ctx.params.id);
  let adata = await db.Answer.findAll({
    where: {
      sid: qdata.id,
      status: { $not: 'deleted' }
    }
  });
  let msg = new ErrMsg();
  if (qdata) {
    msg.data = {
      question: qdata,
      answers: adata
    };
  } else {
    msg.errCode = 2000;
    msg.errMsg = '没有指定ID记录';
  }
  ctx.body = msg;
});
module.exports = router;
