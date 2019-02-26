<template>
  <transition name="fade">
    <div v-if="showLayer">
      <div class="img-layer"></div>
      <div class="img-container">
        <img style="display:inline-block;margin-top:100px;margin-bottom:100px;" :src="imgSrc"/>
      </div>
      <div class="close-btn" @click="close"></div>
    </div>
  </transition>
</template>

<script>
  export default {
    props: {
      value: Boolean,
      url: String
    },
    data() {
      return {
        showLayer: this.value,
        imgSrc: this.src
      }
    },
    methods: {
      close() {
        this.showLayer = false;
      }
    },
    mounted() {
    },
    watch: {
      value(newValue) {
        this.showLayer = newValue;
      },
      showLayer(newValue) {
        this.$emit('input', newValue)
      },
      url(newValue) {
        this.imgSrc = newValue;
      }
    },
    components: {}
  }
</script>

<style scoped>
  .img-layer {
    position: fixed;
    top: 0px;
    left: 0px;
    background-color: #000000;
    opacity: 0.9;
    height: 100vh;
    width: 100vw;
    z-index: 990;
  }

  .img-container {
    position: fixed;
    top: 0px;
    left: 0px;
    z-index: 999;
    height: 100vh;
    width: 100vw;
    text-align: center;
    overflow: auto;
    box-sizing: content-box;
  }

  .close-btn {
    font-family: 'iconfont';
    font-size: 30pt;
    background-color: #111111;
    position: fixed;
    top: 30px;
    right: 30px;
    z-index: 99999;
    color: #ffffff;
  }

  .close-btn:before {
    content: '\ebf7';
  }

  .close-btn:hover {
    background-color: #ff2222;
    cursor: pointer;
  }
</style>
