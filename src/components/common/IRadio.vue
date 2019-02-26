<template>
  <label class="normal" @click.stop="checkValue" :class="{'disabled': disabled}">
    <input :disabled="disabled" class="radio" :value="value" type="radio" :name="name">
    <span class="radioNormal" :class="{'radio-checked': value == label, 'radio-disabled':disabled}"></span>
    <span class="radio-label" :class="{'disabled': disabled}">
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
  </label>
</template>

<script>
    export default {
      name: "i-radio",
      props: {
        name: String,
        value: [Number, String, Boolean],
        label: [Number, String, Boolean],
        disabled: {
          type: Boolean,
          default: false
        }
      },
      data() {
        return {
        }
      },
      methods: {
        checkValue() {
          if(!this.disabled) {
            this.$emit("input", this.label);
          }
        }
      }
    }
</script>

<style scoped>
  .normal {
    font-family: "iconfont";
    display: inline-block;
    font-size: 12pt;
  }
  .radioNormal {
    color: #999999;
    width: 25px;
    height: 25px;
    padding: 0px;
    margin: 0px;
  }
  .radioNormal:hover {
    color: #0374d0;
  }
  .radioNormal:before {
    content: "\eb02";
  }
  .radio {
    display: none;
    margin-top:0;
    margin-bottom:0;
  }
  /*input[type="radio"]:checked + .radioNormal:before {*/
    /*content: "\eb00";*/
    /*color: #0374d0;*/
  /*}*/
  .radio-checked:before {
    content: "\eb00";
    color: #0374d0;
  }
  .radio-disabled:before{
    color: #B6B6B6;
  }
  .radio-label {
    margin-left:5px;
    width: 25px;
    height: 25px;
    padding: 0px;
    cursor: pointer;
    font-family: "\5FAE\8F6F\96C5\9ED1", Arial, SimSun, sans-serif;
  }
  .disabled {
    cursor: not-allowed;
    color: #B6B6B6;
  }
</style>
