<template>
  <div>

    <my-window :visible.sync="isShow"
               :title="title"
               :width="width"
               :height="height">
      <div class="win-search-bar">
        <div class="fl control-list-search">
          <span>描述项名称:</span>
          <i-inputbox style="width: 150px;height: 30px"
                      placeholder="请输入描述项名称"
                      v-model="gridConfigs.searchFields.name" />

          <i-button style="margin-left: 10px; padding: 1px 8px"
                    type="primary"
                    plain
                    @click="searchDes">
            查询
          </i-button>
          <i-button style="padding: 1px 8px"
                    type="primary"
                    plain
                    @click="resetDes">
            重置
          </i-button>

          <i-button style="padding: 1px 8px;float: right;"
                    type="danger"
                    @click="batchRemoveDes">
            批量删除
          </i-button>
          <i-button style="padding: 1px 8px;float: right;margin-right: 8px;"
                    type="success"
                    @click="addDes">
            新增
          </i-button>
        </div>
      </div>
      <div class="win-grid">
        <grid :config="gridConfigs"
              ref="grid"></grid>
      </div>

      <div slot="footer"
           style="float:right;margin-right:20px;">
        <i-button type="primary"
                  @click="isShow = false">
          关闭
        </i-button>
      </div>
    </my-window>

    <!-- 组别描述新增弹窗 -->
    <my-window :visible.sync="desWindowConfig.show"
               :title="desWindowConfig.title"
               :width="desWindowConfig.width"
               :height="desWindowConfig.height">
      <i-form>
        <i-form-item label="描述项名称"
                     :required="!desWindowConfig.readonly">
          <i-inputbox :maxlength=10
                      v-model="form.name"
                      :readonly="desWindowConfig.readonly"></i-inputbox>
        </i-form-item>

        <i-form-item label="序号"
                     :required="!desWindowConfig.readonly">
          <i-inputbox v-model="form.orderNum"
                      :readonly="desWindowConfig.readonly"
                      :maxlength=4></i-inputbox>
        </i-form-item>

        <i-form-item label="描述说明">
          <i-textarea style="height: 80px;"
                      v-model="form.des"
                      :readonly="desWindowConfig.readonly"
                      :maxlength=50>
          </i-textarea>
        </i-form-item>
      </i-form>

      <div slot="footer"
           style="float:right;margin-right:20px">
        <i-button @click="cancel"
                  v-if="!desWindowConfig.readonly">
          取消
        </i-button>
        <i-button type="primary"
                  @click="cancel"
                  v-if="desWindowConfig.readonly">
          关闭
        </i-button>
        <i-button type="primary"
                  @click="submit"
                  v-if="!desWindowConfig.readonly">
          提交
        </i-button>
      </div>
    </my-window>

    <!-- 确认操作的提示框 -->
    <i-dialog v-if="dialogConfig.showDialog"
              :message="dialogConfig.dialogMessage"
              :type="dialogConfig.type"
              @dialogCancel="dialogCancel"
              @dialogConfirm="dialogConfirm"></i-dialog>

    <!--　用于显示信息的提示工具　-->
    <tooltip :show.sync="tooltipConfig.showTooltip"
             :showType="tooltipConfig.tooltipType"
             :message="tooltipConfig.tooltipMessage"
             @tooltipClosed="tooltipConfig.tooltipShow = false;"></tooltip>

  </div>
</template>

<script>
import MyWindow from '../../../components/common/IWindow.vue';
import IButton from '../../../components/common/IButton';
import Tooltip from '../../../components/common/OperationStatusTooltip';
import IDialog from '../../../components/common/Dialog';
import IInputbox from '../../../components/common/IInputbox';
import grid from '../../../components/common/grid';
import IForm from '../../../components/common/IForm';
import IFormItem from '../../../components/common/IFormItem';
import ITextarea from "../../../components/common/ITextarea";

