<template>
  <panel>
    <div slot="searchBar">
      <span>组别名称:</span>

      <i-inputbox v-model="gridConfigs.searchFields.name"
                  style="width:180px;height: 30px;margin-right:10px;"
                  placeholder="请输入组别名称">
      </i-inputbox>
      <i-button type="primary"
                plain
                @click="searchGroup">
        查询
      </i-button>
      <i-button type="primary"
                plain
                @click="resetGroup">
        重置
      </i-button>
    </div>

    <div slot="actionBar">
      <i-button style="margin-right: 10px"
                type="success"
                @click="addgroup">
        新增
      </i-button>
      <i-button type="danger"
                @click="batchRemovegroup">
        批量删除
      </i-button>
    </div>
    <div>
      <grid :config="gridConfigs"
            ref="grid"></grid>
    </div>

    <!-- 确认操作的提示框 -->
    <i-dialog v-if="dialogConfig.showDialog"
              :message="dialogConfig.dialogMessage"
              :type="dialogConfig.type"
              @dialogCancel="dialogCancel"
              @dialogConfirm="dialogConfirm"></i-dialog>

    <!--　用于显示信息的提示工具　-->
    <tooltip :show.sync="tooltipConfig.showTooltip"
             :showType="tooltipConfig.tooltipType"
             :message="tooltipConfig.tooltipMessage">
    </tooltip>

    <!-- 用于查看当前组别基本信息信息的窗口组件 -->
    <my-window :visible.sync="groupWindowConfig.show"
               :title="groupWindowConfig.title"
               :width="groupWindowConfig.width"
               :height="groupWindowConfig.height">
      <i-form>
        <i-form-item label="组别名称"
                     :required="!groupWindowConfig.readonly">
          <i-inputbox v-model="groupWindowConfig.form.name"
                      :readonly="groupWindowConfig.readonly">
          </i-inputbox>
        </i-form-item>

        <i-form-item label="组别序号"
                     :required="!groupWindowConfig.readonly">
          <i-inputbox v-model="groupWindowConfig.form.orderNum"
                      :readonly="groupWindowConfig.readonly"
                      :maxlength=4>
          </i-inputbox>
        </i-form-item>

        <i-form-item label="组别描述">
          <i-textarea style="height: 70px;"
                      v-model="groupWindowConfig.form.des"
                      :readonly="groupWindowConfig.readonly"
                      :maxlength=100>
          </i-textarea>
        </i-form-item>

      </i-form>

      <div slot="footer"
           style="float:right;margin-right:20px">
        <i-button v-if="groupWindowConfig.type == 'view'"
                  type="primary"
                  @click="cancel">
          关闭
        </i-button>

        <i-button v-if="!groupWindowConfig.readonly"
                  @click="cancel">
          取消
        </i-button>

        <i-button v-if="!groupWindowConfig.readonly"
                  type="primary"
                  @click="submit">
          提交
        </i-button>
      </div>
    </my-window>

    <!-- 用于查看当前组别关联描述信息的窗口 -->
    <group-des-win :visible.sync="groupgroupWindowConfig.show"
                   :title="groupgroupWindowConfig.title"
                   :entityId="groupgroupWindowConfig.entityId"
                   :type="groupgroupWindowConfig.type">
    </group-des-win>

  </panel>
</template>

