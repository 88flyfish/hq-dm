<template>
  <action-panel classConfig="{width:22%}">
    <!-- 操作 -->
    <!--<div slot="actionBar">-->
    <!--<i-button style="margin-right: 10px"-->
    <!--type="success"-->
    <!--:disabled="this.gridConfigs.searchFields.directoryId == ''"-->
    <!--@click="addResource">-->
    <!--新增-->
    <!--</i-button>-->

    <!--<i-button type="danger"-->
    <!--:disabled="this.gridConfigs.searchFields.directoryId == ''"-->
    <!--@click="batchRemove">-->
    <!--批量删除-->
    <!--</i-button>-->
    <!--</div>-->

    <!-- 左侧栏 -->
    <div slot="actionBox"
         style="height:100%">
      <tree ref="tree"
            :defaultSelectedId="defaultSelectedId"
            api="./api/directoryFileInfo/getDeptDirectory"
            apiType="get"
            :hasCheckbox="false"
            :expandLevel="2"
            :styleConfig="{nodeIcon:'',leafIcon:'&#xe92f;'}"
            @selected="selected">
      </tree>
    </div>

    <!-- 分页列表 -->
    <div>
      <grid :config="gridConfigs"
            ref="grid"></grid>
    </div>

    <!-- 新增弹窗 -->
    <file-add-win @search="search"
                  :visible.sync="resourceAddWin.show"
                  :title="resourceAddWin.title"
                  :entityId="resourceAddWin.entityId"
                  :type="resourceAddWin.type">
    </file-add-win>

    <!-- 修改查看弹窗 -->
    <resource-item-win v-if="resourceItemWin.show"
                       @search="search"
                       :visible.sync="resourceItemWin.show"
                       :title="resourceItemWin.title"
                       :entityId="resourceItemWin.entityId"
                       :type="resourceItemWin.type">
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
  </action-panel>
</template>

<script>
import ActionPanel from '../../components/ActionPanel'
import Grid from "../../components/common/grid";
import IButton from "../../components/common/IButton";
import Tree from "../../components/common/Tree"
import fileAddWin from "./fileAddWin"
import resourceItemWin from "./resourceItemWin"
import Tooltip from "../../components/common/OperationStatusTooltip"
import IDialog from "../../components/common/Dialog"

export default {
  name: "data-directory",
  data () {
    return {
      //删除单个文件信息接口
      removeDirectoryFileInfoApi: './api/directoryFileInfo/removeById?id=',
      //默认选中的树节点
      defaultSelectedId: '',
      //树结构父节点
      parentId: '',
      //当前用户信息
      currentUser: null,
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

      // 数据列表
      gridConfigs: {
        hasCheckbox: false,
        selectedId: '',
        getSelectedIds: [],
        getSelectedNames: [],
        searchFields: {
          directoryId: '',
          applyStatus: 3,
        },
        operations: [{
          title: "查看服务",
          icon: "&#xe907",
          func: this.serviceSearch
        }, {
          title: "文件记录",
          icon: "&#xe9b9",
          func: this.fileRecord
        }, {
          title: "更新文件",
          icon: "&#xe626",
          func: this.uploadFile
        }
        ],
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
          isSortField: true,
          style: {
            width: "13%",
            float: "left",
            textAlign: "center"
          }
        },
        {
          title: "上传时间",
          field: "createDate",
          sortType: 'desc',
          isSortField: true,
          style: {
            width: "13%",
            float: "right",
            textAlign: "center"
          }
        },
        {
          title: "服务名称",
          field: "serviceName",
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
            textAlign: "center"
          }
        },

        ],
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
    // 显示修改弹窗
    showResourceItemWin (id, title, type) {
      this.resourceItemWin = {
        show: true,
        entityId: id,
        title: title,
        type: type
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



    // 文件记录
    fileRecord (item) {
      this.showResourceItemWin(item.id, `文件记录`, 'view');
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
    //服务搜索
    serviceSearch (item) {
      var url = `./api/dataDirectoryUpdateFileInfo/viewService?serviceName=${encodeURI(item.serviceName)}`;
      $.ajax({
        url: url,
        type: 'GET',
        async: false,
        contentType: 'application/json',
        success: function (res) {
          window.open(res.content, '_blank');
        },
        error: function (res) {

        }
      })

    },
    uploadFile (item) {
      var url = `./api/dataDirectoryUpdateFileInfo/checkFileStauts?dfId=${item.id}`
      this.$http.get(url).then((res) => {
        var obj = JSON.parse(res.bodyText)
        if (obj.content == false) {
          this.showResourceAddWin(item.id, `上传文件`, 'add');
        } else {
          this.showTooltip("failed", "文件等待审核中，暂时无法更新");
        }
      })



    },
  },
  mounted () {
    this.gridConfigs.searchFields.directoryId = '';
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
    fileAddWin,
    resourceItemWin,
    Tooltip,
    IDialog
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
