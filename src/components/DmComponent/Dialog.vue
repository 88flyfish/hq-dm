<template>
  <transition name="fade">
    <mask-layer :show="showLayer">
      <div class="dialog-size">
        <div class="dialog dialog-size">
          <div class="dialog-title">提示</div>
          <div class="dialog-message">
            <span :class="type + '-icon'"></span>
            <span style="margin:auto;width:300px;word-break: keep-all;text-overflow: ellipsis;overflow: hidden;">{{message}}</span>
          </div>
          <div class="dialog-toolbar">
            <i-button v-show="showConfirmBtn"
                      type="primary"
                      @click="confirm">确定</i-button>
            <i-button v-show="showCancelBtn"
                      type="danger"
                      plain
                      @click="cancel"
                      style="margin-right:10px;">取消
            </i-button>
          </div>
        </div>
      </div>
    </mask-layer>
  </transition>
</template>

<script>
import MaskLayer from "../common/MaskLayer"
import IButton from "../common/IButton"

export default {
  props: {
    message: String,
    type: {
      type: String,
      default: "alert"
    }
  },
  data () {
    return {
      showLayer: true,
      showCancelBtn: true,
      showConfirmBtn: true
    }
  },
  methods: {
    cancel () {
      this.showLayer = false;
      this.$emit("dialogCancel");
    },
    confirm () {
      this.showLayer = false;

      if (this.type == "error") {
        this.$emit("dialogCancel");
      } else {
        this.$emit("dialogConfirm");
      }
    }
  },
  mounted () {
    if (this.type == "error") {
      this.showCancelBtn = false;
    }

    $(function () {
      $(".dialog").easydrag();
      $(".dialog").setHandler("dialog-title");
    });
  },
  watch: {
    "show": function (newVal, oldVal) {
      this.showLayer = newVal;
    }
  },
  components: {
    MaskLayer,
    IButton
  }
}
</script>

<style scoped>
.dialog {
  background-color: #ffffff;
  font-family: iconfont;
  border-radius: 5px;
  box-shadow: 0px 0px 55px 4px #555;
  -webkit-box-shadow: 0px 0px 55px 4px #555;
}

.dialog-size {
  min-height: 150px;
  width: 400px;
  height: auto;
}

.dialog-title {
  background-color: #35baf6;
  color: #fff;
  height: 40px;
  font-size: 12pt;
  padding-top: 10px;
  padding-left: 20px;
  border-bottom: 1px solid #dddddd;
}

.alert-icon:before {
  color: #f7ba2a;
  font-size: 32pt;
  content: '\e916';
}

.error-icon:before {
  color: #ff2222;
  font-size: 32pt;
  content: '\ea07';
}

.dialog-message {
  padding: 15px 20px;
  color: #48576a;
}

.dialog-message span {
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}

.dialog-toolbar {
  height: 40px;
}

.dialog-toolbar button {
  float: right;
  margin-right: 20px;
}
</style>
