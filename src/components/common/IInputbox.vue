<template>
  <input :class="{readOnly:readOnly}"
         :readonly="readOnly"
         :style="{width:width,height:height}"
         class="inputbox"
         type="text"
         v-model="inputValue"
         @click="$emit('click')"
         @blur="$emit('blur',$event)" />
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ""
    },
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: '32px'
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  data () {
    var inputValue = this.value;

    return {
      inputValue: inputValue
    }
  },
  watch: {
    value (newValue) {
      this.inputValue = newValue;
    },
    inputValue (newValue) {
      this.$emit('input', newValue)
    }
  },
  name: "i-inputbox"
}
</script>

<style scoped>
.inputbox {
  border-radius: 4px;
  padding-left: 6px;
}
input.readOnly {
  color: #999;
  background-color: #f1f3f7;
  cursor: not-allowed !important;
}
/*input.readOnly:hover{*/
/*border:1px solid #a9a9a9;*/
/*-webkit-box-shadow: none;*/
/*-moz-box-shadow: none;*/
/*box-shadow: none;*/
/*}*/
.inputbox:focus,
.inputbox:hover {
  border: 1px solid #5cadff;
  /* border: 1px solid #20a0ff; */
  -webkit-box-shadow: 0px 0px 10px #d6ebff;
  /* -webkit-box-shadow: 0px 0px 2px #20a0ff; */
  -moz-box-shadow: 0px 0px 10px #d6ebff;
  /* -moz-box-shadow: 0px 0px 2px #20a0ff; */
  box-shadow: 0px 0px 10px #d6ebff;
  /* box-shadow: 0px 0px 2px #20a0ff; */
  cursor: pointer;
}
</style>
