<template>
  <Panel>
    <div slot="searchBar">
      <span>数据索引名称:</span>
      <input type="text" placeholder="请输入数据名称" v-model="gridConfigs.searchFields.name" />
      <button type="button" @click="search">查询</button>
      <button type="button" @click="reset">重置</button>
    </div>
    <div slot="actionBar">
      <button @click="batchRemoveDataIndex">批量删除</button>
    </div>
    <div>
      <grid :config="gridConfigs" ref="grid"></grid>
    </div>

    <!-- 确认操作的提示框 -->
    <my-dialog v-if="showDialog" :message="dialogMessage" @dialogCancel="dialogCancel" @dialogConfirm="dialogConfirm"></my-dialog>
    <!--　用于显示信息的提示工具　-->
    <my-tooltip :show="showTooltip" :showType="tooltipType" :message="tooltipMessage" @tooltipClosed="tooltipClosed"></my-tooltip>

    <!--索引编辑的对话框-->
    <myWindow v-if="dataIndexWindowConfig.show" :config="dataIndexWindowConfig">

      <ITitle>构建索引</ITitle>
      <i-item>
        <WrapBox title='选择搜索字段' themeNum='0' style="width:100%">
          <span class='check' :title="item" v-for="(item,index) in dataIndexWindowConfig.dataIndexForm.stringFileds">
            <label>
              <Checkbox v-model="dataIndexWindowConfig.selectBox1[index]" :readOnly="dataIndexWindowConfig.radioConfig.radioEnable">{{item}}</Checkbox>
            </label>
          </span>
          <span v-show='dataIndexWindowConfig.dataIndexForm.stringFileds.length == 0' class='nodata'>暂无数据</span>
        </WrapBox>
        <wait-mask :isShow="showMask" :maskByParent="true"></wait-mask>
      </i-item>
      <i-item>
        <WrapBox title='选择权重字段' themeNum='0' style="width:100%">
          <span class='check' :title="item" v-for="(item,index) in dataIndexWindowConfig.dataIndexForm.numFields">
            <label>
              <!--<IRadio v-model="dataIndexWindowConfig.selectBox2[index]">{{item}}</IRadio></label>-->
              <IRadio v-model="dataIndexWindowConfig.form.orderFields" :disabled="dataIndexWindowConfig.radioConfig.radioEnable" :label="item">{{item}}</IRadio>
            </label>
          </span>
          <span v-show='dataIndexWindowConfig.dataIndexForm.numFields.length ==  0' class='nodata'>暂无数据</span>
        </WrapBox>
      </i-item>
      <i-item>
        <label for="">几何类型：</label>
        <i-radio v-model="dataIndexWindowConfig.dataIndexForm.geoType" :disabled="dataIndexWindowConfig.radioConfig.radioEnable" name="geometryType" label="point">点
        </i-radio>
        <i-radio v-model="dataIndexWindowConfig.dataIndexForm.geoType" :disabled="dataIndexWindowConfig.radioConfig.radioEnable" name="geometryType" label="polyline">线
        </i-radio>
        <i-radio v-model="dataIndexWindowConfig.dataIndexForm.geoType" :disabled="dataIndexWindowConfig.radioConfig.radioEnable" name="geometryType" label="polygon">面
        </i-radio>
      </i-item>
      <i-item>
        <!-- <i-select v-model="dataIndexWindowConfig.selectConfig.type">
                </i-select> -->
        <label for="">优先级：
          <i-select style='display:inline-block' v-model="dataIndexWindowConfig.selectConfig.select" :config="dataIndexWindowConfig.selectConfig" :readonly="dataIndexWindowConfig.radioConfig.radioEnable"></i-select>
        </label>

      </i-item>
    </myWindow>

    <!--元数据设置的对话框-->
    <myWindow v-if="dataMetaWindowConfig.show" :config="dataMetaWindowConfig">
      <ITitle>元数据设置</ITitle>
      <table class="table" v-if="dataMetaWindowConfig.metaForm.length>0">
        <thead>
          <tr>
            <th scope="col" style="width: 33%;" v-for="i in dataMetaWindowConfig.tableConfig.title">{{i}}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dataMetaWindowConfig.metaForm">
            <td>{{item.fieldName}}</td>
            <td>
              <i-inputbox v-model="item.fieldAlias" />
            </td>
            <td>
              <i-switch v-model="item.canDisplay" />
            </td>
          </tr>
        </tbody>
      </table>
      <NoThings v-else class="pic-nodata"></NoThings>
    </myWindow>
  </Panel>
