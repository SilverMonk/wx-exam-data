const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const cors = require('koa2-cors');

const index = require('./routes/index');
const answer = require('./routes/answer');
const tag = require('./routes/tag');
const users = require('./routes/users');
const subjects = require('./routes/subject');

const session = require('koa-session-minimal');
const MysqlSession = require('koa-mysql-session');

// const mount = require('koa-mount');
const passport = require('./auth/passport_config');
// error handler
onerror(app);

// middlewares
app.use(
  bodyparser({
    enableTypes: ['json', 'form', 'text']
  })
);
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));

// app.use(views(__dirname + '/views', {
//     extension: 'pug'
// }))

app.use(
  views('views', {
    root: __dirname + '/views',
    default: 'hbs',
    extension: 'hbs',
    map: { hbs: 'handlebars' }
  })
);

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.proxy = true;
// session

// 配置存储session信息的mysql
let store = new MysqlSession({
  user: 'winson',
  password: '2wsxdr5tgb',
  database: 'wx-exam',
  port: '63926',
  host: 'sh-cdb-qvfh765u.sql.tencentcdb.com'
});
// 存放sessionId的cookie配置
let cookie = {
  maxAge: '', // cookie有效时长
  expires: '', // cookie失效时间
  path: '', // 写cookie所在的路径
  domain: '', // 写cookie所在的域名
  httpOnly: '', // 是否只用于http请求中获取
  overwrite: '', // 是否允许重写
  secure: '',
  sameSite: '',
  signed: ''
};
// 使用session中间件
app.use(
  session({
    key: 'SESSION_ID',
    store: store,
    cookie: cookie
  })
);
app.use(passport.initialize());
app.use(passport.session());

// cors
app.use(
  cors({
    origin: function(ctx) {
      // if (ctx.hostname !== 'localhost') {
      //   return false;
      // }
      return '*';
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept']
  })
);
// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());
app.use(answer.routes(), answer.allowedMethods());
app.use(tag.routes(), tag.allowedMethods());
app.use(subjects.routes(), subjects.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

module.exports = app;
