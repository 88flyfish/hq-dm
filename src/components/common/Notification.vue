<template>
  <transition name="notification-fade">
    <div
      :class="['notification', customClass, horizontalClass]"
      v-if="config.show"
      :style="positionStyle"
      @mouseenter="clearTimer()"
      @mouseleave="startTimer()"
    >
      <i
        class="notification__icon"
        :class="[ typeClass ]"
        v-if="type ">
      </i>
      <div class="notification__group" >
        <h2 class="notification__title" v-text="title"></h2>
        <div class="notification__content" v-show="message">
          <slot>
            <p v-if="!dangerouslyUseHTMLString">{{ message }}</p>
            <p v-else v-html="message"></p>
          </slot>
        </div>
        <div
          class="notification__closeBtn icon-close"
          v-if="showClose"
          @click.stop="close">
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
    let typeMap = {
      success:'success',
      error:'error',
      warning:'warning',
      info:'info'
    };
    export default {
        name: "Notification",
        props:{
           config:{
              type:Object
            },
            show:{
              type:Boolean,
              default:false
            },
            title:{
              type:String,
              default:"message"
            },
            message:{
              type:String,
              default:"message"
            },
            type:{
              type:String,
              default:"success"
            },
            dangerouslyUseHTMLString:{
                type:Boolean ,
                default:false
            },
            showClose:{
              type:Boolean,
              default:true
            },
        },
        data(){
          if(typeof this.config.show == 'undefined'){
            this.config.show = false;
          }
          return {
            duration:4500,
            closed:false,
            timer:null,
            customClass:null,
          }
        },
        computed:{
          horizontalClass(){
            return 'right';
          },
          typeClass(){
            return this.type && typeMap[this.type] ? `icon-${typeMap[this.type]}` : '';
          },
          positionStyle(){
            return 'top:16px';
          }
      },
      beforeUpdate(){
          this.startTimer();
      },
      methods:{
          clearTimer(){
            clearTimeout(this.timer);
            this.timer = null;
          },
          startTimer(){
              if(this.duration > 0 ){
                if(this.timer){

                }else{
                  this.timer = setTimeout(()=>{
                    if(!this.closed){
                      this.close();
                    }
                  },this.duration);
                }
              }
          },
          close(){
            this.config.show = false;
            this.clearTimer();
          }
        },
    }
</script>

<style scoped>
  .notification {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    width: 330px;
    padding: 14px 26px 14px 13px;
    border-radius: 8px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    border: 1px solid #ebeef5;
    position: fixed;
    margin-top: 30px;
    z-index: 100;
    background-color: #fff;
    -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
    -webkit-transition: opacity .3s, left .3s, right .3s, top .4s, bottom .3s, -webkit-transform .3s;
    transition: opacity .3s, left .3s, right .3s, top .4s, bottom .3s, -webkit-transform .3s;
    transition: opacity .3s, transform .3s, left .3s, right .3s, top .4s, bottom .3s;
    transition: opacity .3s, transform .3s, left .3s, right .3s, top .4s, bottom .3s, -webkit-transform .3s;
    overflow: hidden
  }

  .notification.right {
    right: 16px
  }

  .notification.left {
    left: 16px
  }

  .notification__group {
    margin-left: 13px
  }

  .notification__title {
    font-weight: 700;
    font-size: 16px;
    color: #303133;
    margin: 0
  }

  .notification__content {
    font-size: 14px;
    line-height: 21px;
    margin: 6px 0 0;
    color: #606266;
    text-align: justify
  }

  .notification__content p {
    margin: 0
  }

  .notification__icon {
    height: 24px;
    width: 24px;
    font-size: 24px
  }

  .notification__closeBtn {
    position: absolute;
    top: 18px;
    right: 15px;
    cursor: pointer;
    color: #909399;
    font-size: 16px
  }

  .notification__closeBtn:hover {
    color: #606266
  }

  .icon-success:before{
    font-family: "iconfont";
    content: '\e63b';
    color: #67c23a;
  }
  .icon-error:before{
    color: #f56c6c;
    font-family: "iconfont";
    content: '\e604';
  }

  .icon-info:before{
    color: #909399;
    font-family: "iconfont";
    content: '\ea08';
  }

  .icon-warning:before{
    color: #e6a23c;
    font-family: "iconfont";
    content: '\ea07';
  }

  .notification-fade-enter.right {
    right: 0;
    -webkit-transform: translateX(100%);
    transform: translateX(100%)
  }

  .notification-fade-enter.left {
    left: 0;
    -webkit-transform: translateX(-100%);
    transform: translateX(-100%)
  }

  .notification-fade-leave-active {
    animation:moveOut 3s infinite;
    -webkit-animation:moveOut 3s infinite;
  }
  @keyframes moveOut {
    0% {
      opacity: 1;
    }

    100%{
      right:-330px;
      opacity:0;
    }
  }

</style>