</template>

<script>
import WaitMask from '../../components/common/WaitMask.vue';
import grid from '../../components/common/grid.vue';
import Panel from '../../components/Panel.vue';
import MyDialog from '../../components/common/Dialog.vue';
import MyTooltip from '../../components/common/OperationStatusTooltip.vue';
import MyWindow from '../../components/common/Window.vue';
import Tree from '../../components/common/Tree.vue';
import TreeSelect from '../../components/common/TreeSelect.vue';
import Checkbox from '../../components/common/Checkbox.vue';
import IRadio from '../../components/common/IRadio.vue';
import Tabs from '../../components/common/Tabs.vue';
import TabPane from '../../components/common/TabPane.vue';
import IForm from '../../components/common/IForm';
import IFormItem from '../../components/common/IFormItem';
import IInputbox from '../../components/common/IInputbox';
import ITextarea from '../../components/common/ITextarea';
import WrapBox from '../../components/layout/WrapBox';
import IItem from '../../components/layout/IItem';
import ITitle from '../../components/layout/ITitle';
import ITable from '../../components/layout/ITable';
import ISlider from '../../components/common/ISlider';
import ISwitch from '../../components/common/ISwitch';
import ISelect from '../../components/common/ISelect';
import NoThings from '../../components/layout/NoThings';