<script>
  import grid from '../../../components/common/grid.vue';
  import Tooltip from '../../../components/common/OperationStatusTooltip';
  import IDialog from '../../../components/common/Dialog';
  import MyWindow from '../../../components/common/IWindow.vue';
  import IButton from '../../../components/common/IButton';
  import IForm from '../../../components/common/IForm';
  import IFormItem from '../../../components/common/IFormItem';
  import Panel from '../../../components/Panel';
  import IInputbox from '../../../components/common/IInputbox';

  import groupDesWin from './groupDesWin';
  import ITextarea from "../../../components/common/ITextarea";

  export default {
    name: 'desc-group-manage',
    data() {
      return {
        //查看组别信息
        groupInfoApi: './api/groupInfo/getById?id=',
        //确认修改组别信息
        groupModifyApi: './api/groupInfo/modify',
        //确认新增组别
        groupAddApi: './api/groupInfo/save',
        //查询组别内描述项
        groupDesInfoApi: './api/describeInfo?id=',
        //确认批量删除组别
        groupRemoveApi: './api/groupInfo/batchRemoveFromDb',
        //保存将要批量删除
        removeForm: {},
        //消息提示
        tooltipConfig: {
          showTooltip: false,
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
        //保存当前所操作的组别信息
        operationItem: {},
        //查看组别基本信息弹窗的配置
        groupWindowConfig: {
          type: '',
          readonly: false,
          show: false,
          title: '',
          height: '400px',
          width: '580px',
          form: {
            orderNum: '',
            id: '', //
            name: '', //必填
            des: '',
            createDate: '',
            updateDate: '',
            creatorId: '',
            updaterId: ''
          },
          method: {}
        },
        //查看组别内描述项的弹窗配置
        groupgroupWindowConfig: {
          show: false,
          title: '',
          entityId: '',
          type: ''
        },
        //展示各个组别的表格
        gridConfigs: {
          maskByParent: false,
          searchFields: {
            name: ''
          },
          operations: [
            {
              title: '编辑',
              icon: '&#xe90a',
              func: this.modifyGroup
            },
            {
              title: '查看',
              icon: '&#xe9ce',
              func: this.viewGroup
            },
            {
              title: '查看本组关联描述项',
              icon: '&#xe913',
              func: this.viewGroupDesInfo
            },
            {
              title: '删除',
              icon: '&#xe9ac;',
              func: this.removeGroup
            }
          ],
          operationType: '',
          operationItem: {},
          getSelectedNames: [],
          fields: [
            {
              title: '组别名称',
              field: 'name',
              style: {
                float: 'left',
                width: '12%',
                textAlign: 'center'
              }
            },
            {
              title: '组别序号',
              field: 'orderNum',
              isSortField: true,
              sortType: 'asc',
              style: {
                width: '12%',
                float: 'left',
                textAlign: 'center'
              }
            },
            {
              title: '组别描述',
              field: 'des',
              style: {
                float: 'left',
                width: '16%',
                textAlign: 'center'
              }
            },
            {
              title: '创建时间',
              field: 'createDate',
              isSortField: true,
              style: {
                float: 'left',
                width: '16%',
                textAlign: 'center'
              }
            },
            {
              title: '创建人',
              field: 'user.chinaname',
              isSortField: true,
              style: {
                float: 'left',
                width: '17%',
                textAlign: 'center'
              }
            }
          ],
          currPageNum: 1,
          totalPageNum: 1,
          pageSize: 10,
          api: './api/groupInfo/getPage',
          searchedCallback(rows) {
            for (var i in rows) {
              var row = rows[i];
              if (row.groupbaseType === '1') {
                row.groupbaseType = 'oracle';
              }
            }
          }
        }
      };
    },
    methods: {
      // 显示消息提示
      showTooltip(type, message) {
        this.tooltipConfig = {
          tooltipType: type,
          tooltipMessage: message,
          showTooltip: true
        };
      },

      // 显示对话框
      showDialog(type, message, operationType) {
        this.dialogConfig = {
          showDialog: true,
          dialogMessage: message,
          operationType: operationType,
          type: type
        };
      },

      // 关闭对话框
      closeDialog() {
        this.dialogConfig.showDialog = false;
      },

      //退出对话框
      dialogCancel() {
        this.closeDialog();
      },
      // 条件查询
      searchGroup() {
        //条件查询时必须将当前页重置为1
        this.$refs.grid.resetCurrentPageNum();
        this.$refs.grid.search();
      },

      // 重置查询条件
      resetGroup() {
        this.gridConfigs.searchFields.name = '';
        this.searchGroup();
      },

      //用于打开组别中显示描述项弹窗的方法
      showGroupDesWindow(type, title, id) {
        this.groupgroupWindowConfig = {
          show: true,
          title: title,
          entityId: '' + id,
          type: type
        };
      },

      //打开当前组别包含描述项
      viewGroupDesInfo(item) {
        this.showGroupDesWindow('modify', '关联描述项配置-' + item.name, item.id);
      },

      //查看当前组别信息
      viewGroup(item) {
        this.groupWindowConfig.type = 'view';
        this.operationItem = item;
        this.groupWindowConfig.title = '查看组别信息(只读)-' + item.name;
        this.groupWindowConfig.show = true;
      },

      //打开组别编辑弹窗
      modifyGroup(item) {
        this.groupWindowConfig.type = 'modify';
        this.operationItem = item;
        this.groupWindowConfig.title = '修改组别信息-' + item.name;
        this.groupWindowConfig.show = true;
      },

      //打开新增组别弹窗
      addgroup() {
        this.groupWindowConfig.type = 'add';
        this.groupWindowConfig.show = true;
        this.groupWindowConfig.title = '新增组别';
      },

      // 表单验证
      validateForm() {
        if ('' == this.groupWindowConfig.form.name) {
          this.showTooltip('failed', '请填写组别名称');
          return false;
        }

        if ('' == this.groupWindowConfig.form.orderNum) {
          this.showTooltip('failed', '请填写序号');
          return false;
        }

        let pattern = /^([0-9]\d{0,3}|[0]{1,1})$/;
        if (!pattern.test(this.groupWindowConfig.form.orderNum.replace(/^\s+/, ''))) {
          this.showTooltip('failed', '序号必须为最大4位的非负整数');
          return;
        }

        return true;
      },

      //提交确认
      submit() {
        if (!this.validateForm()) {
          return;
        }

        let message;
        let url;
        if ('add' == this.groupWindowConfig.type) {
          url = this.groupAddApi;
          message = '新增';
        } else if ('modify' == this.groupWindowConfig.type) {
          url = this.groupModifyApi;
          message = '修改';
        }
        this.$http.post(url, this.groupWindowConfig.form).then(
          res => {
            if ('success' == res.body.status) {
              this.showTooltip('success', message + '成功');
              this.searchGroup();
              this.groupWindowConfig.show = false;
            } else {
              this.showTooltip('failed', res.body.message);
            }
          },
          res => {
            this.showTooltip('failed', message + '失败');
          }
        );
      },

      //取消或关闭组别基本信息弹窗
      cancel() {
        this.groupWindowConfig.form = {};
        this.groupWindowConfig.show = false;
      },

      //批量删除组别
      batchRemovegroup() {
        this.gridConfigs.getSelectedNames = [];
        this.removeForm.Id = [];
        let selectItems = this.$refs.grid.getSelectedItems();
        if (0 == selectItems.length) {
          this.showTooltip('failed', '请先选择组别');
        } else {
          for (var i in selectItems) {
            this.removeForm.Id.push(selectItems[i].id);
            this.gridConfigs.getSelectedNames.push(selectItems[i].name);
          }
          this.showDialog(
            'alert',
            '确认要批量删除名称为：' + this.gridConfigs.getSelectedNames.join('、') + ' 的组别吗?',
            'batchRemoveGroup'
          );
        }
      },

      //删除当前组别
      removeGroup(item) {
        this.removeForm.Id = [];
        this.removeForm.Id.push(item.id);
        let msg = '确认删除名称为:' + item.name + '的组别吗？';
        this.showDialog('alert', msg, 'removeGroupAn');
      },
      // 对话框确认
      dialogConfirm() {
        this.closeDialog();
        let message;
        if ('removeGroupAn' == this.dialogConfig.operationType) {
          message = '';
        } else if ('batchRemoveGroup' == this.dialogConfig.operationType) {
          message = '批量';
        }

        this.$http.post(this.groupRemoveApi, this.removeForm.Id).then(
          res => {
            if (res.body.status == 'success') {
              this.showTooltip('success', message + '删除成功');
              this.searchGroup();
            } else {
              this.showTooltip('failed', res.body.message);
            }
          },
          res => {
            this.showTooltip('failed', res.body.message + message + '删除失败');
          }
        );
      },

      // 通过id查询
      getById(id) {
        this.$http.get(this.groupInfoApi + id).then(
          res => {
            var groupInfo = res.body.content;
            this.groupWindowConfig.form = {
              orderNum: groupInfo.orderNum,
              id: '' + groupInfo.id,
              name: groupInfo.name,
              des: '' + groupInfo.des,
              createDate: groupInfo.createDate,
              updateDate: groupInfo.updateDate,
              creatorId: groupInfo.creatorId,
              updaterId: groupInfo.updaterId
            };
          },
          res => {
            showTooltip('failed', res.body.message);
          }
        );
      }
    },
    watch: {
      'groupWindowConfig.show': function (val) {
        if (val) {
          //新增
          if (this.groupWindowConfig.type == 'add') {
            this.groupWindowConfig.readonly = false;
            this.groupWindowConfig.form = {
              orderNum: '',
              id: '',
              name: '',
              des: '',
              createDate: '',
              updateDate: '',
              creatorId: '',
              updaterId: ''
            };
          } else if (this.groupWindowConfig.type == 'modify') {
            //修改
            this.groupWindowConfig.readonly = false;
            this.getById(this.operationItem.id);
          } else if (this.groupWindowConfig.type == 'view') {
            //查看
            this.groupWindowConfig.readonly = true;
            this.getById(this.operationItem.id);
          }
        }
      }
    },
    components: {
      ITextarea,
      IInputbox,
      grid,
      IDialog,
      Tooltip,
      MyWindow,
      IButton,
      IForm,
      IFormItem,
      Panel,
      groupDesWin
    },
  };
</script>

<style scoped>
</style>

