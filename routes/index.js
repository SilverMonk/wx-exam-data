const router = require('koa-router')();
const db = require('../db/api.js');
const { ErrMsg } = require('./msg');

//  权限验证全部
router.get('/', async (ctx, next) => {
  var title = await db.getObjs('User');
  await ctx.render('index', { title: title.length, name: 'WX-Exam' });
});

module.exports = router;
