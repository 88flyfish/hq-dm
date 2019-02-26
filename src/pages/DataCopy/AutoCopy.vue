<template>
  <div class="autoCopy">

    <MyWindow v-if="addWindowConfig.show" :config="addWindowConfig">
      <IForm>
        <IFormItem label="备份名称" labelWidth="100px">
          <Iinput v-model="addWindowConfig.form.name" :readOnly="addWindowConfig.readonly"></Iinput>
        </IFormItem>
        <IFormItem label="描述信息" labelWidth="100px">
          <Iinput v-model="addWindowConfig.form.description" :readOnly="addWindowConfig.readonly"></Iinput>
        </IFormItem>
        <IFormItem label="选择数据" labelWidth="100px">
          <div class="input-box">
            <Iinput v-model="addWindowConfig.form.dataName" :readOnly="addWindowConfig.readonly"></Iinput>
            <button class="choose-btn" @click="chooseWindowConfig.show = true;" v-if="!addWindowConfig.readonly">
              选择数据
            </button>
          </div>
        </IFormItem>
        <IFormItem label="备份周期" labelWidth="100px">
          <Iinput v-model="addWindowConfig.form.cycle" :readOnly="addWindowConfig.readonly"></Iinput>
        </IFormItem>
        <IFormItem label="备份文件源" labelWidth="100px">
          <div class="input-box">
            <Iinput v-model="addWindowConfig.form.fileSourceName" :readOnly="addWindowConfig.readonly"></Iinput>
            <button class="choose-btn" @click="dataSourceWindowConfig.show = true;" v-if="!addWindowConfig.readonly">
              选择数据源
            </button>
          </div>
        </IFormItem>
        <IFormItem label="备份文件路径" labelWidth="100px">
          <div class="input-box">
            <Iinput v-model="addWindowConfig.form.dir" :readOnly="addWindowConfig.readonly"></Iinput>
            <button class="choose-btn" @click="chooseDir" v-if="!addWindowConfig.readonly">
              选择文件夹
            </button>
          </div>
        </IFormItem>
        <IFormItem label="开始时间" labelWidth="100px">
          <!--<date-picker :type="'dateTime'" v-model="addWindowConfig.form.startDate" :class="{disabled:addWindowConfig.readonly}"></date-picker>-->
          <i-datetime-picker v-model="addWindowConfig.form.startDate" type="datetime"
                             :disabled="addWindowConfig.readonly"></i-datetime-picker>
        </IFormItem>
        <IFormItem label="结束时间" labelWidth="100px">
          <i-datetime-picker v-model="addWindowConfig.form.endDate" type="datetime"
                             :disabled="addWindowConfig.readonly"></i-datetime-picker>
          <!--<date-picker :type="'dateTime'" v-model="addWindowConfig.form.endDate" :class="{disabled:addWindowConfig.readonly}"></date-picker>-->
        </IFormItem>
      </IForm>
    </MyWindow>

    <MyWindow v-if="chooseWindowConfig.show" :config="chooseWindowConfig">
      <div class="win-search-bar">
        <span>数据名称:</span>
        <Iinput width="200px" height="30px" type="text" placeholder="请输入数据名称"
                v-model="dataGridConfigs.searchFields.name"/>
        <i-button type="primary" plain @click="search2">查询</i-button>
        <i-button type="primary" plain @click="reset2">重置</i-button>
      </div>
      <div class="win-grid">
        <grid :config="dataGridConfigs" ref="dataGrid"></grid>
      </div>

    </MyWindow>

    <MyWindow v-if="dataSourceWindowConfig.show" :config="dataSourceWindowConfig">
      <div class="win-search-bar">
        <span>数据储存类型:</span>
        <Iselect v-model="dataSourceGridConfigs.searchFields.dataType" :config="typeConfig"></Iselect>
        <span style="margin-left:10px;">数据源类型:</span>
        <Iselect v-model="dataSourceGridConfigs.searchFields.sourceType" :config="sourceTypeConfig" ref="sourceType1"
                 @change="dataSourceSearch"></Iselect>
        <div style="display:inline-block;vertical-align: top;">
          <span style="margin-left:10px;">数据源名称:</span>
          <Iinput placeholder="请输入数据源名称" v-model="dataSourceGridConfigs.searchFields.name" width="160px"
                  height="30px"></Iinput>
          <i-button type="primary" plain @click="dataSourceSearch">查询</i-button>
          <i-button type="primary" plain @click="dataSourceReset">重置</i-button>
        </div>
      </div>
      <div class="win-grid">
        <grid :config="dataSourceGridConfigs" ref="dataSourceGrid"></grid>
      </div>

    </MyWindow>

    <MyWindow v-if="dirWindowConfig.show" :config="dirWindowConfig">
      <AsynTree :treeData='treeConfig.data' :currentItem='treeConfig.currentItem' @item-click="itemClick">

      </AsynTree>
    </MyWindow>

    <Panel>
      <div slot="searchBar">
        <span>备份名称：</span>
        <Iinput v-model="gridConfigs.searchFields.name" placeholder="请输入备份名称" width="200px" height="30px"></Iinput>
        <i-button type="primary" plain @click="search">查询</i-button>
        <i-button type="primary" plain @click="reset">重置</i-button>
      </div>
      <div slot="actionBar">
        <i-button type="primary" @click="addItem">新增</i-button>
        <i-button type="success" plain @click="allRun">全部启动</i-button>
        <i-button type="danger" plain @click="allStop">全部停止</i-button>
        <i-button type="success" @click="someOperation('someRun')">批量启动</i-button>
        <i-button type="warning" @click="someOperation('someStop')">批量停止</i-button>
        <i-button type="danger" @click="someOperation('someDelete')">批量删除</i-button>
      </div>
      <div>
        <WaitMask :isShow="showMask"></WaitMask>
        <grid ref="grid" :config="gridConfigs"></grid>
      </div>
    </Panel>
    <my-dialog v-if="showDialog" :message="dialogMessage" @dialogCancel="showDialog = false;"
               @dialogConfirm="dialogConfirm"></my-dialog>
    <my-tooltip :show="showTooltip" :showType="tooltipType" :message="tooltipMessage"
                @tooltipClosed="showTooltip = false;"></my-tooltip>
  </div>
