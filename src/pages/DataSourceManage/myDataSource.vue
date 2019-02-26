<template>
  <Panel>
    <div slot="searchBar">
      <span>数据储存类型:</span>
      <Iselect v-model="gridConfigs.searchFields.dataType"
               :config="typeConfig"
               @change="search">></Iselect>

      <span style="margin-left:10px;">数据源类型:</span>
      <Iselect v-model="gridConfigs.searchFields.sourceType"
               :config="sourceTypeConfig"
               ref="sourceType1"
               @change="search"></Iselect>

      <div style="display:inline-block;vertical-align: top;">
        <span style="margin-left:10px;">数据源名称:</span>
        <Iinput placeholder="请输入数据源名称"
                v-model="gridConfigs.searchFields.name"
                width="160px"
                height="30px"></Iinput>
        <i-button type="primary"
                  plain
                  @click="search">查询</i-button>
        <i-button type="primary"
                  plain
                  @click="reset">重置</i-button>
      </div>

    </div>
    <div slot="actionBar">
      <i-button type="success"
                @click="addSingleItem">新增</i-button>
      <i-button type="danger"
                @click="batchRemoveData">批量删除</i-button>
    </div>
    <div>
      <grid :config="gridConfigs"
            ref="grid"></grid>
    </div>

    <!-- 确认操作的提示框 -->
    <my-dialog v-if="showDialog"
               :message="dialogMessage"
               @dialogCancel="dialogCancel"
               @dialogConfirm="dialogConfirm"></my-dialog>
    <!--　用于显示信息的提示工具　-->
    <my-tooltip :show="showTooltip"
                :showType="tooltipType"
                :message="tooltipMessage"
                @tooltipClosed="tooltipClosed"></my-tooltip>

    <!--新增数据源的对话框-->
    <myWindow v-if="myDataSourceWindowConfig.show"
              :config="myDataSourceWindowConfig">
      <IForm>
        <div class="base-info">
          <h3 style="font-weight:900;color:#333;text-align:center;">基本信息</h3>
          <IFormItem required
                     label="数据存储类型"
                     labelWidth="130px"
                     :tip="rules.dataType"
                     style="width:48%;display:inline-block;">
            <Iselect v-model="myDataSourceWindowConfig.form.dataType"
                     :config="typeConfig2"
                     :readonly="myDataSourceWindowConfig.readonly"></Iselect>
          </IFormItem>
          <IFormItem required
                     label="数据源类型"
                     labelWidth="130px"
                     :tip="rules.sourceType"
                     style="width:48%;display:inline-block;">
            <Iselect v-model="myDataSourceWindowConfig.form.sourceType"
                     :config="sourceTypeConfig2"
                     @change="sourceTypeChange"
                     ref="sourceType2"
                     :readonly="myDataSourceWindowConfig.readonly"></Iselect>
          </IFormItem>
          <IFormItem required
                     label="数据源名称"
                     labelWidth="130px"
                     :tip="rules.name"
                     style="width:48%;display:inline-block;">
            <Iinput v-model="myDataSourceWindowConfig.form.name"
                    width="200px"
                    height="30px"
                    :readOnly="myDataSourceWindowConfig.readonly"></Iinput>
          </IFormItem>
          <IFormItem label="数据源编号"
                     labelWidth="130px"
                     style="width:48%;display:inline-block;">
            <Iinput v-model="myDataSourceWindowConfig.form.code"
                    width="200px"
                    height="30px"
                    :readOnly="myDataSourceWindowConfig.readonly"></Iinput>
          </IFormItem>
          <IFormItem label="描述信息"
                     labelWidth="130px"
                     style="line-height: 60px;">
            <!-- <Iinput v-model="myDataSourceWindowConfig.form.description"
                    width="calc(100% - 46px)"
                    height="30px"
                    :readOnly="myDataSourceWindowConfig.readonly"></Iinput>-->
            <i-textarea v-model="myDataSourceWindowConfig.form.description"
                        :readonly="myDataSourceWindowConfig.readonly"
                        style="height: 60px; width: 558px;"></i-textarea>
          </IFormItem>
          <IFormItem label="只读状态"
                     labelWidth="130px"
                     style="width:48%;display:inline-block;position: relative;top: -32px;">
            <checkbox v-model="myDataSourceWindowConfig.form.isReadOnly"
                      :readOnly="myDataSourceWindowConfig.readonly">
              只读
            </checkbox>
          </IFormItem>
          <IFormItem label="启用状态"
                     labelWidth="130px"
                     style="width:48%;display:inline-block;position: relative;top: -32px;">
            <checkbox v-model="myDataSourceWindowConfig.form.isValid"
                      :readOnly="myDataSourceWindowConfig.readonly">启用
            </checkbox>
          </IFormItem>
          <!--<IFormItem label="发布审核" style="width:32%;display:inline-block;">-->
          <!--<checkbox v-model="myDataSourceWindowConfig.form.examine">审核</checkbox>-->
          <!--</IFormItem>-->
          <!--<IFormItem label="备注"
                     labelWidth="130px">
            <textarea id=""
                      style="width:calc(100% - 46px)"
                      v-model="myDataSourceWindowConfig.form.remark"
                      :readonly="myDataSourceWindowConfig.readonly"
                      :class="{'readOnly':myDataSourceWindowConfig.readonly}"></textarea>
          </IFormItem>-->
        </div>

        <div class="config-info"
             v-show="''!==myDataSourceWindowConfig.form.sourceType">
          <h3 style="font-weight:900;color:#333;text-align:center;padding-bottom:10px;">配置信息</h3>
          <fieldset style="padding:6px 0;border:1px dashed #ccc;">
            <legend>{{globalSourceType}}</legend>
            <IFormItem required
                       :tip="rules.ip"
                       label="IP地址"
                       labelWidth="130px"
                       style="width:48%;display:inline-block;">
              <Iinput v-model="myDataSourceWindowConfig.form.option.ip"
                      width="200px"
                      height="30px"
                      :readOnly="myDataSourceWindowConfig.readonly"></Iinput>
            </IFormItem>
            <IFormItem required
                       :tip="rules.port"
                       label="端口号"
                       labelWidth="130px"
                       style="width:48%;display:inline-block;">
              <Iinput v-model="myDataSourceWindowConfig.form.option.port"
                      width="200px"
                      height="30px"
                      :readOnly="myDataSourceWindowConfig.readonly"></Iinput>
            </IFormItem>
            <IFormItem required
                       :tip="rules.serviceName"
                       label="服务名"
                       labelWidth="130px"
                       style="width:48%;display:inline-block;"
                       v-if="['oracle','oraclesde','oracleSpatial'].indexOf(myDataSourceWindowConfig.form.sourceType)>-1">
              <Iinput v-model="myDataSourceWindowConfig.form.option.serviceName"
                      width="200px"
                      height="30px"
                      :readOnly="myDataSourceWindowConfig.readonly"></Iinput>
            </IFormItem>
            <IFormItem required
                       :tip="rules.dbName"
                       label="数据库名称"
                       labelWidth="130px"
                       style="width:48%;display:inline-block;"
                       v-if="['mysql','sqlserver','postgresql','postgis'].indexOf(myDataSourceWindowConfig.form.sourceType)>-1">
              <Iinput v-model="myDataSourceWindowConfig.form.option.dbName"
                      width="200px"
                      height="30px"
                      :readOnly="myDataSourceWindowConfig.readonly"></Iinput>
            </IFormItem>
            <IFormItem required
                       :tip="rules.username"
                       label="用户名"
                       labelWidth="130px"
                       style="width:48%;display:inline-block;"
                       v-if="['oracleSpatial','oracle','redis','mongodb','ftp','ftps','mysql','sqlserver','postgresql','postgis','oraclesde','hdfs','sftp'].indexOf(myDataSourceWindowConfig.form.sourceType)>-1">
              <Iinput v-model="myDataSourceWindowConfig.form.option.username"
                      width="200px"
                      height="30px"
                      :readOnly="myDataSourceWindowConfig.readonly"></Iinput>
            </IFormItem>

            <IFormItem required
                       :tip="rules.password"
                       label="密码"
                       labelWidth="130px"
                       style="width:48%;display:inline-block;"
                       v-if="['oracle','redis','mongodb','ftp','ftps','mysql','sqlserver','postgresql','postgis','oraclesde','sftp', 'oracleSpatial'].indexOf(myDataSourceWindowConfig.form.sourceType)>-1">
              <Iinput v-model="myDataSourceWindowConfig.form.option.password"
                      width="200px"
                      height="30px"
                      :readOnly="myDataSourceWindowConfig.readonly"></Iinput>
            </IFormItem>
            <IFormItem required
                       :tip="rules.gisDbType"
                       label="空间数据库类型"
                       labelWidth="130px"
                       style="width:48%;display:inline-block;"
                       v-if="['oraclesde'].indexOf(myDataSourceWindowConfig.form.sourceType)>-1">
              <Iselect :config="{width:'200px',height:'30px',options:[{value:'假数据',label:'假数据'}]}"
                       v-model="myDataSourceWindowConfig.form.option.gisDbType"
                       :readOnly="myDataSourceWindowConfig.readonly"></Iselect>
            </IFormItem>
            <IFormItem required
                       :tip="rules.gisDbPort"
                       label="空间数据库端口"
                       labelWidth="130px"
                       style="width:48%;display:inline-block;"
                       v-if="['oraclesde'].indexOf(myDataSourceWindowConfig.form.sourceType)>-1">
              <Iinput v-model="myDataSourceWindowConfig.form.option.gisDbPort"
                      width="200px"
                      height="30px"
                      :readOnly="myDataSourceWindowConfig.readonly"></Iinput>
            </IFormItem>
            <IFormItem required
                       :tip="rules.minConnect"
                       label="最小连接数"
                       labelWidth="130px"
                       style="width:48%;display:inline-block;"
                       v-if="['oraclesde'].indexOf(myDataSourceWindowConfig.form.sourceType)>-1">
              <Iinput v-model="myDataSourceWindowConfig.form.option.minConnect"
                      width="200px"
                      height="30px"
                      :readOnly="myDataSourceWindowConfig.readonly"></Iinput>
            </IFormItem>
            <IFormItem required
                       :tip="rules.maxConnect"
                       label="最大连接数"
                       labelWidth="130px"
                       style="width:48%;display:inline-block;"
                       v-if="['oraclesde'].indexOf(myDataSourceWindowConfig.form.sourceType)>-1">
              <Iinput v-model="myDataSourceWindowConfig.form.option.maxConnect"
                      width="200px"
                      height="30px"
                      :readOnly="myDataSourceWindowConfig.readonly"></Iinput>
            </IFormItem>
            <IFormItem required
                       :tip="rules.sdeVersion"
                       label="SDE版本"
                       labelWidth="130px"
                       style="width:48%;display:inline-block;"
                       v-if="['oraclesde'].indexOf(myDataSourceWindowConfig.form.sourceType)>-1">
              <Iinput v-model="myDataSourceWindowConfig.form.option.sdeVersion"
                      width="200px"
                      height="30px"
                      :readOnly="myDataSourceWindowConfig.readonly"></Iinput>
            </IFormItem>
            <IFormItem required
                       :tip="rules.administrator"
                       label="管理员"
                       labelWidth="130px"
                       style="width:48%;display:inline-block;"
                       v-if="['oraclesde'].indexOf(myDataSourceWindowConfig.form.sourceType)>-1">
              <Iinput v-model="myDataSourceWindowConfig.form.option.administrator"
                      width="200px"
                      height="30px"
                      :readOnly="myDataSourceWindowConfig.readonly"></Iinput>
            </IFormItem>
            <IFormItem required
                       :tip="rules.schema"
                       label="表空间"
                       labelWidth="130px"
                       style="width:48%;display:inline-block;"
                       v-if="['postgresql','postgis'].indexOf(myDataSourceWindowConfig.form.sourceType)>-1">
              <Iinput v-model="myDataSourceWindowConfig.form.option.schema"
                      width="200px"
                      height="30px"
                      :readOnly="myDataSourceWindowConfig.readonly"></Iinput>
            </IFormItem>

          </fieldset>
        </div>
      </IForm>
      <button slot="footLeft"
              class="footLeft"
              @click="checkConnect">测试连接</button>
    </myWindow>
  </Panel>
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
import Tree from '../../components/common/Tree.vue';
import TreeSelect from '../../components/common/TreeSelect.vue';
import checkbox from '../../components/common/Checkbox.vue';
import Iinput from '../../components/common/IInputbox';
import IButton from '../../components/common/IButton';
import ITextarea from "../../components/common/ITextarea";

