<template>
  <panel>
    <div slot="searchBar">
      <span>数据源名称:</span>
      <i-inputbox v-model="gridConfigs.searchFields.sourceName"
                  style="width:180px;height: 30px;margin-right:10px;"
                  placeholder="请输入数据源名称"></i-inputbox>
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
    <div slot="actionBar">
      <i-button style="margin-right: 10px"
                type="success"
                @click="addDataSource">
        新增
      </i-button>
      <i-button type="danger"
                @click="batchRemoveDataSource">
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
    <tooltip :show.sync="tooltipConfig.tooltipShow"
             :showType="tooltipConfig.tooltipType"
             :message="tooltipConfig.tooltipMessage"></tooltip>

    <!-- 用于查看当前数据源信息的窗口组件 -->
    <my-window :visible.sync="dataWindowConfig.show"
               :title="dataWindowConfig.title"
               :width="dataWindowConfig.width"
               :height="dataWindowConfig.height">
      <i-form>
        <i-form-item label="数据源名称"
                     :required="!dataWindowConfig.readonly">
          <i-inputbox v-model="dataWindowConfig.form.sourceName"
                      :readonly="dataWindowConfig.readonly"></i-inputbox>
        </i-form-item>

        <i-form-item label="数据库类型"
                     :required="!dataWindowConfig.readonly">
          <i-select v-model="dataWindowConfig.form.databaseType"
                    width="100%"
                    panelHeight="100px"
                    :disabled="dataWindowConfig.readonly">
            <i-option value="1"
                      label="Oracle">
            </i-option>
          </i-select>
        </i-form-item>

        <i-form-item label="IP"
                     :required="!dataWindowConfig.readonly">
          <i-inputbox v-model="dataWindowConfig.form.ip"
                      :readonly="dataWindowConfig.readonly"></i-inputbox>
        </i-form-item>

        <i-form-item label="端口"
                     :required="!dataWindowConfig.readonly">
          <i-inputbox v-model="dataWindowConfig.form.port"
                      :readonly="dataWindowConfig.readonly"></i-inputbox>
        </i-form-item>

        <i-form-item label="数据库名称"
                     :required="!dataWindowConfig.readonly">
          <i-inputbox v-model="dataWindowConfig.form.databaseName"
                      :readonly="dataWindowConfig.readonly"></i-inputbox>
        </i-form-item>

        <i-form-item label="账号"
                     :required="!dataWindowConfig.readonly">
          <i-inputbox v-model="dataWindowConfig.form.userName"
                      :readonly="dataWindowConfig.readonly"></i-inputbox>
        </i-form-item>

        <i-form-item label="密码"
                     :required="!dataWindowConfig.readonly">
          <i-inputbox v-model="dataWindowConfig.form.password"
                      type="password"
                      :readonly="dataWindowConfig.readonly"></i-inputbox>
        </i-form-item>
      </i-form>
      <div slot="footer"
           style="float:right;margin-right:20px">
        <i-button v-if="!dataWindowConfig.readonly"
                  style="margin-right: 20px;"
                  type="success"
                  @click="testConnect">
          连接测试
        </i-button>
        <i-button v-if="dataWindowConfig.type == 'view'"
                  type="primary"
                  @click="cancel">
          关闭
        </i-button>
        <i-button v-if="!dataWindowConfig.readonly"
                  @click="cancel">
          取消
        </i-button>
        <i-button v-if="!dataWindowConfig.readonly"
                  type="primary"
                  @click="submit">
          提交
        </i-button>
      </div>
    </my-window>
  </panel>
</template>

<script>
import grid from '../../components/common/grid.vue';
import IDialog from '../../components/common/Dialog.vue';
import Tooltip from '../../components/common/OperationStatusTooltip.vue';
import MyWindow from '../../components/common/IWindow.vue';
import IButton from '../../components/common/IButton';
import IForm from '../../components/common/IForm';
import IFormItem from '../../components/common/IFormItem';
import Panel from '../../components/Panel';
import IInputbox from '../../components/common/IInputbox';
import ISelect from '../../components/DmComponent/ISelect';
import IOption from '../../components/DmComponent/IOption';