</template>

<script>
  import WaitMask from '../../components/common/WaitMask';
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
  import AsynTree from '../../components/common/AsynTree';
  import IButton from "../../components/common/IButton";
  import IDatetimePicker from "../../components/DmComponent/IDateTimePicker";

  export default {
    watch: {
      'dataSourceGridConfigs.searchFields.dataType'(val) {
        if (val == 'relational_db') {
          this.sourceTypeConfig.options = this.relationalDbItemOptions;
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
        this.dataSourceGridConfigs.searchFields.sourceType = '';
        this.dataSourceSearch();
      }
    },
    data() {
      let that = this;
      return {
        treeConfig: {
          data: [
            {
              name: '全部文件',
              parentPath: '',
              isDir: '1',
              isLeafDir: '0'
            }
          ],
          currentItem: {
            path: '/'
          }
        },
        showTooltip: false,
        tooltipType: '',
        tooltipMessage: '',
        showMask: false,
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
        typeConfig: {
          width: '150px',
          height: '30px',
          options: []
        },
        sourceTypeConfig: {
          width: '150px',
          height: '30px',
          options: []
        },
        dataGridConfigs: {
          hasCheckbox: false,
          api: './api/data/getPage',
          currPageNum: 1,
          totalPageNum: 1,
          pageSize: 10,
          searchFields: {
            name: '',
            type: 'table_data'
          },
          getSelectedNames: [],
          selectedIds: [],
          fields: [
            {
              title: '数据名称',
              field: 'name',
              style: {
                width: '25%',
                float: 'left',
                textAlign: 'center'
              }
            },
            {
              title: '描述',
              field: 'description',
              style: {
                width: '20%',
                float: 'left',
                textAlign: 'center'
              }
            },
            {
              title: '创建人',
              field: 'creator',
              style: {
                width: '20%',
                float: 'left',
                textAlign: 'center'
              }
            },
            {
              title: '创建时间',
              field: 'createDate',
              style: {
                width: '20%',
                float: 'left',
                textAlign: 'center'
              }
            }
          ]
        },
        dataSourceGridConfigs: {
          hasCheckbox: false,
          searchFields: {
            dataType: '',
            sourceType: '',
            name: ''
          },
          getSelectedNames: [],
          selectedIds: [],
          fields: [
            {
              title: '数据源名称',
              field: 'name',
              style: {
                width: '25%',
                float: 'left',
                textAlign: 'center'
              }
            },
            {
              title: '数据源编号',
              field: 'code',
              style: {
                width: '20%',
                float: 'left',
                textAlign: 'center'
              }
            },
            {
              title: '存储类型',
              field: 'dataType',
              style: {
                width: '20%',
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
                width: '25%',
                float: 'left',
                textAlign: 'center'
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
        dirWindowConfig: {
          type: 'add',
          show: false,
          parent: this,
          title: '选择文件夹',
          height: '600px',
          width: '700px',
          readonly: false,
          method: {
            close() {
              this.dirWindowConfig.show = false;
            },
            cancel() {
              this.dirWindowConfig.show = false;
            },
            confirm() {
              if (!this.treeConfig.currentItem.path) {
                this.treeConfig.currentItem.path = '/';
              }
              this.addWindowConfig.form.dir = this.treeConfig.currentItem.path;
              this.dirWindowConfig.show = false;
            }
          }
        },
        dataSourceWindowConfig: {
          type: 'add',
          show: false,
          parent: this,
          title: '请选择数据源',
          height: '710px',
          width: '950px',
          readonly: false,
          method: {
            close() {
              this.dataSourceWindowConfig.show = false;
            },
            cancel() {
              this.dataSourceWindowConfig.show = false;
            },
            confirm() {
              //待改动
              var selectItems = this.$refs.dataSourceGrid.getSelectedItems();
              if (selectItems.length == 0) {
                this.tooltipType = 'failed';
                this.tooltipMessage = '请选择一条数据!';
                this.showTooltip = true;
                return;
              } else {
                this.dataSourceGridConfigs.getSelectedNames = [];
                this.dataSourceGridConfigs.selectedIds = [];
                selectItems.forEach(item => {
                  this.dataSourceGridConfigs.selectedIds.push(item.id);
                  this.dataSourceGridConfigs.getSelectedNames.push(item.name);
                });
                this.addWindowConfig.form.fileSourceId = this.dataSourceGridConfigs.selectedIds[0];
                this.addWindowConfig.form.fileSourceName = this.dataSourceGridConfigs.getSelectedNames[0];
                this.dataSourceWindowConfig.show = false;
              }
            }
          }
        },
        chooseWindowConfig: {
          show: false,
          width: '800px',
          height: '660px',
          type: 'add',
          title: '选择数据',
          parent: this,
          readonly: false,
          form: {
            name: ''
          },
          method: {
            close() {
              this.chooseWindowConfig.show = false;
            },
            cancel() {
              this.chooseWindowConfig.show = false;
            },
            confirm() {
              var selectItems = this.$refs.dataGrid.getSelectedItems();
              if (selectItems.length == 0) {
                this.tooltipType = 'failed';
                this.tooltipMessage = '请先选择数据!';
                this.showTooltip = true;
                return;
              } else {
                this.dataGridConfigs.getSelectedNames = [];
                this.dataGridConfigs.selectedIds = [];
                selectItems.forEach(item => {
                  this.dataGridConfigs.selectedIds.push(item.id);
                  this.dataGridConfigs.getSelectedNames.push(item.name);
                });
                this.addWindowConfig.form.dataId = selectItems[0].id;
                this.addWindowConfig.form.dataName = selectItems[0].name;
                this.chooseWindowConfig.show = false;
              }
            }
          }
        },
        addWindowConfig: {
          type: '',
          show: false,
          readonly: false,
          parent: this,
          title: '',
          width: '700px',
          height: '560px',
          form: {
            name: '',
            description: '',
            dataId: '',
            dataName: '',
            cycle: '',
            fileSourceId: '',
            fileSourceName: '',
            dir: '',
            startDate: '',
            endDate: ''
          },
          method: {
            close() {
              this.addWindowConfig.show = false;
            },
            cancel() {
              this.addWindowConfig.show = false;
            },
            confirm() {
              this.showMask = true;
              delete this.addWindowConfig.form.dataName;
              delete this.addWindowConfig.form.fileSourceName;
              if (this.addWindowConfig.type == 'add') {
                this.$http
                  .post('./api/dataBackup/save', this.addWindowConfig.form)
                  .then(
                    res => {
                      res = res.body;
                      this.showMask = false;
                      this.addWindowConfig.show = false;
                      if (res.status == 'success') {
                        this.getTip('新增成功', 'success');
                        this.search();
                      }
                    },
                    err => {
                    }
                  );
              } else if (this.addWindowConfig.type == 'modify') {
                this.$http
                  .post('./api/dataBackup/modify', this.addWindowConfig.form)
                  .then(
                    res => {
                      res = res.body;
                      this.showMask = false;
                      this.addWindowConfig.show = false;
                      if (res.status == 'success') {
                        this.getTip('修改成功', 'success');
                        this.search();
                      }
                    },
                    err => {
                    }
                  );
              }
            }
          }
        },
        dialogMessage: false,
        showDialog: false,
        operationType: '',
        operationItem: {},
        gridConfigs: {
          searchFields: {
            name: ''
          },
          operationType: '',
          operationItem: {},
          getSelectedNames: [],
          selectedIds: [],
          currPageNum: 1,
          totalPageNum: 1,
          pageSize: 10,
          api: './api/dataBackup/getPage',
          fields: [
            {
              title: '备份名称',
              field: 'name',
              style: {
                float: 'left',
                width: '10%',
                textAlign: 'center'
              }
            },
            {
              title: '周期',
              field: 'cycle',
              style: {
                float: 'left',
                width: '8%',
                textAlign: 'center'
              }
            },
            {
              title: '备份文件路径',
              field: 'dir',
              style: {
                float: 'left',
                width: '10%',
                textAlign: 'center'
              }
            },
            {
              title: '描述',
              field: 'description',
              style: {
                float: 'left',
                width: '10%',
                textAlign: 'center'
              }
            },
            {
              title: '开始日期',
              field: 'startDate',
              style: {
                float: 'left',
                width: '11%',
                textAlign: 'center'
              }
            },
            {
              title: '停止日期',
              field: 'endDate',
              style: {
                float: 'left',
                width: '11%',
                textAlign: 'center'
              }
            },
            {
              title: '永久运行',
              field: 'isPermanentlyRunning',
              style: {
                float: 'left',
                width: '6%',
                textAlign: 'center'
              },
              styleCallback: function (fieldValue) {
                if ('是' == fieldValue) {
                  return {color: 'green'};
                } else if ('否' == fieldValue) {
                  return {color: 'red'};
                }
              }
            },
            {
              title: '运行状态',
              field: 'running',
              style: {
                float: 'left',
                width: '6%',
                textAlign: 'center'
              },
              styleCallback: function (fieldValue) {
                if ('运行中' == fieldValue) {
                  return {color: 'green'};
                } else if ('已停止' == fieldValue) {
                  return {color: 'red'};
                }
              }
            }
          ],
          operations: [
            {
              title: '启动',
              icon: '&#xea15',
              func: item => {
                this.$http.get('./api/dataBackup/start?id=' + item.id).then(
                  res => {
                    if ('success' === res.body.status) {
                      that.getTip('启动成功', 'success');
                      that.search();
                    } else {
                      that.getTip(res.body.message, 'failed');
                    }
                  },
                  err => {
                    that.getTip('服务异常，请稍后重试', 'failed');
                  }
                );
              },
              condition(row) {
                return row.running == '已停止';
              }
            },
            {
              title: '停止',
              icon: '&#xea16',
              func: item => {
                this.$http.get('./api/dataBackup/stop?id=' + item.id).then(
                  res => {
                    if ('success' === res.body.status) {
                      that.getTip('停止成功', 'success');
                      that.search();
                    } else {
                      that.getTip(res.body.message, 'failed');
                    }
                  },
                  err => {
                    that.getTip('服务异常，请稍后重试', 'failed');
                  }
                );
              },
              condition(row) {
                return row.running == '运行中';
              }
            },
            {
              title: '查看详情',
              icon: '&#xe9ce',
              func: item => {
                this.addWindowConfig.type = 'view';
                this.addWindowConfig.title = '查看备份';
                this.addWindowConfig.readonly = true;
                this.addWindowConfig.show = true;

                this.$http.get('./api/dataBackup/getById?id=' + item.id).then(
                  res => {
                    res = res.body;
                    if (res.status == 'success') {
                      res = res.content;
                      this.addWindowConfig.form = Object.assign({}, res);
                    }
                  },
                  err => {
                  }
                );
              }
            },
            {
              title: '编辑',
              icon: '&#xe90a',
              func: item => {
                this.addWindowConfig.type = 'modify';
                this.addWindowConfig.title = '编辑备份';
                this.addWindowConfig.readonly = false;
                this.addWindowConfig.show = true;

                this.$http.get('./api/dataBackup/getById?id=' + item.id).then(
                  res => {
                    res = res.body;
                    if (res.status == 'success') {
                      res = res.content;
                      this.addWindowConfig.form = Object.assign({}, res);
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
                this.dialogMessage = `确认删除${item.name}这个数据吗`;
                this.operationType = 'removeSingleItem';
                this.operationItem = item;
                this.showDialog = true;
              }
            }
          ],
          searchedCallback: rows => {
            rows.forEach(item => {
              item.isPermanentlyRunning =
                item.isPermanentlyRunning == 1 ? '是' : '否';
              item.running = item.running == 1 ? '运行中' : '已停止';
            });
          }
        }
      };
    },
    methods: {
      chooseDir() {
        if (!this.addWindowConfig.form.fileSourceId) {
          this.getTip('请先选择数据源', 'failed');
          return;
        }
        this.treeConfig = {
          data: [
            {
              name: '全部文件',
              parentPath: '',
              isDir: '1',
              isLeafDir: '0'
            }
          ],
          currentItem: {
            path: '/'
          }
        };
        this.dirWindowConfig.show = true;
      },
      itemClick(item) {
        var path;
        this.treeConfig.currentItem = item;
        if (item.isDir == '1') item.open = !item.open;
        if (item && item.isDir == '1') {
          if (item.parentPath == '') {
            path = '/';
          } else if (item.parentPath == '/') {
            path = item.parentPath + item.name;
          } else {
            path = item.parentPath + '/' + item.name;
          }
          // debugger;
          var params = {
            path: path
          };
          this.$http
            .post(
              './api/fileSourceView/getFolderList/' +
              this.addWindowConfig.form.fileSourceId,
              params
            )
            .then(
              res => {
                var filterDatas = res.body.content;
                this.$set(this.treeConfig.currentItem, 'children', filterDatas);
              },
              err => {
                this.getTip(err.body.resultBean.message, 'failed');
              }
            );
        }
      },
      getTip(msg, type) {
        this.tooltipMessage = msg;
        this.tooltipType = type;
        this.showTooltip = true;
      },
      dataSourceSearch() {
        //条件查询时必须将当前页重置为1
        this.$refs.dataSourceGrid.resetCurrentPageNum();
        this.$refs.dataSourceGrid.search();
      },
      dataSourceReset() {
        this.dataSourceGridConfigs.searchFields.dataType = '';
        this.dataSourceGridConfigs.searchFields.sourceType = '';
        this.dataSourceGridConfigs.searchFields.name = '';
        this.dataSourceSearch();
      },
      search2() {
        //条件查询时必须将当前页重置为1
        this.$refs.dataGrid.resetCurrentPageNum();
        this.$refs.dataGrid.search();
      },
      reset2() {
        this.dataGridConfigs.searchFields.name = '';
        this.search2();
      },
      addItem() {
        this.addWindowConfig.type = 'add';
        this.addWindowConfig.title = '新增备份';
        this.addWindowConfig.readonly = false;
        this.addWindowConfig.show = true;
        this.addWindowConfig.form = {
          name: '',
          description: '',
          dataId: '',
          dataName: '',
          cycle: '',
          fileSourceId: '',
          dir: '',
          startDate: '',
          endDate: ''
        };
      },
      allRun() {
        this.$http.get('./api/dataBackup/startAll').then(
          res => {
            res = res.body;
            if (res.status == 'success') {
              this.getTip('全部启动成功', 'success');
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
      allStop() {
        this.$http.get('./api/dataBackup/stopAll').then(
          res => {
            res = res.body;
            if (res.status == 'success') {
              this.getTip('全部停止成功', 'success');
              this.search();
            } else {
            }
          },
          err => {
            err = err.body;
            this.getTip(err.resultBean.message, 'failed');
          }
        );
      },
      someOperation(type) {
        this.gridConfigs.getSelectedNames = [];
        this.gridConfigs.selectedIds = [];
        var selectItems = this.$refs.grid.getSelectedItems();
        if (selectItems.length == 0) {
          this.getTip('请先选择数据', 'failed');
        } else {
          for (var i in selectItems) {
            this.gridConfigs.selectedIds.push(selectItems[i].id);
            this.gridConfigs.getSelectedNames.push(selectItems[i].name);
          }
          this.dialogMessage = `确认要批量${
            type == 'someRun'
              ? '启动'
              : type == 'someStop' ? '停止' : type == 'someDelete' ? '删除' : ''
            }：${this.gridConfigs.getSelectedNames}吗?`;
          this.operationType = type;
          this.showDialog = true;
        }
      },
      dialogConfirm() {
        this.showDialog = false;
        if (this.operationType == 'removeSingleItem') {
          this.showMask = true;
          this.$http
            .get('./api/dataBackup/removeFromDbById?id=' + this.operationItem.id)
            .then(
              res => {
                res = res.body;
                this.showMask = false;
                if (res.status == 'success') {
                  this.getTip('删除成功', 'success');
                  this.search();
                } else {
                  this.getTip(res.body.message, 'failed');
                }
              },
              err => {
                this.getTip(err.body.resultBean.message, 'failed');
              }
            );
        } else if (this.operationType == 'someRun') {
          this.$http
            .post('./api/dataBackup/batchStart', this.gridConfigs.selectedIds)
            .then(
              res => {
                res = res.body;
                if (res.status == 'success') {
                  this.getTip('启动成功', 'success');
                  this.search();
                } else {
                  this.getTip(res.message, 'failed');
                }
              },
              err => {
                err = err.body;
                this.getTip(err.resultBean.message, 'failed');
              }
            );
        } else if ('someStop' === this.operationType) {
          this.$http
            .post('./api/dataBackup/batchStop', this.gridConfigs.selectedIds)
            .then(
              res => {
                res = res.body;
                if (res.status === 'success') {
                  this.getTip('停止成功', 'success');
                  this.search();
                } else {
                  this.getTip(res.message, 'failed');
                }
              },
              err => {
                err = err.body;
                this.getTip(err.resultBean.message, 'failed');
              }
            );
        } else if (this.operationType == 'someDelete') {
          this.$http
            .post(
              './api/dataBackup/batchRemoveFromDb',
              this.gridConfigs.selectedIds
            )
            .then(
              res => {
                res = res.body;
                if (res.status == 'success') {
                  this.getTip('删除成功', 'success');
                  this.search();
                } else {
                  this.getTip(res.message, 'failed');
                }
              },
              err => {
                err = err.body;
                this.getTip(err.resultBean.message, 'failed');
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
        this.gridConfigs.searchFields.name = '';
        this.search();
      }
    },
    created() {
      // 数据存储类型接口
      this.$http
        .get('./loginapi/sys/dictionary/getListByCode?code=datatype')
        .then(res => {
          let arr = res.body.content;
          arr.forEach(item => {
            item.value = item.dictCode;
            item.label = item.name;
          });
          this.typeConfig.options = arr;

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
    },
    components: {
      IDatetimePicker,
      IButton,
      WaitMask,
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
      AsynTree
    }
  };
</script>

<style lang="less" scoped>
  .input-box {
    position: relative;
    .choose-btn {
      position: absolute;
      right: 0;
      top: 2px;
      height: 32px;
      border-radius: 4px;
      /*background: #13ce66;*/
      background: #20a0ff;
      color: #fff;
      cursor: pointer;
    }
  }

  .disabled {
    pointer-events: none;
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
