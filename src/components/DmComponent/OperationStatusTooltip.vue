<template>
  <transition name="fade">
    <mask-layer v-show="showLayer" :show="showLayer" :showMask="true">
      <div class="tooltip">
        <span :class="showType"></span>
        <span class="message">{{message}}</span>
      </div>
    </mask-layer>
  </transition>
</template>

<script>
  import MaskLayer from "../common/MaskLayer"

  export default {
    props: {
      show: Boolean,
      showType: {
        type: String,
        default: "success"
      },
      message: String
    },
    data() {
      return {
        showLayer: this.show
      }
    },
    methods: {},
    mounted() {
    },
    watch: {
      "show": function (newVal) {
        var tooltipEl = $(this.$el);
        this.showLayer = newVal;

        if (this.showLayer) {
          var thisVm = this;
          tooltipEl.delay(1500).fadeOut("fast", "linear", function () {
            thisVm.$emit("update:show", false);
            thisVm.$emit("tooltipClosed");
          });
        } else {
          /*
           调用jquery进行渐变隐藏时会将该元素style属性中增加display:none,
           所以需要调用show方法恢复
           */
          tooltipEl.show();
        }
      }
    },
    components: {
      MaskLayer: MaskLayer
    }
  }
</script>

<style scoped>
  .tooltip {
    padding: 10px;
    background-color: #ffffff;
    border: 1px solid #8c939d;
    border-radius: 10px 0;
    box-shadow: 0px 0px 55px 4px #555;
    -webkit-box-shadow: 0px 0px 55px 4px #555;
    vertical-align: middle;
  }
  .successed:before {
    font-family: iconfont;
    content: "\eafe";
    font-size: 24pt;
    color: #00b83f;
  }

  .success:before {
    font-family: iconfont;
    content: "\eafe";
    font-size: 24pt;
    color: #00b83f;
  }

  .failed:before {
    font-family: iconfont;
    content: "\ea08";
    font-size: 24pt;
    color: #ff4949;
  }

  .icon:before {
    font-family: iconfont;
    color: #f7ba2a;
    font-size: 32pt;
    content: "\ea07"
  }

  .message {
    padding-left: 10px;
    color: #48576a;
    position: relative;
    top: -8px;
  }
</style>
