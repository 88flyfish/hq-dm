<template>
  <panel>
    <div slot="searchBar">
      <span>规范名称:</span>
      <i-inputbox placeholder="请输入规范名称"
                  v-model="gridConfigs.searchFields.name"
                  style="width:180px; height: 30px; margin-right:20px;">
      </i-inputbox>
      <span>资源目录:</span>
      <div style="display:inline-block;vertical-align: middle;">
        <tree-select :selectStyle="treeSelectSearchConfig.selectStyle"
                     :api="treeSelectSearchConfig.api"
                     :hasSearch="true"
                     v-model="gridConfigs.searchFields.themeId"
                     :treeStyleConfig="{leafIcon:'&#xe92f;'}"
                     ref="treeSelect"></tree-select>
      </div>
      <i-button type="primary"
                plain
                @click="search">查询</i-button>
      <i-button type="primary"
                plain
                @click="reset">重置</i-button>
    </div>

    <div slot="actionBar">
      <i-button type="success"
                @click="addDataSpecification">
        新增
      </i-button>

      <i-button type="danger"
                @click="batchRemoveDataSpecification">
        批量删除
      </i-button>
    </div>

    <div>
      <grid :config="gridConfigs"
            ref="grid"></grid>
    </div>

    <!-- 数据规范弹框 -->
    <data-specification-win :visible.sync="specificationWin.show"
                            :title="specificationWin.title"
                            :themeId="specificationWin.themeId"
                            :entityId="specificationWin.entityId"
                            :type="specificationWin.type">
    </data-specification-win>

    <!--关联字段配置的弹框-->
    <data-field-win :visible.sync="dataFieldWin.show"
                    :title="dataFieldWin.title"
                    :entityId="dataFieldWin.entityId">
    </data-field-win>

    <!--关联描述组别的对话框-->
    <desc-group-win :visible.sync="descGroupWindowConfig.show"
                    :title="descGroupWindowConfig.title"
                    :entityId="descGroupWindowConfig.entityId"
                    :type="descGroupWindowConfig.type">
    </desc-group-win>

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
import grid from '../../../components/common/grid.vue';
import Panel from '../../../components/Panel.vue';
import IDialog from '../../../components/common/Dialog.vue';
import tooltip from '../../../components/common/OperationStatusTooltip.vue';
import IForm from '../../../components/common/IForm';
import IFormItem from '../../../components/common/IFormItem';
import IInputbox from '../../../components/common/IInputbox';
import TreeSelect from '../../../components/DmComponent/TreeSelect';
import IButton from '../../../components/common/IButton';

import DataFieldWin from './DataFieldWin';
import DescGroupWin from './DescGroupWin';
import DataSpecificationWin from './DataSpecificationWin';


