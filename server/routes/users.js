const Router = require('koa-router');
const util =  require('../util/util.js');

const router = new Router({
  prefix: '/api/users'
});

// 加载model
const User = require('../models/user');
// util
const formatDate = require('../util/util');


/* GET users listing. */
router.get('/', async (ctx, next) => {
  ctx.body = 'respond with a resource';
});

// 登录 /api/users/login
router.post('/login', async (ctx, next) => {
  // post取参
  var param = {
    userName: ctx.request.body.userName,
    userPwd: ctx.request.body.userPwd
  };

  try {
    let user = await User.findOne(param);

    if (user) {
      // 登录成功
      // 写入cookie, 3个参数: cookie名称, cookie的值, 设定的参数
      ctx.cookies.set('userId', user.userId, {
        // cookie放在服务器根目录
        path: '/ ',
        // cookie周期(ms)
        maxAge: 1000 * 60 * 60
      });
      ctx.cookies.set('userName', user.userName, {
        path: '/ ',
        maxAge: 1000 * 60 * 60
      });

      // 存入session, session是客户端发过来的, 所以req
      // req.session.user = doc;

      ctx.body = {
        status: '0',
        msg: '',
        result: {
          userName: user.userName
        }
      };
    } else {
      // 用户名密码不对
      ctx.body = {
        status: '1',
        msg: '用户名或密码错误'
      };
    }
  } catch (err) {
    ctx.body = {
      status: '1',
      msg: err.message
    };
  }
});

// 登出
router.post('/logout', async (ctx, next) => {
  // 清除cookie
  ctx.cookies.set('userId', '', {
    path: '/',
    maxAge: -1
  });
  ctx.cookies.set('userName', '', {
    path: '/',
    maxAge: -1
  });

  ctx.body = {
    status: '0',
    msg: '',
    result: ''
  };
});

// 登录校验
router.get('/checklogin', async (ctx, next) => {
  if (ctx.cookies.get('userId')) {
    ctx.body = {
      status: '0',
      msg: '',
      result: ctx.cookies.get('userName')
    };
  } else {
    ctx.body = {
      status: '1',
      msg: '未登录',
      result: ''
    };
  }
});

// 注册
router.post('/signin', async (ctx, next) => {
  var userName = ctx.request.body.userName;
  var userPwd =  ctx.request.body.userPwd;

  try {
    let user = await User.findOne({userName: userName});

    if (!user) {
      // 注册
      var rnum = Math.random().toString().slice(2, 6);
      var createTime = util.formatDate(new Date(), 'yyyyMMddhhmmss');
      var newuser = await User.create({
        userId: rnum + createTime,
        userName: userName,
        userPwd: userPwd,
        orderList: [],
        cartList: [],
        addresslist: []
      });
      if (newuser) {
        ctx.body = {
          status: '0',
          msg: '',
          result: '已添加用户: ' + userName
        };
      } else {
        ctx.body = {
          status: '1',
          msg: '注册失败，您可以再次尝试',
          result: ''
        };
      }
    } else {
      ctx.body = {
        status: '101',
        msg: '账户已存在'
      };
    }
  } catch (err) {
    ctx.body = {
      status: '1',
      msg: err.message,
      result: ''
    };
  }
})

// 获取用户购物车列表
router.get('/cartlist', async (ctx, next) => {
  var userId = ctx.cookies.get('userId');

  try {
    let user = await User.findOne({userId: userId});

    if (user) {
      ctx.body = {
        status: '0',
        msg: '',
        result: user.cartList
      };
    } else {
      ctx.body = {
        status: '1',
        msg: 'err'
      };
    }
  } catch (err) {
    ctx.body = {
      status: '1',
      msg: err.message,
      result: ''
    };
  }
});

