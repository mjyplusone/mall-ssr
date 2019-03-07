const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const json = require('koa-json');
const cors = require('koa-cors');
const consola = require('consola');
const { Nuxt, Builder } = require('nuxt');
// routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const goodsRouter = require('./routes/goods');
// mongoose
const mongoose = require('mongoose');
const dbConfig =  require('./util/config');

const app = new Koa();

app.use(bodyParser());
app.use(json());

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js');
config.dev = !(app.env === 'production');

async function start() {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config);

  const {
    host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000
  } = nuxt.options.server;

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  }

  // 全局拦截
  app.use(async (ctx, next) => {
    try {
      console.log(`request with path ${ctx.path}`);
      if (ctx.cookies.get('userId')) {
        await next();
      } else {
        if (ctx.path === '/api/goods/addcart') {
          ctx.body = {
            status: '1',
            msg: '未登录',
            result: ''
          };
        } else {
          await next();
        }
      }
    } catch (err) {
      ctx.status = 500;
      if (config.dev) {
        ctx.body = err.message;
      } else {
        ctx.body = 'Please try again';
      }
    }
  })

  // routes
  app.use(indexRouter.routes()).use(indexRouter.allowedMethods());
  app.use(usersRouter.routes()).use(usersRouter.allowedMethods());
  app.use(goodsRouter.routes()).use(goodsRouter.allowedMethods());

  // nuxt
  app.use(ctx => {
    ctx.status = 200
    ctx.respond = false // Bypass Koa's built-in response handling
    ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
    nuxt.render(ctx.req, ctx.res)
  })

  // mongoose
  mongoose.connect(dbConfig.dbs, {
    useNewUrlParser: true
  });

  // 监听是否连接成功
  mongoose.connection.on("connected", function () {
      console.log("MongoDB connected success!");
  });

  mongoose.connection.on("error", function () {
      console.log("MongoDB connected fail!");
  });

  mongoose.connection.on("disconnected", function () {
      console.log("MongoDB disconnected!");
  });

  // listen
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

start();
