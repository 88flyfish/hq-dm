<template>
  <textarea class="textarea" v-model="textValue" :readonly="readonly"></textarea>
</template>

<script>
  export default {
    props: {
      value: {
        type: String,
        default: ""
      },
      readonly: {
        type: Boolean,
        default: false
      }
    },
    data() {
      var textValue = this.value;

      return {
        textValue: textValue
      }
    },
    watch: {
      value(newValue) {
        this.textValue = newValue;
      },
      textValue(newValue) {
        this.$emit('input', newValue)
      }
    },
    name: "i-textarea"
  }
</script>

<style scoped>
  .textarea {
    resize: none;
    width: 100%;
    overflow: auto;
    border-radius: 4px;
  }
</style>
