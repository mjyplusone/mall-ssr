<template>
  <div class="m-header">
    <div class="header-content">
      <div class="logo"></div>
      <div class="title">EasyMall</div>
      <div class="username" v-show="$store.state.loginUserName" @click="goUserOrder">{{ $store.state.loginUserName }}</div>
      <div class="login" @click="logToggle">{{ logText }}</div>
      <div class="shopcart" @click="goShopcart"></div>
      <!-- <router-link class="shopcart" tag="div" to="/shopcart"></router-link> -->
    </div>
  </div>
</template>

<script>
import {userLogout, checkLogin} from '../api/users.js';

export default {
  // created () {
    // this._checkLogin();
  // },
  methods: {
    logToggle () {
      if (!this.$store.state.loginUserName) {
        // login
        this.$store.commit('SET_ISSHOWLOGIN', true);
      } else {
        // logout
        userLogout().then((res) => {
          if (res.status === '0') {
            this.$store.commit('SET_LOGINUSERNAME', '');
            this.$router.push({
              path: '/'
            });
          }
        });
      }
    },
    // _checkLogin () {
    //   console.log('check');
    //   checkLogin().then((res) => {
    //     if (res.status === '0') {
    //       this.$store.commit('SET_LOGINUSERNAME', res.result);
    //     }
    //   });
    // },
    goShopcart () {
      if (this.$store.state.loginUserName) {
        this.$router.push({
          path: '/shopcart'
        });
      } else {
        this.$store.commit('SET_ISSHOWLOGIN', true);
      }
    },
    goUserOrder () {
      this.$router.push({
        path: '/userorder'
      });
    }
  },
  computed: {
    logText () {
      return this.$store.state.loginUserName ? 'Logout' : 'Login';
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .m-header
    height: 70px
    .header-content
      position: relative
      height: 70px
      width: 100%
      max-width: 1280px
      margin: 0 auto
      .logo
        position: absolute
        top: 15px
        left: 30px
        width: 35px
        height: 35px
        border-radius: 50%
        background: url('../assets/image/dog.jpg')
        background-size: 100%
      .title
        position: absolute
        top: 20px
        left: 80px
        font-size: 25px
        font-weight: 700
      .username
        position: absolute
        right: 120px
        line-height: 70px
        color: #666666
        cursor: pointer
        &:hover
          color: #d1434a
      .login
        position: absolute
        right: 60px
        line-height: 70px
        color: #666666
        cursor: pointer
        &:hover
          color: #d1434a
      .shopcart
        position: absolute
        top: 20px
        right: 20px
        width: 30px
        height: 30px
        background: url('../assets/image/shopcart.png')
        background-size: 100%
        cursor: pointer
</style>
