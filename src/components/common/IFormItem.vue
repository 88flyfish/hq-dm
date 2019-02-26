<template>
  <div class="i-form-item">
    <label class="i-form-item-label"
           :style="labelStyle">
      <span v-if="required"
            style="display:inline-block;color:red;font-family: iconfont;font-size: 11px;"
            title="必填">★
        <!--&#xe938;-->
      </span>
      {{label}}：
    </label>
    <div class="valid-tip"
         v-if="tipShow">
      {{tipTxt}}
    </div>
    <div class="i-form-item-field"
         :style="itemStyle">
      <slot>
        Content can't be empty!
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: String,
    tipShow: Boolean,
    tipTxt: String,
    labelStyle: Object,
    itemStyle: Object,
    required: {
      type: Boolean,
      default: false
    }
  },

  name: "i-form-item"
}
</script>

<style scoped>
.i-form-item {
  min-height: 35px;
  line-height: 35px;
  border: 0px solid blue;
  box-sizing: border-box;
  clear: both;
  padding-top: 20px;
  /* overflow: hidden; */
}

.i-form-item-label {
  width: 120px;
  height: 100%;
  float: left;
  text-align: right;
  padding-right: 2px;
  color: #606266;
  font-size: 14px;
}

.i-form-item-field {
  margin-left: 120px;
  margin-right: 120px;
  box-sizing: content-box;
  height: 100%;
}

.valid-tip {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  height: 100%;
  width: 120px;
  float: right;
  color: red;
  font-size: 9pt;
  text-align: left;
  padding-left: 10px;
}
</style>
