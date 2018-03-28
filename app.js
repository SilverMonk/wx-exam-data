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

const jwt = require('koa-jwt');
const token = require('./auth/token');
const secret = require('./config/secret.json');
// const session = require('koa-session-minimal');
// const MysqlSession = require('koa-mysql-session');

// const mount = require('koa-mount');

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

// app.proxy = true;

// JWT
app.use(
  jwt({ secret: secret.sign, passthrough: true }).unless({
    path: [/^\/users\/login/]
  })
);
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
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'Authorization']
  })
);
app.use(async (ctx, next) => {
  if (ctx.request.method == 'OPTIONS') {
    ctx.response.status = 200;
  } else {
    await next();
  }
});

app.use(token());
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
