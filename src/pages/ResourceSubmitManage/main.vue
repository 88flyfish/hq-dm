<template>
  <action-panel classConfig="{width:22%}">
    <!-- 操作 -->
    <div slot="actionBar">
      <i-button style="margin-right: 10px"
                type="success"
                :disabled="this.gridConfigs.searchFields.directoryId == ''"
                @click="addResource">
        新增
      </i-button>

      <i-button type="danger"
                @click="batchRemove">
        批量删除
      </i-button>
    </div>

    <!-- 左侧栏 -->
    <div slot="actionBox"
         style="height:100%">
      <tree ref="tree"
            :defaultSelectedId="defaultSelectedId"
            api="./api/directoryFileInfo/getDeptDirectory"
            apiType="get"
            :hasCheckbox="false"
            :expandLevel="2"
            :styleInfo="{height:'100%'}"
            :styleConfig="{nodeIcon:'',leafIcon:'&#xe92f;'}"
            @selected="selected">
      </tree>
    </div>

    <!-- 分页列表 -->
    <div>
      <grid :config="gridConfigs"
            ref="grid"></grid>
    </div>
    <!-- 详情页面 -->
    <resource-detail-win :visible.sync="resourceDetailWin.show"
                         :detailData="resourceDetailWin.detailData"
                         :title="resourceDetailWin.title">
    </resource-detail-win>
    <!-- 新增弹窗 -->
    <resource-add-win @search="search"
                      :visible.sync="resourceAddWin.show"
                      :title="resourceAddWin.title"
                      :entityId="resourceAddWin.entityId"
                      :type="resourceAddWin.type">
    </resource-add-win>

    <!-- 修改查看弹窗 -->
    <resource-item-win @search="search"
                       :visible.sync="resourceItemWin.show"
                       :title="resourceItemWin.title"
                       :entityId="resourceItemWin.entityId"
                       :type="resourceItemWin.type"
                       :applyStatus="resourceItemWin.applyStatus">
    </resource-item-win>

    <!-- 确认操作对话框 -->
    <i-dialog v-if="dialogConfig.show"
              :message="dialogConfig.dialogMessage"
              :type="dialogConfig.type"
              @dialogCancel="dialogCancel"
              @dialogConfirm="dialogConfirm">
    </i-dialog>

    <!-- 信息提示 -->
    <tooltip :show.sync="tooltipConfig.tooltipShow"
             :showType="tooltipConfig.tooltipType"
             :message="tooltipConfig.tooltipMessage">
    </tooltip>

    <!--错误信息提示窗口-->
    <i-window :visible.sync="errorMessageWin.show"
              :title="errorMessageWin.title"
              width="600px"
              height="400px">
      <i-form>
        <i-textarea style="height: 300px;"
                    v-model="errorMessageWin.dialogMessage"
                    :readonly="true">
        </i-textarea>
      </i-form>
      <div slot="footer"
           style="float:right;margin-right:20px;">
        <i-button plain
                  @click="errorMessageWin.show = false">
          关闭
        </i-button>
      </div>
    </i-window>
  </action-panel>
</template>

<script>
import ActionPanel from '../../components/ActionPanel'
import Grid from "../../components/common/grid";
import IButton from "../../components/common/IButton";
import Tree from "../../components/common/Tree"
import resourceAddWin from "./resourceAddWin"
import resourceItemWin from "./resourceItemWin"
import resourceDetailWin from "./resourceDetailWin"
import Tooltip from "../../components/common/OperationStatusTooltip"
import IDialog from "../../components/common/Dialog"
import IWindow from "../../components/common/IWindow";
import IForm from '../../components/common/IForm'
import ITextarea from '../../components/common/ITextarea'