// 删除购物车中商品
router.post('/deleteproduct', async (ctx, next) => {
  // 获取cookie中的用户id和post请求中的商品id
  var userId = ctx.cookies.get('userId');
  var productId = ctx.request.body.productId;

  try {
    // update更新数据库,$pull删除商品
    await User.updateOne({
      userId: userId
    }, {
      $pull: {
        'cartList': {
          'productId': productId
        }
      }
    });

    ctx.body = {
      status: '0',
      msg: '',
      result: 'delete product success'
    };
  } catch (err) {
    ctx.body = {
      status: '1',
      msg: err.message,
      result: ''
    };
  }
})

// 改变商品数量
router.post('/editnum', async (ctx, next) => {
  var userId = ctx.cookies.get('userId');
  var productId = ctx.request.body.productId;
  var productNum = ctx.request.body.productNum;

  try {
    await User.updateOne({
      'userId': userId,
      'cartList.productId': productId
    }, {
      'cartList.$.productNum': productNum
    });

    ctx.body = {
      status: '0',
      msg: '',
      result: 'edit product num success'
    };
  } catch (err) {
    ctx.body = {
      status: '1',
      msg: err.message,
      result: ''
    };
  }
})

// 获取用户地址列表
router.get('/addresslist', async (ctx, next) => {
  var userId = ctx.cookies.get('userId');

  console.log(userId);

  try {
    let user = await User.findOne({userId: userId});

    if (user) {
      ctx.body = {
        status: '0',
        msg: '',
        result: user.addressList
      };
    } else {
      ctx.body = {
        status: '1',
        msg: 'err',
        result: ''
      };
    }
  } catch (err) {
    ctx.body = {
      status: '1',
      msg: err.message,
      result: ''
    };
  }
})

// 设置默认地址
router.post('/setdefault', async (ctx, next) => {
  var userId = ctx.cookies.get('userId');
  var addressId = ctx.request.body.addressId;

  try {
    let user = await User.findOne({userId: userId});

    if (user) {
      user.addressList.forEach((item) => {
        if (item.addressId === addressId) {
          item.isDefault = true;
        } else {
          item.isDefault = false;
        }
      });

      // 修改完isDefault字段,保存
      try {
        await user.save();

        ctx.body = {
          status: '0',
          msg: '',
          result: ''
        };
      } catch (err) {
        ctx.body = {
          status: '1',
          msg: err.message,
          result: ''
        };
      }
    } else {
      ctx.body = {
        status: '1',
        msg: 'err',
        result: ''
      };
    }
  } catch (err) {
    ctx.body = {
      status: '1',
      msg: err.message,
      result: ''
    };
  }
})

// 删除地址
router.post('/deleteaddr', async (ctx, next) => {
  var userId = ctx.cookies.get('userId');
  var addressId = ctx.request.body.addressId;

  try {
    await User.update({
      userId: userId
    }, {
      $pull: {
        'addressList': {
          'addressId': addressId
        }
      }
    });

    ctx.body = {
      status: '0',
      msg: '',
      result: 'delete address success'
    };
  } catch (err) {
    ctx.body = {
      status: '1',
      msg: err.message,
      result: ''
    };
  }
})

// 新增地址
router.post('/addaddr', async (ctx, next) => {
  var userId = ctx.cookies.get('userId');
  var userName = ctx.request.body.userName;
  var streetName = ctx.request.body.streetName;
  var tel = ctx.request.body.tel;

  try {
    let user = await User.findOne({userId: userId});

    if (user) {
      user.addressList.push({
        'addressId': user.addressList.length === 0 ? '100000' :parseInt(user.addressList[user.addressList.length - 1].addressId) + 1 + '',
        'userName': userName,
        'streetName': streetName,
        'postCode': '',
        'tel': tel,
        'isDefault': false
      });

      try {
        await user.save();

        ctx.body = {
          status: '0',
          msg: '',
          result: 'add address success'
        };
      } catch (err) {
        ctx.body = {
          status: '1',
          msg: err.message,
          result: ''
        };
      }
    } else {
      ctx.body = {
        status: '1',
        msg: 'err',
        result: ''
      };
    }
  } catch (err) {
    ctx.body = {
      status: '1',
      msg: err.message,
      result: ''
    };
  }
})

