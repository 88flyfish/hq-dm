<template>
  <Panel>
    <div slot="searchBar">
      <span>数据名称:</span>
      <i-inputbox type="text"
                  placeholder="请输入数据名称"
                  style="width:180px;height: 30px;margin-right:10px;"
                  v-model="gridConfigs.searchFields.name" />
      <i-button type="primary"
                plain
                @click="search">查询</i-button>
      <i-button type="primary"
                plain
                @click="reset">重置</i-button>
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

    <!-- 确认表操作的提示框 -->
    <my-dialog v-if="showDialog"
               :message="dialogMessage"
               @dialogCancel="dialogCancel"
               @dialogConfirm="dialogConfirm"></my-dialog>
    <!--　用于显示表信息的提示工具　-->
    <my-tooltip :show="tooltipConfig.showTooltip"
                :showType="tooltipConfig.tooltipType"
                :message="tooltipConfig.tooltipMessage"
                @tooltipClosed="tooltipClosed"></my-tooltip>
    <!--新增数据的对话框-->
    <myWindow v-if="myDataWindowConfig.show"
              :config="myDataWindowConfig">
      <steps :current="myDataWindowConfig.current"
             type="line"
             ref="steps">
        <step title="基本信息"
              class="content-body-form">
          <!--<div class='title'>数据的基本信息</div>-->
          <i-form style="padding-top: 0;">
            <i-form-item label="数据名称"
                         labelWidth="100px"
                         required
                         :tipTxt="rules.name.tip"
                         :tipShow="rules.name.show">
              <i-inputbox v-model="myDataWindowConfig.form.name"
                          :readOnly="myDataWindowConfig.readonly" />
              <!--<span class="must">*</span>-->
            </i-form-item>
            <i-form-item label="数据规范"
                         :required="true">
              <tree-select :selectStyle="standardTreeSelectConfig.selectStyle"
                           :api="standardTreeSelectConfig.api"
                           :hasSearch="true"
                           addChildren="standardInfoList"
                           :treeStyleConfig="{leafIcon:'&#xe934;'}"
                           :readonly="myDataWindowConfig.readonly"
                           v-model="myDataWindowConfig.form.dataStandardId"
                           @change="standardChange">
              </tree-select>
            </i-form-item>
            <i-form-item label="描述信息"
                         labelWidth="100px">
              <i-inputbox v-model="myDataWindowConfig.form.description"
                          :readOnly="myDataWindowConfig.readonly" />
            </i-form-item>
            <i-form-item label="数据类型"
                         required
                         :tipTxt="rules.type.tip"
                         :tipShow="rules.type.show"
                         labelWidth="100px">
              <i-select v-model="myDataWindowConfig.form.type"
                        :config="dataTypeOptions"
                        :readonly="myDataWindowConfig.readonly"
                        @change="typeChange"></i-select>
            </i-form-item>
            <i-form-item label="数据源"
                         required
                         :tipTxt="rules.dataSourceName.tip"
                         :tipShow="rules.dataSourceName.show"
                         labelWidth="100px">
              <div class="input-box">
                <i-inputbox v-model="myDataWindowConfig.form.dataSourceName"
                            :readOnly="myDataWindowConfig.readonly"></i-inputbox>
                <button class="choose-btn"
                        @click="initDataSource"
                        v-if="!myDataWindowConfig.readonly&&myDataWindowConfig.form.type!='table_data'">
                  本地数据源
                </button>
                <button class="choose-btn2"
                        @click="chooseDataSource"
                        v-if="!myDataWindowConfig.readonly">
                  其他数据源
                </button>
              </div>
            </i-form-item>
            <i-form-item label="数据表名"
                         required
                         :tipTxt="rules.tableName.tip"
                         :tipShow="rules.tableName.show"
                         labelWidth="100px"
                         v-if='myDataWindowConfig.form.type == "table_data"'>
              <ISelect v-model="myDataWindowConfig.form.tableName"
                       :config="tableNameOptions"
                       :readonly="myDataWindowConfig.readonly"></ISelect>
            </i-form-item>

            <i-form-item label="文件路径"
                         required
                         :tipTxt="rules.filePath.tip"
                         :tipShow="rules.filePath.show"
                         labelWidth="100px"
                         v-else>
              <div class="input-box">
                <i-inputbox v-model="myDataWindowConfig.form.filePath"
                            :readOnly="myDataWindowConfig.readonly"></i-inputbox>
                <button class="choose-btn3"
                        @click="chooseFile"
                        v-if="!myDataWindowConfig.readonly">
                  选择文件
                </button>
              </div>
            </i-form-item>
            <i-form-item label="备注"
                         labelWidth="100px">
              <i-textarea v-model="myDataWindowConfig.form.remark"
                          :readonly="myDataWindowConfig.readonly"
                          style="width: 100%;height: 60px;resize: none;"></i-textarea>
            </i-form-item>
          </i-form>
        </step>
        <step title="元信息"
              class="content-body-form">
          <Tabs v-model='tabConfig.activeTab'
                :config='tabConfig'>
            <tab-pane v-for="group in groupInfoList"
                      :label="group.name"
                      :key="group.id">
              <i-form>
                <section v-for="describeInfo in group.describeInfoList">
                  <!-- <i-form-item label="描述项名称"
                               style="display: inline-block; width: 49.5%;">
                    <i-inputbox v-model="describeInfo.name"></i-inputbox>
                  </i-form-item> -->
                  <!-- {{describeInfo.name}}:<input v-model="describeInfo.value"
                         style="width: 300px;"></input> -->
                  <i-form-item :label="describeInfo.name"
                               :labelStyle='labelStyle'
                               :itemStyle='itemStyle'
                               style="display: inline-block;  margin-left: 50px;">
                    <i-inputbox v-model="describeInfo.value"
                                style="width: 300px;"></i-inputbox>
                  </i-form-item>
                </section>
              </i-form>
            </tab-pane>
          </Tabs>
        </step>
      </steps>
    </myWindow>

    <!--选择文件的window弹窗-->
    <myWindow v-if="chooseFileWindowConfig.show"
              :config="chooseFileWindowConfig">
      <Panel>
        <div slot="searchBar">
          <span>文件名称:</span>
          <input type="text"
                 placeholder="请输入文件名称"
                 v-model="folderConfig.searchFields.name" />
          <button type="button"
                  @click="fileSearch">查询</button>
          <button type="button"
                  @click="fileReset">重置</button>
        </div>
        <div slot="actionBar"
             class="uploadBtn">
          <FileUpLoader style="display:inline-block"
                        :attach-params="folderConfig.currentPath"
                        v-model="chooseFileWindowConfig.files"
                        multiple></FileUpLoader>
        </div>
        <div>
          <Folder ref="folder"
                  :config="folderConfig"
                  @getPathArr="getPathArr"></Folder>
        </div>
      </Panel>
    </myWindow>

    <!--选择数据源的window弹框-->
    <myWindow v-if="dataSourceWindowConfig.show"
              :config="dataSourceWindowConfig">
      <Panel>
        <div slot="searchBar">
          <span>数据储存类型:</span>
          <ISelect v-model="dataSourceGridConfigs.searchFields.dataType"
                   :config="typeConfig"></ISelect>
          <span style="margin-left:10px;">数据源类型:</span>
          <ISelect v-model="dataSourceGridConfigs.searchFields.sourceType"
                   :config="sourceTypeConfig"
                   ref="sourceType1"
                   @change="dataSourceSearch"></ISelect>
          <div style="display:inline-block;vertical-align: top;">
            <span style="margin-left:10px;">数据源名称:</span>
            <i-inputbox placeholder="请输入数据源名称"
                        v-model="dataSourceGridConfigs.searchFields.name"
                        width="160px"
                        height="30px"></i-inputbox>
            <button type="button"
                    @click="dataSourceSearch">查询</button>
            <button type="button"
                    @click="dataSourceReset">重置</button>
          </div>
        </div>
        <div>
          <grid :config="dataSourceGridConfigs"
                ref="dataSourceGrid"></grid>
        </div>
      </Panel>

    </myWindow>

    <!--新增数据条目的对话框-->
    <myWindow v-if="dataRowWindowConfig.show"
              :config="dataRowWindowConfig">
      <div class='title'>数据项的基本信息</div>
      <i-form-item label="名称"
                   labelWidth="70px">
        <i-inputbox v-model="dataRowWindowConfig.form.name"
                    :readOnly="dataRowWindowConfig.readonly" />
      </i-form-item>
      <i-form-item label="类型"
                   labelWidth="70px">
        <i-select v-model="dataRowWindowConfig.form.type"
                  :config="dataRowWindowConfig.selectConfig"></i-select>
      </i-form-item>
      <i-form-item label="数据源"
                   labelWidth="70px">
        <i-inputbox :readOnly="dataRowWindowConfig.readonly" />
        <!-- <tree-select :selectStyle="dataRowWindowConfig.dataSourceId" :api="treeSelectConfig.api"></tree-select> -->
      </i-form-item>
      <div class='title'>参数</div>
      <i-form-item label="表名"
                   labelWidth="70px">
        <i-inputbox v-model="dataRowWindowConfig.form.tableName"
                    :readOnly="dataRowWindowConfig.readonly" />
      </i-form-item>
      <div class='fileUpWrap'
           v-if="dataRowWindowConfig.type === 'add' ">
        <i-form-item label="URL"
                     labelWidth="70px">
          <i-inputbox v-model="dataRowWindowConfig.form.fileUrl"
                      :readOnly="dataRowWindowConfig.readonly" />
          <FileUpLoader style="display:inline-block;margin-top:10px;"
                        v-model="setFileUrl"
                        :multiple="true"
                        class='fileUpButton'></FileUpLoader>
        </i-form-item>
      </div>
    </myWindow>
  </Panel>

