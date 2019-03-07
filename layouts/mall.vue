<template>
  <div id="app">
    <m-header></m-header>
    <nuxt/>
    <m-footer></m-footer>
    <loginmodal></loginmodal>
  </div>
</template>

<script>
import MHeader from '../components/m-header.vue';
import MFooter from '../components/m-footer.vue';
import loginmodal from '../components/loginmodal.vue';

export default {
    name: 'App',
    components: {
        MHeader,
        MFooter,
        loginmodal
    }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
  #app
    width: 100%
    display: flex
    flex-flow: column
    min-height: 100vh
    min-width: 320px
</style>