export default {
  name: "data-directory",
  data () {
    var that = this;
    return {
      //删除单个文件信息接口
      removeDirectoryFileInfoApi: './api/directoryFileInfo/removeById?id=',
      //批量删除文件信息接口
      removeBatchDirectoryFileInfoApi: './api/directoryFileInfo/batchRemove',
      //默认选中的树节点
      defaultSelectedId: '',
      //树结构父节点
      parentId: '',
      //当前用户信息
      currentUser: null,
      //服务详情页面
      resourceDetailWin: {
        show: false,
        title: '',
        detailData: null
      },
      // 新增修改弹窗
      resourceAddWin: {
        show: false,
        title: '',
        entityId: '',
        type: '',
      },
      // 新增修改弹窗
      resourceItemWin: {
        show: false,
        title: '',
        entityId: '',
        type: '',
        applyStatus: '',
      },

      // 对话框
      dialogConfig: {
        show: false,
        dialogMessage: "",
        operationType: "",
        type: ""
      },

      // 信息提示
      tooltipConfig: {
        tooltipShow: false,
        tooltipType: "",
        tooltipMessage: ""
      },
      errorMessageWin: {
        show: false,
        title: '未通过详情',
        type: 'view',
        dialogMessage: ''
      },
      // 数据列表
      gridConfigs: {
        selectedId: '',
        getSelectedIds: [],
        getSelectedNames: [],
        searchFields: {
          directoryId: '',
        },
        operations: [{
          title: "查看服务",
          icon: "&#xe907",
          func: this.serviceSearch,
          condition: function (row) {
            return row.applyStatus == '已通过' || row.applyStatus == '3';
          }
        }, {
          title: "查看",
          icon: "&#xe9ce",
          func: this.viewResource
        }, {
          title: "编辑",
          icon: "&#xe90a",
          func: this.modifyResource
        }, {
          title: "删除",
          icon: "&#xe9ac",
          func: this.removeResource
        }, {
          title: '下载',
          icon: '&#xe625',
          func: this.downLoad
        }],
        fields: [{
          title: "资源名称",
          field: "resourceName",
          isSortField: true,
          style: {
            width: "11%",
            float: "left",
            textAlign: "center"
          }
        },
        {
          title: "资源目录",
          field: "dataDirectory.name",
          style: {
            width: "13%",
            float: "left",
            textAlign: "center"
          }
        },
        {
          title: "文件名称",
          field: "fileInfo.fileName",
          style: {
            width: "15%",
            float: "left",
            textAlign: "center"
          }
        },
        {
          title: "资源状态",
          field: "applyStatus",
          isSortField: true,
          style: {
            width: "8%",
            float: "right",
            textAlign: "center"
          },
          operation: function (item) {
            if ('审核未通过' == item.applyStatus) {
              that.errorMessageWin.show = true;
              that.errorMessageWin.dialogMessage = item.rejectReason;
            }
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
        },
        {
          title: "上传人",
          field: "uploadUser.chinaname",
          style: {
            width: "8%",
            float: "right",
            textAlign: "center"
          }
        },
        {
          title: "上传时间",
          field: "createDate",
          sortType: 'desc',
          isSortField: true,
          style: {
            width: "10%",
            float: "right",
            textAlign: "center"
          }
        },
        {
          title: "文件描述",
          field: "fileDes",
          style: {
            // width: "11%",
            // float: "left",
            textAlign: "center"
          }
        },
        ],
        searchedCallback: function (rows) {
          if (rows && rows.length > 0) {
            var temp = [];
            rows.map(function (item) {
              //裁剪时间时分秒信息
              item.createDate = item.createDate.slice(0, item.createDate.indexOf(' '))
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
        currPageNum: 1,
        totalPageNum: 1,
        pageSize: 10,
        api: "./api/directoryFileInfo/getPage"
      }
    }
  },

  methods: {
    // 查询
    // 条件查询
    search () {
      //条件查询时必须将当前页重置为1
      this.$refs.grid.resetCurrentPageNum();
      this.$refs.grid.search();
    },

    // 显示详情信息弹窗
    showResourceDetailWin (title, detailData) {
      this.resourceDetailWin = {
        show: true,
        title: title,
        detailData: detailData
      }
    },

    // 显示修改弹窗
    showResourceItemWin (id, title, type, applyStatus) {
      this.resourceItemWin = {
        show: true,
        entityId: id,
        title: title,
        type: type,
        applyStatus: applyStatus
      }
    },

    // 显示新增弹窗
    showResourceAddWin (id, title, type) {
      this.resourceAddWin = {
        show: true,
        entityId: id,
        title: title,
        type: type
      }
    },

    // 显示对话框
    showDialog (type, message, operationType) {
      this.dialogConfig = {
        show: true,
        dialogMessage: message,
        operationType: operationType,
        type: type
      }
    },

    // 信息提示
    showTooltip (type, message) {
      this.tooltipConfig = {
        tooltipType: type,
        tooltipMessage: message,
        tooltipShow: true
      };
    },

    // 关闭对话框
    closeDialog () {
      this.dialogConfig.show = false;
    },

    dialogCancel () {
      this.closeDialog();
    },

    // 选中树目录
    selected (id) {
      if (id == this.parentId) {
        this.gridConfigs.searchFields.directoryId = '';
      } else {
        this.gridConfigs.searchFields.directoryId = id;
      }
      //
    },

    // 新增
    addResource () {
      this.showResourceAddWin(this.gridConfigs.searchFields.directoryId, '新增文件', 'add');
    },

    // 查看
    viewResource (item) {
      this.showResourceItemWin(item.id, `查看文件(只读)-${item.fileInfo.fileName || ''}`, 'view', item.applyStatus);
    },

    // 修改
    modifyResource (item) {
      this.showResourceItemWin(item.id, `修改文件-${item.fileInfo.fileName || ''}`, 'modify', item.applyStatus);
    },

    // 删除对话框
    removeResource (item) {
      this.gridConfigs.selectedId = item.id;
      this.showDialog('alert', `确认要删除名称为${item.fileInfo.fileName}的文件吗?`, 'removeResource');
    },

    // 批量删除对话框
    batchRemove () {
      this.gridConfigs.getSelectedNames = [];
      this.gridConfigs.getSelectedIds = [];
      var selectItems = this.$refs.grid.getSelectedItems();
      if (selectItems.length == 0) {
        this.showTooltip("failed", "请选择至少一条数据");
      } else {
        for (let i in selectItems) {
          this.gridConfigs.getSelectedIds.push(selectItems[i].id);
          this.gridConfigs.getSelectedNames.push(selectItems[i].fileInfo.fileName);
        }
        this.showDialog('alert', `确认要批量删除名称为：${this.gridConfigs.getSelectedNames.join('、')}的文件吗?`, "batchRemove");
      }
    },

    // 确认操作
    dialogConfirm () {
      this.closeDialog();
      if ('removeResource' == this.dialogConfig.operationType) {
        this.$http.get(this.removeDirectoryFileInfoApi + this.gridConfigs.selectedId).then(
          (res) => {
            if ('success' == res.body.status) {
              this.showTooltip("success", "删除成功");
              this.search();
            } else {
              this.showTooltip("success", "删除失败");
            }
          },
          (res) => {
            this.showTooltip("failed", "服务器异常,请刷新后重试");
          }
        )
      } else if ('batchRemove' == this.dialogConfig.operationType) {
        this.$http.post(this.removeBatchDirectoryFileInfoApi, this.gridConfigs.getSelectedIds).then(
          (res) => {
            if ('success' == res.body.status) {
              this.showTooltip("success", "批量删除成功");
              this.search();
            } else {
              this.showTooltip("failed", "批量删除失败");
            }
          },
          (res) => {
            this.showTooltip("failed", "服务器异常,请刷新后重试");
          }
        )
      }
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
    },
    serviceSearch (item) {
      let baseUrl;
      let urlGet = `./api/dataDirectoryUpdateFileInfo/viewService?serviceName=${encodeURI(item.serviceName)}`;
      let url;
      this.$http.get(urlGet).then(
        res => {
          const urlData = res.body.content;
          var reg = /^((\w+):\/\/([^/:]*)(?::(\d+))?)(.*)/;
          baseUrl = reg.exec(urlData)[1];
          // let foo = urlData.match(/.+\/smartcity/)[0];
          // baseUrl = foo.substr(0, (foo.length - 9));
          url = `${baseUrl}/smartcity/resource/getResourceDetails?resourceId=${encodeURI(item.resourceId)}`;
          this.getDetail(url);
        },
        res => {
          this.showTooltip('failed', '无法获取信息');
        }
      );
    },
    getDetail (url) {
      this.$http.get(url).then(
        res => {
          const detailObj = res.data;
          this.showResourceDetailWin('详细信息', detailObj)
        },
        res => {
          this.showTooltip('failed', '无法获取信息');
        }
      );
    },
  },
  mounted () {
    this.gridConfigs.searchFields.directoryId = '',
      this.$http.get("./loginapi/sys/getCurrentUser").then(
        (res) => {
          let resInfo = res.body.content;
          this.currentUser = {
            chinesename: resInfo.chinesename,
            id: resInfo.id
          }
          this.defaultSelectedId = resInfo.depId;
          this.parentId = resInfo.depId;
          this.gridConfigs.searchFields.directoryId = '';
          // this.search();
        }
      )
  },
  components: {
    IButton,
    Grid,
    ActionPanel,
    Tree,
    resourceDetailWin,
    resourceAddWin,
    resourceItemWin,
    Tooltip,
    IDialog,
    IWindow,
    IForm,
    ITextarea
  },
  watch: {
    "gridConfigs.searchFields.directoryId": {
      handler (val) {
        //由于列表查询的条件也是异步获取的，只能通过监听来刷新
        this.search();
      }
    }
  }
}
</script>

<style scoped>
</style>
