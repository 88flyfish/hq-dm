<template>
  <div>
    <i-window :visible.sync="isShow"
              :title="title"
              :width="width"
              height="520px">
      <i-form>
        <i-form-item label="审核结果"
                     v-if="type=='check'">
          <i-radio v-model="form.applyStatus"
                   name="check"
                   label="3">
            <small>批准</small>
          </i-radio>&nbsp;&nbsp;
          <i-radio v-model="form.applyStatus"
                   name="check"
                   label='2'>
            <small>驳回</small>
          </i-radio>
        </i-form-item>
        <i-form-item label="授权编辑"
                     v-if="(status == '待审核'||status == '')&&form.applyStatus!=='2'">
          <i-radio v-model="form.allowEdit"
                   name="check"
                   label="1">
            <small>是</small>
          </i-radio>&nbsp;&nbsp;
          <i-radio v-model="form.allowEdit"
                   name="check"
                   label='2'>
            <small>否</small>
          </i-radio>
        </i-form-item>
        <i-form-item label="驳回原因描述"
                     v-if="form.applyStatus!=='3'&& (status == '审核未通过'||status == '')">
          <i-textarea style="height: 60px;"
                      :disabled="form.applyStatus!=='2'&& status == ''"
                      v-model="form.rejectReason"
                      :readonly="form.applyStatus!=='2'&& status == ''">
          </i-textarea>
        </i-form-item>
        <i-form-item label="服务资源"
                     v-if="form.applyStatus!=='2'&& (status == '已通过'||status == '')"
                     style="position:relative">
          <i-inputbox v-model="chooseName.aliasname"
                      :readonly="true">

          </i-inputbox>
          <i-button class='btn'
                    :class="{active:gridType==1,enable:form.applyStatus!=='3'&& status == ''}"
                    :disabled="form.applyStatus!=='3'&& status == ''"
                    @click="resourceChoose">
            选择资源
          </i-button>
        </i-form-item>

        <div style="width:100%;background-color:#eff1f5;padding: 12px 10px;border:1px solid #aaaaaa;border-bottom: 0px;margin-top:10px;overflow:hidden"
             v-show="form.applyStatus=='3'&&gridType!==0 || status =='已处理'&&gridType!==0">
          <div class="fl control-list-search"
               v-if="gridType==1">
            <span>
              <span class='title'>资源列表</span>
              关键字:
            </span>
            <i-inputbox style="width: 150px;height: 30px;margin-right:10px"
                        placeholder="请输入关键字"
                        v-model="resourceGridConfigs.searchFields.keyWord" />
            <span>坐标系:</span>
            <i-select width="170px"
                      height="30px"
                      panel-height="150px"
                      v-model="resourceGridConfigs.searchFields.coordinateType">
              <i-option v-for="item in selectConfig.gisOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label">
              </i-option>
            </i-select>
            <i-button style="margin-left: 10px; padding: 1px 8px"
                      type="primary"
                      plain
                      @click="searchResource">
              查询
            </i-button>
            <i-button style="padding: 1px 8px"
                      type="primary"
                      plain
                      @click="resetResource">
              重置
            </i-button>
          </div>
        </div>
        <div class="win-grid"
             v-show="form.applyStatus=='3'&&gridType!==0 || status =='已处理'&&gridType!==0">
          <div class="gridBox">
            <grid :config="resourceGridConfigs"
                  ref="resourceGrid"
                  v-show="gridType==1"></grid>
          </div>
        </div>
      </i-form>
      <div slot="footer"
           style="float:right;margin-right:20px;">
        <i-button plain
                  @click="isShow = false">
          取消
        </i-button>
        <i-button type="primary"
                  @click="submit">
          提交
        </i-button>
      </div>

      <!-- 确认操作的提示框 -->
      <i-dialog v-if="dialogConfig.showDialog"
                :message="dialogConfig.dialogMessage"
                :type="dialogConfig.type"
                @dialogCancel="dialogCancel"
                @dialogConfirm="dialogConfirm">
      </i-dialog>

      <!-- 数据配置提示信息-->
      <i-dialog v-if="metaConfig.showDialog"
                :message="metaConfig.dialogMessage"
                :type="metaConfig.type"
                @dialogCancel="metaConfigCancel"
                @dialogConfirm="metaConfigConfirm">
      </i-dialog>

    </i-window>

    <!--　用于显示信息的提示工具　-->
    <tooltip :show.sync="tooltipConfig.tooltipShow"
             :showType="tooltipConfig.tooltipType"
             :message="tooltipConfig.tooltipMessage"
             @tooltipClosed="tooltipConfig.tooltipShow = false;">
    </tooltip>
  </div>

