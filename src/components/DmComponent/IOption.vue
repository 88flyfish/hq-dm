<template>
  <li
    class="normal-option"
    @click.stop="selectOption"
    :class="{'selected': selected}">
    {{label}}
  </li>
</template>

<script>
    export default {
      name: "i-option",

      inject: ['iSelect'],

      props: {
        value: {
          type: [String, Number],
          required: true,
          default: ""
        },

        label: {
          type: [String, Number],
          required: true,
          default: ""
        }
      },

      data() {
        return {

        }
      },

      methods: {
        selectOption() {
          if (!this.iSelect.multiple) {
            this.iSelect.selectLabel = this.label;
            this.iSelect.$emit('input', this.value);
            this.iSelect.$emit('change', this.value);
            this.iSelect.showPanel = false;
          } else {
            if (this.iSelect.selectValues.includes(this.value)) {
              this.iSelect.selectValues = this.iSelect.selectValues.filter(value => value != this.value);
              this.iSelect.selectLabels = this.iSelect.selectLabels.filter(label => label != this.label);
            } else {
              this.iSelect.selectValues.push(this.value);
              this.iSelect.selectLabels.push(this.label);
              this.iSelect.selectLabels = this.iSelect.selectLabels.filter(label => label != this.iSelect.placeholder);
            }
            this.iSelect.$emit('input', this.iSelect.selectValues);
            this.iSelect.$emit('change', this.iSelect.selectValues);
          }
        }
      },

      computed: {
        selected() {
          if (!this.iSelect.multiple) {
            return this.value == this.iSelect.value;
          } else {
            return this.iSelect.value.includes(this.value);
          }
        }
      },

      mounted() {
        if (this.selected) {
          if (!this.iSelect.multiple) {
            this.iSelect.selectLabel = this.label;
          } else {
            this.iSelect.selectValues.push(this.value);
            this.iSelect.selectLabels.push(this.label);
            this.iSelect.selectLabels = this.iSelect.selectLabels.filter(item => item != this.iSelect.placeholder);
          }
        }
      },
      watch: {
        'iSelect.value': function (newVal) {
          if (this.value == newVal) {
            this.iSelect.selectLabel = this.label;
          }
        }
      }

    }
</script>

<style scoped>
  .normal-option {
    font-size: 14px;
    padding: 0 10px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 30px;
    line-height: 30px;
    box-sizing: border-box;
    cursor: pointer;
    font-family: Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif;
    color: #606266;
  }
  .normal-option:hover {
    background-color: #F5F7FA;
  }
  .selected {
    background-color: #EEEEEE;
    color: #0088EE;
  }
</style>
