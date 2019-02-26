<template>
  <div class="normal" :style="{width:config.width, height: config.height}"
       @click.stop="toggleSelect($event)" :class="{readOnly:readonly}">
    <span style="display:inline-block;height:100%;">{{text}}</span>
    <div class="icon-hq-select"></div>
    <div class="selectDiv" :style="{width:config.width,height:config.panelHeight}">
      <ul>
        <li @click.stop="selectOption('', '请选择')"
            :class="{'selectBack': value == ''}">请选择
        </li>
        <li v-for="option in config.options"
            @click.stop="selectOption(option.value, option.label)"
            :class="{'selectBack': value == option.value}">
          {{option.label}}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: "i-select",
    props: {
      config: Object,
      value: String,
      readonly: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        text: "请选择"
      }
    },
    methods: {
      // 下拉框
      toggleSelect(event) {
        if (!this.readonly) {
          $(event.currentTarget).find(".selectDiv").slideToggle("fast");
        }
      },
      selectOption(value, label) {
        this.text = label;
        this.$emit("input", value);
        this.$emit("change", value, label);
        $(".selectDiv").slideUp("fast");
      },
      handleClickOut() {
        $(".selectDiv").slideUp("fast");
      }
    },
    mounted() {
      this.globalClick(this.handleClickOut);
      // 父组件有值，默认选中。
      for (let index in this.config.options) {
        let option = this.config.options[index];
        if (this.value == option.value) {
          this.text = option.label;
        }
      }
    },
    watch: {
      value(val) {
        for (let index in this.config.options) {
          let option = this.config.options[index];
          if (this.value == option.value) {
            this.text = option.label;
          }
        }
        if(val==''){
          this.text='请选择'
        }
      }
    }
  }
</script>

<style scoped>
  .normal {
    margin: 0px;
    border: 1px solid #a9a9a9;
    border-radius: 4px;
    background-color: #ffffff;
    padding: 5px;
    padding-left: 10px;
    font-family: "iconfont";
    cursor: default;
    text-align: left;
    line-height: normal;
    width: 100%;
    height: 100%;
    position: relative;
    display:inline-block;
    /*vertical-align:middle;*/
    font-size:13px;
  }
  .normal.readOnly{
    color:#c0c4cc;
    background-color:#f1f3f7;
    cursor:not-allowed !important;
  }

  .normal:hover {
    /*border: 1px solid #5cadff;*/
    border: 1px solid #20a0ff;
    outline: 0;
    /*-webkit-box-shadow: 0 0px 10px #d6ebff;*/
    -webkit-box-shadow: 0 0px 10px #20a0ff;
    /*box-shadow: 0 0px 10px #d6ebff;*/
    box-shadow: 0 0px 10px #20a0ff;
  }

  .selectDiv {
    background-color: #ffffff;
    width: 100%;
    max-height: 300px;
    position: absolute;
    margin-top: 8px;
    margin-left: -11px;
    /*border: 1px solid #5cadff;*/
    border: 1px solid #20a0ff;
    -webkit-box-shadow: 2px 2px 5px lightgray, -2px 2px 5px lightgray;
    -moz-box-shadow: 2px 2px 5px lightgray, -2px 2px 5px lightgray;
    box-shadow: 2px 2px 5px lightgray, -2px 2px 5px lightgray;
    z-index: 999;
    overflow: auto;
    box-sizing: content-box;
    border-radius: 4px;
    display: none;
  }

  .icon-hq-select {
    margin-top: 3px;
    float: right;
    border-radius: 2px;
    height: 100%;
    line-height: 100%;
    margin-right: -5px;
  }

  .icon-hq-select:before {
    font-size: 24px;
    content: '\e313';
  }

  .selectDiv ul {
    list-style: none;
    width: 100%;
    height: 100%;
  }

  .selectDiv ul li {
    vertical-align: middle;
    line-height: 24px;
    padding-left: 10px;
  }

  .selectDiv ul li:hover {
    background: #F5F7FA;
    /*color: #5cadff;*/
    color: #20a0ff;
  }

  .selectBack {
    background: #F5F7FA;
    /*color: #5cadff;*/
    color: #20a0ff;
    font-weight: bold;
  }
</style>