// 生成订单
router.post('/payment', async (ctx, next) => {
  var userId = ctx.cookies.get('userId');
  var subPrice = ctx.request.body.subPrice;
  var shipping = ctx.request.body.shipping;
  var addressId = ctx.request.body.addressId;
  var orderList =  ctx.request.body.orderList;

  try {
    let user = await User.findOne({userId: userId});

    if (user) {
      var address = '';
      // 获取用户当前使用的地址信息
      user.addressList.forEach((item) => {
        if (item.addressId === addressId) {
          address = item;
        }
      });

      // 自动生成orderId
      var platform = '1212'
      // 生成0-9随机数
      var random1 = Math.floor(Math.random() * 10);
      var random2 = Math.floor(Math.random() * 10);

      var sysDate = util.formatDate(new Date(), 'yyyyMMddhhmmss');
      var createDate = util.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss');

      var orderId = platform + random1 + sysDate + random2;

      var order = {
        orderId: orderId,
        subPrice: subPrice,
        shipping: shipping,
        orderTotal: subPrice + shipping,
        addressInfo: address,
        orderList: orderList,
        orderStatus: '1',
        createDate: createDate
      };

      // 新订单写入数据库
      user.orderList.push(order);

      try {
        user.save();

        ctx.body = {
          status: '0',
          msg: '',
          result: {
            orderId: order.orderId,
            orderTotal: order.orderTotal
          }
        };
      } catch (err) {
        ctx.body = {
          status: '1',
          msg: err.message,
          result: ''
        };
      }
    } else {
      ctx.body = {
        status: '1',
        msg: 'err',
        result: ''
      };
    }
  } catch (err) {
    ctx.body = {
      status: '1',
      msg: err.message,
      result: ''
    };
  }
})

// 查询orderId对应订单信息
router.get('/orderdetail', async (ctx, next) => {
  var userId = ctx.cookies.get('userId');
  var orderId = ctx.request.query.orderId;

  try {
    let user = await User.findOne({userId: userId});

    if (user.orderList.length > 0) {
      var order = {};
      user.orderList.forEach((item) => {
        // 从用户所有订单中找到orderId对应的订单
        if (item.orderId === orderId) {
          order = item;
        }
      });
      if (order) {
        ctx.body = {
          status: '0',
          msg: '',
          result: order
        };
      } else {
        ctx.body = {
          status: '1',
          msg: 'no order',
          result: ''
        };
      }
    } else {
      ctx.body = {
        status: '1',
        msg: 'no order',
        result: ''
      };
    }
  } catch (err) {
    ctx.body = {
      status: '1',
      msg: err.message,
      result: ''
    };
  }
})

// 查询用户所有订单
router.get('/userorder', async (ctx, next) => {
  var userId = ctx.cookies.get('userId');

  try {
    let user = await User.findOne({userId: userId});

    if (user) {
      ctx.body = {
        status: '0',
        msg: '',
        result: user.orderList
      };
    } else {
      ctx.body = {
        status: '1',
        msg: 'err',
        result: ''
      };
    }
  } catch (err) {
    ctx.body = {
      status: '1',
      msg: err.message,
      result: ''
    };
  }
})

// 删除订单
router.post('/deleteorder', async (ctx, next) => {
  var userId = ctx.cookies.get('userId');
  var orderId = ctx.request.body.orderId;

  try {
    await User.update({
      userId: userId
    }, {
      $pull: {
        'orderList': {
          'orderId': orderId
        }
      }
    });

    ctx.body = {
      status: '0',
      msg: '',
      result: 'delete order success'
    };
  } catch (err) {
    ctx.body = {
      status: '1',
      msg: err.message,
      result: ''
    };
  }
})

module.exports = router;
