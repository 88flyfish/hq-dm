<template>
  <transition name="fade">
    <div class="waitMask"
         v-if="isShow"
         :style="{left:left + 'px',top:top + 'px',height:height+'px',width:width+'px',minHeight:'200px'}">
      <div class="waitMask-content">
      <span class="img">
        <img src="../../common/img/waiting.gif"/>
      </span>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    props: {
      isShow: Boolean,
      maskByParent: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        left: 0,
        top: 0,
        height: 0,
        width: 0
      }
    },
    methods: {},
    mounted() {
      if (this.maskByParent) {
        this.left = $(this.$parent.$el).parent().position().left;
        //因为layout布局样式有变化，于是这里left改为0
        // this.left = 0
        this.top = $(this.$parent.$el).parent().position().top;
        // this.width='100%';
        // this.height='100%';
        this.height = $(this.$parent.$el).parent().height();

        this.width = $(this.$parent.$el).parent().width();
      } else {
        this.left = $(".content").position().left;
        this.top = $(".header").height();
        this.height = $("body").height() - $(".header").height();
        this.width = $(".content").width();
      }

    },
    components: {},
    watch: {
      "isShow": function () {
        if (this.maskByParent) {
          this.left = $(this.$parent.$el).position().left;
          //因为layout布局样式有变化，于是这里left改为0
          // this.left = 0;
          this.top = $(this.$parent.$el).position().top;
          this.height = $(this.$parent.$el).height();
          this.width = $(this.$parent.$el).width();
        } else {
          this.left = $(".content").position().left;
          this.top = $(".header").height();
          this.height = $("body").height() - $(".header").height();
          this.width = $(".content").width();
        }
      }
    }
  }
</script>

<style scoped>
  .waitMask {
    position: absolute;
    z-index:9999;
    background-color: #ffffff;
    opacity: 0.4;
    -moz-opacity: 0.4;
    filter: alpha(opacity=40);
    display: table;
  }

  .waitMask-content {
    text-align: center;
    display: table-cell;
    vertical-align: middle;
  }

  .content img {
    display: inline-block;
    height: 40px;
    width: 40px;
  }

  .img {
    display: inline-block;
    padding: 10px;
    border: 1px solid #aaaaaa;
    /*box-shadow: 0px 0px 60px 10px #cccccc;*/
    border-radius: 10px;
  }

  .fade-leave-active {
    transition: opacity .5s;
  }

  .fade-leave-to {
    opacity: 0;
  }
</style>
