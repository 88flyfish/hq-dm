<template>
  <panel>
    <div slot="searchBar">
      <span>数据名称:</span>
      <i-inputbox placeholder="请输入数据名称"
                  v-model="gridConfigs.searchFields.data.name"
                  style="width:180px; height: 30px; margin-right:20px;">
      </i-inputbox>
      <span>是否启用:</span>
      <i-select
        :clear="false"
        panelHeight="80px"
        height="30px"
        width="120px"
        @change="search"
        v-model="gridConfigs.searchFields.isValid">
        <i-option value="1" label="启用"></i-option>
        <i-option value="0" label="停用"></i-option>
      </i-select>
      <i-button type="primary"
                plain
                @click="search">查询</i-button>

      <i-button type="primary"
                plain
                @click="reset">重置</i-button>
    </div>

    <div slot="actionBar">
      <i-button type="success"
                plain
                @click="batchEnable">启用
      </i-button>

      <i-button type="danger"
                plain
                @click="batchDisable">停用</i-button>

      <i-button type="primary"
                @click="addDataOwnership">新增</i-button>

      <i-button type="danger"
                @click="batchRemoveDataOwnership">批量删除</i-button>
    </div>

    <div>
      <grid :config="gridConfigs" ref="grid"></grid>
    </div>

    <ownership-win
      :visible.sync="ownershipWin.show"
      :title="ownershipWin.title"
      @refresh="search"></ownership-win>

    <!-- 确认操作的提示框 -->
    <i-dialog v-if="dialogConfig.show"
              :message="dialogConfig.dialogMessage"
              :type="dialogConfig.type"
              @dialogCancel="dialogCancel"
              @dialogConfirm="dialogConfirm">
    </i-dialog>

    <!--　用于显示信息的提示工具　-->
    <tooltip :show.sync="tooltipConfig.show"
             :showType="tooltipConfig.tooltipType"
             :message="tooltipConfig.tooltipMessage"
             @tooltipClosed="tooltipConfig.show = false"></tooltip>
  </panel>
</template>

