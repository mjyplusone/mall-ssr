const actions = {
    nuxtServerInit ({ commit }, { req }) {
      // console.log(req.ctx.cookies.get('userId'))
      if (req && req.ctx && req.ctx.cookies) {
        commit('SET_LOGINUSERNAME', req.ctx.cookies.get('userName'));
      }
    }
};

export default actions;