</template>

<script>
import IWindow from '../../components/common/IWindow';
import grid from '../../components/common/grid.vue';
import IForm from '../../components/common/IForm';
import IFormItem from '../../components/common/IFormItem';
import IInputbox from '../../components/common/IInputbox';
import ITextarea from '../../components/common/ITextarea';
import IRadio from '../../components/common/IRadio';
import tooltip from '../../components/common/OperationStatusTooltip';
import IButton from '../../components/common/IButton';
import IDialog from '../../components/common/Dialog.vue';
import ISelect from '../../components/DmComponent/ISelect';
import IOption from '../../components/DmComponent/IOption';
export default {
  name: 'check-resource-win',

  inject: ['getStatisticsInfo'],

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
    },
    deptId: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: ''
    }
  },
  data () {
    var that = this;
    return {
      //获取单个文件信息
      getDirectoryFileInfoApi: './api/directoryFileInfo/getById?id=',
      checkServiceResourceApi:
        './api/directoryFileInfo/checkServiceResource?id=',
      width: '900px',
      height: '520px',
      isShow: this.visible,
      gridType: 0,
      readonly: false,
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
      metaConfig: {
        name: 'meta',
        showDialog: false,
        dialogMessage: '',
        type: 'error',
        operationType: ''
      },
      //下拉框
      selectConfig: {
        gisOptions: [
          {
            value: 'EPSG:4490',
            label: 'CGCS2000'
          },
          {
            value: 'EPSG:2435',
            label: '深圳独立坐标系'
          },
          {
            value: 'EPSG:4326',
            label: 'WGS84'
          }
        ]
      },
      // 表单
      form: {
        id: this.entityId,
        //'1'待审核 '2'审核未通过 '3'已通过'
        applyStatus: '',
        rejectReason: '',
        resourceId: '',
        metadataId: '',
        allowEdit: ''
      },
      chooseName: {
        aliasname: ''
      },
      // 资源列表
      resourceGridConfigs: {
        rowChecked: false,
        operationColumnWidth: '80px',
        hasCheckbox: false,
        selectedId: '',
        getSelectedIds: [],
        getSelectedNames: [],
        searchFields: {
          keyWord: '',
          coordinateType: '',
          deptId: ''
        },
        operations: [
          {
            title: '选择',
            icon: '&#xe9ba',
            func: this.pickResource
          }
        ],
        fields: [
          {
            title: '资源服务名称',
            field: 'resourceName',
            style: {
              width: '20%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '资源服务别名',
            field: 'aliasname',
            style: {
              width: '16%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '发布单位',
            field: 'deptName',
            style: {
              width: '15%',
              float: 'right',
              textAlign: 'center'
            }
          },
          {
            title: '坐标系统',
            field: 'coordinateType',
            style: {
              width: '12%',
              float: 'right',
              textAlign: 'center'
            }
          },
          {
            title: '描述信息',
            field: 'abstractName',
            style: {
              textAlign: 'center'
            }
          }
        ],
        searchedCallback: function (rows) {
          rows.forEach(row => {
            row.coordinateType = that.enCS(row.coordinateType);
          });
        },
        currPageNum: 1,
        totalPageNum: 1,
        pageSize: 5,
        api: './api/directoryFileInfo/getDeptResourcePage'
      }
    };
  },
  methods: {
    metaConfigCancel () {
      this.metaConfig.showDialog = false;
    },
    metaConfigConfirm () {
      this.metaConfig.showDialog = false;
    },
    // 条件查询资源目录
    searchResource () {
      this.resourceGridConfigs.isLoading = false;
      //条件查询时必须将当前页重置为1
      this.$refs.resourceGrid.resetCurrentPageNum();
      this.$refs.resourceGrid.search();
    },
    // 重置查询条件资源目录
    resetResource () {
      this.resourceGridConfigs.searchFields.keyWord = '';
      this.resourceGridConfigs.searchFields.coordinateType = '';
      this.searchResource();
    },
    // 显示对话框
    showDialog (type, message, operationType) {
      this.dialogConfig = {
        show: true,
        dialogMessage: message,
        operationType: operationType,
        type: type
      };
    },
    // 信息提示
    showTooltip (type, message) {
      this.tooltipConfig = {
        tooltipType: type,
        tooltipMessage: message,
        tooltipShow: true
      };
    },

    // 关闭对话框
    closeDialog () {
      this.dialogConfig.show = false;
    },

    resourceChoose () {
      this.resourceGridConfigs.searchFields.deptId = this.deptId;
      this.gridType = 1;
      this.searchResource();
    },
    // metadataChoose () {
    //     this.gridType = 2;
    //     this.searchMeta();
    // },
    //选择
    pickResource (item) {
      this.$http.get(this.checkServiceResourceApi + item.id).then(res => {
        var obj = JSON.parse(res.bodyText);
        if (obj.status == 'fail') {
          this.metaConfig.showDialog = true;
          this.metaConfig.dialogMessage =
            '该资源未配置关联的数据信息，请确认该资源是否正确发布！\n';
        } else {
          this.chooseName.aliasname = item.aliasname;
          this.form.resourceId = item.id;
          this.form.metadataId = obj.content;
          this.$refs.resourceGrid.rows = this.$refs.resourceGrid.rows.map(
            item => {
              item.isChecked = false;
              return item;
            }
          );
          item.isChecked = true;
        }
      });
    },

    //获取单个文件信息
    getDirectoryFileInfo () {
      this.$http.get(this.getDirectoryFileInfoApi + this.entityId).then(
        res => {
          if ('success' == res.body.status) {
            let resInfo = res.body.content;
            this.form = {
              id: this.entityId,
              applyStatus: resInfo.applyStatus,
              rejectReason: resInfo.rejectReason,
              resourceId: resInfo.resourceId,
              allowEdit: resInfo.allowEdit,
              metadataId: resInfo.metadataId
            };
            this.chooseName = {
              aliasname: resInfo.aliasname
            };
          } else {
            this.showTooltip('failed', res.body.message);
          }
        },

        res => {
          this.showTooltip('failed', '服务器异常,请刷新后重试');
        }
      );
    },
    // 表单验证
    validateForm () {
      if ('0' == this.form.applyStatus) {
        this.showTooltip('failed', '请完成审核');
        return false;
      }
      if (
        '2' == this.form.applyStatus &&
        ('' == this.form.rejectReason ||
          this.form.rejectReason.match(/^\s+$/)) &&
        this.status !== '已通过'
      ) {
        this.showTooltip('failed', '描述信息不能为空');
        return false;
      }
      if (
        '3' == this.form.applyStatus &&
        '' == this.form.resourceId &&
        this.status !== '审核未通过'
      ) {
        this.showTooltip('failed', '请选择资源文件');
        return false;
      }
      return true;
    },
    // 提交表单
    submit () {
      if (!this.validateForm()) {
        return;
      }
      let message;

      if (this.type == 'check') {
        message = '审核';
      } else if (this.type == 'modify') {
        message = '修改';
      }
      if (
        this.form.applyStatus !== '2' &&
        this.status !== '审核未通过' &&
        (!this.form.metadataId || this.form.metadataId == '')
      ) {
        this.metaConfig.showDialog = true;
        this.metaConfig.dialogMessage =
          '该资源未配置关联的数据信息，请确认该资源是否正确发布！';
        return;
      }
      this.form.id = this.entityId;
      this.$http.post('./api/directoryFileInfo/modify', this.form).then(
        res => {
          if ('success' == res.body.status) {
            this.showTooltip('success', message + '成功');
            this.$emit('freshGrid');
            // 刷新面板中的数字
            this.getStatisticsInfo();
          } else {
            this.showTooltip('failed', res.body.message);
          }
        },

        res => {
          this.showTooltip('failed', '服务器异常,请刷新后重试');
        }
      );
    },

    enCS (src) {
      switch (src) {
        case 'EPSG:4326':
          return 'WGS84';
        case 'EPSG:4490':
          return 'CGCS2000';
        case 'EPSG:2435':
          return '深圳独立坐标系';
        default:
          return;
      }
    },
    deCS (src) {
      switch (src) {
        case 'WGS84':
          return 'EPSG:4326';
        case 'CGCS2000':
          return 'EPSG:4490';
        case '深圳独立坐标系':
          return 'EPSG:2435';
        default:
          return;
      }
    }
  },
  mounted () { },
  watch: {
    visible (val) {
      this.isShow = val;
    },
    isShow (val) {
      //为true表示显示当前Window
      if (val) {
        if (this.type == 'check') {
          this.width = '900px';
          this.height = '520px';
          this.form = {
            id: this.entityId,
            applyStatus: '3',
            rejectReason: '',
            resourceId: '',
            allowEdit: '1',
            metadataId: ''
          };
          this.chooseName = {
            aliasname: ''
          };
          this.gridType = 0;
        } else if (this.type == 'modify') {
          this.gridType = 0;
          this.getDirectoryFileInfo();
          if (this.status == '审核未通过') {
            this.width = '900px';
            this.height = '200px';
          } else if (this.status == '已通过') {
            this.width = '900px';
            this.height = '520px';
          }
        }
      } else {
        //通过向父组件传递事件的方式修改visible属性所对应的变量的值
        this.$emit('update:visible', val);
      }
    },

    'form.applyStatus': function (val) {
      if (val !== '0' && this.type == 'check') {
        this.form.rejectReason = '';
        this.form.resourceId = '';
        this.form.metadataId = '';
        this.chooseName = {
          aliasname: ''
        };
        this.gridType = 0;
        // this.$refs.resourceGrid.rows = [];
        // this.$refs.metaGrid.rows = [];
      }
    },
    'tooltipConfig.tooltipShow': function (val) {
      // 当tooltip关闭后，如果是成功类型的说明操作成功了，此时一并将Window一起关闭
      if (!val && 'success' == this.tooltipConfig.tooltipType) {
        this.isShow = false;
        this.gridType = 0;
      }
    }
  },

  components: {
    grid,
    IButton,
    IInputbox,
    IFormItem,
    IForm,
    IWindow,
    tooltip,
    ITextarea,
    IRadio,
    IDialog,
    ISelect,
    IOption
  }
};
</script>

<style scoped lang="scss">
.btn {
  border: none;
  padding: 0;
  display: inline-block;
  position: absolute;
  right: 119px;
  top: 20px;
  width: 80px;
  height: 34px;
  border-radius: 4px;
  /*background: #13ce66;*/
  background: #2a9ff8 !important;
  text-align: center;
  color: #fff !important;
  cursor: pointer;
  &:hover {
    opacity: 0.7;
  }
}
.active {
  background: #046ab8 !important;
}
.enable {
  cursor: not-allowed;
  background-color: #ccc !important;
}
.gridBox {
  border: 1px solid #ccc;
  border-radius: 5px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
}
.title {
  font-size: 14px;
  font-weight: 600;
  margin-right: 20px;
}

.win-grid {
  border: 1px solid #aaaaaa;
  overflow: auto;
}

.win-grid::-webkit-scrollbar { /*滚动条整体部分*/
  width: 8px;
  height: 10px;
}

.win-grid::-webkit-scrollbar-thumb {
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .2);
  background-color: #eee;
}
</style>