export default {
  name: 'data-standard-main',
  provide () {
    return {
      search: this.search
    };
  },
  data () {
    return {
      // 数据规范弹窗
      specificationWin: {
        show: false,
        title: '',
        entityId: '',
        themeId: '',
        type: ''
      },

      // 对话框
      dialogConfig: {
        showDialog: false,
        dialogMessage: '',
        operationType: '',
        type: ''
      },

      // 信息提示
      tooltipConfig: {
        tooltipShow: false,
        tooltipType: '',
        tooltipMessage: ''
      },

      // 资源目录树形下拉框
      treeSelectSearchConfig: {
        api: './api/theme/getAll',
        field: 'nameSearch',
        selectStyle: {
          width: '200px',
          height: '30px'
        }
      },
      // 数据列表
      gridConfigs: {
        maskByParent: false,
        getSelectedNames: [],
        getSelectedIds: [],
        operations: [
          {
            title: '编辑',
            icon: '&#xe90a',
            func: this.modifyDataSpecification
          },
          {
            title: '查看',
            icon: '&#xe9ce',
            func: this.viewDataSpecification
          },
          {
            title: '关联组别配置',
            icon: '&#xe919',
            func: this.descGroup
          },
          {
            title: '关联字段配置',
            icon: '&#xe92c',
            func: this.dataFieldConfig
          },
          {
            title: '删除',
            icon: '&#xe9ac',
            func: this.removeDataSpecification
          }
        ],
        searchFields: {
          name: '',
          themeId: ''
        },
        fields: [
          {
            title: '数据规范名称',
            field: 'name',
            isSortField: true,
            style: {
              width: '10%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '规范编码',
            field: 'standardCode',
            style: {
              width: '8%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '描述',
            field: 'des',
            style: {
              width: '13%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '资源目录',
            field: 'theme.name',
            style: {
              width: '10%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '创建时间',
            field: 'createDate',
            isSortField: true,
            sortType: 'desc',
            style: {
              width: '14%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '更新时间',
            field: 'updateDate',
            isSortField: true,
            style: {
              width: '14%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '创建人',
            field: 'user.chinaname',
            style: {
              textAlign: 'center',
            }
          }
        ],
        currPageNum: 1,
        totalPageNum: 1,
        pageSize: 10,
        api: './api/standardInfo/getPage'
      },
      dataFieldWin: {
        show: false,
        entityId: '',
        title: '',
        type: ''
      },
      descGroupWindowConfig: {
        show: false,
        title: '',
        entityId: ''
      }
    };
  },
  methods: {
    search () {
      //条件查询时必须将当前页重置为1
      this.$refs.grid.resetCurrentPageNum();
      this.$refs.grid.search();
    },
    reset () {
      this.gridConfigs.searchFields = {
        name: '',
        themeId: ''
      };
      this.$refs.treeSelect.title = '';
      this.search();
    },
    dialogCancel () {
      //对值进行重置,不然不会触发change事件
      this.showDialog = false;
    },
    tooltipClosed () {
      this.showTooltip = false;
    },

    descGroup (item) {
      this.descGroupWindowConfig.show = true;
      this.descGroupWindowConfig.entityId = item.id;
      this.descGroupWindowConfig.title = '组别配置-' + item.name;
    },

    // 关联字段配置弹窗
    showDataFieldWin (id, title) {
      this.dataFieldWin = {
        show: true,
        entityId: id,
        title: title
      };
    },

    // 显示数据规范弹窗
    showSpecificationWin (id, themeId, title, type) {
      this.specificationWin = {
        show: true,
        entityId: id,
        themeId: themeId,
        title: title,
        type: type
      };
    },

    // 新增规范
    addDataSpecification () {
      this.showSpecificationWin('', '', '新增数据规范', 'add');
    },

    // 预览数据规范
    viewDataSpecification (item) {
      this.showSpecificationWin(item.id, item.themeId, `查看数据规范(只读)-${item.name}`, 'view');
    },

    // 修改数据规范
    modifyDataSpecification (item) {
      this.showSpecificationWin(item.id, item.themeId, `编辑数据规范-${item.name}`, 'modify');
    },

    // 关联字段配置
    dataFieldConfig (item) {
      this.showDataFieldWin(item.id, `关联字段配置-${item.name}`);
    },

    // 信息提示
    showTooltip (type, message) {
      this.tooltipConfig = {
        tooltipType: type,
        tooltipMessage: message,
        tooltipShow: true
      };
    },

    // 对话框
    showDialog (type, message, operationType) {
      this.dialogConfig = {
        showDialog: true,
        dialogMessage: message,
        operationType: operationType,
        type: type
      };
    },

    // 关闭对话框
    closeDialog () {
      this.dialogConfig.showDialog = false;
    },

    dialogCancel () {
      this.closeDialog();
    },

    removeDataSpecification (item) {
      this.gridConfigs.getSelectedIds = [];
      this.gridConfigs.getSelectedIds.push(item.id);
      this.showDialog('alert', '确认要移除名称为：' + item.name + '的数据规范吗?', 'remove');
    },

    batchRemoveDataSpecification () {
      this.gridConfigs.getSelectedNames = [];
      this.gridConfigs.getSelectedIds = [];
      var selectItems = this.$refs.grid.getSelectedItems();
      if (selectItems.length == 0) {
        this.showTooltip('failed', '请选择至少一条数据');
      } else {
        for (var i in selectItems) {
          this.gridConfigs.getSelectedIds.push(selectItems[i].id);
          this.gridConfigs.getSelectedNames.push(selectItems[i].name);
        }
        this.showDialog(
          'alert',
          `确认要批量删除名称为：${this.gridConfigs.getSelectedNames.join('、')}的数据规范吗?`,
          'batchRemove'
        );
      }
    },

    dialogConfirm () {
      this.closeDialog();
      let message = this.dialogConfig.operationType == 'batchRemove' ? '批量' : '';
      this.$http.post('./api/standardInfo/batchRemoveFromDb', this.gridConfigs.getSelectedIds).then(
        res => {
          if ('success' == res.body.status) {
            this.showTooltip('success', message + '删除成功');
            this.search();
          } else {
            this.showTooltip('failed', res.body.message);
          }
        },

        res => {
          this.showTooltip('failed', '服务器异常,请刷新后重试');
        }
      );
    }
  },
  components: {
    grid,
    Panel,
    IDialog,
    tooltip,
    IForm,
    IFormItem,
    IInputbox,
    IButton,
    TreeSelect,
    DataFieldWin,
    DescGroupWin,
    DataSpecificationWin
  }
};
</script>

<style scoped>
</style>
