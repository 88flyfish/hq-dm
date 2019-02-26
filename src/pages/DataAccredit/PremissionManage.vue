<template>
  <div class="premissionManage">
    <Panel>
      <div slot="searchBar">
        <span>数据名称:</span>
        <Iinput v-model="gridConfigs.searchFields.dataName" width="200px" height="30px"
                placeholder="请输入数据名称"></Iinput>
        <i-button type="primary" plain @click="search">查询</i-button>
        <i-button type="primary" plain @click="reset">重置</i-button>
      </div>
      <div slot="actionBar">
        <i-button type="primary" @click="addSingleItem">新增</i-button>
        <i-button type="danger" @click="deleteAll">批量删除</i-button>
      </div>
      <div>
        <grid ref="grid" :config="gridConfigs"></grid>
      </div>
      <!-- 确认操作的提示框 -->
      <my-dialog v-if="showDialog" :message="dialogMessage" @dialogCancel="dialogCancel"
                 @dialogConfirm="dialogConfirm"></my-dialog>
      <MyWindow v-if="addWindowConfig.show" :config="addWindowConfig">
        <IForm>
          <IFormItem required label="数据" labelWidth="100px">
            <div class="input-box">
              <Iinput v-model="addWindowConfig.form.dataName" :readOnly='true'></Iinput>
              <button class="choose-btn" @click="chooseData">
                选择数据
              </button>
            </div>
          </IFormItem>
          <IFormItem required label="权限对象" labelWidth="100px">
            <div class="input-box">
              <Iinput v-model="addWindowConfig.form.targetName" :readOnly='true'></Iinput>
              <button class="choose-btn" @click="targetWindowConfig.show=true;">
                选择对象
              </button>
            </div>
          </IFormItem>
          <IFormItem label="再授权" labelWidth="100px" size="mini">
            <checkbox v-model="addWindowConfig.form.canReauth">允许</checkbox>
          </IFormItem>
          <IFormItem label="编辑" labelWidth="100px" size="mini">
            <checkbox v-model="addWindowConfig.form.canInsert">新增</checkbox>
            <checkbox v-model="addWindowConfig.form.canUpdate">修改</checkbox>
            <checkbox v-model="addWindowConfig.form.canDelete">删除</checkbox>
          </IFormItem>
          <IFormItem label="操作" labelWidth="100px" size="mini">
            <checkbox v-model="addWindowConfig.form.canImport">导入</checkbox>
            <checkbox v-model="addWindowConfig.form.canExport">导出</checkbox>
            <checkbox v-model="addWindowConfig.form.canCopy">复制</checkbox>
            <checkbox v-model="addWindowConfig.form.canBackup">备份</checkbox>
            <checkbox v-model="addWindowConfig.form.canExamine">审核</checkbox>
          </IFormItem>
          <IFormItem label="范围限制" labelWidth="100px" size="mini">
            <checkbox v-model="addWindowConfig.form.areaLimit">开启</checkbox>
          </IFormItem>
          <IFormItem label="生效时间" labelWidth="100px">
            <!--<DatePicker type="dateTime" v-model="addWindowConfig.form.startDate"></DatePicker>-->
            <i-datetime-picker v-model="addWindowConfig.form.startDate" type="datetime"></i-datetime-picker>
          </IFormItem>
          <IFormItem label="过期时间" labelWidth="100px">
            <!--<DatePicker type="dateTime" v-model="addWindowConfig.form.endDate"></DatePicker>-->
            <i-datetime-picker v-model="addWindowConfig.form.endDate" type="datetime"></i-datetime-picker>
          </IFormItem>
        </IForm>
      </MyWindow>
      <MyWindow v-if="chooseDataWindowConfig.show" :config="chooseDataWindowConfig">
        <div class="win-search-bar">
          <span>数据名称：</span>
          <Iinput v-model="chooseDataGridConfig.searchFields.name" width="160px" height="30px" placeholder="请输入数据名称"></Iinput>
          <i-button type="primary" plain @click="dataSearch">查询</i-button>
          <i-button type="primary" plain @click="dataReset">重置</i-button>
        </div>
        <div class="win-grid">
          <grid :config="chooseDataGridConfig" ref="dataGrid"></grid>
        </div>
      </MyWindow>
      <MyWindow v-if="targetWindowConfig.show" :config="targetWindowConfig">
          <div class="win-search-bar">
            <span>用户账号：</span>
            <Iinput v-model="targetGridConfig.searchFields.loginName" placeholder="请输入用户账号" width="160px"
                    height="30px"></Iinput>
            <i-button type="primary" plain @click="targetSearch">查询</i-button>
            <i-button type="primary" plain @click="targetReset">重置</i-button>
          </div>
          <div class="win-grid">
            <div style="width: 26%; float: left">
              <Tree api="./loginapi/sys/org/getAll"
                    :hasCheckbox="false"
                    @selected="treeSelected"
                    ref="leftTree"></Tree>
            </div>
            <div style="float: left; width: 74%; border-left: 1px solid lightgray; height: 100%;">
              <grid :config="targetGridConfig" ref="targetGrid"></grid>
            </div>
          </div>
      </MyWindow>
      <MyTooltip :show="showTooltip" :showType="tooltipType" :message="tooltipMessage"
                 @tooltipClosed="tooltipClosed"></MyTooltip>
    </Panel>
  </div>
