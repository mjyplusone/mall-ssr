const Router = require('koa-router');

const router = new Router({
  prefix: '/api'
});

router.get('/', async (ctx, next) => {
  ctx.body = '<h1>Easy Mall API</h1>'
})

module.exports = router;
