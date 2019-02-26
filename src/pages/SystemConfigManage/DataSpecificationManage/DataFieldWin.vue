<template>
  <div>
    <i-window :visible.sync="isShow"
              :title="title"
              :width="width"
              :height="height">
      <div class="win-search-bar">
        <div class="fl control-list-search">
          <span>字段名称:</span>
          <i-inputbox style="width: 150px;height: 30px"
                      placeholder="请输入字段名称"
                      v-model="gridConfigs.searchFields.fieldName" />

          <i-button style="margin-left: 10px; padding: 1px 8px"
                    type="primary"
                    plain
                    @click="search">
            查询
          </i-button>
          <i-button style="padding: 1px 8px"
                    type="primary"
                    plain
                    @click="reset">
            重置
          </i-button>

          <i-button style="padding: 1px 8px;float: right;"
                    type="danger"
                    @click="batchRemoveDataField">
            批量删除
          </i-button>
          <i-button style="padding: 1px 8px;float: right;margin-right: 8px;"
                    type="success"
                    @click="addDataField">
            新增
          </i-button>
          <i-button style="padding: 1px 8px;float: right;margin-right: 8px;"
                    type="success"
                    @click="addFile">
            导入
          </i-button>
        </div>
      </div>
      <div class="win-grid">
        <grid :config="gridConfigs"
              ref="grid">
        </grid>
      </div>

      <div slot="footer"
           style="float:right;margin-right:20px;">
        <i-button type="primary"
                  @click="isShow = false">关闭
        </i-button>
      </div>
    </i-window>

    <!-- 单项操作对话框 -->
    <i-window :visible.sync="dataFieldItemWin.show"
              :title="dataFieldItemWin.title"
              width="680px"
              height="500px">
      <i-form>

        <i-form-item :required="true"
                     label="字段名称">
          <i-inputbox :maxlength=20
                      v-model="form.fieldName"
                      :readonly="readonly">
          </i-inputbox>
        </i-form-item>

        <i-form-item :required="true"
                     label="中文名称">
          <i-inputbox :maxlength=20
                      v-model="form.chineseName"
                      :readonly="readonly">
          </i-inputbox>
        </i-form-item>

        <i-form-item :required="true"
                     label="字段类型">
          <i-select v-model="form.type"
                    width="100%"
                    panelHeight="200px"
                    :disabled="readonly">
            <i-option v-for="item in types"
                      :key="item.value"
                      :value="item.value"
                      :label="item.label">
            </i-option>
          </i-select>
        </i-form-item>

        <i-form-item :required="true"
                     v-if="dataFieldItemWin.type == 'view'"
                     label="序号">
          <i-inputbox v-model="form.orderNum"
                      :readonly="readonly">
          </i-inputbox>
        </i-form-item>

        <i-form-item label="长度">
          <i-inputbox :maxlength=3
                      v-model="form.length"
                      :readonly="readonly">
          </i-inputbox>
        </i-form-item>
      </i-form>
      <div slot="footer"
           style="float:right;margin-right:20px;">
        <i-button v-if="readonly"
                  type="primary"
                  @click="dataFieldItemWin.show = false">
          关闭
        </i-button>

        <i-button v-if="!readonly"
                  plain
                  @click="dataFieldItemWin.show = false">
          取消
        </i-button>

        <i-button v-if="!readonly"
                  type="primary"
                  @click="submit">
          提交
        </i-button>
      </div>
    </i-window>
    <!-- 导入规范的解析字段对话框 -->
    <i-window :visible.sync="fileFieldItemWin.show"
              :title="fileFieldItemWin.title"
              width="700px"
              height="500px">
      <i-form-item label="请选择数据来源">
        <i-radio v-model="chooseType"
                 name="choose"
                 label="1">
          <small>从上传的文件导入</small>
        </i-radio>&nbsp;&nbsp;
        <i-radio v-model="chooseType"
                 name="choose"
                 label="2">
          <small>从数据规范导入</small>
        </i-radio>&nbsp;&nbsp;
        <i-radio v-model="chooseType"
                 name="choose"
                 label="3">
          <small>从提交的资源文件导入</small>
        </i-radio>
      </i-form-item>
      <i-form-item label="选择资源"
                   v-if="chooseType=='3'">
        <i-button type="blue"
                  @click="showResourceList"
                  style="margin-right: 10px;">选择资源
        </i-button>
      </i-form-item>
      <div v-if="this.resourceSelectId!==''&&this.chooseType == '3'&&this.failMessage==''"
           class='fileState'>
        <span class='iconPic'></span>
        <span class='fs'>{{chooseFileItem.fileName}}</span>
        <span class="rightPic"></span>
      </div>
      <i-form-item label="选择文件"
                   v-if="chooseType=='1'">
        <div style="display:inline-block">
          <file-uploader v-model="uploadConfig.files"
                         :multiple="false">
          </file-uploader>
        </div>
      </i-form-item>
      <i-form-item label="数据规范"
                   v-if="chooseType=='2'">
        <tree-select :selectStyle="standardTreeSelectConfig.selectStyle"
                     :api="standardTreeSelectConfig.api"
                     addChildren="standardInfoList"
                     :treeStyleConfig="{leafIcon:'&#xe934;'}"
                     v-model="standardInfo">
        </tree-select>
      </i-form-item>
      <div class='tip'
           v-if="fileForm.length>0">
        字段名只能包含数字、字母和下划线，并以字母开头,Geometry字段类型是唯一的
      </div>
      <div v-if="tipFlag"
           class="tiptxt">{{tipTXT}}
      </div>
      <no-data v-if="fileForm.length == 0"></no-data>
      <table class="table"
             v-if="fileForm.length>0">
        <thead>
          <tr>
            <th scope="col"
                style="50%"
                :key='i'
                v-for="i in uploadFileFieldConfig.title">{{i}}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item,index) in fileForm"
              :key="index">
            <td>
              <i-inputbox v-model="item.fieldName">
              </i-inputbox>
            </td>
            <td>
              <i-inputbox v-model="item.chineseName">
              </i-inputbox>
            </td>
            <td style="position:relative;">
              <i-select v-model="fileForm[index].type"
                        width="85%"
                        panelHeight="200px"
                        :disabled="readonly">
                <i-option v-for="item in types"
                          :key="item.value"
                          :value="item.value"
                          :label="item.label">
                </i-option>
              </i-select>
              <span style="color:red;font-size:18px;position:absolute;top:10px;right:8px;"
                    v-if="item.type == '5'&&showSameTip==true">
                !
              </span>
            </td>
            <td>
              <span v-for="operation in operations"
                    class="operation"
                    @click.stop="operation.func(item)"
                    :title="operation.title"
                    :key="operation.icon"
                    v-html="operation.icon">
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div style="color:blue;font-size:10px;margin-left:25px;"
           v-if="this.showSameTip == true">注：！表示该类型的选项不应该有相同的
      </div>

      <div slot="footer"
           style="float:right;margin-right:20px;">
        <i-button v-if="!readonly"
                  plain
                  @click="fileFieldItemWin.show = false">
          取消
        </i-button>

        <i-button v-if="!readonly"
                  type="primary"
                  :disabled="isDisabled"
                  @click="saveFileField">
          提交
        </i-button>
      </div>
    </i-window>

    <!-- 资源目录版本弹窗 -->
    <resource-list-win @emitCoordinate="setCoordinate"
                       @emitShpField="setShpField"
                       v-if="resourceListWin.show"
                       :visible.sync="resourceListWin.show"
                       :title="resourceListWin.title"
                       :entityId="resourceListWin.entityId"
                       :type="resourceListWin.type">
    </resource-list-win>

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
             :message="tooltipConfig.tooltipMessage"
             @tooltipClosed="tooltipConfig.tooltipShow = false;">
    </tooltip>
  </div>