</template>

<script>
  import IForm from '../../components/common/IForm.vue';
  import IFormItem from '../../components/common/IFormItem.vue';
  import Iselect from '../../components/common/ISelect.vue';
  import grid from '../../components/common/grid.vue';
  import Panel from '../../components/Panel.vue';
  import MyDialog from '../../components/common/Dialog.vue';
  import MyTooltip from '../../components/common/OperationStatusTooltip.vue';
  import MyWindow from '../../components/common/Window.vue';
  import checkbox from '../../components/common/Checkbox.vue';
  import Iinput from '../../components/common/IInputbox';
  import DatePicker from '../../components/common/DatePicker';
  import ActionPanel from '../../components/ActionPanel';
  import Tree from '../../components/common/Tree';
  import IButton from "../../components/common/IButton";
  import IDatetimePicker from "../../components/DmComponent/IDateTimePicker";

  export default {
    data() {
      return {
        showTooltip: false,
        tooltipType: '',
        tooltipMessage: '',
        targetGridConfig: {
          hasCheckbox: false,
          searchFields: {
            loginName: '',
            orgId: ''
          },
          operationType: '',
          operationItem: {},
          getSelectedNames: [],
          selectedIds: [],
          fields: [
            {
              title: '员工id',
              field: 'id',
              style: {
                width: '14%',
                float: 'left',
                textAlign: 'center'
              }
            },
            {
              title: '账号',
              field: 'loginName',
              style: {
                width: '15%',
                float: 'left',
                textAlign: 'center'
              }
            },
            {
              title: '姓名',
              field: 'username',
              style: {
                width: '15%',
                float: 'left',
                textAlign: 'center'
              }
            },
            {
              title: '所属机构',
              field: 'organization.name',
              style: {
                width: '28%',
                float: 'left',
                textAlign: 'center'
              }
            },
            {
              title: '电话',
              field: 'phone',
              style: {
                width: '14%',
                float: 'left',
                textAlign: 'center'
              }
            }
          ],
          currPageNum: 1,
          totalPageNum: 1,
          pageSize: 10,
          api: './loginapi/sys/user/getPage'
        },
        chooseDataGridConfig: {
          hasCheckbox: false,
          searchFields: {
            name: ''
          },
          operationType: '',
          operationItem: {},
          getSelectedNames: [],
          selectedIds: [],
          fields: [
            {
              title: '数据名称',
              field: 'name',
              isSortField: true,
              style: {
                width: '24%',
                float: 'left',
                textAlign: 'center',
                paddingLeft: '3%'
              }
            },
            {
              title: '创建人',
              field: 'creator',
              style: {
                width: '12%',
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
                width: '20%',
                float: 'left',
                textAlign: 'center'
              }
            },
            {
              title: '修改人',
              field: 'updater',
              style: {
                float: 'left',
                width: '12%',
                textAlign: 'center'
              }
            },
            {
              title: '修改时间',
              field: 'updateDate',
              isSortField: true,
              style: {
                width: '20%',
                float: 'left',
                textAlign: 'center'
              }
            }
          ],
          currPageNum: 1,
          totalPageNum: 1,
          pageSize: 10,
          api: './api/data/getPage'
        },
        targetWindowConfig: {
          type: 'add',
          show: false,
          readonly: false,
          parent: this,
          title: '选择授权用户',
          width: '1000px',
          height: '680px',
          method: {
            close() {
              this.targetWindowConfig.show = false;
            },
            cancel() {
              this.targetWindowConfig.show = false;
            },
            confirm() {
              var selectItems = this.$refs.targetGrid.getSelectedItems();
              if (selectItems.length == 0) {
                this.tooltipType = 'failed';
                this.tooltipMessage = '请选择一条数据!';
                this.showTooltip = true;
              } else {
                this.targetGridConfig.getSelectedNames = [];
                this.targetGridConfig.selectedIds = [];
                this.addWindowConfig.form.targetId = selectItems[0].id;
                this.addWindowConfig.form.targetName = selectItems[0].loginName;
                this.targetWindowConfig.show = false;
              }
            }
          }
        },
        chooseDataWindowConfig: {
          type: 'add',
          show: false,
          readonly: false,
          parent: this,
          title: '选择数据',
          width: '950px',
          height: '680px',
          method: {
            close() {
              this.chooseDataWindowConfig.show = false;
            },
            cancel() {
              this.chooseDataWindowConfig.show = false;
            },
            confirm() {
              var selectItems = this.$refs.dataGrid.getSelectedItems();
              if (selectItems.length == 0) {
                this.tooltipType = 'failed';
                this.tooltipMessage = '请选择一条数据!';
                this.showTooltip = true;
              } else {
                this.chooseDataGridConfig.getSelectedNames = [];
                this.chooseDataGridConfig.selectedIds = [];
                this.addWindowConfig.form.dataId = selectItems[0].id;
                this.addWindowConfig.form.dataName = selectItems[0].name;
                this.chooseDataWindowConfig.show = false;
              }
            }
          }
        },
        addWindowConfig: {
          type: '',
          show: false,
          readonly: false,
          parent: this,
          title: '新增权限',
          height: '580px',
          width: '700px',
          form: {
            dataId: '', //数据ID
            dataName: '', //数据名
            targetId: '', //权限ID
            targetName: '', //权限名
            canReauth: 0, //是否允许再授权
            canInsert: 0, //新增
            canUpdate: 0, //修改
            canDelete: 0, //删除
            canImport: 0, //导入
            canExport: 0, //导出
            canCopy: 0, //复制
            canBackup: 0, //备份
            canExamine: 0, //审核
            areaLimit: 0, //范围限制
            startDate: '', //生效时间
            endDate: '' //过期时间
          },
          method: {
            close() {
              this.addWindowConfig.show = false;
            },
            cancel() {
              this.addWindowConfig.show = false;
            },
            confirm() {
              //表单验证
              //todo

              var params = Object.assign({}, this.addWindowConfig.form);
              for (var k in params) {
                if (params[k] === false) {
                  params[k] = 0;
                } else if (params[k] === true) {
                  params[k] = 1;
                }
              }
              if (this.addWindowConfig.type == 'add') {
                this.$http.post('./api/dataPermission/save', params).then(
                  res => {
                    res = res.body;
                    if (res.status == 'success') {
                      this.addWindowConfig.show = false;
                      this.search();
                      this.tooltipType = 'success';
                      this.tooltipMessage = '新增成功';
                      this.showTooltip = true;
                    } else {
                      this.tooltipType = 'failed';
                      this.tooltipMessage = '新增失败';
                      this.showTooltip = true;
                    }
                  },
                  err => {
                    this.addWindowConfig.show = false;
                    this.tooltipType = 'failed';
                    this.tooltipMessage = '新增失败';
                    this.showTooltip = true;
                  }
                );
              } else if (this.addWindowConfig.type == 'modify') {
                this.$http.post('./api/dataPermission/modify', params).then(
                  res => {
                    res = res.body;
                    if (res.status == 'success') {
                      this.addWindowConfig.show = false;
                      this.search();
                      this.tooltipType = 'success';
                      this.tooltipMessage = '修改成功';
                      this.showTooltip = true;
                    } else {
                      this.tooltipType = 'failed';
                      this.tooltipMessage = '修改失败';
                      this.showTooltip = true;
                    }
                  },
                  err => {
                    this.addWindowConfig.show = false;
                    this.tooltipType = 'failed';
                    this.tooltipMessage = '修改失败';
                    this.showTooltip = true;
                  }
                );
              }
            }
          }
        },
        dialogMessage: '',
        operationType: '',
        operationItem: {},
        showDialog: false,
        gridConfigs: {
          operationColumnWidth: '150px',
          searchFields: {
            dataName: ''
          },
          operationType: '',
          operationItem: {},
          getSelectedNames: [],
          selectedIds: [],
          fields: [
            {
              title: '数据名称',
              field: 'dataName',
              style: {
                float: 'left',
                width: '17%',
                textAlign: 'center'
              }
            },
            {
              title: '授权目标名称',
              field: 'targetName',
              style: {
                float: 'left',
                width: '14%',
                textAlign: 'center'
              }
            },
            {
              title: '区域限制',
              field: 'areaLimit',
              style: {
                float: 'left',
                width: '8%',
                textAlign: 'center'
              }
            },
            {
              title: '数据创建者',
              field: 'isOnwer',
              style: {
                float: 'left',
                width: '8%',
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
              title: '创建日期',
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
          api: './api/dataPermission/getPage',
          operations: [
            {
              title: '编辑',
              icon: '&#xe90a',
              func: item => {
                this.$http.get('./api/dataPermission/getById?id=' + item.id).then(
                  res => {
                    res = res.body;
                    if (res.status == 'success') {
                      res = res.content;
                      this.addWindowConfig.form = {
                        id: item.id,
                        dataId: res.dataId, //数据ID
                        dataName: res.dataName, //数据名
                        targetId: res.targetId, //权限ID
                        targetName: res.targetName, //权限名
                        canReauth: this.toBool(res.canReauth), //是否允许再授权
                        canInsert: this.toBool(res.canInsert), //新增
                        canUpdate: this.toBool(res.canUpdate), //修改
                        canDelete: this.toBool(res.canDelete), //删除
                        canImport: this.toBool(res.canImport), //导入
                        canExport: this.toBool(res.canExport), //导出
                        canCopy: this.toBool(res.canCopy), //复制
                        canBackup: this.toBool(res.canBackup), //备份
                        canExamine: this.toBool(res.canExamine), //审核
                        areaLimit: this.toBool(res.areaLimit), //范围限制
                        startDate: res.startDate, //生效时间
                        endDate: res.endDate //过期时间
                      };
                      this.addWindowConfig.show = true;
                      this.addWindowConfig.type = 'modify';
                    }
                  },
                  err => {
                  }
                );
              }
            },
            {
              title: '删除',
              icon: '&#xe9ac',
              func: item => {
                this.dialogMessage = `确认删除${item.dataName}这个数据吗`;
                this.operationType = 'removeSingleItem';
                this.operationItem = item;
                this.showDialog = true;
              },
              condition(row) {
                return row.isOnwer != '是';
              }
            }
          ],
          searchedCallback: function (rows) {
            for (var i in rows) {
              var row = rows[i];
              row.areaLimit = row.areaLimit == 1 ? '是' : '否';
              row.isOnwer = row.isOnwer == 1 ? '是' : '否';
            }
          }
        }
      };
    },
    methods: {
      treeSelected(id, title) {
        this.targetGridConfig.searchFields.orgId = id;
        this.$refs.targetGrid.resetCurrentPageNum();
        this.$refs.targetGrid.search();
      },
      deleteAll() {
        this.gridConfigs.getSelectedNames = [];
        this.gridConfigs.selectedIds = [];
        var selectItems = this.$refs.grid.getSelectedItems();
        if (selectItems.length == 0) {
          this.tooltipType = 'failed';
          this.tooltipMessage = '请先选择数据!';
          this.showTooltip = true;
        } else {
          selectItems.forEach(item => {
            this.gridConfigs.getSelectedNames.push(item.dataName);
            this.gridConfigs.selectedIds.push(item.id);
          });
          this.dialogMessage =
            '确认要批量删除：' +
            this.gridConfigs.getSelectedNames.toString() +
            ' 的数据吗?';
          this.operationType = 'removeDataBatch';
          this.showDialog = true;
        }
      },
      chooseData() {
        this.chooseDataWindowConfig.show = true;
      },
      tooltipClosed() {
        this.showTooltip = false;
      },
      targetSearch() {
        this.$refs.targetGrid.resetCurrentPageNum();
        this.$refs.targetGrid.search();
      },
      targetReset() {
        this.targetGridConfig.searchFields.loginName = '';
        this.targetSearch()
      },
      dataSearch() {
        this.$refs.dataGrid.resetCurrentPageNum();
        this.$refs.dataGrid.search();
      },
      dataReset() {
        this.chooseDataGridConfig.searchFields.name = '';
        this.dataSearch()
      },
      addSingleItem() {
        this.addWindowConfig.form = {
          dataId: '', //数据ID
          dataName: '', //数据名
          targetId: '', //权限ID
          targetName: '', //权限名
          canReauth: 0, //是否允许再授权
          canInsert: 0, //新增
          canUpdate: 0, //修改
          canDelete: 0, //删除
          canImport: 0, //导入
          canExport: 0, //导出
          canCopy: 0, //复制
          canBackup: 0, //备份
          canExamine: 0, //审核
          areaLimit: 0, //范围限制
          startDate: '', //生效时间
          endDate: '' //过期时间
        };
        this.addWindowConfig.show = true;
        this.addWindowConfig.readonly = false;
        this.addWindowConfig.type = 'add';
      },
      dialogCancel() {
        this.showDialog = false;
      },
      dialogConfirm() {
        this.showDialog = false;
        if (this.operationType == 'removeSingleItem') {
          this.$http
            .get(
              './api/dataPermission/removeFromDbById?id=' + this.operationItem.id
            )
            .then(
              res => {
                res = res.body;
                if (res.status == 'success') {
                  this.tooltipType = 'success';
                  this.tooltipMessage = '删除权限成功!';
                  this.showTooltip = true;
                  this.search();
                } else {
                  this.dialogMessage = res.message;
                  this.operationType = 'none';
                  this.showDialog = true;
                }
              },
              err => {
              }
            );
        } else if (this.operationType == 'removeDataBatch') {
          this.$http
            .post(
              './api/dataPermission/batchRemoveFromDb',
              this.gridConfigs.selectedIds
            )
            .then(
              res => {
                res = res.body;
                if (res.status == 'success') {
                  this.tooltipType = 'success';
                  this.tooltipMessage = '批量删除成功!';
                  this.showTooltip = true;
                  this.search();
                } else {
                  this.showDialog = true;
                  this.dialogMessage = `部分删除失败，原因为：${res.message}`;
                  this.operationType = 'none';
                  this.search();
                }
              },
              err => {
              }
            );
        }
      },
      search() {
        this.gridConfigs.getSelectedNames = [];
        this.gridConfigs.selectedIds = [];
        this.$refs.grid.resetCurrentPageNum();
        this.$refs.grid.search();
      },
      reset() {
        this.gridConfigs.searchFields.dataName = '';
        this.search();
      }
    },
    mounted() {
    },
    components: {
      IDatetimePicker,
      IButton,
      IForm,
      IFormItem,
      Iinput,
      checkbox,
      Iselect,
      grid,
      Panel,
      MyDialog,
      MyTooltip,
      MyWindow,
      DatePicker,
      ActionPanel,
      Tree
    }
  };
</script>

<style lang="less" scoped>
  .input-box {
    position: relative;
    .choose-btn {
      position: absolute;
      right: 0px;
      top: 2px;
      height: 32px;
      /*background: #13ce66;*/
      background: #20a0ff;
      border-radius: 4px;
      color: #fff;
      cursor: pointer;
    }
  }
  .win-search-bar {
    width: 100%;
    background-color: #eff1f5;
    padding: 8px 10px;
    border: 1px solid #aaa;
    border-bottom: 0px;
  }
  .win-grid {
    height: calc(100% - 50px);
    border: 1px solid #aaaaaa;
    overflow: auto;
    width: 100%;
  }
</style>
