const Router = require('koa-router');

const router = new Router({
  prefix: '/api/goods'
});

// 加载model
const Goods = require('../models/goods');
const User = require('../models/user');

// router
// 查询商品列表
router.get('/', async (ctx, next) => {
  console.log('')
  // param
  let page = parseInt(ctx.request.query.page);
  let pageSize = parseInt(ctx.request.query.pagesize);
  let sort = ctx.request.query.sort;
  let priceStart = parseInt(ctx.request.query.pricestart);
  let priceEnd = parseInt(ctx.request.query.priceend);

  // 分页计算公式
  let skip = (page - 1) * pageSize;

  // 过滤参数
  let params;
  if (priceStart != -1 && priceEnd != -1) {
    params = {
      salePrice: {
        $gt: priceStart,
        $lte: priceEnd
      }
    };
  } else {
    params = {};
  }

  // find查找所有数据,skip默认跳过skip条数据,limit限制查询条数
  // sort=1升序,sort=-1降序
  let goods = await Goods.find(params).skip(skip).limit(pageSize)
                        .sort({'salePrice': sort}).exec();

  if (goods) {
    ctx.body = {
      status: '0',
      msg: '',
      result: {
        count: goods.length,
        list: goods
      }
    }
  } else {
    ctx.body = {
      status: '1',
      msg: 'err'
    };
  }
});

// 加入购物车   /api/goods/addcart
router.post('/addcart', async (ctx, next) => {
  var userId = ctx.cookies.get('userId');
  var productId = ctx.request.body.productId;

  try {
    let user = await User.findOne({userId: userId});

    if (user) {
      // 判断用户购物车中是否已经有此商品
      let goodsItem = '';
      user.cartList.forEach((item) => {
        if (item.productId === productId) {
          goodsItem = item;
          item.productNum++;
        }
      });
      // 用户购物车中已经有此商品
      if (goodsItem) {
        // 保存
        try {
          await user.save();
          ctx.body = {
            status: '0',
            msg: '',
            result: 'success'
          };
        } catch (err) {
          ctx.body = {
            status: '1',
            msg: err.message
          };
        }
      } else {
      // 用户购物车中没有此商品
        // 在商品列表里查询此商品
        try {
          let goods = await Goods.findOne({productId: productId});

          if (goods) {
            goods.productNum = 1;
            // 选中状态,默认选中
            goods.checked = 1;

            // 商品信息加到用户名下
            user.cartList.push(goods);

            try {
              await user.save();
              ctx.body = {
                status: '0',
                msg: '',
                result: 'success'
              };
            } catch (err) {
              ctx.body = {
                status: '1',
                msg: err.message
              };
            }
          }
        } catch (err) {
          ctx.body = {
            status: '1',
            msg: err.message
          };
        }
      }
    } else {
      ctx.body = {
        status: '1',
        msg: 'err'
      };
    }
  } catch (err) {
    ctx.body = {
      status: '1',
      msg: err.message
    };
  }
});

module.exports = router;
