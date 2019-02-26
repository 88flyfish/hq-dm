<template>
  <span class="checkbox checkbox-normal" :class="{'checkbox-checked':checked, 'half-selected':halfSelected2,'readOnly':readOnly}"
        @click.stop="click">
    <span class="word" :class="{readOnly:readOnly}"><slot></slot></span>
  </span>
</template>

<script>
  export default {
    props: ['value', 'halfSelected','readOnly'],
    // props: {
    //   value: {
    //     type: Boolean,
    //     default: false
    //   },
    //   halfSelected: {
    //     type: Boolean,
    //     default: false
    //   }
    // },
    data() {
      return {
        checked: Boolean(this.value),
        halfSelected2: Boolean(this.halfSelected)
      }
    },
    methods: {
      click(event) {
        if(!this.readOnly){
          if (this.halfSelected2) {
            this.halfSelected2 = false;
          } else {
            this.checked = !this.checked;
          }
          this.$emit('input', this.checked);
          this.$emit('change', this.checked);
        }
      }
    },
    mounted() {
    },
    watch: {
      "value": function (newValue) {
        this.checked = Boolean(newValue);
      },
      "halfSelected": function (val) {
        this.halfSelected2 = Boolean(val);
      }
    },
    components: {}
  }
</script>

<style scoped>
  span.word {
    color: #333;
    font-size: 14px;
    margin-left: 5px;
    line-height: 100%;
  }
  .checkbox.readOnly{
    cursor: not-allowed;
  }
  .checkbox.readOnly span{
    color: #B6B6B6;
  }

  .checkbox {
    font-family: iconfont;
    display: inline-block;
    font-size: 12pt;
    color: #999999;
    cursor: pointer;
    margin-top: 0;
    margin-bottom: 0;
  }

  .checkbox:hover {
    color: #0374d0
  }

  .checkbox-normal:before {
    content: "\eaff"
  }

  .checkbox-checked:before {
    content: "\eafe"
  }

  .half-selected:before {
    color: #cccccc;
  }
</style>