</template>

<script>
import Folder from '../../components/common/Folder';
import grid from '../../components/common/grid.vue';
import Panel from '../../components/Panel.vue';
import MyDialog from '../../components/common/Dialog.vue';
import MyTooltip from '../../components/common/OperationStatusTooltip.vue';
import MyWindow from '../../components/common/Window.vue';
import Tree from '../../components/common/Tree.vue';
import TreeSelect from '../../components/DmComponent/TreeSelect';
import Steps from '../../components/common/Steps.vue';
import Step from '../../components/common/Step.vue';
import Checkbox from '../../components/common/Checkbox.vue';
import Tabs from '../../components/common/Tabs.vue';
import TabPane from '../../components/common/TabPane.vue';
import IForm from '../../components/common/IForm';
import IFormItem from '../../components/common/IFormItem';
import IInputbox from '../../components/common/IInputbox';
import ITextarea from '../../components/common/ITextarea';
import FileUpLoader from '../../components/common/FileUploader';
import ITimePicker from '../../components/common/ITimePicker';
import ISelect from '../../components/common/ISelect';
import DatePicker from '../../components/common/DatePicker';
import IItem from '../../components/layout/IItem';
import IButton from '../../components/common/IButton';

export default {
  props: {},
  data () {
    return {
      labelStyle: {
        width: '300px'
      },
      itemStyle: {
        marginLeft: '300px'
      },
      // 描述组别动态tab选项卡

      groupInfoList: [],
      describeInfoList: [],
      folderConfig: {
        hasCheckbox: false,
        single: true,
        sourceId: '-2',
        api: './api/fileSourceView/getContentList/',
        apiDir: '/',
        searchFields: {
          name: ''
        },
        pathChangeParentFlag: true,
        pathArr: [],
        uploadConfig: {
          files: []
        },
        currentPath: {},
        operations: [],
        searchFields: {
          type: '',
          sourceType: '',
          name: ''
        },
        fields: [
          {
            title: '文件名',
            field: 'name',
            isSortField: true,
            sortType: 'asc',
            style: {
              width: '45%',
              float: 'left',
              textAlign: 'left',
              paddingLeft: '10px'
            }
          },
          {
            title: '文件大小',
            field: 'size',
            isSortField: true,
            style: {
              width: '10%',
              float: 'left',
              textAlign: 'center'
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
            style: {
              width: '22%',
              float: 'left',
              textAlign: 'center'
            }
          }
        ],
        searchedCallback: function (rows) {
          if (rows && rows.length > 0) {
            var temp = [];
            rows.filter(function (item) {
              if (item.isDir && item.isDir == '1') {
                // item.size = '——';
                temp.push(item);
              }
              return true;
            });
            rows.filter(function (item) {
              if (item.isDir && item.isDir == '0') {
                // item.size = item.size ?(item.size/1024/1024).toFixed(3)+"MB":undefined;
                temp.push(item);
              }
              return true;
            });
            rows = temp;
          }
          return rows;
        }
      },
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
      // 获取字典条目类型API
      getDataItemTypeApi:
        './loginapi/sys/dictionary/getListByCode?code=data_item_type',
      // 数据源类型接口
      dataTypeApi: './loginapi/sys/dictionary/getListByCode?code=question_status',
      // 获取当前用户信息
      getCurrentUserApi: './api/sys/getCurrentUser',
      // 获取单个数据关联信息接口
      getSingleDataApi: './api/data/getByWhereWithRelationShip',
      // 增加数据接口
      addSingleDataApi: './api/data/save',
      // 修改数据信息接口
      modifySingleDataApi: './api/data/modify',
      // 删除数据信息接口
      removeSingleDataApi: './api/data/removeFromDbById?id=',
      // 批量删除数据信息接口
      removeDataBatchApi: './api/data/batchRemoveFromDb',
      // 获取单个数据数据条目接口
      getSingleDataRowApi: './api/dataItem/getById?id=',
      // 增加数据数据条目接口
      addSingleDataRowApi: './api/dataItem/save',
      // 修改数据数据条目接口
      modifySingleDataRowApi: './api/dataItem/modify',
      // 删除数据数据条目接口
      removeSingleDataRowApi: './api/dataItem/removeFromDbById?id=',

      dataTypeOptions: {
        options: []
      },
      tableNameOptions: {
        options: []
      },
      standardTreeSelectConfig: {
        api: "./api/theme/getThemeStandardInfo",
        field: "name",
        selectStyle: {
          width: "100%",
          height: "35px",
          float: "left"
        }
      },
      dataTypeAll: [],
      currentUserId: '',
      showDialog: false,
      dialogMessage: '',
      tooltipConfig: {
        showTooltip: false,
        tooltipType: '',
        tooltipMessage: ''
      },
      iconEditFlag: false,
      iconCloseFlag: false,
      files: [],
      tabConfig: {
        activeTab: 0,
        style: {
          height: 'auto'
        }
      },
      datePickerConfig: {
        title: '-'
      },
      treeSelectConfig: {
        api: './api/sys/org/getAll',
        field: 'name',
        selectStyle: {
          width: '65%',
          height: '32px',
          display: 'inline-block',
          verticalAlign: 'bottom'
        }
      },
      gridConfigs: {
        operationColumnWidth: '10%',
        operations: [
          {
            title: '编辑',
            icon: '&#xe90a',
            func: this.modifySingleItem
          },
          {
            title: '浏览',
            icon: '&#xe9ce',
            func: this.viewSingleItem
          },
          {
            title: '删除',
            icon: '&#xe9ac',
            func: this.removeSingleItem
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
            style: {
              width: '19%',
              float: 'left',
              textAlign: 'left',
              paddingLeft: '2%'
            }
          },
          {
            title: '数据类型',
            field: 'type',
            style: {
              width: '7%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '创建人',
            field: 'creator',
            style: {
              width: '13%',
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
            title: '修改人',
            field: 'updater',
            style: {
              float: 'left',
              width: '13%',
              textAlign: 'center'
            }
          },
          {
            title: '修改时间',
            field: 'updateDate',
            isSortField: true,
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
        api: './api/data/getPage',
        searchedCallback: rows => {
          rows.forEach(item => {
            switch (item.type) {
              case 'file_data':
                item.type = '文件数据';
                break;
              case 'table_data':
                item.type = '表数据';
                break;
            }
          });
        }
      },
      dataSourceGridConfigs: {
        single: true,
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
              textAlign: 'left'
            }
          },
          {
            title: '数据源编号',
            field: 'code',
            style: {
              width: '20%',
              float: 'left',
              textAlign: 'left'
            }
          },
          {
            title: '存储类型',
            field: 'dataType',
            style: {
              width: '20%',
              float: 'left',
              textAlign: 'left'
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
              textAlign: 'left'
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
      chooseFileWindowConfig: {
        files: [],
        type: 'add',
        show: false,
        parent: this,
        title: '请选择文件',
        height: '680px',
        width: '850px',
        readonly: false,
        method: {
          close () {
            this.chooseFileWindowConfig.show = false;
          },
          cancel () {
            this.chooseFileWindowConfig.show = false;
          },
          confirm () {
            this.folderConfig.getSelectedNames = [];
            this.folderConfig.getSelectedPaths = [];
            var selectItems = this.$refs.folder.getSelectedItems();
            if (selectItems.length == 0) {
              this.getTip('请先选择文件!', 'failed');
              return;
            } else {
              for (var i in selectItems) {
                this.folderConfig.getSelectedPaths.push(selectItems[i].path);
                this.folderConfig.getSelectedNames.push(selectItems[i].name);
              }
            }
            this.myDataWindowConfig.form.filePath = this.folderConfig.getSelectedPaths[0];
            this.chooseFileWindowConfig.show = false;
          }
        }
      },
      dataSourceWindowConfig: {
        type: 'add',
        show: false,
        parent: this,
        title: '请选择数据源',
        height: '705px',
        width: '990px',
        readonly: false,
        method: {
          close () {
            this.dataSourceWindowConfig.show = false;
          },
          cancel () {
            this.dataSourceWindowConfig.show = false;
          },
          confirm () {
            //待改动
            var selectItems = this.$refs.dataSourceGrid.getSelectedItems();
            if (selectItems.length == 0) {
              this.getTip('请选择一条数据!', 'failed');
              return;
            } else {
              this.dataSourceGridConfigs.getSelectedNames = [];
              this.dataSourceGridConfigs.selectedIds = [];
              selectItems.forEach(item => {
                this.dataSourceGridConfigs.selectedIds.push(item.id);
                this.dataSourceGridConfigs.getSelectedNames.push(item.name);
              });

              this.myDataWindowConfig.form.dataSourceId = this.dataSourceGridConfigs.selectedIds[0];
              this.myDataWindowConfig.form.dataSourceName = this.dataSourceGridConfigs.getSelectedNames[0];

              this.dataSourceWindowConfig.show = false;
            }
          }
        }
      },
      myDataWindowConfig: {
        type: '', //add modify view 分别表示新增，修改以及查看
        typeStatus: null,
        show: false,
        parent: this,
        title: '',
        height: '620px',
        width: '1000px',
        current: 0,
        readonly: false,
        operationItemId: '',

        form: {
          data: '',
          dataSourceId: '-2',
          dataSourceName: '我的文件',
          filePath: '',
          type: 'file_data',
          tableName: '',
          dataItemList: [],
          description: '',
          dataStandardId: '',
          dcMetadataManage: {
            jsonStr: '',
            id: null
          },
          dataMetadata: {
            id: '',
            name: '',
            dataId: '',
            recentDate: '',
            version: '',
            languageCode: '',
            summary: '',
            northLatitude: '',
            southLatitude: '',
            westLongitude: '',
            eastLongitude: '',
            areaName: '',
            startDate: '',
            endDate: '',
            minVertical: '',
            maxVertical: '',
            verticalUnit: '',
            securityLevel: '',
            responsibleDepartment: '',
            contacts: '',
            job: '',
            telephone: '',
            fax: '',
            address: '',
            zipCode: '',
            email: '',
            netAddress: '',

          },
          dataPermissionList: [],
          id: null,
          name: '',
          remark: null
        },

        method: {
          close () {
            this.myDataWindowConfig.show = false;
            this.clearCheck();
          },
          cancel () {
            this.myDataWindowConfig.show = false;
            this.clearCheck();
          },
          next () {
            if (this.myDataWindowConfig.type != 'viewSteps') {
              //   if (this.checkForm(this.myDataWindowConfig.form) == 0) {
              if (this.validateForm()) {
                this.$refs.steps.next();
              }
            } else {
              this.$refs.steps.next();
            }
          },
          prev () {
            this.$refs.steps.prev();
          },
          confirm () {
            //如果表单没通过验证，就直接return 中断，不走后续代码
            if (this.checkForm(this.myDataWindowConfig.form) > 0) return;
            if (!this.validateForm()) return;
            if (this.myDataWindowConfig.form.type == 'file_data') {
              this.myDataWindowConfig.form.data = this.myDataWindowConfig.form.filePath;
            } else if (this.myDataWindowConfig.form.type == 'table_data') {
              this.myDataWindowConfig.form.data = this.myDataWindowConfig.form.tableName;
            }
            delete this.myDataWindowConfig.form.tableName;
            delete this.myDataWindowConfig.form.dataSourceName;
            delete this.myDataWindowConfig.form.filePath;
            if (this.myDataWindowConfig.type === 'addSteps') {
              var list = { groupInfoList: this.groupInfoList }
              this.myDataWindowConfig.form.dcMetadataManage.jsonStr = JSON.stringify(list)
              this.$http
                .post(this.addSingleDataApi, this.myDataWindowConfig.form)
                .then(
                  res => {
                    if (res.body.status == 'success') {
                      this.search();
                      this.getTip('添加成功!', 'success');
                    } else {
                      this.getTip(res.body.message, 'failed');
                    }
                  },
                  res => {
                    this.getTip(res.body.message, 'failed');
                  }
                );
            } else if (this.myDataWindowConfig.type === 'modifySteps') {
              var list = { groupInfoList: this.groupInfoList }
              //   this.myDataWindowConfig.form.dcMetadataManage.id = ;
              this.myDataWindowConfig.form.dcMetadataManage.jsonStr = JSON.stringify(list)
              this.$http
                .post(this.modifySingleDataApi, this.myDataWindowConfig.form)
                .then(
                  res => {
                    this.myDataWindowConfig.show = false;
                    //新增完按创建时间降序排序，方便查看最新增加的信息
                    if (res.body.status == 'success') {
                      for (var idx in this.gridConfigs.fields) {
                        var field = this.gridConfigs.fields[idx];
                      }
                      this.search();
                      this.getTip('修改成功!', 'success');
                    } else {
                      this.getTip(res.body.message, 'failed');
                    }
                  },
                  res => {
                    this.getTip('修改失败!', 'failed');
                  }
                );
            }
            this.myDataWindowConfig.show = false;
          }
        }
      },
      dataRowWindowConfig: {
        type: '', //add modify view 分别表示新增，修改以及查看
        show: false,
        parent: this,
        title: '',
        height: '600px',
        width: '700px',
        selectConfig: {
          testSelect: '',
          width: '100%',
          height: '35px',
          panelHeight: '200px',
          options: []
        },
        uploadConfig: {
          files: []
        },
        readonly: false,
        form: {
          id: '',
          dataSourceId: '',
          dataId: '',
          fileUrl: '',
          name: '',
          tableName: '',
          type: '',
          option: ''
        },
        files: [],
        method: {
          close () {
            this.dataRowWindowConfig.show = false;
          },
          cancel () {
            this.dataRowWindowConfig.show = false;
          },
          confirm () {
            var formItemList = this.dataRowWindowConfig.form;
            this.myDataWindowConfig.form.dataItemList.push(formItemList);

            if (this.dataRowWindowConfig.type === 'add') {
              this.$http
                .post(this.addSingleDataRowApi, this.dataRowWindowConfig.form)
                .then(
                  res => {
                    if (res.body.status == 'success') {
                      this.searchRow();
                      this.getTip('添加成功!', 'success');
                    } else {
                      this.getTip(res.body.message, 'failed');
                    }
                  },
                  res => {
                    this.getTip(res.body.message, 'failed');
                  }
                );
            } else if (this.dataRowWindowConfig.type === 'modify') {
              this.$http
                .post(
                  this.modifySingleDataRowApi,
                  this.dataRowWindowConfig.form
                )
                .then(
                  res => {
                    this.dataRowWindowConfig.show = false;
                    //新增完按创建时间降序排序，方便查看最新增加的信息
                    if (res.body.status == 'success') {
                      for (var idx in this.gridDataRowConfigs.fields) {
                        var field = this.gridDataRowConfigs.fields[idx];
                      }
                      this.searchRow();
                      this.getTip('修改成功!', 'success');
                    } else {
                      this.getTip(res.body.message, 'failed');
                    }
                  },
                  res => {
                    this.getTip('修改失败!', 'failed');
                  }
                );
            }
            this.dataRowWindowConfig.show = false;
          }
        }
      },
      gridDataRowConfigs: {
        hasCheckbox: false,
        operations: [
          {
            title: '编辑',
            icon: '&#xe909',
            func: this.modifySingleItemRow,
            condition () {
              if (newType !== 'viewSteps') {
                return true;
              } else {
                return false;
              }
            }
          },
          {
            title: '浏览',
            icon: '&#xe9ce',
            func: this.viewSingleItemRow
          },
          {
            title: '删除',
            icon: '&#xe9ac',
            func: this.removeSingleItemRow,
            condition () {
              if (1) {
                return true;
              } else {
                return false;
              }
            }
          }
        ],
        operationType: '',
        operationItem: {},
        getSelectedNames: [],
        getSelectedIds: [],
        fields: [
          {
            title: '名称',
            field: 'name',
            style: {
              width: '20%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '类型',
            field: 'type',
            style: {
              width: '12%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '数据源',
            field: 'dataSourceId',
            style: {
              width: '15%',
              float: 'left',
              textAlign: 'center'
            }
          }
        ],
        currPageNum: 1,
        totalPageNum: 1,
        pageSize: 10,
        api: './api/dataItem/getPage',
        searchFields: {
          dataId: ''
        }
      }
    };
  },
  methods: {
    showTooltip (type, message) {
      this.tooltipConfig = {
        showTooltip: true,
        tooltipType: type,
        tooltipMessage: message
      };
    },
    // 数据规范切换
    standardChange (standardId) {
      this.$http.get(`./api/standardInfo/selectDescribeInfoByStandardId?id=${standardId}`).then(
        res => {
          if ('success' === res.body.status) {
            this.groupInfoList = res.body.content.groupInfoList;
            this.groupInfoList = this.groupInfoList.map(element => {
              element.describeInfoList.map((item) => {
                item.value = ''
                return item;
              })
              return {
                id: element.id,
                name: element.name,
                describeInfoList: element.describeInfoList
              }
            })
          }
        }
      )
    },
    typeChange (type) {
      this.myDataWindowConfig.form.dataSourceId = '';
      this.myDataWindowConfig.form.dataSourceName = '';
    },
    initDataSource () {
      this.myDataWindowConfig.form.dataSourceId = '-2';
      this.myDataWindowConfig.form.dataSourceName = '我的文件';
    },
    //获取目前文件夹组件的面包屑导航的path集合
    getPathArr (pathArr) {
      if (pathArr && pathArr[pathArr.length - 1])
        this.folderConfig.currentPath.path =
          pathArr[pathArr.length - 1].parentPath;
      else this.folderConfig.currentPath.path = '/';
      this.folderConfig.currentPath.sourceId = this.myDataWindowConfig.form.dataSourceId;
    },
    chooseDataSource () {
      this.dataSourceWindowConfig.show = true;
    },
    chooseFile () {
      this.chooseFileWindowConfig.show = true;
    },
    clearCheck () {
      for (var key in this.rules) {
        this.rules[key].show = false;
      }
    },
    checkForm (form) {
      var num = 0;
      for (var key in form) {
        if (form[key] == '') {
          if (key in this.rules) {
            if (this.rules[key].isRequired) {
              this.rules[key].show = true;
              num++;
            }
          }
        } else {
          if (key in this.rules) {
            this.rules[key].show = false;
          }
        }
      }
      console.log(332, this.rules.filePath.show, this.rules)
      return num;
    },
    // 表单验证
    validateForm () {
      if ('' == this.myDataWindowConfig.form.name || this.myDataWindowConfig.form.name.match(/^\s+$/)) {
        this.showTooltip('failed', '请填写数据名称');
        return false;
      }
      if ('' == this.myDataWindowConfig.form.dataStandardId) {
        this.showTooltip('failed', '请选择数据规范');
        return false;
      }
      if ('' == this.myDataWindowConfig.form.type || this.myDataWindowConfig.form.type.match(/^\s+$/)) {
        this.showTooltip('failed', '请选择数据类型');
        return false;
      }
      if ('' == this.myDataWindowConfig.form.dataSourceName || this.myDataWindowConfig.form.dataSourceName.match(/^\s+$/)) {
        this.showTooltip('failed', '请选择数据表');
        return false;
      }
      if ('' == this.myDataWindowConfig.form.dataSourceName || this.myDataWindowConfig.form.dataSourceName.match(/^\s+$/)) {
        this.showTooltip('failed', '请选择数据表');
        return false;
      }
      return true;
    },
    setCondition (flag) {
      this.gridDataRowConfigs.operations.forEach(element => {
        if (element.title == '编辑') {
          element.condition = function () {
            return flag;
          };
        } else if (element.title == '删除') {
          element.condition = function () {
            return flag;
          };
        }
      });
    },
    search () {
      //条件查询时必须将当前页重置为1
      this.$refs.grid.resetCurrentPageNum();
      this.$refs.grid.search();
    },
    dataSourceSearch () {
      //条件查询时必须将当前页重置为1
      this.$refs.dataSourceGrid.resetCurrentPageNum();
      this.$refs.dataSourceGrid.search();
    },
    fileSearch () {
      //条件查询时必须将当前页重置为1
      this.$refs.folder.getFolders();
      this.folderConfig.pathChangeParentFlag = false;
    },
    reset () {
      this.gridConfigs.searchFields.type = '';
      this.gridConfigs.searchFields.sourceType = '';
      this.gridConfigs.searchFields.name = '';
      this.search();
    },
    dataSourceReset () {
      this.dataSourceGridConfigs.searchFields.dataType = '';
      this.dataSourceGridConfigs.searchFields.sourceType = '';
      this.dataSourceGridConfigs.searchFields.name = '';
      this.dataSourceSearch();
    },
    fileReset () {
      this.folderConfig.searchFields.name = '';
      this.fileSearch();
    },
    searchRow () {
      //条件查询时必须将当前页重置为1
      // this.$refs.gridRow.resetCurrentPageNum();
      // this.$refs.gridRow.search();
    },
    dialogCancel () {
      //对值进行重置,不然不会触发change事件
      this.showDialog = false;
    },
    tooltipClosed () {
      this.tooltipConfig.showTooltip = false;
    },
    addSingleItem () {
      //新增时清空数据
      this.tableNameOptions = { options: [] };
      this.myDataWindowConfig.form = {
        dataSourceId: '-2',
        dataSourceName: '我的文件',
        filePath: '',
        type: 'file_data',
        tableName: '',
        dataItemList: [],
        dcMetadataManage: {
          jsonStr: '',
          id: null
        },
        dataMetadata: {
          id: '',
          name: '',
          dataId: '',
          recentDate: '',
          version: '',
          languageCode: '',
          summary: '',
          northLatitude: '',
          southLatitude: '',
          westLongitude: '',
          eastLongitude: '',
          areaName: '',
          startDate: '',
          endDate: '',
          minVertical: '',
          maxVertical: '',
          verticalUnit: '',
          securityLevel: '',
          responsibleDepartment: '',
          contacts: '',
          job: '',
          telephone: '',
          fax: '',
          address: '',
          zipCode: '',
          email: '',
          netAddress: '',

        },
        dataPermissionList: [],
        description: null,
        id: null,
        type: 'file_data',
        name: '',
        remark: null,
      };
      this.myDataWindowConfig.show = true;
      this.setCondition(true);
      this.myDataWindowConfig.title = '新增数据';
      this.myDataWindowConfig.readonly = false;
      this.myDataWindowConfig.type = 'addSteps';
      this.myDataWindowConfig.operationItemId = this.currentUserId;
      this.gridDataRowConfigs.searchFields.dataId = this.currentUserId;
      this.tabConfig.activeTab = 0;
    },
    modifySingleItem (item) {
      //点击操作栏中的“编辑”
      this.myDataWindowConfig.show = true;
      this.myDataWindowConfig.title = '编辑数据信息';
      this.myDataWindowConfig.type = 'modifySteps';
      this.myDataWindowConfig.readonly = false;
      this.$http
        .post(this.getSingleDataApi, {
          id: item.id
        })
        .then(res => {
          var clgInfo = res.body.content[0];
          this.myDataWindowConfig.form = {
            data: clgInfo.data,
            dataSourceId: clgInfo.dataSourceId,
            dataStandardId: clgInfo.dataStandardId,
            dataSourceName:
              clgInfo.dataSourceId == -2 || !clgInfo.dataSource.name ? '我的文件' : clgInfo.dataSource.name,
            type: clgInfo.type,
            filePath: clgInfo.type == 'file_data' ? clgInfo.data : '',
            tableName: clgInfo.type == 'table_data' ? clgInfo.data : '',
            dataItemList: clgInfo.dataItemList,
            dataMetadata: clgInfo.dataMetadata,
            dataPermissionList: clgInfo.dataPermissionList,
            description: clgInfo.description,
            id: clgInfo.id,
            name: clgInfo.name,
            remark: clgInfo.remark,
            dcMetadataManage: {
              jsonStr: '',
              id: null
            }
          };
          this.groupInfoList = JSON.parse(clgInfo.dcMetadataManage.jsonStr).groupInfoList;
          this.myDataWindowConfig.form.dcMetadataManage.id = clgInfo.dcMetadataManage.id;
          if (this.myDataWindowConfig.form.dataMetadata === null) {
            this.myDataWindowConfig.form.dataMetadata = {
              id: '',
              name: '',
              dataId: '',
              recentDate: '',
              version: '',
              languageCode: '',
              summary: '',
              northLatitude: '',
              southLatitude: '',
              westLongitude: '',
              eastLongitude: '',
              areaName: '',
              startDate: '',
              endDate: '',
              minVertical: '',
              maxVertical: '',
              verticalUnit: '',
              securityLevel: '',
              responsibleDepartment: '',
              contacts: '',
              job: '',
              telephone: '',
              fax: '',
              address: '',
              zipCode: '',
              email: '',
              netAddress: '',
            };
          }

          this.setCondition(true);
          this.myDataWindowConfig.readonly = false;
          this.myDataWindowConfig.operationItemId = clgInfo.id;
          this.gridDataRowConfigs.searchFields.dataId = clgInfo.id;
          this.searchRow();
          this.tabConfig.activeTab = 0;
        });
      //   this.standardChange(item.dataStandardId);
    },
    removeSingleItem (item) {
      this.dialogMessage = '确认需要移除：“' + item.name + '”这个数据吗?';
      this.operationType = 'removeSingleItem';
      this.operationItem = item;
      this.showDialog = true;
    },
    batchRemoveData () {
      this.gridConfigs.getSelectedNames = [];
      this.gridConfigs.getSelectedIds = [];
      var selectItems = this.$refs.grid.getSelectedItems();
      if (selectItems.length == 0) {
        this.getTip('请先选择数据!', 'failed');
        return;
      } else {
        for (var i in selectItems) {
          this.gridConfigs.getSelectedIds.push(selectItems[i].id);
          this.gridConfigs.getSelectedNames.push(selectItems[i].name);
        }
        this.dialogMessage =
          '确认要批量删除：“' +
          this.gridConfigs.getSelectedNames +
          '” 的数据吗?';
        this.operationType = 'removeDataBatch';
        this.showDialog = true;
      }
    },
    viewSingleItem (item) {
      //点击操作栏中的“浏览”
      this.myDataWindowConfig.title = '预览数据源';
      this.myDataWindowConfig.type = 'viewSteps';
      this.myDataWindowConfig.show = true;
      this.$http
        .post(this.getSingleDataApi, {
          id: item.id
        })
        .then(res => {
          var clgInfo = res.body.content[0];

          this.myDataWindowConfig.form = {
            data: clgInfo.data,
            dataSourceId: clgInfo.dataSourceId,
            dataStandardId: clgInfo.dataStandardId,
            dataSourceName:
              clgInfo.dataSourceId == -2 ? '我的文件' : clgInfo.dataSource.name,
            type: clgInfo.type,
            filePath: clgInfo.type == 'file_data' ? clgInfo.data : '',
            tableName: clgInfo.type == 'table_data' ? clgInfo.data : '',
            createDate: clgInfo.createDate,
            creator: clgInfo.creator,
            creatorId: clgInfo.creatorId,
            dataItemList: clgInfo.dataItemList,
            dataMetadata: clgInfo.dataMetadata,
            dataPermissionList: clgInfo.dataPermissionList,
            deleteDate: clgInfo.deleteDate,
            deleter: clgInfo.deleter,
            deleterId: clgInfo.deleterId,
            description: clgInfo.description,
            id: clgInfo.id,
            isDelete: clgInfo.isDelete,
            name: clgInfo.name,
            remark: clgInfo.remark,
            updateDate: clgInfo.updateDate,
            updateId: clgInfo.updateId,
            updater: clgInfo.updater,
            updaterId: clgInfo.updaterId
          };
          this.groupInfoList = JSON.parse(clgInfo.dcMetadataManage.jsonStr).groupInfoList;
          if (this.myDataWindowConfig.form.dataMetadata === null) {
            this.myDataWindowConfig.form.dataMetadata = {
              id: '',
              name: '',
              dataId: '',
              recentDate: '',
              version: '',
              languageCode: '',
              summary: '',
              northLatitude: '',
              southLatitude: '',
              westLongitude: '',
              eastLongitude: '',
              areaName: '',
              startDate: '',
              endDate: '',
              minVertical: '',
              maxVertical: '',
              verticalUnit: '',
              securityLevel: '',
              responsibleDepartment: '',
              contacts: '',
              job: '',
              telephone: '',
              fax: '',
              address: '',
              zipCode: '',
              email: '',
              netAddress: '',

            };
          }
          this.setCondition(false);
          this.myDataWindowConfig.readonly = true;
          this.gridDataRowConfigs.searchFields.dataId = clgInfo.id;
          this.tabConfig.activeTab = 0;
        });
    },
    addSingleItemRow () {
      var dataId = this.myDataWindowConfig.operationItemId;
      this.dataRowWindowConfig.form = {
        id: '',
        dataSourceId: '',
        dataId: dataId,
        fileUrl: '',
        name: '',
        tableName: '',
        type: 'default_hdfs_file',
        option: ''
      };
      this.dataRowWindowConfig.show = true;
      this.dataRowWindowConfig.title = '新增数据条目';
      this.dataRowWindowConfig.readonly = false;
      this.dataRowWindowConfig.type = 'add';
    },
    modifySingleItemRow (item) {
      this.$http.get(this.getSingleDataRowApi + item.id).then(res => {
        const clgInfo = res.body.content;
        this.dataRowWindowConfig.form = {
          id: clgInfo.id,
          dataId: clgInfo.dataId,
          dataSourceId: clgInfo.dataSourceId,
          name: clgInfo.name,
          type: clgInfo.type,
          fileUrl: clgInfo.fileUrl,
          tableName: clgInfo.tableName
        };
        this.dataRowWindowConfig.show = true;
        this.dataRowWindowConfig.title = '编辑数据源信息';
        this.dataRowWindowConfig.type = 'modify';
        this.dataRowWindowConfig.readonly = false;
      });
    },
    removeSingleItemRow (item) {
      this.dialogMessage = '确认需要移除' + item.name + '这个数据条目吗?';
      this.operationType = 'removeSingleItemRow';
      this.gridDataRowConfigs.operationItem = item;
      this.showDialog = true;
    },
    viewSingleItemRow (item) {
      this.$http.get(this.getSingleDataRowApi + item.id).then(res => {
        const clgInfo = res.body.content;
        this.dataRowWindowConfig.form = {
          id: clgInfo.id,
          dataId: clgInfo.dataId,
          dataSourceId: clgInfo.dataSourceId,
          name: clgInfo.name,
          type: clgInfo.type
        };
        this.dataRowWindowConfig.show = true;
        this.dataRowWindowConfig.title = '预览数据条目';
        this.dataRowWindowConfig.type = 'view';
        this.dataRowWindowConfig.readonly = true;
      });
    },
    dialogConfirm () {
      this.showDialog = false;
      if (this.operationType == 'removeSingleItem') {
        this.$http.get(this.removeSingleDataApi + this.operationItem.id).then(
          res => {
            this.getTip('删除成功!', 'success');
            this.search();
          },
          res => {
            this.getTip('删除失败!', 'failed');
          }
        );
      } else if (this.operationType == 'removeDataBatch') {
        this.$http
          .post(this.removeDataBatchApi, this.gridConfigs.getSelectedIds)
          .then(
            res => {
              this.getTip('批量删除成功!', 'success');
              this.search();
              this.gridConfigs.getSelectedIds = [];
            },
            res => {
              this.getTip('批量删除失败!', 'failed');
              this.gridConfigs.getSelectedIds = [];
            }
          );
      } else if (this.operationType == 'removeSingleItemRow') {
        this.$http
          .get(
            this.removeSingleDataRowApi +
            this.gridDataRowConfigs.operationItem.id
          )
          .then(
            res => {
              this.getTip('删除成功!', 'success');
              this.searchRow();
              this.gridResMetaConfigs.getSelectedIds = [];
            },
            res => {
              this.getTip('删除失败!', 'failed');
              this.gridResMetaConfigs.getSelectedIds = [];
            }
          );
      }
    },
    isExist (vkey, value) {
      var param = new Object();
      param[vkey] = value;
      if (value != '') {
        this.$http.post(this.orgValidApi, param).then(res => {
          if (res.body.status == 'success') {
            if (vkey == 'name') {
              this.orgWindowConfig.orgNameFlag = true;
            } else if (vkey == 'code') {
              this.orgWindowConfig.orgCodeFlag = true;
            }
          } else {
            if (vkey == 'name') {
              this.orgWindowConfig.orgNameFlag = false;
            } else if (vkey == 'code') {
              this.orgWindowConfig.orgCodeFlag = false;
            }
          }
        });
      } else if (vkey == 'name' && value == '') {
        this.orgWindowConfig.orgNameFlag = false;
      } else if (vkey == 'code' && value == '') {
        this.orgWindowConfig.orgCodeFlag = false;
      }
    },
    //消息提示方法
    getTip (msg, type) {
      this.tooltipConfig = {
        showTooltip: true,
        tooltipMessage: msg,
        tooltipType: type
      };
    }
  },
  created () {
    this.myDataWindowConfig.typeStatus = this.myDataWindowConfig.type;
    this.$http.get('./loginapi/sys/dictionary/getListByCode?code=data_type').then(
      res => {
        res = res.body;
        this.dataTypeOptions.options = res.content;
        this.dataTypeOptions.options.forEach(item => {
          item.value = item.dictCode;
          item.label = item.name;
        });
      },
      err => { }
    );

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
  mounted () {
    // 数据源类型接口
    this.$http.get(this.getDataItemTypeApi).then(res => {
      var arr = res.body.content;
      this.dataRowWindowConfig.selectConfig.options = arr.map((item, index) => {
        item['label'] = item['name'];
        item['value'] = item['dictCode'];
        return item;
      });
    });
    this.$http.get(this.getCurrentUserApi).then(res => {
      this.currentUserId = res.body.content.id;
    });
  },
  computed: {
    rules () {
      return {
        name: {
          tip: '请输入数据名称',
          show: false,
          isRequired: true
        },
        type: {
          tip: '请选择数据类型',
          show: false,
          isRequired: true
        },
        dataSourceName: {
          tip: '请选择数据源',
          show: false,
          isRequired: true
        },
        tableName: {
          tip: '请选择表',
          show: false,
          isRequired: this.myDataWindowConfig.form.type == 'table_data'
        },
        filePath: {
          tip: '请选择文件',
          show: false,
          isRequired: this.myDataWindowConfig.form.type == 'file_data'
        },
        dataStandardId: {
          tip: '请选择数据规范',
          show: false,
          isRequired: true
        }
      };
    },
    setFileUrl: {
      // getter
      get: function () {
        return this.dataRowWindowConfig.files;
      },
      // setter
      set: function (newValue) {
        this.dataRowWindowConfig.files = newValue;
        if (newValue.length > 0) {
          // this.dataRowWindowConfig.form.fileUrl = newValue[0].url;
          let fileNames = '',
            fileUrls = '';
          newValue.forEach(item => {
            fileNames += item.name + ' ; ';
            fileUrls += item.url + ' ; ';
          });
          fileNames = fileNames.slice(0, -2);
          fileUrls = fileUrls.slice(0, -2);
          this.dataRowWindowConfig.form.name = fileNames;
          this.dataRowWindowConfig.form.fileUrl = fileUrls;
        }
      }
    },
    newType () {
      return this.myDataWindowConfig.type;
    }
  },
  watch: {
    'chooseFileWindowConfig.files' (arr) {
      var _this = this;
      if (arr.length) {
        this.$refs.folder.showMask = true;
        setTimeout(() => {
          _this.folderConfig.pathChangeParentFlag = false;
          _this.$refs.folder.getFolders();
          _this.$refs.folder.showMask = false;
        }, 2000);
      }
    },
    newType (val, oldVal) {
      this.myDataWindowConfig.typeStatus = val;
    },
    'dataSourceGridConfigs.searchFields.dataType' (val) {
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
    },
    'myDataWindowConfig.form.dataSourceId' (val) {
      if ('' !== val) {
        this.folderConfig.sourceId = val;
        this.myDataWindowConfig.form.filePath = '';
        this.myDataWindowConfig.form.tableName = '';
        this.$http
          .get(
            './api/dbSource/findAllTable?id=' +
            this.myDataWindowConfig.form.dataSourceId
          )
          .then(
            res => {
              res = res.body;
              if (res.status == 'success') {
                res = res.content;
                this.tableNameOptions.options = res.map(item => {
                  return {
                    label: item,
                    value: item
                  };
                });
              } else {
                this.tableNameOptions.options = [];
              }
            },
            err => {
              this.tableNameOptions.options = [];
            }
          );
      }
    }
  },
  components: {
    Folder,
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
    Step,
    Steps,
    IForm,
    IFormItem,
    IInputbox,
    ITextarea,
    FileUpLoader,
    ITimePicker,
    IItem,
    ISelect,
    DatePicker,
    IButton
  }
};
</script>

<style lang="less">
.uploadBtn {
  .add-btn ~ div {
    display: none;
  }
}
</style>

<style scoped lang="less">
.title {
  font-size: 16px;
  color: #aaa;
  margin-top: 10px;
  margin-bottom: 10px;
}

.fileUpWrap {
  /* position: relative; */
}

.fileUpButton {
  /* position: absolute;
   right: 150px;
   top: 12px; */
}

.toolbar-add {
  height: 27px;
  padding: 0 12px;
  background: #20a0ff;
  color: #fff;
  border-radius: 4px;
  float: right;
  margin-right: 12px;
  letter-spacing: 2px;
}
.disabledDatePicker {
  pointer-events: none;
}
.input-box {
  position: relative;
  .choose-btn {
    position: absolute;
    right: 80px;
    top: 2px;
    height: 32px;
    border-radius: 4px;
    /*background: #13ce66;*/
    background: #20a0ff;
    color: #fff;
    cursor: pointer;
  }
  .choose-btn2 {
    position: absolute;
    right: 0px;
    top: 2px;
    height: 32px;
    border-radius: 4px;
    /*background: #13ce66;*/
    background: #20a0ff;
    color: #fff;
    cursor: pointer;
  }
  .choose-btn3 {
    position: absolute;
    right: 0px;
    top: 2px;
    height: 32px;
    border-radius: 4px;
    /*background: #13ce66;*/
    background: #20a0ff;
    color: #fff;
    cursor: pointer;
  }
}
.win-grid {
  height: calc(100% - 50px);
  border: 1px solid #aaaaaa;
  overflow: auto;
  width: 100%;
}

.win-grid::-webkit-scrollbar {
  /*滚动条整体部分*/
  width: 10px;
  height: 10px;
}

.win-grid::-webkit-scrollbar-thumb {
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
  background-color: #eee;
}
</style>
