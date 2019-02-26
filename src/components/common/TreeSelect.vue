<template>
  <div :style="selectStyle" @click.stop="click" class="normal" :class="{'opened':open}">
    <span style="display:inline-block;height:100%;">{{title}}</span>
    <input ref="input" :value="value" style="display: none"/>
    <div class="select-btn"></div>
    <div class="select-content" :style="treeStyle">
      <tree @selected="selected" @defaultSelected="defaultSelected" :defaultSelectedId="defaultValue"
            :api="api" :field="field" :expandLevel="1"></tree>
    </div>
  </div>
</template>

<script>
  import Tree from "./Tree.vue"

  export default {
    props: {
      value: String,
      api: String,
      readonly: {
        type: Boolean,
        default: false
      },
      field: {
        type: String,
        default: "name"
      },
      selectStyle: {
        type: Object,
        default: function () {
          return {
            /*width: "400px",
            height: "32px"*/
          }
        }
      }
    },
    data() {
      return {
        treeStyle: {
          display: "none",
          width: this.selectStyle.width
        },
        defaultValue: this.value,
        title: "",
        open: false
      }
    },
    methods: {
      defaultSelected: function (id, title) {
        this.title = title;
        this.$emit('input', id)
      },
      selected: function (id, title) {
        this.title = title;
        this.$emit('input', id.toString())
        this.open = false;
      },
      click: function (event) {
        if (!this.readonly) {
          this.open = !this.open;
        }
      },
      handleClickOut() {
        this.open = false;
      }
    },
    mounted() {
      this.globalClick(this.handleClickOut);
    },
    components: {
      Tree: Tree
    },
    watch: {
      open(newValue) {
        $(".select-content").slideToggle("fast");
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
  }

  .select-btn {
    margin: 0px;
    /*border: 1px solid #a9a9a9;*/
    padding: 1px;
    float: right;
    border-radius: 2px;
    height: 100%;
    line-height: 100%;
  }

  .select-btn:before :hover {
    /*color: #5cadff;*/
    color: #20a0ff;
  }

  .select-btn:before {
    font-size: 9pt;
    content: '\ea3a';
  }

  .opened .select-btn:before {
    content: "\ea3e";
    /*color: #5cadff;*/
    color: #20a0ff;
  }

  .opened, .normal:hover {
    /*border: 1px solid #5cadff;*/
    border: 1px solid #20a0ff;
    /*-webkit-box-shadow: 0px 0px 10px #d6ebff;*/
    -webkit-box-shadow: 0px 0px 2px #20a0ff;
    /*-moz-box-shadow: 0px 0px 10px #d6ebff;*/
    -moz-box-shadow: 0px 0px 2px #20a0ff;
    /*box-shadow: 0px 0px 10px #d6ebff;*/
    box-shadow: 0px 0px 2px #20a0ff;
  }

  .select-content {
    background-color: #ffffff;
    width: 100%;
    height: 300px;
    position: absolute;
    margin-top: 8px;
    margin-left: -11px;
    /*border: 1px solid #5cadff;*/
    border: 1px solid #20a0ff;
    /*-webkit-box-shadow: 0px 0px 10px #d6ebff;*/
    -webkit-box-shadow: 0px 0px 2px #20a0ff;
    /*-moz-box-shadow: 0px 0px 10px #d6ebff;*/
    -moz-box-shadow: 0px 0px 2px #20a0ff;
    /*box-shadow: 0px 0px 10px #d6ebff;*/
    box-shadow: 0px 0px 2px #20a0ff;
    z-index: 999;
  }
</style>