export default {
  props: {},
  data() {
    return {
      showMask: false,
      // 获取用户信息接口
      getUserMessageApi: './api/sys/getCurrentUser',
      // 获取单个数据索引信息接口
      getSingleDataIndexApi: './api/dataIndex/getIndexFieldList?id=',
      // 保存数据索引接口
      saveDataIndexApi: './api/dataIndex/save',
      // 构建数据索引接口
      buildDataIndexApi: './api/dataIndex/buildIndex/',
      // 修改数据索引信息接口
      modifyDataIndexApi: './api/dataIndex/modify',
      // 删除元数据源信息接口
      removeDataIndexApi: './api/dataIndex/removeFromDbById?id=',
      // 批量删除元数据信息接口
      removeDataIndexBatchApi: './api/dataIndex/deleteIndex',
      // 获取元数据索引设置信息接口
      getDateMetaApi: './api/dataIndexFieldMetadata/getByWhere',
      // 修改元数据索引设置信息接口
      modifyDateMetaApi: './api/dataIndexFieldMetadata/batchUpdate',
      // 判断是否可以创建索引信息接口
      judgeDateIndexApi: './api/dataIndex/checkFile?dataId=',

      dataTypeAll: [],
      dataSourceTypeAll: [],
      tabConfig: {
        activeTab: 0,
        style: {
          width: '100%',
          height: 'auto'
        }
      },
      showDialog: false,
      dialogMessage: '',
      showTooltip: false,
      tooltipType: '',
      tooltipMessage: '',
      iconEditFlag: false,
      iconCloseFlag: false,
      gridConfigs: {
        operationColumnWidth: '12%',
        operations: [
          {
            title: '创建索引',
            icon: '&#xe921',
            func: this.addDataIndex,
            condition(item) {
              if (item.dataIndex === null) {
                return true;
              } else {
                return false;
              }
            }
          },
          {
            title: '重建索引',
            icon: '&#xe909',
            func: this.modifyDataIndex,
            condition(item) {
              if (item.dataIndex !== null) {
                return true;
              } else {
                return false;
              }
            }
          },
          {
            title: '预览索引',
            icon: '&#xe9ce',
            func: this.viewDataIndex,
            condition(item) {
              if (item.dataIndex !== null) {
                return true;
              } else {
                return false;
              }
            }
          },
          {
            title: '删除索引',
            icon: '&#xe9ac',
            func: this.removeDataIndex,
            condition(item) {
              if (item.dataIndex !== null) {
                return true;
              } else {
                return false;
              }
            }
          },
          {
            title: '元数据',
            icon: '&#xebdf',
            func: this.setDataMeta,
            condition(item) {
              if (item.dataIndex !== null) {
                return true;
              } else {
                return false;
              }
            }
          }
        ],
        searchFields: {
          name: ''
        },
        operationType: '',
        operationItem: {},
        getSelectedNames: [],
        getSelectedIds: [],
        fields: [
          {
            title: '数据名称',
            field: 'name',
            isSortField: true,
            sortType: 'asc',
            style: {
              width: '19%',
              float: 'left',
              textAlign: 'left',
              paddingLeft: '2%'
            }
          },
          {
            title: '创建人',
            field: 'creator',
            style: {
              width: '11%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '创建时间',
            field: 'createDate',
            isSortField: true,
            sortType: 'asc',
            style: {
              width: '14%',
              float: 'left',
              textAlign: 'center'
            }
          },
          // {
          //   title: '修改时间',
          //   field: 'updateDate',
          //   isSortField: true,
          //   sortType: 'asc',
          //   style: {
          //     width: '10%',
          //     float: 'left',
          //     textAlign: 'center'
          //   }
          // },
          // {
          //   title: '修改人',
          //   field: 'updater',
          //   style: {
          //     width: '10%',
          //     float: 'left',
          //     textAlign: 'center'
          //   }
          // },
          {
            title: '搜索字段',
            field: 'dataIndex.searchFields',
            style: {
              float: 'left',
              width: '13%',
              textAlign: 'center'
            }
          },
          {
            title: '权重字段',
            field: 'dataIndex.orderFields',
            style: {
              float: 'left',
              width: '8%',
              textAlign: 'center'
            }
          },
          {
            title: '几何类型',
            field: 'dataIndex.geometryType',
            style: {
              float: 'left',
              width: '7%',
              textAlign: 'center'
            }
          },
          {
            title: '构建状态',
            field: 'dataIndex.buildStatus',
            style: {
              float: 'right',
              width: '7%',
              textAlign: 'center'
            },
            styleCallback: function(fieldValue) {
              if ('成功' == fieldValue) {
                return {
                  color: 'green'
                };
              } else if ('失败' == fieldValue) {
                return {
                  color: 'red'
                };
              } else if ('构建中' == fieldValue) {
                return {
                  color: 'blue'
                };
              }
            }
          }
        ],
        currPageNum: 1,
        totalPageNum: 1,
        pageSize: 10,
        api: './api/data/getPage',
        searchedCallback(rows) {
          for (var i in rows) {
            var row = rows[i];
            if (
              row.hasOwnProperty('dataIndex') &&
              row.dataIndex !== null &&
              row.dataIndex.hasOwnProperty('buildStatus')
            ) {
              if (row.dataIndex.buildStatus === 'success') {
                row.dataIndex.buildStatus = '成功';
              } else if (row.dataIndex.buildStatus === 'fail') {
                row.dataIndex.buildStatus = '失败';
              } else if (row.dataIndex.buildStatus === 'building') {
                row.dataIndex.buildStatus = '构建中';
              } else {
                row.dataIndex.buildStatus = '未定义状态';
              }
            }
            if (
              row.hasOwnProperty('dataIndex') &&
              row.dataIndex !== null &&
              row.dataIndex.hasOwnProperty('buildStatus')
            ) {
              if (row.dataIndex.geometryType === 'point') {
                row.dataIndex.geometryType = '点';
              } else if (row.dataIndex.geometryType === 'polyline') {
                row.dataIndex.geometryType = '线';
              } else if (row.dataIndex.geometryType === 'polygon') {
                row.dataIndex.geometryType = '面';
              } else {
                row.dataIndex.geometryType = '未定义几何类型';
              }
            }
          }
        }
      },
      dataIndexWindowConfig: {
        type: '', //add modify view 分别表示新增，修改以及查看
        show: false,
        parent: this,
        title: '',
        radioConfig: {
          geometryType: '',
          radioEnable: false
        },
        selectConfig: {
          select: '3',
          width: '200px',
          height: '100%',
          panelHeight: '200px',
          options: [
            {
              value: '5',
              label: '最低'
            },
            {
              value: '4',
              label: '低'
            },
            {
              value: '3',
              label: '普通'
            },
            {
              value: '2',
              label: '高'
            },
            {
              value: '1',
              label: '最高'
            }
          ]
        },
        height: '550px',
        width: '800px',
        dataIndexForm: {
          //fileds属性名 geotype几何类型 numFields权重类型 stringFileds搜索类型
          fields: [],
          geoType: '',
          numFields: [],
          stringFileds: []
        },
        selectBox1: [],
        selectBox2: [],
        form: {
          id: '',
          orderFields: '',
          searchFields: '',
          geometryType: '',
          priority: '',
          dataIndexFieldMetadataList: []
        },
        method: {
          close() {
            this.dataIndexWindowConfig.show = false;
          },
          cancel() {
            this.dataIndexWindowConfig.show = false;
          },
          confirm() {
            if (this.dataIndexWindowConfig.type === 'add') {
              this.dataIndexWindowConfig.form.searchFields = this.setCheckGroup(
                this.dataIndexWindowConfig.selectBox1,
                this.dataIndexWindowConfig.dataIndexForm.stringFileds
              ); //stringFields是搜索字段
              // this.dataIndexWindowConfig.form.orderFields = this.setCheckGroup(this.dataIndexWindowConfig.selectBox2,
              //   this.dataIndexWindowConfig.dataIndexForm.numFields)       //numFields是权重字段
              var arr = this.dataIndexWindowConfig.dataIndexForm.fields.map(
                (i, index) => {
                  var obj = new Object();
                  obj.fieldName = i;
                  return obj;
                }
              );
              this.dataIndexWindowConfig.form.dataIndexFieldMetadataList = arr;
              this.dataIndexWindowConfig.form.priority = this.dataIndexWindowConfig.selectConfig.select;
              this.dataIndexWindowConfig.form.geometryType = this.dataIndexWindowConfig.dataIndexForm.geoType;

              this.$http
                .post(this.saveDataIndexApi, this.dataIndexWindowConfig.form)
                .then(
                  res => {
                    if (res.body.status == 'success') {
                      var id = res.body.content;
                      this.$http.post(this.buildDataIndexApi + id).then(
                        res => {
                          if (res.body.status == 'success') {
                            this.search();
                            this.tooltipType = 'success';
                            this.tooltipMessage = '构建成功!';
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
            } else if (this.dataIndexWindowConfig.type === 'modify') {
              this.dataIndexWindowConfig.form.searchFields = this.setCheckGroup(
                this.dataIndexWindowConfig.selectBox1,
                this.dataIndexWindowConfig.dataIndexForm.stringFileds
              );
              // this.dataIndexWindowConfig.form.orderFields = this.setCheckGroup(this.dataIndexWindowConfig.selectBox2,
              //   this.dataIndexWindowConfig.dataIndexForm.numFields)
              var arr = this.dataIndexWindowConfig.dataIndexForm.fields.map(
                (i, index) => {
                  var obj = new Object();
                  obj.fieldName = i;
                  return obj;
                }
              );
              this.dataIndexWindowConfig.form.dataIndexFieldMetadataList = arr;
              this.dataIndexWindowConfig.form.priority = this.dataIndexWindowConfig.selectConfig.select;
              this.dataIndexWindowConfig.form.id = this.dataIndexWindowConfig.dataIndexForm.id;
              this.dataIndexWindowConfig.form.geometryType = this.dataIndexWindowConfig.dataIndexForm.geoType;
              delete this.dataIndexWindowConfig.form.dataId;
              this.$http
                .post(this.modifyDataIndexApi, this.dataIndexWindowConfig.form)
                .then(
                  res => {
                    // debugger
                    this.dataIndexWindowConfig.show = false;
                    //新增完按创建时间降序排序，方便查看最新增加的信息
                    if (res.body.status == 'success') {
                      for (var idx in this.gridConfigs.fields) {
                        var field = this.gridConfigs.fields[idx];
                      }
                      var id = this.dataIndexWindowConfig.dataIndexForm.id;
                      this.$http.post(this.buildDataIndexApi + id).then(
                        res => {
                          if (res.body.status == 'success') {
                            this.search();
                            this.tooltipType = 'success';
                            this.tooltipMessage = '重构成功!';
                            this.showTooltip = true;
                          } else {
                            this.tooltipType = 'failed';
                            this.tooltipMessage = res.body.message;
                            this.showTooltip = true;
                          }
                        },
                        res => {
                          this.tooltipType = 'failed';
                          this.tooltipMessage = res.body.resultBean.message;
                          this.showTooltip = true;
                        }
                      );
                      // this.tooltipType = "success";
                      // this.tooltipMessage = "修改成功!";
                      // this.showTooltip = true;
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
            this.dataIndexWindowConfig.show = false;
          }
        }
      },
      dataMetaWindowConfig: {
        type: '', //add modify view 分别表示新增，修改以及查看
        show: false,
        parent: this,
        title: '',
        tableConfig: {
          title: ['属性名', '中文名', '是否展示']
        },
        height: '500px',
        width: '600px',
        //数据绑定表单
        metaForm: {
          id: '',
          fieldAlias: '',
          canDisplay: ''
        },
        //提交表单
        form: {
          id: '',
          fieldAlias: '',
          canDisplay: ''
        },
        method: {
          close() {
            this.dataMetaWindowConfig.show = false;
          },
          cancel() {
            this.dataMetaWindowConfig.show = false;
          },
          confirm() {
            if (this.dataMetaWindowConfig.type === 'modify') {
              this.dataMetaWindowConfig.form = this.dataMetaWindowConfig.metaForm.map(
                i => {
                  if (i.canDisplay == true) {
                    i.canDisplay = '1';
                    return i;
                  } else {
                    i.canDisplay = '0';
                    return i;
                  }
                }
              );
              this.$http
                .post(this.modifyDateMetaApi, this.dataMetaWindowConfig.form)
                .then(
                  res => {
                    // debugger
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
            }
            this.dataMetaWindowConfig.show = false;
          }
        }
      }
    };
  },
  methods: {
    //对checkboxGroup数据进行过滤处理
    setCheckGroup(arrValue, arrData) {
      var newArrData = arrData.filter((i, index) => arrValue[index]);
      var str = newArrData.join(',');
      return str;
    },
    search() {
      //条件查询时必须将当前页重置为1
      this.$refs.grid.resetCurrentPageNum();
      this.$refs.grid.search();
    },
    reset() {
      this.gridConfigs.searchFields.type = '';
      this.gridConfigs.searchFields.sourceType = '';
      this.gridConfigs.searchFields.name = '';
      this.search();
    },
    dialogCancel() {
      //对值进行重置,不然不会触发change事件
      this.showDialog = false;
    },
    tooltipClosed() {
      this.showTooltip = false;
    },
    addDataIndex(item) {
      //新增时清空数据

      this.$http.get(this.getSingleDataIndexApi + item.id).then(
        res => {
          var clgInfo = res.body.content;
          if (res.body.status == 'success') {
            this.showMask = true;
            this.dataIndexWindowConfig.title = '添加数据索引信息';
            this.dataIndexWindowConfig.readonly = false;
            this.dataIndexWindowConfig.type = 'add';
            this.dataIndexWindowConfig.radioConfig.radioEnable = false;
            this.dataIndexWindowConfig.show = true;

            this.dataIndexWindowConfig.dataIndexForm = {
              numFields: clgInfo.numFields,
              stringFileds: clgInfo.stringFileds,
              geoType: clgInfo.geoType,
              fields: clgInfo.fields
            };
            this.dataIndexWindowConfig.selectBox1 = Array(
              this.dataIndexWindowConfig.dataIndexForm.stringFileds.length
            ).fill(false);
            this.dataIndexWindowConfig.selectBox2 = Array(
              this.dataIndexWindowConfig.dataIndexForm.numFields.length
            ).fill(false);
          } else {
            this.dataIndexWindowConfig.dataIndexForm = {
              numFields: [],
              stringFileds: [],
              geoType: ''
            };
          }
          this.dataIndexWindowConfig.form = {
            dataId: item.id,
            orderFields: '',
            searchFields: '',
            geometryType: '',
            priority: ''
          };

          this.showMask = false;
        },
        err => {
          this.tooltipType = 'failed';
          this.tooltipMessage = err.body.resultBean.message;
          this.showTooltip = true;
        }
      );
      this.dataIndexWindowConfig.selectConfig.select = '3'; //优先级设置为普通

      // // 根据判断用户是否上传了完整的shp,shx,dbf,prj文件来显示创建索引对话框
      // this.$http.get(this.judgeDateIndexApi + item.id).then((res) => {
      //   var judgeFlag = res.body.status;
      //   var msg = res.body.message;
      //   if (judgeFlag == "success") {
      //     this.dataIndexWindowConfig.show = true;
      //   } else {
      //     this.dialogMessage = "缺少：" + msg + " 数据文件！";
      //     this.showDialog = true;
      //   }
      // })
    },
    modifyDataIndex(item) {
      this.dataIndexWindowConfig.show = true;
      this.dataIndexWindowConfig.title = '编辑数据索引信息';
      this.dataIndexWindowConfig.type = 'modify';
      this.dataIndexWindowConfig.readonly = false;
      this.dataIndexWindowConfig.parentClgReadonly = true;
      this.dataIndexWindowConfig.radioConfig.radioEnable = false;

      this.showMask = true;

      this.$http.get(this.getSingleDataIndexApi + item.id).then(res => {
        this.showMask = false;
        var clgInfo = res.body.content;
        // debugger
        this.dataIndexWindowConfig.dataIndexForm = {
          id: item.dataIndex.id,
          fields: clgInfo.fields,
          geoType: clgInfo.geoType,
          numFields: clgInfo.numFields,
          stringFileds: clgInfo.stringFileds
        };
        this.dataIndexWindowConfig.selectBox1 = Array(
          this.dataIndexWindowConfig.dataIndexForm.stringFileds.length
        ).fill(false);
        this.dataIndexWindowConfig.selectBox2 = Array(
          this.dataIndexWindowConfig.dataIndexForm.numFields.length
        ).fill(false);
      });
    },
    removeDataIndex(item) {
      this.gridConfigs.getSelectedNames = [];
      this.gridConfigs.getSelectedIds = [];
      var selectItems = item;
      this.gridConfigs.getSelectedIds.push(selectItems.dataIndex.id);
      this.gridConfigs.getSelectedNames.push(selectItems.name);
      this.dialogMessage =
        '确认要删除：' + this.gridConfigs.getSelectedNames + ' 的数据索引吗?';
      this.operationType = 'removeDataIndexBatch';
      this.showDialog = true;
    },
    batchRemoveDataIndex() {
      this.gridConfigs.getSelectedNames = [];
      this.gridConfigs.getSelectedIds = [];
      var selectItems = this.$refs.grid.getSelectedItems();
      if (selectItems.length == 0) {
        this.tooltipType = 'failed';
        this.tooltipMessage = '请先选择数据索引!';
        this.showTooltip = true;
        return;
      } else {
        for (var i in selectItems) {
          this.gridConfigs.getSelectedIds.push(selectItems[i].dataIndex.id);
          this.gridConfigs.getSelectedNames.push(selectItems[i].name);
        }
        this.dialogMessage =
          '确认要批量删除：' +
          this.gridConfigs.getSelectedNames +
          ' 的数据索引吗?';
        this.operationType = 'removeDataIndexBatch';
        this.showDialog = true;
      }
    },
    viewDataIndex(item) {
      this.dataIndexWindowConfig.show = true;
      this.dataIndexWindowConfig.title = '预览数据索引';
      this.dataIndexWindowConfig.type = 'view';
      this.dataIndexWindowConfig.readonly = true;
      this.dataIndexWindowConfig.parentClgReadonly = true;
      this.dataIndexWindowConfig.radioConfig.radioEnable = true;
      this.showMask = true;
      this.$http.get(this.getSingleDataIndexApi + item.id).then(res => {
        this.showMask = false;
        var clgInfo = res.body.content;
        this.dataIndexWindowConfig.dataIndexForm = {
          fields: clgInfo.fields,
          geoType: clgInfo.geoType,
          numFields: clgInfo.numFields,
          stringFileds: clgInfo.stringFileds
        };
        if (item.dataIndex.searchFields !== '')
          var searchFieldsArr = item.dataIndex.searchFields.split(',');
        if (item.dataIndex.orderFields !== '')
          var orderFieldsArr = item.dataIndex.orderFields.split(',');
        //拿到的后台数据是已选则的字段的拼接字符串，需要处理成对应的所有字段数组中被选中的字段item为true
        this.dataIndexWindowConfig.selectBox1 = Array(
          this.dataIndexWindowConfig.dataIndexForm.stringFileds.length
        ).fill(false);
        this.dataIndexWindowConfig.selectBox2 = Array(
          this.dataIndexWindowConfig.dataIndexForm.numFields.length
        ).fill(false);
        this.dataIndexWindowConfig.selectBox1 = this.dataIndexWindowConfig.dataIndexForm.stringFileds.map(
          item => {
            if (searchFieldsArr.indexOf(item) !== -1) return true;
            else return false;
          }
        );
        this.dataIndexWindowConfig.selectBox2 = this.dataIndexWindowConfig.dataIndexForm.numFields.map(
          item => {
            if (searchFieldsArr.indexOf(item) !== -1) return true;
            else return false;
          }
        );
      });
    },
    setDataMeta(item) {
      var dataIndex = item.dataIndex.id;
      this.dataMetaWindowConfig.title = '元数据设置';
      this.dataMetaWindowConfig.type = 'modify';
      this.dataMetaWindowConfig.readonly = false;
      this.dataMetaWindowConfig.parentClgReadonly = true;
      this.dataMetaWindowConfig.show = true;
      this.$http
        .post(this.getDateMetaApi, {
          indexId: dataIndex
        })
        .then(res => {
          var clgInfo = res.body.content;
          this.dataMetaWindowConfig.metaForm = clgInfo;
          this.dataMetaWindowConfig.metaForm = this.dataMetaWindowConfig.metaForm.map(
            (i, index) => {
              i['canDisplay'] = !!+i['canDisplay'];
              return i;
            }
          );
        });
    },
    dialogConfirm() {
      this.showDialog = false;
      if (this.operationType == 'removeDataIndex') {
        this.$http.get(this.removeDataIndexApi + this.operationItem.id).then(
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
      } else if (this.operationType == 'removeDataIndexBatch') {
        this.$http
          .post(this.removeDataIndexBatchApi, this.gridConfigs.getSelectedIds)
          .then(
            res => {
              this.tooltipType = 'success';
              this.tooltipMessage =
                this.gridConfigs.getSelectedIds.length == 1
                  ? '删除成功!'
                  : '批量删除成功!';
              this.showTooltip = true;
              this.search();
              this.gridConfigs.getSelectedIds = [];
            },
            res => {
              this.tooltipType = 'failed';
              this.tooltipMessage =
                this.gridConfigs.getSelectedIds.length == 1
                  ? '删除失败!'
                  : '批量删除失败!';
              this.showTooltip = true;
              this.gridConfigs.getSelectedIds = [];
            }
          );
      } else {
        this.dataIndexWindowConfig.show = false;
      }
    }
  },
  mounted() {
    // 数据存储类型接口
    this.$http.get(this.dataTypeApi).then(res => {
      this.dataTypeAll = res.body.content;
    });
    // 数据源类型接口
    this.$http.get(this.dataSourceTypeApi).then(res => {
      this.dataSourceTypeAll = res.body.content;
    });
  },
  components: {
    WaitMask,
    grid,
    Panel,
    MyDialog,
    MyTooltip,
    MyWindow,
    TreeSelect,
    Tree,
    Checkbox,
    TabPane,
    Tabs,
    IForm,
    IFormItem,
    IInputbox,
    ITextarea,
    WrapBox,
    ISlider,
    ITitle,
    IRadio,
    IItem,
    ISwitch,
    ISelect,
    NoThings
  }
};
</script>

<style scoped>
.col {
}

.check {
  width: 20%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  margin-left: 20px;
  display: inline-block;
  padding-top: 8px;
  padding-bottom: 8px;
}

/* 元数据表设置table样式 */

.table {
  margin: 0 auto;
  font-size: 12px;
  text-align: center;
  border-collapse: collapse;
  border: 1px solid #e8edff;
}

th {
  font-size: 16px;
  font-weight: normal;
  padding: 8px;
  text-align: center;
  color: #fff;
  background-color: #44aaf5;
}

tr {
  text-align: center;
}

td {
  font-size: 13px;
  padding: 1px;
  color: #555;
  border: 1px solid #fff;
}

tbody tr:nth-child(2n) {
  background: #e5e5e5;
}

tbody tr:nth-child(2n + 1) {
  background: #eeeeee;
}

tr:hover td {
  font-size: 13px;
  background: #ddd;
}

.nodata {
  color: #ccc;
  text-align: center;
}
.disabled {
  pointer-events: none;
}
</style>