export default {
  name: 'group-des-win',
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
    type: {
      type: String,
      default: ''
    }
  },
  components: {
    ITextarea,
    IButton,
    Tooltip,
    IDialog,
    IInputbox,
    grid,
    MyWindow,
    IForm,
    IFormItem
  },
  data () {
    return {
      isShow: this.visible,
      width: '960px',
      height: '580px',
      //查看描述项信息
      desInfoApi: './api/describeInfo//getById?id=',
      //确认编辑描述项信息
      desModifyApi: './api/describeInfo/modify',
      //确认新增描述项
      desAddApi: './api/describeInfo/save',
      //单个删除描述项
      desDeleteApi: './api/describeInfo/removeFromDbById?id=',
      //确认批量删除描述项
      desRemoveApi: './api/describeInfo/batchRemoveFromDb',
      //消息提示
      tooltipConfig: {
        showTooltip: false,
        tooltipType: '',
        tooltipMessage: ''
      },
      operationItem: {
        id: ''
      },
      // 对话框
      dialogConfig: {
        showDialog: false,
        dialogMessage: '',
        operationType: '',
        type: ''
      },
      // 数据分页列表
      gridConfigs: {
        maskByParent: true,
        hasCheckbox: true,
        searchFields: {
          groupInfoId: this.entityId,
          name: ''
        },
        operations: [
          {
            title: '编辑',
            icon: '&#xe90a;',
            func: this.modifyDes
          },
          {
            title: '查看',
            icon: '&#xe9ce;',
            func: this.viewDes
          },
          {
            title: '删除',
            icon: '&#xe9ac;',
            func: this.removeDes
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
            title: '描述项名称',
            field: 'name',
            style: {
              textAlign: 'center',
              float: 'left',
              width: '11%'
            }
          },
          {
            title: '序号',
            field: 'orderNum',
            isSortField: true,
            sortType: 'asc',
            style: {
              textAlign: 'center',
              float: 'left',
              width: '10%'
            }
          },
          {
            title: '描述说明',
            field: 'des',
            style: {
              float: 'left',
              width: '14%',
              textAlign: 'center'
            }
          },
          {
            title: '创建时间',
            field: 'createDate',
            isSortField: true,
            style: {
              float: 'left',
              width: '18%',
              textAlign: 'center'
            }
          },
          {
            title: '创建人',
            field: 'user.chinaname',
            isSortField: true,
            style: {
              float: 'left',
              width: '15%',
              textAlign: 'center'
            }
          }
        ],
        currPageNum: 1,
        totalPageNum: 1,
        pageSize: 5,
        api: './api/describeInfo/getPage'
      },
      // 描述项的新增弹窗
      desWindowConfig: {
        show: false,
        title: '',
        width: '600px',
        height: '400px',
        entityId: '',
        type: '',
        readonly: true
      },
      form: {
        groupInfoId: this.entityId,
        id: '',
        name: '',
        des: '',
        orderNum: ''
      }
    };
  },
  methods: {
    // 显示消息提示
    showTooltip (type, message) {
      this.tooltipConfig = {
        tooltipType: type,
        tooltipMessage: message,
        showTooltip: true
      };
    },

    // 条件查询
    searchDes () {
      //条件查询时必须将当前页重置为1
      this.$refs.grid.resetCurrentPageNum();
      this.$refs.grid.search();
    },

    // 重置查询条件
    resetDes () {
      this.gridConfigs.searchFields.name = '';
      this.searchDes();
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
    // 对话框确认操作
    dialogConfirm () {
      this.closeDialog();
      let message = this.dialogConfig.operationType == 'batchRemove' ? '批量' : '';
      this.$http.post('./api/describeInfo/batchRemoveFromDb', this.gridConfigs.getSelectedIds).then(
        res => {
          if ('success' == res.body.status) {
            this.showTooltip('success', message + '删除成功');
            this.searchDes();
          } else {
            this.showTooltip('failed', res.body.message);
          }
        },

        res => {
          this.showTooltip('failed', '服务器异常,请刷新后重试');
        }
      );
    },

    // 新增描述项弹窗
    addDes () {
      this.desWindowConfig.show = true;
      this.desWindowConfig.title = '新增描述项';
      this.desWindowConfig.type = 'add';
    },

    //查看当前描述项
    viewDes (item) {
      this.desWindowConfig.type = 'view';
      this.operationItem.id = item.id;
      this.desWindowConfig.title = '查看描述项信息(只读)-' + item.name;
      this.desWindowConfig.show = true;
    },

    //编辑当前描述项
    modifyDes (item) {
      this.desWindowConfig.type = 'modify';
      this.operationItem.id = item.id;
      this.desWindowConfig.title = '数据源信息编辑-' + item.name;
      this.desWindowConfig.show = true;
    },





    validateForm () {
      if ('' == this.form.name) {
        this.showTooltip('failed', '请填写描述项名称');
        return false;
      }

      if (this.form.name.length > 10) {
        this.showTooltip('failed', '名称字符长度小于10');
        return false;
      }

      if ('' == this.form.orderNum) {
        this.showTooltip('failed', '请填写描述项序号');
        return false;
      }

      let pattern = /^([0-9]\d{0,3}|[0]{1,1})$/;
      if (!pattern.test(this.form.orderNum.replace(/^\s+/, ''))) {
        this.showTooltip('failed', '序号必须为最大4位的非负整数');
        return;
      }

      return true;
    },

    // // 表单验证
    // validateForm () {
    //   if ('' == this.form.name) {
    //     this.showTooltip('failed', '请填写描述项名称');
    //     return false;
    //   }

    //   if ('' == this.form.orderNum) {
    //     this.showTooltip('failed', '请填写描述项序号');
    //     return false;
    //   }

    //   let pattern = /^([1-9]\d*|[0]{1,1})$/;
    //   if (!pattern.test(this.form.orderNum)) {
    //     this.showTooltip('failed', '序号必须为非负整数');
    //     return;
    //   }

    //   return true;
    // },

    // 提交表单
    submit () {
      if (!this.validateForm()) {
        return;
      }

      let message;
      let url;
      if ('add' == this.desWindowConfig.type) {
        url = this.desAddApi;
        message = '新增';
      } else if ('modify' == this.desWindowConfig.type) {
        url = this.desModifyApi;
        message = '修改';
      }
      this.$http.post(url, this.form).then(
        res => {
          if ('success' == res.body.status) {
            this.showTooltip('success', message + '成功');
            this.searchDes();
            this.desWindowConfig.show = false;
          } else {
            this.showTooltip('failed', res.body.message);
          }
        },
        res => {
          this.showTooltip('failed', message + '失败');
        }
      );
    },

    //退出描述项信息弹窗
    cancel () {
      this.desWindowConfig.show = false;
    },

    // 单条删除对话框
    removeDes (item) {
      this.gridConfigs.getSelectedIds = [];
      this.gridConfigs.getSelectedIds.push(item.id);
      this.showDialog('alert', '确认要删除名称为：' + item.name + '的描述项吗?', 'removeDesAn');
    },

    // 批量删除对话框
    batchRemoveDes () {
      this.gridConfigs.getSelectedNames = [];
      this.gridConfigs.getSelectedIds = [];
      let selectItems = this.$refs.grid.getSelectedItems();
      if (0 == selectItems.length) {
        this.showTooltip('failed', '请选择至少一条数据');
      } else {
        for (var i in selectItems) {
          this.gridConfigs.getSelectedIds.push(selectItems[i].id);
          this.gridConfigs.getSelectedNames.push(selectItems[i].name);
        }
        this.showDialog(
          'alert',
          '确认要批量删除名称为：' + this.gridConfigs.getSelectedNames.join('、') + '的描述项吗?',
          'batchRemove'
        );
      }
    },

    // 通过id查询
    getById (id) {
      this.$http.get(this.desInfoApi + id).then(
        res => {
          let item = res.body.content;
          this.form = {
            orderNum: item.orderNum,
            id: item.id,
            name: item.name,
            des: item.des,
            groupInfoId: item.groupInfoId
          };
        },
        res => {
          showTooltip('failed', res.body.message);
        }
      );
    }
  },
  watch: {
    visible (val) {
      this.isShow = val;
    },
    isShow (val) {
      //为true表示显示当前Window
      if (val) {
        this.gridConfigs.searchFields = {
          groupInfoId: this.entityId
        };
      } else {
        //通过向父组件传递事件的方式修改visible属性所对应的变量的值
        this.$emit('update:visible', val);
      }
    },
    'desWindowConfig.show': function (val) {
      if (val) {
        this.desWindowConfig.entityId = this.entityId;
        //新增
        if (this.desWindowConfig.type == 'add') {
          this.desWindowConfig.readonly = false;
          this.form = {
            orderNum: '',
            groupInfoId: this.entityId,
            name: '',
            des: ''
          };
        } else if (this.desWindowConfig.type == 'modify') {
          //修改
          this.desWindowConfig.readonly = false;
          this.getById(this.operationItem.id);
        } else if (this.desWindowConfig.type == 'view') {
          //查看
          this.desWindowConfig.readonly = true;
          this.getById(this.operationItem.id);
        }
      }
    }
  }
};
</script>

<style scoped>
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
    overflow:hidden;
  }

  .win-grid::-webkit-scrollbar { /*滚动条整体部分*/
    width: 10px;
    height: 10px;
  }

  .win-grid::-webkit-scrollbar-thumb {
    border-radius: 5px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .2);
    background-color: #eee;
  }
</style>
