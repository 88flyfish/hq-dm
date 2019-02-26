<template>
  <transition name="fade">
    <div v-if="visible" class="window-windowWrap">
      <div class="window-maskLayer"></div>
      <div class="window-maskLayerContent">
        <div class="window-container">
          <div class="window-content">
            <div :style="windowStyle">
              <div class="drag-window" :class="'drag-window' + winNum" :style="windowStyle">
                <div class="content-title" :class="'content-title' + winNum">
                  <span>{{title}}</span>
                  <span v-if="showCloseButton" class="close-btn" @click="close"></span>
                  <span v-if="showMaxButton" :class="{'max-btn':!isMaxed,'nor-btn':isMaxed}" @click="max"></span>
                </div>
                <div class="content-body">
                  <slot></slot>
                </div>
                <div class="content-toolbar">
                  <slot name="footer"></slot>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ""
      },
      width: {
        type: String,
        default: "800px"
      },
      height: {
        type: String,
        default: "600px"
      },
      //是否显示关闭按钮
      showCloseButton: {
        type: Boolean,
        default: true
      },
      //是否显示最大化按钮
      showMaxButton: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isMaxed: false,
        windowStyle: {
          height: this.height,
          width: this.width
        },
        winNum: 0
      }
    },
    methods: {
      close() {
        this.$emit("update:visible", false);
      },
      max() {
        if (!this.isMaxed) {
          var position = $(this.$el).find(".drag-window" + this.winNum).position();
          this.styleBak = this.windowStyle;
          this.styleBak.left = position.left + "px";
          this.styleBak.top = position.top + "px";

          this.windowStyle = {
            left: "0px",
            top: "0px",
            width: "100vw",
            height: "100vh"
          }

          this.isMaxed = true;
        } else {
          this.windowStyle = this.styleBak;
          this.isMaxed = false;
        }
      }
    },
    mounted() {
      //给window生成一个唯一编号
      this.winNum = this.$root.tools.winNum();
    },
    updated() {
      //给标题添加拖拽的能力
      $(".drag-window" + this.winNum).easydrag();
      $(".drag-window" + this.winNum).setHandler("content-title" + this.winNum);
    },
    watch: {
      width(val) {
        this.windowStyle.width = val;
      },
      height(val) {
        this.windowStyle.height = val;
      }
    }
  }
</script>

<style scoped>
  .window-windowWrap {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    z-index: 999;
  }

  .window-maskLayer {
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0.8;
    -moz-opacity: 0.8;
    filter: alpha(opacity=80);
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .window-maskLayerContent {
    position: absolute;
    height: 100%;
    width: 100%;
    display: table;
  }

  .window-container {
    text-align: center;
    display: table-cell;
    vertical-align: middle;
  }

  .window-content {
    display: inline-block;
    text-align: left;
  }

  .drag-window {
    border: 1px solid #8c939d;
    background: #ffffff;
    border-top: 0px;
    border-radius: 5px;
    position: absolute;
    z-index: 999;
    box-shadow: 0px 0px 55px 4px #555;
    -webkit-box-shadow: 0px 0px 55px 4px #555;
  }

  .content-title {
    border-radius: 5px 5px 0px 0px;
    height: 35px;
    line-height: 25px;
    background: #20a0ff;
    color: #fff;
    padding: 5px 30px 0 10px;
    font-size: 15px;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    position: relative;
  }

  .content-body {
    height: calc(100% - 79px);
    padding: 10px;
    overflow: auto;
  }

  .content-toolbar {
    height: 50px;
    background: white;
    border-radius: 0px 0px 5px 5px;
    padding-top: 10px;
    border-top: 1px solid #dddddd;
  }

  .close-btn, .max-btn, .nor-btn {
    font-family: "iconfont";
    cursor: pointer;
    float: right;
    color: #fff;
    padding: 0px;
    width: 25px;
    height: 25px;
    line-height: 25px;
    text-align: center;
    margin-left: 5px;

    position: absolute;
    right: 5px;
    top: 5px;
  }

  /*.close-btn {
    line-height: 23px;
    padding-bottom: 5px;
  }*/

  .nor-btn {
    line-height: 23px;
    padding-top: 2px;
  }

  .close-btn:before {
    content: "\e624";
    font-size: 16pt;
    font-weight: bolder;
  }

  .max-btn:before {
    content: "\e8fa";
    font-size: 14pt;
    background-color: transparent;
    color: #fff;
  }

  .nor-btn:before {
    content: "\e8fb";
    font-size: 13pt;
    position: relative;
    top: -2px;
  }

  .close-btn:hover {
    -webkit-transition: color 0.5s;
    -moz-transition: color 0.5s;
    -ms-transition: color 0.5s;
    -o-transition: color 0.5s;
    transition: color 0.5s;
    color: red;
  }

  .nor-btn:hover, .max-btn:hover {
    -webkit-transition: background-color 0.5s;
    -moz-transition: background-color 0.5s;
    -ms-transition: background-color 0.5s;
    -o-transition: background-color 0.5s;
    transition: background-color 0.5s;
    background-color: #2D64B3;
  }

  .content-body::-webkit-scrollbar { /*滚动条整体部分*/
    width: 10px;
    height: 10px;
  }

  .content-body::-webkit-scrollbar-thumb {
    border-radius: 5px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .2);
    background-color: #ddd;
  }
</style>
