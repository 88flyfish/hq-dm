<template>
  <transition name="drop">
    <div v-if="showMessage"
         :class="['myMessage',{'message-success':messageType=='success','message-warning':messageType=='warning','message-error':messageType=='error'}]">
      <div class="messageContent">
        {{messageContent}}
      </div>
      <i class="icon-guanbi5" @click="close"></i>
    </div>
  </transition>
</template>

<script>
  import {mapGetters, mapMutations} from 'vuex'

  export default {
    name: "Message",
    computed: {
      ...mapGetters([
        'showMessage', 'messageType', 'messageContent'
      ])
    },
    data() {
      return {
        timer: null
      }
    },
    methods: {
      ...mapMutations({
        setShowMessage: 'setShowMessage'
      }),
      close(){
        this.setShowMessage(false);
      }
    },
    beforeDestroy() {
      clearTimeout(this.timer);
      this.timer = null;
    },
    watch: {
      'showMessage'(bool) {
        const _this = this;
        if (bool) {
          clearTimeout(_this.timer);
          _this.timer = null;
          this.timer = setTimeout(() => {
            _this.setShowMessage(false)
          }, 3000)
        }
      }
    }
  }
</script>

<style lang="less" scoped>

  .myMessage {
    &.drop-enter-active, &.drop-leave-active {
      transition: all .3s ease-out;
    }
    &.drop-enter, &.drop-leave-to /* .fade-leave-active below version 2.1.8 */ {
      top: -60px;
      opacity:0;
      filter:alpha(opacity=0);
    }

    position: fixed;
    opacity:1;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2051;
    padding: 20px;
    min-width: 400px;
    border-radius: 4px;
    border: 1px solid #ebeef5;
    background-color: #edf2fc;
    color: #909399;
    i{
      position:absolute;
      right:16px;
      font-size:16px;
      top:18px;
      cursor:pointer;
    }
    .messageContent {
      font-size: 14px;
      line-height: 1;
      text-align: center
    }
    &.message-success {
      background-color: #f0f9eb;
      border-color: #e1f3d8;
      .messageContent,i {
        color: #67c23a;
      }
    }
    &.message-warning {
      border-color: #faecd8;
      background-color: #fdf6ec;
      .messageContent,i {
        color: #e6a23c;
      }
    }
    &.message-error {
      background-color: #fef0f0;
      border-color: #fde2e2;
      .messageContent,i {
        color: #f56c6c;
      }
    }
  }
</style>
