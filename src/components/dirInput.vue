<template>
  <div class="dirInput">
    <MyWindow v-if="dirWindowConfig.show" :config="dirWindowConfig">
      <AsynTree :treeData='treeConfig.data' :currentItem='treeConfig.currentItem' @item-click="itemClick">

      </AsynTree>
    </MyWindow>
    <div class="input-box">
      <Iinput v-model="dir" :height="height"></Iinput>
      <button class="choose-btn" @click="chooseDir" :style="{height:height?height:'32px'}">
        选择文件夹
      </button>
    </div>
    <my-tooltip :show="showTooltip" :showType="tooltipType" :message="tooltipMessage"
                @tooltipClosed="showTooltip = false;"></my-tooltip>
  </div>
</template>

<script>
  import WaitMask from './common/WaitMask'
  import grid from "./common/grid.vue"
  import MyWindow from "./common/Window.vue"
  import Iinput from './common/IInputbox'
  import Panel from "./Panel.vue"
  import AsynTree from './common/AsynTree'

  import MyTooltip from "./common/OperationStatusTooltip.vue"


  export default {
    components: {
      WaitMask, grid, MyWindow, Iinput, Panel, AsynTree, MyTooltip
    },
    name: "dirInput",
    props: ['fileSourceId', 'height'],
    data() {
      return {
        showTooltip: false,
        tooltipType: '',
        tooltipMessage: '',
        dir: '',
        treeConfig: {
          data: [{
            name: '全部文件',
            parentPath: '',
            isDir: '1',
            isLeafDir: '0'
          }],
          currentItem: {
            path: '/'
          }
        },
        dirWindowConfig: {
          type: 'add',
          show: false,
          parent: this,
          title: '选择文件夹',
          height: '600px',
          width: '700px',
          readonly: false,
          method: {
            close() {
              this.dirWindowConfig.show = false;
            },
            cancel() {
              this.dirWindowConfig.show = false;
            },
            confirm() {
              if (!this.treeConfig.currentItem.path) {
                this.treeConfig.currentItem.path = '/'
              }
              // this.addWindowConfig.form.dir = this.treeConfig.currentItem.path;
              this.dir = this.treeConfig.currentItem.path;
              this.$emit('setDir', this.treeConfig.currentItem.path)
              this.dirWindowConfig.show = false;
            }
          }
        }
      }
    },
    methods: {
      chooseDir() {
        if (!this.fileSourceId) {
          this.getTip('请先选择数据源', 'failed')
          return;
        }
        this.treeConfig = {
          data: [{
            name: '全部文件',
            parentPath: '',
            isDir: '1',
            isLeafDir: '0'
          }],
          currentItem: {
            path: '/'
          }
        }
        this.dirWindowConfig.show = true;
      },
      itemClick(item) {
        var path;
        this.treeConfig.currentItem = item;
        if (item.isDir == '1') item.open = !item.open;
        if (item && item.isDir == "1") {
          if (item.parentPath == "") {
            path = '/'
          } else if (item.parentPath == "/") {
            path = item.parentPath + item.name;
          } else {
            path = item.parentPath + "/" + item.name;
          }
          // debugger;
          var params = {
            path: path
          }
          this.$http.post('./api/fileSourceView/getFolderList/' + this.fileSourceId, params).then((res) => {

            var filterDatas = res.body.content;
            this.$set(this.treeConfig.currentItem, 'children', filterDatas);
          }, err => {
            this.getTip(err.body.resultBean.message, 'failed')
          });
        }
      },
      getTip(msg, type) {
        this.showTooltip = true;
        this.tooltipMessage = msg;
        this.tooltipType = type;
      }
    }
  }
</script>

<style lang="less" scoped>
  .dirInput {
    .input-box {
      position: relative;
      .choose-btn {
        position: absolute;
        right: 0;
        top: 0px;
        width: 80px;
        height: 32px;
        border-radius: 4px;
        /*background: #13ce66;*/
        background: #20a0ff;
        color: #fff;
        cursor: pointer;
      }
    }
  }
</style>
