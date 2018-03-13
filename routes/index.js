const router = require('koa-router')();
const db = require('../db/api.js');
const { ErrMsg } = require('./msg');

// const CBR = ['/subjects'];
// router.all('*', async (ctx, next) => {
//   if (CBR.indexOf(ctx.path) == -1 || ctx.session.user != null) {
//     next();
//   } else {
//     ctx.body = new ErrMsg(4000, '权限不足');
//   }

//   //   var title = await db.getObjs('User');
//   //   await ctx.render('index', { title: title.length, name: 'WX-Exam' });
// });

module.exports = router;