export default {
  name: 'data-source',
  components: {
    IInputbox,
    grid,
    IDialog,
    Tooltip,
    MyWindow,
    IButton,
    IForm,
    IFormItem,
    Panel,
    ISelect,
    IOption
  },
  data () {
    return {
      //数据源信息
      DataSourceInfoApi: './api/sourceInfo/getById?id=',
      //数据源测试
      DataSourceTestApi: './api/sourceInfo/testConnection',
      //数据源修改
      DataSourceModifyApi: './api/sourceInfo/modify',
      //数据源新增
      DataSourceAddApi: './api/sourceInfo/save',
      //数据源删除
      DataSourceDeleteApi: './api/sourceInfo/removeById?id=',
      //数据源批量删除
      DataSourceRemoveApi: './api/sourceInfo/batchRemove',
      //测试结果
      isConnected: false,
      //保存将要批量删除
      removeForm: {},
      //消息提示
      tooltipConfig: {
        tooltipShow: false,
        tooltipType: '',
        tooltipMessage: ''
      },
      //对话框
      dialogConfig: {
        showDialog: false,
        dialogMessage: '',
        operationType: '',
        type: ''
      },

      //数据源信息弹窗基本配置
      dataWindowConfig: {
        type: '',
        readonly: false,
        show: false,
        title: '',
        height: '500px',
        width: '700px',
        form: {
          id: '', //
          databaseType: '1', //必填
          ip: '',
          port: '',
          databaseName: '',
          sourceName: '',
          password: '',
          createDate: '',
          updateDate: '',
          creatorId: '',
          updaterId: ''
        },
        method: {}
      },
      //表格基本配置
      gridConfigs: {
        maskByParent: false,
        searchFields: {
          sourceName: ''
        },
        operationColumnWidth: '200px',
        operations: [
          {
            title: '编辑',
            icon: '&#xe90a',
            func: this.modifyDataSource
          },
          {
            title: '查看',
            icon: '&#xe9ce',
            func: this.viewDataSource
          },
          {
            title: '删除',
            icon: '&#xe9ac;',
            func: this.removeDataSource
          }
        ],
        operationType: '',
        operationItem: {
          id: ''
        },
        getSelectedNames: [],
        getSelectedIds: [],
        fields: [
          {
            title: '数据源名称',
            field: 'sourceName',
            style: {
              float: 'left',
              width: '11%',
              textAlign: 'center'
            }
          },
          {
            title: '数据库类型',
            field: 'databaseType',
            style: {
              width: '10%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '数据库名称',
            field: 'databaseName',
            style: {
              float: 'left',
              width: '8%',
              textAlign: 'center'
            }
          },
          {
            title: 'IP',
            field: 'ip',
            style: {
              float: 'left',
              width: '9%',
              textAlign: 'center'
            }
          },
          {
            title: '端口',
            field: 'port',
            style: {
              float: 'left',
              width: '8%',
              textAlign: 'center'
            }
          },
          {
            title: '账号',
            field: 'userName',
            isSortField: true,
            orderBy: 'userName',
            style: {
              float: 'left',
              width: '8%',
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
              width: '14%',
              textAlign: 'center'
            }
          },
          {
            title: '创建人',
            field: 'user.chinaname',
            style: {
              textAlign: 'center'
            }
          }
        ],
        currPageNum: 1,
        totalPageNum: 1,
        pageSize: 10,
        api: './api/sourceInfo/getPage',
        searchedCallback (rows) {
          for (var i in rows) {
            var row = rows[i];

            if (row.databaseType === '1') {
              row.databaseType = 'Oracle';
            }
          }
        }
      }
    };
  },
  methods: {
    // 条件查询
    search () {
      //条件查询时必须将当前页重置为1
      this.$refs.grid.resetCurrentPageNum();
      this.$refs.grid.search();
    },

    // 重置查询条件
    reset () {
      this.gridConfigs.searchFields.sourceName = '';
      this.search();
    },

    // 显示消息提示
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

    // 关闭对话框
    closeDialog () {
      this.dialogConfig.showDialog = false;
    },

    //退出对话框
    dialogCancel () {
      this.closeDialog();
    },

    //打开查看数据源信息弹窗
    viewDataSource (item) {
      this.dataWindowConfig.type = 'view';
      this.gridConfigs.operationItem.id = item.id;
      this.dataWindowConfig.title = '数据源信息查看（只读）-' + item.sourceName;
      this.dataWindowConfig.show = true;
    },

    //打开编辑数据源信息弹窗
    modifyDataSource (item) {
      this.dataWindowConfig.type = 'modify';
      this.gridConfigs.operationItem.id = item.id;
      this.dataWindowConfig.title = '数据源信息修改-' + item.sourceName;
      this.dataWindowConfig.show = true;
    },

    //打开新增数据源信息弹窗
    addDataSource () {
      this.dataWindowConfig.show = true;
      this.dataWindowConfig.form = {};
      this.dataWindowConfig.type = 'add';
      this.dataWindowConfig.title = '新增数据源';
      this.dataWindowConfig.readonly = false;
    },

    //测试链接
    testConnect () {
      if (!this.validateForm()) {
        return;
      }

      let testForm = {
        id: this.dataWindowConfig.form.id,
        databaseType: this.dataWindowConfig.form.databaseType,
        databaseName: this.dataWindowConfig.form.databaseName,
        sourceName: this.dataWindowConfig.form.sourceName,
        ip: this.dataWindowConfig.form.ip,
        port: this.dataWindowConfig.form.port,
        userName: this.dataWindowConfig.form.userName,
        password: this.dataWindowConfig.form.password
      };
      this.$http.post(this.DataSourceTestApi, testForm).then(
        res => {
          if (res.body.status == 'success') {
            this.showTooltip('success', '连接成功');
            this.isConnected = true;
          } else {
            this.showTooltip('failed', '连接失败');
            this.isConnected = false;
          }
        },
        res => {
          this.showTooltip('failed', res.body.message);
        }
      );
    },

    //关闭或退出数据源信息弹窗
    cancel () {
      this.dataWindowConfig.form = {};
      this.dataWindowConfig.show = false;
    },

    //删除当前组别
    removeDataSource (item) {
      let msg = '确认删除当前名称为：' + item.sourceName + '的数据源吗？';
      this.showDialog('alert', msg, 'removeDataSourceAn');
      this.gridConfigs.operationItem.id = item.id;
    },

    //批量删除组别
    batchRemoveDataSource () {
      this.gridConfigs.getSelectedNames = [];
      this.removeForm.Id = [];
      let selectItems = this.$refs.grid.getSelectedItems();
      if (0 == selectItems.length) {
        this.showTooltip('failed', '请先选择数据源');
      } else {
        for (var i in selectItems) {
          this.removeForm.Id.push(selectItems[i].id);
          this.gridConfigs.getSelectedNames.push(selectItems[i].sourceName);
        }
        this.showDialog(
          'alert',
          '确认要批量删除名称为：' + this.gridConfigs.getSelectedNames.join('、') + ' 的数据源吗?',
          'batchRemoveDataSource'
        );
      }
    },

    // 对话框确认
    dialogConfirm () {
      this.closeDialog();
      if ('removeDataSourceAn' == this.dialogConfig.operationType) {
        this.$http.get(this.DataSourceDeleteApi + this.gridConfigs.operationItem.id).then(
          res => {
            if (res.body.status == 'success') {
              this.showTooltip('success', '删除成功');
              this.search();
            } else {
              this.showTooltip('failed', '删除失败');
            }
          },
          res => {
            this.showTooltip('failed', res.body.message);
          }
        );
      } else if ('batchRemoveDataSource' == this.dialogConfig.operationType) {
        this.$http.post(this.DataSourceRemoveApi, this.removeForm.Id).then(
          res => {
            if (res.body.status == 'success') {
              this.showTooltip('success', '批量删除成功');
              this.search();
            } else {
              this.showTooltip('failed', '批量删除失败');
            }
          },
          res => {
            this.showTooltip('failed', res.body.message);
          }
        );
      }
    },

    // 表单验证
    validateForm () {
      if ('' == this.dataWindowConfig.form.sourceName) {
        this.showTooltip('failed', '请填写数据源名称');
        return false;
      }

      if ('' == this.dataWindowConfig.form.databaseType) {
        this.showTooltip('failed', '请选择数据库类型');
        return false;
      }

      if ('' == this.dataWindowConfig.form.ip) {
        this.showTooltip('failed', '请填写IP地址');
        return false;
      }

      if ('' == this.dataWindowConfig.form.port) {
        this.showTooltip('failed', '请填写端口');
        return false;
      }

      if ('' == this.dataWindowConfig.form.databaseName) {
        this.showTooltip('failed', '请填写数据库名称');
        return false;
      }

      if ('' == this.dataWindowConfig.form.userName) {
        this.showTooltip('failed', '请填写账号');
        return false;
      }

      if ('' == this.dataWindowConfig.form.password) {
        this.showTooltip('failed', '请填写密码');
        return false;
      }

      return true;
    },

    // 提交表单
    submit () {
      if (!this.isConnected) {
        this.showTooltip('failed', '尚未通过连接测试');
        return;
      }
      let message;
      let url;
      if ('add' == this.dataWindowConfig.type) {
        url = this.DataSourceAddApi;
        message = '新增';
      } else if ('modify' == this.dataWindowConfig.type) {
        url = this.DataSourceModifyApi;
        message = '修改';
      }
      this.$http.post(url, this.dataWindowConfig.form).then(
        res => {
          if ('success' == res.body.status) {
            this.showTooltip('success', message + '成功');
            this.search();
            this.dataWindowConfig.show = false;
          } else {
            this.showTooltip('failed', res.body.message);
          }
        },
        res => {
          this.showTooltip('failed', message + '失败');
        }
      );
    },

    // 通过id查询
    getById (id) {
      this.$http.get(this.DataSourceInfoApi + id).then(
        res => {
          let item = res.body.content;
          this.dataWindowConfig.form = {
            id: item.id,
            databaseType: item.databaseType,
            ip: '' + item.ip,
            port: '' + item.port,
            databaseName: item.databaseName,
            sourceName: item.sourceName,
            userName: item.userName,
            password: item.password,
            createDate: item.createDate,
            updateDate: item.updateDate,
            creatorId: item.creatorId,
            updaterId: item.updaterId
          };
        },
        res => {
          showTooltip('failed', res.body.message);
        }
      );
    }
  },
  watch: {
    'dataWindowConfig.show': function (val) {
      //为true表示显示当前Window
      if (val) {
        this.isConnected = false;
        //新增
        if (this.dataWindowConfig.type == 'add') {
          this.dataWindowConfig.readonly = false;
          this.dataWindowConfig.form = {
            databaseType: '1',
            ip: '',
            port: '',
            databaseName: '',
            sourceName: '',
            userName: '',
            password: ''
          };
        } else if (this.dataWindowConfig.type == 'modify') {
          //修改
          this.dataWindowConfig.readonly = false;
          this.getById(this.gridConfigs.operationItem.id);
        } else if (this.dataWindowConfig.type == 'view') {
          //查看
          this.dataWindowConfig.readonly = true;
          this.getById(this.gridConfigs.operationItem.id);
        }
      } else {
        //通过向父组件传递事件的方式修改visible属性所对应的变量的值
        this.$emit('update:visible', val);
      }
    },
    'dataWindowConfig.form': {
      handler: function () {
        this.isConnected = false;
      },
      deep: true
    }
  }
};
</script>

<style scoped>
</style>

