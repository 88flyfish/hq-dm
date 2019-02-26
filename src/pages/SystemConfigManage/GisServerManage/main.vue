<template>
  <panel>
    <!-- 条件查询 -->
    <div slot="searchBar">
      <span>服务器名称:</span>
      <i-inputbox placeholder="请输入服务器名称"
                  v-model="gridConfigs.searchFields.name"
                  style="width:180px; height: 30px; margin-right:20px;">
      </i-inputbox>

      <i-button type="primary"
                plain
                @click="search">
        查询
      </i-button>

      <i-button type="primary"
                plain
                @click="reset">
        重置
      </i-button>
    </div>

    <!-- 操作 -->
    <div slot="actionBar">
      <i-button type="success"
                style="margin-right: 10px;"
                @click="addGisServer">
        新增
      </i-button>
      <i-button type="danger"
                @click="batchRemove">
        批量删除
      </i-button>
    </div>

    <!-- 数据列表 -->
    <div>
      <grid :config="gridConfigs"
            ref="grid"></grid>
    </div>

    <!-- 新增修改弹窗 -->
    <gis-server-win :visible.sync="gisServerWin.show"
                    :title="gisServerWin.title"
                    :entityId="gisServerWin.entityId"
                    :type="gisServerWin.type">
    </gis-server-win>

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
             :message="tooltipConfig.tooltipMessage">
    </tooltip>
  </panel>
</template>

<script>
  import Panel from "../../../components/Panel.vue"
  import Grid from "../../../components/common/grid";
  import IButton from "../../../components/common/IButton";
  import IInputbox from "../../../components/common/IInputbox";
  import GisServerWin from "./GisServerWin";
  import tooltip from "../../../components/common/OperationStatusTooltip"
  import IDialog from "../../../components/common/Dialog"

  export default {
    name: 'gis-server-main',
    provide() {
      return {
        search: this.search
      };
    },
    data() {
      return {
        // 信息提示
        tooltipConfig: {
          tooltipShow: false,
          tooltipType: "",
          tooltipMessage: ""
        },

        // 对话框
        dialogConfig: {
          showDialog: false,
          dialogMessage: "",
          operationType: "",
          type: ""
        },

        // 数据列表
        gridConfigs: {
          maskByParent: false,
          selectedId: '',
          getSelectedIds: [],
          getSelectedNames: [],
          searchFields: {
            name: '',
          },
          operations: [
            {
              title: "编辑",
              icon: "&#xe90a",
              func: this.modifyGisServer
            },
            {
              title: "查看",
              icon: "&#xe9ce",
              func: this.viewGisServer
            },
            {
              title: "删除",
              icon: "&#xe9ac",
              func: this.removeGisServer
            }],
          fields: [
            {
              title: "服务器名称",
              field: "name",
              isSortField: true,
              style: {
                width: "11%",
                float: "left",
                textAlign: "center"
              }
            },
            {
              title: "IP地址",
              field: "ip",
              style: {
                width: "14%",
                float: "left",
                textAlign: "center"
              }
            },
            {
              title: "端口号",
              field: "port",
              style: {
                float: "left",
                width: "11%",
                textAlign: "center"
              }
            },
            {
              title: "账号",
              field: "username",
              isSortField: true,
              style: {
                width: "12%",
                float: "left",
                textAlign: "center"
              }
            },
            {
              title: "创建时间",
              field: "createDate",
              isSortField: true,
              sortType: 'desc',
              style: {
                float: "left",
                width: "14%",
                textAlign: "center"
              }
            },
            {
              title: "创建人",
              field: "user.chinaname",
              style: {
                textAlign: "center"
              }
            }
          ],
          currPageNum: 1,
          totalPageNum: 1,
          pageSize: 10,
          api: "./api/gisServer/getPage"
        },

        // 弹窗
        gisServerWin: {
          show: false,
          title: '',
          entityId: '',
          type: ''
        },
      }
    },
    methods: {
      // 条件查询
      search() {
        //条件查询时必须将当前页重置为1
        this.$refs.grid.resetCurrentPageNum();
        this.$refs.grid.search();
      },

      // 重置查询条件
      reset() {
        this.gridConfigs.searchFields.name = '';
        this.search();
      },

      // 信息提示
      showTooltip(type, message) {
        this.tooltipConfig = {
          tooltipType: type,
          tooltipMessage: message,
          tooltipShow: true
        };
      },

      // 对话框
      showDialog(type, message, operationType) {
        this.dialogConfig = {
          showDialog: true,
          dialogMessage: message,
          operationType: operationType,
          type: type
        }
      },

      // 关闭对话框
      closeDialog() {
        this.dialogConfig.showDialog = false;
      },

      dialogCancel() {
        this.closeDialog();
      },

      // 显示窗口
      showGisServerWin(id, title, type) {
        this.tooltipConfig.tooltipShow = false;
        this.gisServerWin = {
          show: true,
          entityId: id,
          title: title,
          type: type
        }
      },

      // 新增
      addGisServer() {
        this.tooltipConfig.tooltipShow = false;
        this.showGisServerWin('', '新增GIS服务器', 'add');
      },

      // 查看
      viewGisServer(item) {
        this.tooltipConfig.tooltipShow = false;
        this.showGisServerWin(item.id, '查看GIS服务器(只读)-' + item.username, 'view');
      },

      // 修改
      modifyGisServer(item) {
        this.tooltipConfig.tooltipShow = false;
        this.showGisServerWin(item.id, '修改GIS服务器-' + item.username, 'modify');
      },

      // 删除对话框
      removeGisServer(item) {
        this.gridConfigs.selectedId = '';
        this.gridConfigs.selectedId = item.id;
        this.showDialog('alert', `确定删除账号为：${item.username}的GIS服务器吗?`, 'removeGis');
      },

      // 批量删除对话框
      batchRemove() {
        this.gridConfigs.getSelectedNames = [];
        this.gridConfigs.getSelectedIds = [];
        var selectItems = this.$refs.grid.getSelectedItems();
        if (selectItems.length == 0) {
          this.showTooltip("failed", "请选择至少一条数据");
        } else {
          for (var i in selectItems) {
            this.gridConfigs.getSelectedIds.push(selectItems[i].id);
            this.gridConfigs.getSelectedNames.push(selectItems[i].username);
          }
          this.showDialog('alert', `确认要批量删除名称为：${this.gridConfigs.getSelectedNames.join('、')}的GIS服务器吗?`, "batchRemove");
        }
      },

      // 对话框确认操作
      dialogConfirm() {
        this.closeDialog();

        if ('removeGis' == this.dialogConfig.operationType) {
          this.$http.get("./api/gisServer/removeById?id=" + this.gridConfigs.selectedId).then(
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
          this.$http.post('./api/gisServer/batchRemove', this.gridConfigs.getSelectedIds).then(
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
      }
    },
    components: {
      GisServerWin,
      IInputbox,
      IButton,
      Grid,
      Panel,
      tooltip,
      IDialog
    }
  }

</script>

<style scoped>
</style>