</template>

<script>
import IWindow from '../../../components/common/IWindow';
import IButton from '../../../components/common/IButton';
import Tooltip from '../../../components/common/OperationStatusTooltip';
import IDialog from '../../../components/common/Dialog';
import IInputbox from '../../../components/common/IInputbox';
import ISelect from '../../../components/DmComponent/ISelect';
import IOption from '../../../components/DmComponent/IOption';
import IRadio from '../../../components/common/IRadio';
import grid from '../../../components/common/grid';
import IForm from '../../../components/common/IForm';
import IFormItem from '../../../components/common/IFormItem';
import FileUploader from '../../../components/common/FileUploader';
import noData from '../../../components/layout/noData';
import TreeSelect from '../../../components/common/TreeSelect';
import resourceListWin from './resourceListWin';

// 最小与最大排序记录
let minOrderNum;
let maxOrderNum;
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    entityId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      // 获取shp文件解析的字段接口
      getShpFieldApi: './api/metaInfo/getFileField',
      //上传文件为execl时获取信息接口
      getCoordinateApi: './api/metaInfo/getExcelField?fileInfoId=',
      //保存文件解析的字段信息接口
      saveFileFieldApi: './api/fieldInfo/saveFieldFromFile',
      // 获取某个规范文件定义字段接口
      getStandardFieldApi: './api/fieldInfo/getByWhere',
      //选择资源列表的文件的是否存在校验接口
      checkResourceFileApi: "./api/fileDownload/isFileExist/",
      oprationItem: null,
      isShow: this.visible,
      width: '1200px',
      height: '580px',
      readonly: false,
      tipFlag: false,
      tipTXT: '导入失败！',
      //资源目录选择项的信息
      resourceSelectId: '',
      chooseFileItem: null,
      // 防止连续点击按钮导致重复导入
      isDisabled: false,
      types: [
        {
          value: '1',
          label: 'String'
        },
        {
          value: '2',
          label: 'Integer'
        },
        {
          value: '3',
          label: 'Date'
        },
        {
          value: '4',
          label: 'Boolean'
        },
        {
          value: '5',
          label: 'Geometry'
        },
        {
          value: '6',
          label: 'Double'
        }
      ],
      //新增文件模式选择
      chooseType: '',
      // 数据规范树形下拉框
      standardTreeSelectConfig: {
        api: './api/theme/getThemeStandardInfo',
        field: 'name',
        selectStyle: {
          width: '100%',
          height: '35px',
          float: 'left'
        }
      },
      //规范信息
      standardInfo: '',
      //上传文件信息
      uploadConfig: {
        files: [],
        id: ''
      },
      //上传文件解析出的字段信息列表
      uploadFileFieldConfig: {
        title: ['字段名', '中文名', '字段类型', '操作'],
        fieldArr: []
      },
      operations: [
        {
          title: '删除',
          icon: '&#xe9ac',
          func: this.deleteFieldDialog
        }
      ],
      // 信息提示
      tooltipConfig: {
        tooltipShow: false,
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

      // 表单
      form: {
        id: '',
        fieldName: '',
        chineseName: '',
        length: '',
        orderNum: '',
        type: '',
        standardInfoId: this.entityId
      },
      //解析的文件字段表单
      fileForm: [],
      //重复字段提示
      showSameTip: true,
      //资源选择文件错误状态信息
      failMessage: '',
      // 数据分页列表
      gridConfigs: {
        // isRightAllow: false,
        operationColumnWidth: '200px',
        selectedId: '',
        getSelectedNames: [],
        getSelectedIds: [],
        maskByParent: true,
        isLoading: true,
        operations: [
          {
            title: '上移',
            icon: '&#xea3a',
            func: this.rowUp,
            condition (row) {
              if (minOrderNum == row.orderNum) {
                return false;
              }
              return true;
            }
          },
          {
            title: '下移',
            icon: '&#xea3e',
            func: this.rowDown,
            condition (row) {
              if (maxOrderNum == row.orderNum) {
                return false;
              }
              return true;
            }
          },
          {
            title: '可显示',
            icon: '&#xe910',
            func: this.fieldPickup,
            style: 'color:#45db5e;font-size:14pt;',
            condition (row) {
              let isShow = row.showNum ? 0 == row.showNum ? true : false : true;
              return isShow;
            }
          },
          {
            title: '不可显示',
            icon: '&#xe911',
            func: this.fieldPickup,
            style: 'color:#fe512e;font-size:14pt;',
            condition (row) {
              if ('1' !== row.showNum) {
                return false;
              }
              return true;
            }
          },
          {
            title: '编辑',
            icon: '&#xe90a',
            func: this.modifyDataField
          },
          {
            title: '查看',
            icon: '&#xe9ce',
            func: this.viewDataField
          },
          {
            title: '删除',
            icon: '&#xe9ac',
            func: this.removeDataField
          }
        ],
        searchFields: {
          standardInfoId: this.entityId,
          fieldName: ''
        },
        fields: [
          {
            title: '字段名',
            field: 'fieldName',
            style: {
              width: '9%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '中文名称',
            field: 'chineseName',
            style: {
              width: '11%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '长度',
            field: 'length',
            style: {
              width: '10%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '字段类型',
            field: 'type',
            style: {
              width: '11%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '序号',
            field: 'orderNum',
            isSortField: true,
            sortType: 'asc',
            style: {
              width: '8%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '创建人',
            field: 'user.chinaname',
            style: {
              width: '11%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '创建时间',
            field: 'createDate',
            style: {
              width: '15%',
              float: 'left',
              textAlign: 'center'
            }
          }
        ],
        currPageNum: 1,
        totalPageNum: 1,
        pageSize: 5,
        api: './api/fieldInfo/getPage',
        searchedCallback (rows) {
          for (var i in rows) {
            var row = rows[i];
            switch (row.type) {
              case '1':
                row.type = 'String';
                break;
              case '2':
                row.type = 'Integer';
                break;
              case '3':
                row.type = 'Date';
                break;
              case '4':
                row.type = 'Boolean';
                break;
              case '5':
                row.type = 'Geometry';
                break;
              case '6':
                row.type = 'Double';
                break;
              default:
                break;
            }
          }
        }
      },

      dataFieldItemWin: {
        show: false,
        title: '',
        type: ''
      },
      //上传文件解析的字段信息对话框
      fileFieldItemWin: {
        show: false,
        title: '',
        type: ''
      },
      // 查看资源弹窗
      resourceListWin: {
        show: false,
        title: '',
        entityId: '',
        type: ''
      }
    };
  },
  computed: {
    fileFieldData () {
      return this.uploadConfig.files[0];
    }
  },
  methods: {
    search (flag) {
      //条件查询时必须将当前页重置为1
      this.gridConfigs.isLoading = !!flag;
      if (flag) {
        this.$refs.grid.resetCurrentPageNum();
      }
      this.$refs.grid.search();
      //刷新大表格
      this.$emit('freshList');
    },
    reset () {
      this.gridConfigs.searchFields.fieldName = '';
      this.search(true);
    },

    // 弹窗
    showDataFieldItemWin (title, type) {
      this.dataFieldItemWin = {
        show: true,
        title: title,
        type: type
      };
    },
    // 上传文件导入弹窗
    showFileFieldItemWin (title, type) {
      this.fileFieldItemWin = {
        show: true,
        title: title,
        type: type
      };
    },
    // 显示资源列表弹窗
    showResourceListWin (id, title, type) {
      this.resourceListWin = {
        show: true,
        entityId: id,
        title: title,
        type: type
      };
    },
    showResourceList () {
      this.showResourceListWin(this.entityId, `资源列表`, 'view');
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

    // 表单非空验证
    validateForm () {
      if ('' == this.form.fieldName) {
        this.showTooltip('failed', '请填写字段名称');
        return false;
      }

      /*let patternFieldName = /^[a-zA-Z][a-zA-Z0-9_]*$/;
      if (!patternFieldName.test(this.form.fieldName)) {
        this.showTooltip(
          'failed',
          '字段名只能包含数字、字母和下划线，并以字母开头'
        );
        return;
      }*/

      if ('' == this.form.chineseName) {
        this.showTooltip('failed', '请填写中文名称');
        return false;
      }

      if ('' == this.form.type) {
        this.showTooltip('failed', '请选择字段类型');
        return false;
      }

      if ('' !== this.form.length && undefined !== this.form.length) {
        let pattern = /^([1-9]\d*|[0]{1,1})$/;
        if (!pattern.test(this.form.length)) {
          this.showTooltip('failed', '长度必须为非负整数');
          return;
        }
      }

      return true;
    },
    //选择资源目录文件是否存在的校验
    checkResourceFile (id) {
      this.$http.get(this.checkResourceFileApi + id).then(
        (res) => {
          if ('success' == res.body.status) {
            if (res.body.content == false) {
              this.showTooltip('failed', res.body.message);
              this.tipFlag = true;
              this.tipTXT = res.body.message
            } else if ((res.body.content == true)) {
              this.tipFlag = false
            }
          } else {
            this.showTooltip('failed', res.body.message);
            this.tipFlag = false
          }
        },
        (res) => {
          this.showTooltip('failed', '服务器异常,请刷新后重试');
        })
    },
    //获取某规范的数据字段
    getStandardField () {
      this.$http
        .post(this.getStandardFieldApi, { standardInfoId: this.standardInfo })
        .then(
          res => {
            this.fileForm = [];
            if (res.body.status == 'success') {
              this.fileForm = res.body.content.map(item => {
                let obj = {
                  fieldName: item.fieldName,
                  chineseName: item.chineseName,
                  type: item.type,
                  standardInfoId: this.entityId
                };
                return obj;
              });
            } else {
              this.showTooltip('failed', res.body.message);
            }
          },
          res => {
            this.showTooltip('failed', '服务器异常,请刷新后重试');
          }
        );
    },

    //字段拾取、不可拾取
    fieldPickup (item) {
      let showNum = '';
      switch (item.showNum) {
        case '1':
          showNum = '0';
          break;
        case '0':
          showNum = '1';
          break;
      }
      this.$http
        .post('./api/fieldInfo/modify', { showNum: showNum, id: item.id, standardInfoId: item.standardInfoId })
        .then(
          res => {
            if ('success' == res.body.status) {
              this.showTooltip('success', '更新状态成功');
              this.search(false);
            }
          },

          res => {
            this.showTooltip('failed', '服务器异常,请刷新后重试');
          }
        );
    },
    // 上移
    rowUp (item) {
      let param = {
        id: item.id,
        orderNum: item.orderNum,
        standardInfoId: item.standardInfoId,
        flag: 'up'
      };
      this.moveRow(param);
    },

    // 下移
    rowDown (item) {
      let param = {
        id: item.id,
        orderNum: item.orderNum,
        standardInfoId: item.standardInfoId,
        flag: 'down'
      };
      this.moveRow(param);
    },

    moveRow (param) {
      this.$http
        .post('./api/fieldInfo/batchUpdateOrderNum', JSON.stringify(param))
        .then(
          res => {
            if ('success' == res.body.status) {
              this.search(false);
            }
          },

          res => {
            this.showTooltip('failed', '服务器异常,请刷新后重试');
            // console.error('unknown error...');
          }
        );
    },

    submit () {
      if (!this.validateForm()) {
        return;
      }
      let message;
      let url;
      this.form.length = this.form.length == '' ? null : this.form.length;
      if ('add' == this.dataFieldItemWin.type) {
        url = './api/fieldInfo/save';
        message = '新增';
      } else if ('modify' == this.dataFieldItemWin.type) {
        url = './api/fieldInfo/modify';
        message = '修改';
      }

      this.$http.post(url, this.form).then(
        res => {
          if ('success' == res.body.status) {
            this.showTooltip('success', message + '成功');
            this.search(true);
            if ('add' == this.dataFieldItemWin.type) {
              this.getAllFieldByEntityId();
            }
          } else {
            this.showTooltip('failed', res.body.message);
          }
        },

        res => {
          this.showTooltip('failed', '服务器异常,请刷新后重试');
        }
      );
    },

    // 查询当前规范下的所有字段
    getAllFieldByEntityId () {
      this.$http
        .post('./api/fieldInfo/getByWhere', { standardInfoId: this.entityId })
        .then(
          res => {
            let filedList = res.body.content;
            if (filedList.length > 0) {
              minOrderNum = filedList[0].orderNum;
              maxOrderNum = filedList[filedList.length - 1].orderNum;
            }
          },
          res => {
            console.error('unknown error...');
          }
        );
    },
    //获取zip文件的解析字段信息
    getShpField (info) {
      let parmas = {
        fileInfoId: ''
      };
      if (this.chooseType == '1') {
        let index = info[0].url.lastIndexOf('/');
        parmas.fileInfoId = info[0].url.substr(index + 1);
      } else if (this.chooseType == '3') {
        parmas.fileInfoId = this.resourceSelectId;
      }
      this.$http.post(this.getShpFieldApi, parmas).then(
        res => {
          if (res.body.status == 'success') {
            this.fileForm = [];
            this.uploadFileFieldConfig.fieldArr =
              res.body.content.fieldInfoList;
            this.fileForm = res.body.content.fieldInfoList.map(item => {
              let obj = {
                fieldName: item.fieldName,
                chineseName: item.fieldName,
                type: item.type,
                standardInfoId: this.entityId
              };
              return obj;
            });
            this.failMessage = '';
            this.resourceListWin.show = false;
          } else {
            this.failMessage = res.body.message;
          }
        },
        res => {
          this.showTooltip('failed', '服务器异常,请刷新后重试');
        }
      );
    },
    //文件为execl时获取信息
    getCoordinate (info) {
      let id;
      if (this.chooseType == '1') {
        let index = info[0].url.lastIndexOf('/');
        id = info[0].url.substr(index + 1);
      } else if (this.chooseType == '3') {
        id = this.resourceSelectId;
      }

      this.$http.get(this.getCoordinateApi + id).then(
        res => {
          if (res.body.status == 'success') {
            this.fileForm = [];
            this.uploadFileFieldConfig.fieldArr = res.body.content;
            this.fileForm = res.body.content.map(item => {
              let obj = {
                fieldName: item.fieldName,
                chineseName: item.fieldName,
                type: item.type,
                standardInfoId: this.entityId
              };
              return obj;
            });
            this.failMessage = '';
            this.resourceListWin.show = false;
          } else {
            this.failMessage = res.body.message;
          }
        },
        res => {
          this.showTooltip('failed', '服务器异常,请刷新后重试');
        }
      );
    },

    //删除字段信息
    deleteFieldDialog (item) {
      this.oprationItem = item;
      this.showDialog(
        'alert',
        '确认要删除字段名为:' + item.fieldName + '的数据吗?',
        'deleteFiled'
      );
    },
    deleteField () {
      this.fileForm = this.fileForm.filter(item => {
        return item.fieldName !== this.oprationItem.fieldName;
      });
    },

    setCoordinate (info) {
      this.resourceSelectId = info.chooseId;
      this.chooseFileItem = info.chooseFileItem;
    },
    setShpField (info) {
      this.resourceSelectId = info.chooseId;
      this.chooseFileItem = info.chooseFileItem;
    },
    //导入规范表单验证
    validateFileForm () {
      let flag = true;
      let count = 0;
      this.showSameTip = false;
      if ('' == this.chooseType) {
        this.showTooltip('failed', '请先完成导入规范');
        return false;
      }
      this.fileForm.forEach(item => {
        /* let reg = /^[a-zA-Z][a-zA-Z0-9_]*$/;
         if (!reg.test(item.fieldName)) {
           this.showTooltip(
             'failed',
             '字段名只能包含数字、字母和下划线，并以字母开头'
           );
           flag = false;
         }*/
        if (item.chineseName == '') {
          this.showTooltip('failed', '中文名称不能为空');
          flag = false;
        }
        if (item.type == '') {
          this.showTooltip('failed', '字段类型不能为空');
          flag = false;
        }
        if (item.type == '5') {
          count++;
          if (count > 1) {
            flag = false;
            this.showSameTip = true;
            this.showTooltip('failed', '！标记的为字段类型相同');
          }
        }
        return flag;
      });

      if (this.chooseType == '1') {
        if (this.uploadConfig.files == 0) {
          this.showTooltip('failed', '请上传文件');
          return false;
        }
      }

      if (this.chooseType == '2') {
        if ('' == this.standardInfo) {
          this.showTooltip('failed', '请选择数据规范');
          flag = false;
        }
      }

      if (this.chooseType == '3') {
        if ('' !== this.failMessage) {
          this.showTooltip('failed', this.failMessage);
          flag = false;
        } else if (this.resourceSelectId == '') {
          this.showTooltip('failed', '请先选择资源');
          flag = false;
        }
      }
      return flag;
    },
    //保存上传文件字段信息接口
    saveFileField () {
      if (!this.validateFileForm()) {
        return;
      }
      this.isDisabled = true;
      let parmas = this.fileForm;
      this.$http.post(this.saveFileFieldApi, parmas).then(
        res => {
          if (res.body.status == 'success') {
            this.showTooltip('success', '导入成功');
            this.getAllFieldByEntityId();
            this.search(true);
            this.fileFieldItemWin.show = false;
          } else {
            this.showTooltip('failed', '导入失败');
          }
          this.isDisabled = false;
        },
        res => {
          this.showTooltip('failed', '服务器异常,请刷新后重试');
        }
      );
    },
    // 新增字段
    addDataField () {
      this.form = {
        id: '',
        fieldName: '',
        chineseName: '',
        length: '',
        orderNum: '',
        type: '',
        standardInfoId: this.entityId
      };
      this.readonly = false;
      this.showDataFieldItemWin('新增字段', 'add');
    },

    //导入文件
    addFile () {
      this.showSameTip = false;
      this.readonly = false;
      this.uploadConfig.files = [];
      this.fileForm = [];
      this.showFileFieldItemWin('导入规范', 'add');
    },
    // 根据id查询
    getById (id) {
      this.$http.get('././api/fieldInfo/getById?id=' + id).then(res => {
        let item = res.body.content;
        this.form = {
          id: item.id,
          fieldName: item.fieldName,
          chineseName: item.chineseName,
          length: item.length,
          orderNum: item.orderNum,
          type: item.type,
          standardInfoId: this.entityId
        };
      });
    },

    // 修改回显
    modifyDataField (item) {
      this.readonly = false;
      this.getById(item.id);
      this.showDataFieldItemWin(`修改字段-${item.fieldName}`, 'modify');
    },

    // 查看
    viewDataField (item) {
      this.readonly = true;
      this.getById(item.id);
      this.showDataFieldItemWin(`查看字段(只读)-${item.fieldName}`, 'view');
    },

    removeDataField (item) {
      this.gridConfigs.selectedId = item.id;
      this.showDialog(
        'alert',
        '确认要删除字段名为:' + item.fieldName + '的数据吗?',
        'removeField'
      );
    },

    batchRemoveDataField () {
      this.gridConfigs.getSelectedNames = [];
      this.gridConfigs.getSelectedIds = [];
      var selectItems = this.$refs.grid.getSelectedItems();
      if (selectItems.length == 0) {
        this.showTooltip('failed', '请选择至少一条数据');
      } else {
        for (var i in selectItems) {
          this.gridConfigs.getSelectedIds.push(selectItems[i].id);
          this.gridConfigs.getSelectedNames.push(selectItems[i].fieldName);
        }
        this.showDialog(
          'alert',
          `确认要批量删除字段名为：${this.gridConfigs.getSelectedNames.join(
            '、'
          )}的数据吗?`,
          'batchRemove'
        );
      }
    },

    // 删除操作
    dialogConfirm () {
      this.closeDialog();
      if ('removeField' == this.dialogConfig.operationType) {
        this.$http
          .get(
            './api/fieldInfo/removeFromDbById?id=' + this.gridConfigs.selectedId
          )
          .then(
            res => {
              this.gridConfigs.selectedId = '';
              if ('success' == res.body.status) {
                this.showTooltip('success', '删除成功');
                this.search();
              } else {
                this.showTooltip('success', '删除失败');
              }
            },
            res => {
              this.gridConfigs.selectedId = '';
              this.showTooltip('failed', '服务器异常,请刷新后重试');
            }
          );
      } else if ('batchRemove' == this.dialogConfig.operationType) {
        this.$http
          .post(
            './api/fieldInfo/batchRemoveFromDb',
            this.gridConfigs.getSelectedIds
          )
          .then(
            res => {
              if ('success' == res.body.status) {
                this.showTooltip('success', '批量删除成功');
                this.search();
              } else {
                this.showTooltip('failed', '批量删除失败');
              }
            },
            res => {
              this.showTooltip('failed', '服务器异常,请刷新后重试');
            }
          );
      } else if ('deleteFiled' == this.dialogConfig.operationType) {
        this.deleteField();
      }
    }
  },
  watch: {
    visible (val) {
      this.isShow = val;
    },
    isShow (val) {
      //为true表示显示当前Window
      if (val) {
        this.getAllFieldByEntityId();
        this.resourceSelectId = '';
        this.chooseFileItem = null;

        this.gridConfigs.searchFields = {
          standardInfoId: this.entityId,
          fieldName: ''
        };
      } else {
        //通过向父组件传递事件的方式修改visible属性所对应的变量的值
        this.$emit('update:visible', val);
      }
    },
    'tooltipConfig.tooltipShow': function (val) {
      // 当tooltip关闭后，如果是成功类型的说明操作成功了，此时一并将Window一起关闭
      if (!val && 'success' == this.tooltipConfig.tooltipType) {
        this.dataFieldItemWin.show = false;
      }
    },
    'uploadConfig.files': {
      handler (val) {
        if (val[0] && val[0].name && val[0].url && val[0].url.length > 0) {
          const fileType = val[0].name.substr(val[0].name.lastIndexOf('.') + 1);
          const index = this.uploadConfig.files[0].url.lastIndexOf("\/");
          const id = this.uploadConfig.files[0].url.substring(index + 1, this.uploadConfig.files[0].url.length);
          if (fileType === 'xls' || fileType === 'xlsx') {
            this.checkResourceFile(id);
            this.getCoordinate(val);
          } else {
            this.checkResourceFile(id);
            this.getShpField(val);
          }
        }
      },
      deep: true
    },
    chooseFileItem: {
      handler (val) {
        if (val) {
          const fileType = val.fileName.substr(
            val.fileName.lastIndexOf('.') + 1
          );
          if (fileType === 'xls' || fileType === 'xlsx') {
            this.getCoordinate();
          } else {
            this.getShpField();
          }
        }
      },
      deep: true
    },
    standardInfo: function (val) {
      if (val.length > 0) {
        this.getStandardField();
      }
    },
    'fileFieldItemWin.show': function (val) {
      if (val == false) {
        this.chooseType = '';
        this.standardInfo = '';
      } else {
        this.tipFlag = false;
      }
    },
    chooseType (val) {
      this.fileForm = [];
      this.uploadConfig.files = [];
      this.standardInfo = '';
      this.resourceSelectId = '';
      this.chooseFileItem = null;
      this.failMessage = '';
      if (val == '3') {
        // this.showResourceListWin('', `资源列表`, 'view');
      }
    }
  },
  mounted () {
  },
  components: {
    IWindow,
    IButton,
    Tooltip,
    IDialog,
    IInputbox,
    ISelect,
    IOption,
    grid,
    IFormItem,
    IForm,
    FileUploader,
    noData,
    IRadio,
    TreeSelect,
    resourceListWin
  }
};
</script>

<style scoped lang="scss">
.fileState {
  margin: 10px auto;
  width: calc(100% - 240px);
  height: 30px;
  line-height: 30px;
  & .iconPic {
    float: left;
    margin-left: 5px;
    margin-right: 5px;
    &:before {
      font-family: iconfont;
      content: "\E925";
    }
  }

  & .rightPic {
    float: right;
    margin-right: 5px;
    color: #00b83f;
    &:before {
      font-family: iconfont;
      content: "\E63B";
    }
  }
  &:hover {
    cursor: pointer;
    background-color: #f5f7fa;
    border-radius: 4px;
    transition: background-color 0.5s;
    & .fs {
      color: #409eff;
    }
  }
}

.operation {
  font-family: iconfont;
  padding: 8px;
}

.operation:hover {
  cursor: pointer;
  background-color: #cccccc;
  color: #0374d0;
  -webkit-transition: background-color 0.5s;
  -moz-transition: background-color 0.5s;
  -ms-transition: background-color 0.5s;
  -o-transition: background-color 0.5s;
  transition: background-color 0.5s;
}

.tip {
  margin-left: 25px;
  font-size: 12px;
  color: #999;
  float: left;
}

.table {
  width: calc(100% - 50px);
  margin: 0 auto;
  font-size: 12px;
  text-align: center;
  border-collapse: collapse;
  border: 1px solid #e8edff;
}

.table-row li {
  height: 100%;
  cursor: default;
  white-space: nowrap;
  /* text-overflow: ellipsis; */
  overflow: hidden;
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

.colorSelect {
  color: blue;
}

.model_type {
  font-size: 12px;
}

.tiptxt {
  height: 40px;
  line-height: 40px;
  background-color: #dff0d8;
  border-color: #d6e9c6;
  color: #3c763d;
  text-align: center;
  width: 60%;
  margin: 0 auto;
}

.win-grid {
  height: calc(100% - 50px);
  border: 1px solid #aaaaaa;
  overflow: auto;
}

.win-search-bar {
  width: 100%;
  background-color: #eff1f5;
  padding: 8px 10px;
  border: 1px solid #aaa;
  border-bottom: 0px;
  overflow: hidden;
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