export default {
  components: {
    ITextarea,
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
    TreeSelect,
    Tree,
    IButton
  },
  watch: {
    'gridConfigs.searchFields.dataType' (val) {
      if (val == 'relational_db') {
        this.sourceTypeConfig.options = this.relationalDbItemOptions;
        console.log(this.relationalDbItemOptions);
      } else if (val == 'nosql_db') {
        this.sourceTypeConfig.options = this.nosqlDbItemOptions;
      } else if (val == 'spatial_db') {
        this.sourceTypeConfig.options = this.spatialDbItemOptions;
      } else if (val == 'file_sys') {
        this.sourceTypeConfig.options = this.fileSysItemOptions;
      } else if (val == '') {
        this.sourceTypeConfig.options = [];
      }
      // this.$refs.sourceType1.text = '请选择';
      this.gridConfigs.searchFields.sourceType = '';
      this.search();
    },
    'myDataSourceWindowConfig.form.dataType' (val) {
      if (val != this.cacheDataSource.dataType) {
        this.myDataSourceWindowConfig.form.option = {};
      }
      if (val == 'relational_db') {
        this.sourceTypeConfig2.options = this.relationalDbItemOptions;
      } else if (val == 'nosql_db') {
        this.sourceTypeConfig2.options = this.nosqlDbItemOptions;
      } else if (val == 'spatial_db') {
        this.sourceTypeConfig2.options = this.spatialDbItemOptions;
      } else if (val == 'file_sys') {
        this.sourceTypeConfig2.options = this.fileSysItemOptions;
      } else if (val == '') {
        this.sourceTypeConfig2.options = [];
      }

      // this.$refs.sourceType2.text = '请选择';
      this.myDataSourceWindowConfig.form.sourceType = '';
    },
    'myDataSourceWindowConfig.form': {
      handler: function (val, oldVal) {
        this.myDataSourceWindowConfig.connectTest = false;
      },
      deep: true
    }
  },
  computed: {
    //新增弹框里的表单验证规则对象rules
    rules () {
      const _this = this;
      return {
        name: { tip: '请输入数据源名称', show: false, isRequired: true },
        dataType: { tip: '请选择数据存储类型', show: false, isRequired: true },
        sourceType: { tip: '请选择数据源类型', show: false, isRequired: true },
        ip: { tip: '请输入ip', show: false, isRequired: true },
        port: { tip: '请输入端口号', show: false, isRequired: true },
        dbName: {
          tip: '请输入数据库名称',
          show: false,
          isRequired:
            ['mysql', 'sqlserver', 'postgresql', 'postgis'].indexOf(
              _this.myDataSourceWindowConfig.form.sourceType
            ) > -1
        },
        serviceName: {
          tip: '请输入服务名称',
          show: false,
          isRequired:
            ['oracle', 'oraclesde', 'oracleSpatial'].indexOf(
              _this.myDataSourceWindowConfig.form.sourceType
            ) > -1
        },
        username: {
          tip: '请输入用户名',
          show: false,
          isRequired:
            [
              'oracle',
              'redis',
              'mongodb',
              'ftp',
              'mysql',
              'sqlserver',
              'postgresql',
              'postgis',
              'oraclesde',
              'hdfs',
              'oracleSpatial'
            ].indexOf(_this.myDataSourceWindowConfig.form.sourceType) > -1
        },
        password: {
          tip: '请输入密码',
          show: false,
          isRequired:
            [
              'oracle',
              'redis',
              'mongodb',
              'ftp',
              'mysql',
              'sqlserver',
              'postgresql',
              'postgis',
              'oraclesde',
              'oracleSpatial'
            ].indexOf(_this.myDataSourceWindowConfig.form.sourceType) > -1
        },
        gisDbType: {
          tip: '请选择空间数据库类型',
          show: false,
          isRequired:
            ['oraclesde'].indexOf(
              _this.myDataSourceWindowConfig.form.sourceType
            ) > -1
        },
        gisDbPort: {
          tip: '请选择空间数据库端口',
          show: false,
          isRequired:
            ['oraclesde'].indexOf(
              _this.myDataSourceWindowConfig.form.sourceType
            ) > -1
        },
        minConnect: {
          tip: '请输入最小连接数',
          show: false,
          isRequired:
            ['oraclesde'].indexOf(
              _this.myDataSourceWindowConfig.form.sourceType
            ) > -1
        },
        maxConnect: {
          tip: '请输入最大连接数',
          show: false,
          isRequired:
            ['oraclesde'].indexOf(
              _this.myDataSourceWindowConfig.form.sourceType
            ) > -1
        },
        sdeVersion: {
          tip: '请输入SDE版本',
          show: false,
          isRequired:
            ['oraclesde'].indexOf(
              _this.myDataSourceWindowConfig.form.sourceType
            ) > -1
        },
        administrator: {
          tip: '请输入数据库管理员',
          show: false,
          isRequired:
            ['oraclesde'].indexOf(
              _this.myDataSourceWindowConfig.form.sourceType
            ) > -1
        },
        schema: {
          tip: '请输入表空间',
          show: false,
          isRequired:
            ['postgresql', 'postgis'].indexOf(
              _this.myDataSourceWindowConfig.form.sourceType
            ) > -1
        }
        // clusterNodes: {tip: '请输入redis集群节点', show: false, isRequired: true},
      };
    }
  },
  data () {
    const _this = this;
    return {
      timer: null,
      operationType: '',
      //数据源类型下拉框配置项
      typeConfig: {
        width: '150px',
        height: '30px',
        options: []
      },
      typeConfig2: {
        width: '200px',
        height: '30px',
        options: []
      },
      sourceTypeConfig: {
        width: '150px',
        height: '30px',
        options: []
      },
      sourceTypeConfig2: {
        width: '200px',
        height: '30px',
        options: []
      },
      globalSourceType: '',
      // 获取表格数据接口
      // getPageApi: "./restful/resQuestion/getPage",
      getPageApi: './api/dataSource/getPage',
      // 数据存储类型接口
      // dataTypeApi: "./restful/sys/dictionary/getListByCode?code=question_type",
      dataTypeApi: './loginapi/sys/dictionary/getListByCode?code=datatype',
      // 数据源类型接口
      // dataSourceTypeApi: "./restful/sys/dictionary/getListByCode?code=question_status",
      nosqlDbItemApi: './loginapi/sys/dictionary/getListByCode?code=nosql_db_item',
      nosqlDbItemOptions: [],
      relationalDbItemApi:
        './loginapi/sys/dictionary/getListByCode?code=relational_db_item',
      relationalDbItemOptions: [],
      spatialDbItemApi:
        './loginapi/sys/dictionary/getListByCode?code=spatial_db_item',
      spatialDbItemOptions: [],
      fileSysItemApi: './loginapi/sys/dictionary/getListByCode?code=file_sys_item',
      fileSysItemOptions: [],
      // 获取用户信息接口
      getUserMessageApi: './restful/sys/getCurrentUser',
      // 获取单个数据源信息接口
      // getSingleDataSourceApi: "./restful/resQuestion/getById?id=",
      getSingleDataSourceApi: './api/dataSource/getById?id=',
      // 增加数据源接口
      // addSingleDataSourceApi: "./restful/resQuestion/save",
      addSingleDataSourceApi: './api/dataSource/save',
      // 修改数据源信息接口
      // modifySingleDataSourceApi: "./restful/resQuestion/modify",
      modifySingleDataSourceApi: './api/dataSource/modify',
      // 删除数据源信息接口
      // removeSingleDataSourceApi: "./restful/resQuestion/removeFromDbById?id=",
      removeSingleDataSourceApi: './api/dataSource/removeFromDbById?id=',
      dataTypeAll: [],
      dataSourceTypeAll: [],
      showDialog: false,
      dialogMessage: '',
      showTooltip: false,
      tooltipType: '',
      tooltipMessage: '',
      iconEditFlag: false,
      iconCloseFlag: false,
      cacheDataSource: {
        //缓存对象
        type: null,
        form: {},
        dataType: null
      },
      gridConfigs: {
        operationColumnWidth: '12%',
        operations: [
          {
            title: '编辑',
            icon: '&#xe90a',
            func: this.modifySingleItem
          },
          {
            title: '查看详情',
            icon: '&#xe9ce',
            func: this.viewSingleItem
          },
          {
            title: '删除',
            icon: '&#xe9ac',
            func: this.removeSingleItem
          },
          {
            title: '浏览数据源',
            icon: '&#xeaee',
            func: function (row) {
              if (row.dataType == '文件系统') {
                _this.$router.push('/FileView?sourceId=' + row.id);
              } else if (row.dataType == '关系型数据库') {
                _this.$router.push(
                  '/DataBaseView?sourceId=' +
                  row.id +
                  '&dataType=' +
                  'relational'
                );
              } else if (row.dataType == '空间数据库') {
                _this.$router.push(
                  '/DataBaseView?sourceId=' + row.id + '&dataType=' + 'spatial'
                );
              }
            }
          }
        ],
        searchFields: {
          dataType: '',
          sourceType: '',
          name: ''
        },
        operationType: '',
        operationItem: {},
        getSelectedNames: [],
        getSelectedIds: [],
        fields: [
          {
            title: '数据源名称',
            field: 'name',
            style: {
              width: '13%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '数据源编号',
            field: 'code',
            style: {
              width: '11%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '存储类型',
            field: 'dataType',
            style: {
              width: '10%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '数据源类型',
            field: 'sourceType',
            isSortField: true,
            sortType: 'desc',
            style: {
              width: '9%',
              float: 'left',
              textAlign: 'center'
            }
          },

          {
            title: '创建日期',
            field: 'createDate',
            isSortField: true,
            style: {
              float: 'left',
              width: '14%',
              textAlign: 'center'
            }
          },
          {
            title: '创建人',
            field: 'creator',
            style: {
              float: 'left',
              width: '10%',
              textAlign: 'center'
            }
          },

          {
            title: '是否启用',
            field: 'isValid',
            style: {
              float: 'right',
              width: '7%',
              textAlign: 'center'
            },
            styleCallback: function (fieldValue) {
              if ('已启用' == fieldValue) {
                return { color: 'green' };
              } else if ('停用' == fieldValue) {
                return { color: 'red' };
              }
            }
          },
          {
            title: '可读',
            field: 'isReadOnly',
            style: {
              width: '5%',
              float: 'right',
              textAlign: 'center'
            },
            styleCallback: function (fieldValue) {
              if ('是' == fieldValue) {
                return { color: 'green' };
              } else if ('否' == fieldValue) {
                return { color: 'red' };
              }
            }
          }
        ],
        currPageNum: 1,
        totalPageNum: 1,
        pageSize: 10,
        api: './api/dataSource/getPage',
        searchedCallback: function (rows) {
          for (var i in rows) {
            var row = rows[i];
            row.isValid =
              row.isValid == 1
                ? '已启用'
                : row.isValid == 0 ? '停用' : '无状态';
            row.isReadOnly = row.isReadOnly == 1 ? '是' : '否';
            switch (row.dataType) {
              case 'relational_db':
                row.dataType = '关系型数据库';
                break;
              case 'file_sys':
                row.dataType = '文件系统';
                break;
              case 'nosql_db':
                row.dataType = 'NoSQL数据库';
                break;
              case 'spatial_db':
                row.dataType = '空间数据库';
                break;
            }
          }
        }
      },
      myDataSourceWindowConfig: {
        type: '', //add modify view 分别表示新增，修改以及查看
        show: false,
        readonly: false,
        parent: this,
        connectTest: false,
        title: '',
        height: '550px',
        width: '800px',
        subForm: {
          ip: '', //IP地址
          port: '', //端口号
          dbName: '', //数据库名称
          serviceName: '', //服务名称
          username: '', //用户名
          password: '', //密码
          gisDbType: '', //空间数据库类型
          gisDbPort: '', //空间数据库端口
          minConnect: '', //最小连接数
          maxConnect: '', //最大连接数
          sdeVersion: '', //sde版本
          administrator: '' //数据库管理员
          // clusterNodes: '',  //redis集群节点
        },
        form: {
          id: '',
          name: '', //数据源名称
          code: '', //数据源编号
          dataType: '', //存储类型
          sourceType: '', //数据源类型
          description: '', //描述信息
          isReadOnly: false, //只读状态
          isValid: false, //禁用状态
          // examine: 0,  //发布审核
          remark: '', //备注
          option: {
            ip: '',
            port: '',
            dbName: '',
            serviceName: '',
            username: '',
            password: '',
            gisDbType: '',
            gisDbPort: '',
            minConnect: '',
            maxConnect: '',
            sdeVersion: '',
            administrator: '',
            schema: ''
          }
        },
        method: {
          close () {
            this.myDataSourceWindowConfig.show = false;
          },
          cancel () {
            this.myDataSourceWindowConfig.show = false;
          },
          confirm () {
            debugger
            const _this = this;
            let num = 0;
            for (var key in this.myDataSourceWindowConfig.form) {
              if (this.myDataSourceWindowConfig.form[key] == '') {
                if (key in this.rules && this.rules[key].isRequired) {
                  this.rules[key].show = true;
                  num++;
                }
              } else {
                if (key in this.rules) {
                  this.rules[key].show = false;
                }
              }
            }
            for (var k in this.myDataSourceWindowConfig.form.option) {
              if (this.myDataSourceWindowConfig.form.option[k] == '') {
                if (k in this.rules && this.rules[k].isRequired) {
                  this.rules[k].show = true;
                  num++;
                }
              } else {
                if (k in this.rules) {
                  this.rules[k].show = false;
                }
              }
            }
            if (num == 0) {
              let option = this.myDataSourceWindowConfig.form.option;
              let { ...params } = this.myDataSourceWindowConfig.form;
              params.isReadOnly = _this.toParamStr(
                _this.myDataSourceWindowConfig.form.isReadOnly
              );
              params.isValid = _this.toParamStr(
                _this.myDataSourceWindowConfig.form.isValid
              );
              delete params.option;
              params.option = JSON.stringify(option);
              if (!this.myDataSourceWindowConfig.connectTest) {
                this.tooltipType = 'failed';
                this.tooltipMessage = '请先通过测试连接';
                this.showTooltip = true;
                return false;
              }


              if (this.myDataSourceWindowConfig.type === 'add') {

                this.$http.post(this.addSingleDataSourceApi, params).then(
                  res => {
                    if (res.body.status == 'success') {
                      this.search();
                      this.tooltipType = 'success';
                      this.tooltipMessage = '添加成功!';
                      this.showTooltip = true;
                    } else {
                      this.tooltipType = 'failed';
                      this.tooltipMessage = res.body.message;
                      this.showTooltip = true;
                    }
                  },
                  res => {
                    this.tooltipType = 'failed';
                    this.tooltipMessage = res.body.message;
                    this.showTooltip = true;
                  }
                );
              } else if (this.myDataSourceWindowConfig.type === 'modify') {
                this.$http.post(this.modifySingleDataSourceApi, params).then(
                  res => {
                    this.myDataSourceWindowConfig.show = false;
                    //新增完按创建时间降序排序，方便查看最新增加的信息
                    if (res.body.status == 'success') {
                      for (var idx in this.gridConfigs.fields) {
                        var field = this.gridConfigs.fields[idx];
                      }
                      this.search();
                      this.tooltipType = 'success';
                      this.tooltipMessage = '修改成功!';
                      this.showTooltip = true;
                    } else {
                      this.tooltipType = 'failed';
                      this.tooltipMessage = res.body.message;
                      this.showTooltip = true;
                    }
                  },
                  res => {
                    this.tooltipType = 'failed';
                    this.tooltipMessage = '修改失败!';
                    this.showTooltip = true;
                  }
                );
              }
              this.myDataSourceWindowConfig.show = false;
            }
          }
        }
      }
    };
  },
  methods: {
    getTip (msg, type) {
      this.showTooltip = true;
      this.tooltipMessage = msg;
      this.tooltipType = type;
    },
    checkConnect () {
      let option = this.myDataSourceWindowConfig.form.option;
      let { ...params } = this.myDataSourceWindowConfig.form;
      params.isReadOnly = this.toParamStr(
        this.myDataSourceWindowConfig.form.isReadOnly
      );
      params.isValid = this.toParamStr(
        this.myDataSourceWindowConfig.form.isValid
      );
      delete params.option;
      params.option = JSON.stringify(option);
      this.$http.post('./api/datasource/view/checkConnect', params).then(
        res => {
          res = res.body;
          if (res.status == 'success') {
            this.getTip('连接成功', 'success');
            this.myDataSourceWindowConfig.connectTest = true;
          } else {
            this.getTip(res.message, 'failed');
          }
        },
        err => {
          err = err.body;
          this.getTip(err.resultBean.message, 'failed');
        }
      );
    },
    sourceTypeChange (val, label) {
      if (val === this.cacheDataSource.type) {
        this.myDataSourceWindowConfig.form.option = this.cacheDataSource.form.option;
      } else {
        //弹框内切换数据源类型的时候，将配置信息表单置空
        this.myDataSourceWindowConfig.form.option = {
          ip: '', //IP地址
          port: '', //端口号
          dbName: '', //数据库名称
          serviceName: '', //服务名称
          username: '', //用户名
          password: '', //密码
          gisDbType: '', //空间数据库类型
          gisDbPort: '', //空间数据库端口
          minConnect: '', //最小连接数
          maxConnect: '', //最大连接数
          sdeVersion: '', //sde版本
          administrator: '', //数据库管理员
          // clusterNodes: '',  //redis集群节点
          schema: ''
        };
      }
      if (label != '请选择') {
        this.globalSourceType = label;
      } else {
        this.globalSourceType = '';
      }
    },
    search () {
      //条件查询时必须将当前页重置为1
      this.$refs.grid.resetCurrentPageNum();
      this.$refs.grid.search();
    },
    reset () {
      this.gridConfigs.searchFields.dataType = '';
      this.gridConfigs.searchFields.sourceType = '';
      this.gridConfigs.searchFields.name = '';
      this.search();
    },
    dialogCancel () {
      //对值进行重置,不然不会触发change事件
      this.showDialog = false;
    },
    tooltipClosed () {
      this.showTooltip = false;
    },
    addSingleItem () {
      //新增时清空数据
      this.globalSourceType = '';
      this.myDataSourceWindowConfig.form = {
        id: '',
        name: '', //数据源名称
        code: '', //数据源编号
        dataType: '', //存储类型
        sourceType: '', //数据源类型
        description: '', //描述信息
        isReadOnly: false, //只读状态
        isValid: false, //禁用状态
        // examine: 0,  //发布审核
        remark: '', //备注
        option: {
          ip: '',
          port: '',
          dbName: '',
          serviceName: '',
          username: '',
          password: '',
          gisDbType: '',
          gisDbPort: '',
          minConnect: '',
          maxConnect: '',
          sdeVersion: '',
          administrator: '',
          schema: ''
        }
      };

      this.myDataSourceWindowConfig.show = true;
      this.myDataSourceWindowConfig.title = '新增数据源';
      this.myDataSourceWindowConfig.readonly = false;
      this.myDataSourceWindowConfig.type = 'add';
    },
    modifySingleItem (item) {
      this.myDataSourceWindowConfig.show = true;
      this.myDataSourceWindowConfig.title = '编辑数据源信息';
      this.myDataSourceWindowConfig.type = 'modify';
      this.myDataSourceWindowConfig.readonly = false;
      this.myDataSourceWindowConfig.parentClgReadonly = true;

      this.$http.get(this.getSingleDataSourceApi + item.id).then(res => {
        var clgInfo = res.body.content;
        var option = JSON.parse(clgInfo.option);
        this.myDataSourceWindowConfig.form = {
          id: clgInfo.id,
          name: clgInfo.name,
          code: clgInfo.code,
          dataType: clgInfo.dataType,
          sourceType: clgInfo.sourceType,
          description: clgInfo.description,
          isReadOnly: Boolean(clgInfo.isReadOnly),
          isValid: this.toBool(clgInfo.isValid),
          remark: clgInfo.remark,
          option: {
            ip: option.ip,
            port: option.port,
            dbName: option.dbName,
            serviceName: option.serviceName,
            username: option.username,
            password: option.password,
            gisDbType: option.gisDbType,
            gisDbPort: option.gisDbPort,
            minConnect: option.minConnect,
            maxConnect: option.maxConnect,
            sdeVersion: option.sdeVersion,
            administrator: option.administrator,
            schema: option.schema
          }
        };
        this.globalSourceType = clgInfo.sourceType;
        //深复制
        this.cacheDataSource.form = Object.assign(
          {},
          this.myDataSourceWindowConfig.form
        );
        this.cacheDataSource.type = this.myDataSourceWindowConfig.form.sourceType;
        this.cacheDataSource.dataType = this.myDataSourceWindowConfig.form.dataType;
        const _this = this;
        clearTimeout(_this.timer);
        this.timer = null;
        this.timer = setTimeout(() => {
          _this.myDataSourceWindowConfig.form.sourceType = clgInfo.sourceType;
        }, 20);
      });
    },
    removeSingleItem (item) {
      this.dialogMessage = '确认需要移除' + item.description + '这个数据源吗?';
      this.operationType = 'removeSingleItem';
      this.operationItem = item;
      this.showDialog = true;
    },
    batchRemoveData () {
      this.gridConfigs.getSelectedNames = [];
      this.gridConfigs.getSelectedIds = [];
      var selectItems = this.$refs.grid.getSelectedItems();
      if (selectItems.length == 0) {
        this.tooltipType = 'failed';
        this.tooltipMessage = '请先选择数据!';
        this.showTooltip = true;
      } else {
        for (var i in selectItems) {
          this.gridConfigs.getSelectedIds.push(selectItems[i].id);
          this.gridConfigs.getSelectedNames.push(selectItems[i].name);
        }
        this.dialogMessage =
          '确认要批量删除：' + this.gridConfigs.getSelectedNames + ' 的数据吗?';
        this.operationType = 'removeBatch';
        this.showDialog = true;
      }
    },
    viewSingleItem (item) {
      this.myDataSourceWindowConfig.title = '预览数据源';
      this.myDataSourceWindowConfig.type = 'view';
      this.myDataSourceWindowConfig.readonly = true;
      this.myDataSourceWindowConfig.parentClgReadonly = true;
      this.myDataSourceWindowConfig.show = true;
      this.$http.get(this.getSingleDataSourceApi + item.id).then(res => {
        var clgInfo = res.body.content;
        var option = JSON.parse(clgInfo.option);
        this.myDataSourceWindowConfig.form = {
          id: clgInfo.id,
          name: clgInfo.name,
          code: clgInfo.code,
          dataType: clgInfo.dataType,
          sourceType: clgInfo.sourceType,
          description: clgInfo.description,
          isReadOnly: this.toBool(clgInfo.isReadOnly),
          isValid: this.toBool(clgInfo.isValid),
          remark: clgInfo.remark,
          option: {
            ip: option.ip,
            port: option.port,
            dbName: option.dbName,
            serviceName: option.serviceName,
            username: option.username,
            password: option.password,
            gisDbType: option.gisDbType,
            gisDbPort: option.gisDbPort,
            minConnect: option.minConnect,
            maxConnect: option.maxConnect,
            sdeVersion: option.sdeVersion,
            administrator: option.administrator,
            schema: option.schema
          }
        };
        this.globalSourceType = clgInfo.sourceType;
        this.cacheDataSource.dataType = this.myDataSourceWindowConfig.form.dataType;
        const _this = this;
        clearTimeout(_this.timer);
        this.timer = null;
        this.timer = setTimeout(() => {
          _this.myDataSourceWindowConfig.form.sourceType = clgInfo.sourceType;
        }, 20);
      });
    },
    dialogConfirm () {
      this.showDialog = false;
      if (this.operationType == 'removeSingleItem') {
        this.$http
          .get(this.removeSingleDataSourceApi + this.operationItem.id)
          .then(
            res => {
              this.tooltipType = 'success';
              this.tooltipMessage = '删除成功!';
              this.showTooltip = true;
              this.search();
            },
            res => {
              this.tooltipType = 'failed';
              this.tooltipMessage = '删除失败!';
              this.showTooltip = true;
            }
          );
      } else if (this.operationType == 'removeBatch') {
        this.$http
          .post(
            './api/dataSource/batchRemoveFromDb',
            this.gridConfigs.getSelectedIds
          )
          .then(
            res => {
              this.tooltipType = 'success';
              this.tooltipMessage = '批量删除成功!';
              this.showTooltip = true;
              this.search();
              this.gridConfigs.getSelectedIds = [];
            },
            res => {
              this.tooltipType = 'failed';
              this.tooltipMessage = '批量删除失败!';
              this.showTooltip = true;
              this.gridConfigs.getSelectedIds = [];
            }
          );
      }
    }
  },
  created () {
    // 数据存储类型接口
    this.$http.get(this.dataTypeApi).then(res => {
      let arr = res.body.content;
      arr.forEach(item => {
        item.value = item.dictCode;
        item.label = item.name;
      });
      this.typeConfig.options = arr;
      this.typeConfig2.options = arr;
      // arr.unshift({value: '', label: '全部'})
      this.dataTypeAll = res.body.content;
    });
    // 数据源类型接口
    this.$http.get(this.nosqlDbItemApi).then(res => {
      let arr = res.body.content;
      arr.forEach(item => {
        item.value = item.dictCode;
        item.label = item.name;
      });
      // arr.unshift({value: '', label: '全部'})
      this.nosqlDbItemOptions = arr;
    });
    this.$http.get(this.relationalDbItemApi).then(res => {
      let arr = res.body.content;
      arr.forEach(item => {
        item.value = item.dictCode;
        item.label = item.name;
      });
      // arr.unshift({value: '', label: '全部'})
      this.relationalDbItemOptions = arr;
    });
    this.$http.get(this.spatialDbItemApi).then(res => {
      let arr = res.body.content;
      arr.forEach(item => {
        item.value = item.dictCode;
        item.label = item.name;
      });
      // arr.unshift({value: '', label: '全部'})
      this.spatialDbItemOptions = arr;
    });
    this.$http.get(this.fileSysItemApi).then(res => {
      let arr = res.body.content;
      arr.forEach(item => {
        item.value = item.dictCode;
        item.label = item.name;
      });
      // arr.unshift({value: '', label: '全部'})
      this.fileSysItemOptions = arr;
    });

    // this.$http.get(this.dataSourceTypeApi).then(
    //   (res) => {
    //     this.dataSourceTypeAll = res.body.content;
    //   });
  },
  beforeDestroy () {
    const _this = this;
    clearTimeout(_this.timer);
    this.timer = null;
  }
};
</script>

<style lang="less" scoped>
.footLeft {
  height: 27px;
  padding: 0 12px;
  /*background: #13ce66;*/
  background: #20a0ff;
  color: #fff;
  border-radius: 4px;
  margin-left: 12px;
  letter-spacing: 2px;
}

.footLeft:hover {
  background: #87ce66;
}

.config-info {
  padding-bottom: 18px;
  margin-top: -25px;
  fieldset {
    border-color: #fefefe;
    border-radius: 4px;
    legend {
      color: #48576a;
      margin-left: 35px;
      font-weight: bold;
    }
  }
}
.i-form-item {
  padding-top: 16px;
}
</style>
