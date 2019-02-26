<template>
  <div>
    <i-window :visible.sync="isShow"
              :title="title"
              :width="width"
              :height="height">
      <div class="win-search-bar">
        <div class="fl control-list-search">
          <span>资源名称:</span>
          <i-inputbox style="width: 150px;height: 30px"
                      placeholder="请输入资源名称"
                      v-model="gridConfigs.searchFields.resourceName" />

          <i-button style="margin-left: 10px; padding: 1px 8px"
                    type="primary"
                    plain
                    @click="search">
            查询
          </i-button>
          <i-button style="padding: 1px 8px"
                    type="primary"
                    plain
                    @click="reset">
            重置
          </i-button>
        </div>
      </div>

      <div class="win-grid">
        <grid :config="gridConfigs"
              ref="grid"></grid>
      </div>

      <div slot="footer"
           style="float:right;margin-right:20px;">
        <i-button type="primary"
                  @click="isShow = false">
          关闭
        </i-button>
      </div>
    </i-window>

    <!-- 审核资源窗口 -->
    <check-resource-win @freshGrid='search'
                        :visible.sync="checkResourceWindowConfig.show"
                        :title="checkResourceWindowConfig.title"
                        :entityId="checkResourceWindowConfig.entityId"
                        :deptId="checkResourceWindowConfig.deptId"
                        :type="checkResourceWindowConfig.type"
                        :status="checkResourceWindowConfig.status">
    </check-resource-win>

    <!-- 确认操作的提示框 -->
    <i-dialog v-if="dialogConfig.showDialog"
              :message="dialogConfig.dialogMessage"
              :type="dialogConfig.type"
              @dialogCancel="dialogCancel"
              @dialogConfirm="dialogConfirm">
    </i-dialog>

    <!--　用于显示信息的提示工具　-->
    <tooltip :show.sync="tooltipConfig.tooltipShow"
             :showType="tooltipConfig.tooltipType"
             :message="tooltipConfig.tooltipMessage"
             @tooltipClosed="tooltipConfig.tooltipShow = false;">
    </tooltip>

  </div>
</template>

<script>
import IWindow from '../../components/common/IWindow';
import grid from '../../components/common/grid.vue';
import IForm from '../../components/common/IForm';
import IDialog from '../../components/common/Dialog';
import IFormItem from '../../components/common/IFormItem';
import IInputbox from '../../components/common/IInputbox';
import ITextarea from '../../components/common/ITextarea';
import tooltip from '../../components/common/OperationStatusTooltip';
import IButton from '../../components/common/IButton';
import checkResourceWin from './checkResourceWin';