<script>
  import Panel from '../../../components/Panel'
  import IButton from '../../../components/common/IButton'
  import IInputbox from "../../../components/common/IInputbox";
  import ISelect from "../../../components/DmComponent/ISelect";
  import IOption from "../../../components/DmComponent/IOption";
  import Grid from '../../../components/common/grid';
  import IDialog from '../../../components/DmComponent/Dialog';
  import Tooltip from '../../../components/DmComponent/OperationStatusTooltip'

  import OwnershipWin from './OwnershipWin'

  export default {
    data() {
      return {
        ownershipWin: {
          show: false,
          title: ''
        },

        // 对话框
        dialogConfig: {
          show: false,
          dialogMessage: '',
          operationType: '',
          type: ''
        },

        tooltipConfig: {
          show: false,
          tooltipType: '',
          tooltipMessage: ''
        },

        // 数据列表
        gridConfigs: {
          maskByParent: true,
          selectedId: '',
          selectedIds: [],
          operations: [
            {
              title: '启用',
              icon: '&#xea15',
              func: this.enableOwnership,
              condition(row) {
                return '停用' === row.isValid;
              }
            },
            {
              title: '停用',
              icon: '&#xea16',
              func: this.disableOwnership,
              condition(row) {
                return '已启用' === row.isValid;
              }
            },
            {
              title: '删除',
              icon: '&#xe9ac',
              func: this.removeOwnership
            },
          ],
          searchFields: {
            isValid: '',
            data:{
              name: ''
            }
          },
          fields: [
            {
              title: '数据名称',
              field: 'data.name',
              isSortField: true,
              style: {
                float: 'left',
                width: '17%',
                textAlign: 'center'
              }
            },
            {
              title: '权属人',
              field: 'ownership',
              style: {
                float: 'left',
                width: '14%',
                textAlign: 'center'
              }
            },
            {
              title: '状态',
              field: 'isValid',
              isSortField: true,
              style: {
                float: 'left',
                width: '12%',
                textAlign: 'center'
              }
            },
            {
              title: '创建人',
              field: 'creator',
              style: {
                float: 'left',
                width: '14%',
                textAlign: 'center'
              }
            },
            {
              title: '创建时间',
              field: 'createDate',
              isSortField: true,
              sortType: 'desc',
              style: {
                float: 'left',
                width: '15%',
                textAlign: 'center'
              }
            },
          ],
          currPageNum: 1,
          totalPageNum: 1,
          pageSize: 10,
          api: './api/dataOwnership/getPage',
          searchedCallback: rows => {
            rows.forEach(element => {
              element.isValid =  '1' === element.isValid ? '已启用' : '0' === element.isValid ? '停用' : '无状态';
            });
          }
        }
      }
    },
    methods: {
      search() {
        //条件查询时必须将当前页重置为1
        this.$refs.grid.resetCurrentPageNum();
        this.$refs.grid.search();
      },
      reset() {
        this.gridConfigs.searchFields = {
          data: {
            name: ''
          },
          isValid: ''
        };
        this.search();
      },
      showOwnershipWin(title) {
        this.ownershipWin = {
          show: true,
          title: title
        }
      },
      addDataOwnership() {
        this.showOwnershipWin('新增数据权属人');
      },
      showTooltip(type, message) {
        this.tooltipConfig = {
          tooltipType: type,
          tooltipMessage: message,
          show: true
        };
      },
      // 对话框
      showDialog(type, message, operationType) {
        this.dialogConfig = {
          show: true,
          dialogMessage: message,
          operationType: operationType,
          type: type
        };
      },
      // 关闭对话框
      closeDialog() {
        this.dialogConfig.show = false;
      },

      dialogCancel() {
        this.closeDialog();
      },
      removeById() {
        this.$http
          .get('./api/dataOwnership/removeFromDbById?id=' + this.gridConfigs.selectedId)
          .then(res => {
              this.gridConfigs.selectedId = '';
              if ('success' === res.body.status) {
                this.showTooltip('success', '删除成功');
                this.search();
              } else {
                this.showTooltip('success', '删除失败');
              }
            },
            res => {
              this.gridConfigs.selectedId = '';
              this.showTooltip('failed', '服务器异常,请刷新后重试');
            });
      },
      batchRemove() {
        this.$http
          .post('./api/dataOwnership/batchRemoveFromDb', this.gridConfigs.selectedIds)
          .then(res => {
              if ('success' === res.body.status) {
                this.showTooltip('success', '批量删除成功');
                this.search();
              } else {
                this.showTooltip('failed', '批量删除失败');
              }
            },
            res => {
              this.showTooltip('failed', '服务器异常,请刷新后重试');
            });
      },
      enableDisable() {
        let flag = 'enable' === this.dialogConfig.operationType;
        let isValid = flag ? 1 : 0;
        let message = flag ? '启用' : '停用';
        let params = {
          id: this.gridConfigs.selectedId,
          isValid: isValid
        };
        this.$http
          .post('./api/dataOwnership/modify', params)
          .then(res => {
              if ('success' === res.body.status) {
                this.showTooltip('success', `${message}成功`);
                this.search();
              } else {
                this.showTooltip('failed', `${message}失败`);
              }
            },
            res => {
              this.showTooltip('failed', '服务器异常,请刷新后重试');
            });
      },
      batchEnableDisabled() {
        let flag = 'batchEnable' === this.dialogConfig.operationType ;
        let isValid = flag ? 1 : 0;
        let message = flag ? '启用' : '停用';
        let params = {
          idList: this.gridConfigs.selectedIds,
          entity:{
            isValid: isValid
          }
        };
        this.$http
          .post('./api/dataOwnership/batchModify', params)
          .then(res => {
              if ('success' === res.body.status) {
                this.showTooltip('success', `${message}成功`);
                this.search();
              } else {
                this.showTooltip('failed', `${message}失败`);
              }
            },
            res => {
              this.showTooltip('failed', '服务器异常,请刷新后重试');
            });
      },
      removeOwnership(item) {
        this.gridConfigs.selectedId = item.id;
        this.showDialog('alert', `确认要删除数据名称:${item.data.name},权属人:${item.ownership}的权属关系吗?`, 'remove');
      },
      batchRemoveDataOwnership() {
        this.gridConfigs.selectedIds = [];
        let selectItems = this.$refs.grid.getSelectedItems();
        if (0 === selectItems.length) {
          this.showTooltip('icon', '请选择至少一条数据');
        } else {
          selectItems.forEach(element => {
            this.gridConfigs.selectedIds.push(element.id);
            this.showDialog('alert', `确认要删除这些权属关系吗?`, 'batchRemove');
          });
        }
      },
      batchEnable() {
        this.gridConfigs.selectedIds = [];
        let selectItems = this.$refs.grid.getSelectedItems();
        if (0 === selectItems.length) {
          this.showTooltip('icon', '请选择至少一条数据');
        } else {
          selectItems.forEach(element => {
            this.gridConfigs.selectedIds.push(element.id);
            this.showDialog('alert', `确认要启用这些权属关系吗?`, 'batchEnable');
          });
        }
      },
      batchDisable() {
        this.gridConfigs.selectedIds = [];
        let selectItems = this.$refs.grid.getSelectedItems();
        if (0 === selectItems.length) {
          this.showTooltip('icon', '请选择至少一条数据');
        } else {
          selectItems.forEach(element => {
            this.gridConfigs.selectedIds.push(element.id);
            this.showDialog('alert', `确认要停用这些权属关系吗?`, 'batchDisable');
          });
        }
      },
      enableOwnership(item) {
        this.gridConfigs.selectedId = item.id;
        this.showDialog('alert', `确认要启用数据名称:${item.data.name},权属人:${item.ownership}的权属关系吗?`, 'enable');
      },
      disableOwnership(item) {
        this.gridConfigs.selectedId = item.id;
        this.showDialog('alert', `确认要停用数据名称:${item.data.name},权属人:${item.ownership}的权属关系吗?`, 'disable');
      },
      dialogConfirm() {
        this.closeDialog();
        switch (this.dialogConfig.operationType) {
          case 'remove':
            this.removeById();
            break;
          case 'batchRemove':
            this.batchRemove();
            break;
          case 'enable':
          case 'disable':
            this.enableDisable();
            break;
          case 'batchEnable':
          case 'batchDisable':
            this.batchEnableDisabled();
            break;
          default:
            break;
        }
      },
    },

    components: {
      IOption,
      ISelect,
      IInputbox,
      Panel,
      IButton,
      Grid,
      OwnershipWin,
      IDialog,
      Tooltip
    }
  }

</script>

<style scoped>

</style>