export default {
  name: 'gis-server-win',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    entityId: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    applyStatus: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      width: '1150px',
      height: '550px',
      //获取单个数据的配置信息
      getMateDateSingleApi: './api/metaInfo/getById?id=',
      //修改单个数据接口
      modifyMateDateSingleApi: './api/metaInfo/modify',
      isShow: this.visible,
      readonly: false,
      operationItem: {},
      // 信息提示
      tooltipConfig: {
        tooltipShow: false,
        tooltipType: '',
        tooltipMessage: ''
      },

      // 对话框
      dialogConfig: {
        showDialog: false,
        dialogMessage: '',
        operationType: '',
        type: ''
      },

      // 数据列表
      gridConfigs: {
        rowChecked: false,
        selectedId: '',
        getSelectedIds: [],
        getSelectedNames: [],
        isRightAllow: false,
        searchFields: {
          resourceName: '',
          deptId: this.entityId,
          applyStatus: this.applyStatus
        },
        operations: [
          {
            title: '授权',
            icon: '&#xe92b',
            func: this.authorizeResource,
            style: 'color:#9f9f9f;font-size:14pt;',
            condition (row) {
              if ('2' !== row.allowEdit || '已通过' !== row.applyStatus) {
                return false;
              }
              return true;
            }
          },
          {
            title: '取消授权',
            icon: '&#xe941',
            func: this.authorizeResource,
            style: 'color:#dc7228;font-size:14pt;',
            condition (row) {
              if ('1' !== row.allowEdit || '已通过' !== row.applyStatus) {
                return false;
              }
              return true;
            }
          },
          {
            title: '审核',
            icon: '&#xe900',
            func: this.checkResource,
            condition (row) {
              if (
                '已通过' == row.applyStatus ||
                '审核未通过' == row.applyStatus
              ) {
                return false;
              }
              return true;
            }
          },
          {
            title: '编辑',
            icon: '&#xe90a',
            func: this.modifyResource,
            condition (row) {
              if ('待审核' == row.applyStatus) {
                return false;
              }
              return true;
            }
          },
          {
            title: '下载',
            icon: '&#xe625',
            func: this.downLoad
          }
        ],
        fields: [
          {
            title: '资源名称',
            field: 'resourceName',
            isSortField: true,
            style: {
              width: '11%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '资源目录',
            field: 'dataDirectory.name',
            isSortField: true,
            style: {
              width: '12%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '文件名称',
            field: 'fileInfo.fileName',
            isSortField: true,
            style: {
              width: '13%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '文件描述',
            field: 'fileDes',
            style: {
              float: 'left',
              width: '10%',
              textAlign: 'center'
            }
          },
          {
            title: '上传人',
            field: 'uploadUser.chinaname',
            style: {
              width: '12%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '上传时间',
            field: 'createDate',
            sortType: 'desc',
            isSortField: true,
            style: {
              width: '10%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '资源状态',
            field: 'applyStatus',
            isSortField: true,
            style: {
              width: '7%',
              float: 'left',
              textAlign: 'center'
            },
            styleCallback: function (value) {
              if ('待审核' == value) {
                return {
                  color: 'blue'
                };
              } else if ('审核未通过' == value) {
                return {
                  color: 'red'
                };
              } else if ('已通过' == value) {
                return {
                  color: 'green'
                };
              }
            }
          }
        ],
        searchedCallback: function (rows) {
          if (rows && rows.length > 0) {
            var temp = [];
            rows.map(function (item) {
              //裁剪时间时分秒信息
              item.createDate = item.createDate.slice(
                0,
                item.createDate.indexOf(' ')
              );
              if (item.applyStatus == '1') {
                item.applyStatus = '待审核';
                temp.push(item);
              } else if (item.applyStatus == '2') {
                item.applyStatus = '审核未通过';
                temp.push(item);
              } else if (item.applyStatus == '3') {
                item.applyStatus = '已通过';
                temp.push(item);
              }
              return true;
            });
            rows = temp;
          }
          return rows;
        },
        padding: '40px',
        currPageNum: 1,
        totalPageNum: 1,
        pageSize: 5,
        api: './api/directoryFileInfo/getAllFileInfoPage'
      },
      checkResourceWindowConfig: {
        show: false,
        title: '',
        entityId: '',
        deptId: '',
        type: '',
        status: ''
      }
    };
  },
  methods: {
    // 条件查询资源目录
    search () {
      //条件查询时必须将当前页重置为1
      this.$refs.grid.resetCurrentPageNum();
      this.$refs.grid.search();
      //刷新大表格
      this.$emit('freshList');
    },
    // 重置查询条件资源目录
    reset () {
      this.gridConfigs.searchFields.resourceName = '';
      this.search();
    },
    // 信息提示
    showTooltip (type, message) {
      this.tooltipConfig = {
        tooltipType: type,
        tooltipMessage: message,
        tooltipShow: true
      };
    },

    // 显示对话框
    showDialog (type, message, operationType) {
      this.dialogConfig = {
        showDialog: true,
        dialogMessage: message,
        operationType: operationType,
        type: type
      };
    },

    dialogCancel () {
      this.closeDialog();
    },
    // 关闭对话框
    closeDialog () {
      this.dialogConfig.showDialog = false;
    },

    dialogConfirm () {
      if (this.dialogConfig.operationType == 'allow') {
        this.operationItem.allowEdit = '1';
      } else if (this.dialogConfig.operationType == 'cancel') {
        this.operationItem.allowEdit = '2';
      }
      this.dialogConfig.showDialog = false;
      this.updateInfo(this.operationItem);
    },
    // 通过id查询
    getMateDateSingle () {
      this.$http.get(this.getMateDateSingleApi + this.entityId).then(res => {
        var clgInfo = res.body.content;
        this.form = {
          id: clgInfo.id,
          metaName: clgInfo.metaName,
          metaDes: clgInfo.metaDes,
          themeId: clgInfo.theme.id
        };
      });
    },
    //显示审核资源弹窗
    showCheckResourceWin (id, deptId, title, type, status) {
      this.checkResourceWindowConfig = {
        show: true,
        entityId: id,
        deptId: deptId,
        title: title,
        type: type,
        status: status
      };
    },
    checkResource (item) {
      this.showCheckResourceWin(
        item.id,
        item.deptId,
        `审核${item.resourceName}文件`,
        'check',
        ''
      );
    },
    modifyResource (item) {
      this.showCheckResourceWin(
        item.id,
        item.deptId,
        `修改${item.resourceName}文件`,
        'modify',
        item.applyStatus
      );
    },
    authorizeResource (item) {
      if (
        item.allowEdit == '2' ||
        item.allowEdit == undefined ||
        item.allowEdit == ''
      ) {
        this.showDialog(
          'alert',
          `确认授权${item.resourceName}资源权限吗？`,
          'allow'
        );
      } else if (item.allowEdit == '1') {
        this.showDialog(
          'alert',
          `确认取消${item.resourceName}资源授权吗？`,
          'cancel'
        );
      }
      this.operationItem = item;
    },
    updateInfo (item) {
      let applyStatus = '';
      switch (item.applyStatus) {
        case '已通过':
          applyStatus = '3';
          break;
        case '待审核':
          applyStatus = '1';
          break;
        case '审核未通过':
          applyStatus = '2';
          break;
      }
      let form = {
        id: item.id,
        applyStatus: applyStatus,
        rejectReason: item.rejectReason,
        resourceId: item.resourceId,
        metadataId: item.metadataId,
        allowEdit: item.allowEdit
      };
      this.$http.post('./api/directoryFileInfo/modify', form).then(
        res => {
          if ('success' == res.body.status) {
            this.showTooltip('success', '操作成功');
            this.$emit('freshList');
          } else {
            this.showTooltip('failed', res.body.message);
          }
        },
        res => {
          this.showTooltip('failed', '服务器异常,请刷新后重试');
        }
      );
    },
    //下载
    downLoad (item) {
      this.$http.get(`./api/fileDownload/download/${item.fileInfoId}`).then(
        res => {
          window.location.href = `./api/fileDownload/download/${item.fileInfoId}`;
          // funDownload(res,'1.zip')
        },
        res => {
          this.showTooltip('failed', '文件不存在');
        }
      );
    }
  },
  watch: {
    visible (val) {
      this.isShow = val;
    },
    isShow (val) {
      //为true表示显示当前Window
      if (val) {
        //修改
        if (this.type == 'modify') {
          this.readonly = false;
          this.getMateDateSingle();
        }
      } else {
        //通过向父组件传递事件的方式修改visible属性所对应的变量的值
        this.$emit('update:visible', val);
      }
    },
    'tooltipConfig.tooltipShow': function (val) {
      // 当tooltip关闭后，如果是成功类型的说明操作成功了，此时一并将Window一起关闭
      if (!val && 'success' == this.tooltipConfig.tooltipType) {
        this.isShow = false;
      }
    },
    entityId (val) {
      this.gridConfigs.searchFields.deptId = val;
    },
    applyStatus (val) {
      this.gridConfigs.searchFields.applyStatus = val;
    }
  },
  components: {
    grid,
    IButton,
    IInputbox,
    IFormItem,
    IDialog,
    IForm,
    IWindow,
    tooltip,
    ITextarea,
    checkResourceWin
  }
};
</script>

<style scoped>
  .win-grid {
    height: calc(100% - 50px);
    border: 1px solid #aaaaaa;
    overflow: auto;
  }

  .win-search-bar {
    width: 100%;
    background-color: #eff1f5;
    padding: 8px 10px;
    border: 1px solid #aaa;
    border-bottom: 0px;
    overflow:hidden;
  }

  .win-grid::-webkit-scrollbar { /*滚动条整体部分*/
    width: 10px;
    height: 10px;
  }

  .win-grid::-webkit-scrollbar-thumb {
    border-radius: 5px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .2);
    background-color: #eee;
  }
</style>
