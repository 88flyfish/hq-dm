<template>
  <div>
    <i-window :visible.sync="isShow"
              :title="title"
              width="620px"
              height="360px">
      <i-form>
        <i-form-item :required="true"
                     label="数据名称"
                     style="position: relative;">
          <i-inputbox v-model="form.dataName" :readOnly="true"></i-inputbox>
          <i-button type="primary"
                    class="choose-button"
                    @click="selectDataName">请选择
          </i-button>
        </i-form-item>

        <i-form-item :required="true"
                     label="权属人"
                     :readOnly="true"
                     style="position: relative;">
          <i-inputbox v-model="form.ownership" :readOnly="true"></i-inputbox>
          <i-button type="primary"
                    class="choose-button"
                    @click="selectOwnership">请选择
          </i-button>
        </i-form-item>
      </i-form>
      <div slot="footer"
           style="float:right;margin-right:20px;">
        <i-button plain @click="isShow = false">取消</i-button>

        <i-button type="primary" @click="submit">提交</i-button>
      </div>
    </i-window>

    <!--　用于显示信息的提示工具　-->
    <tooltip :show.sync="tooltipConfig.show"
             :showType="tooltipConfig.tooltipType"
             :message="tooltipConfig.tooltipMessage"
             @tooltipClosed="tooltipConfig.show = false"></tooltip>

    <data-grid-win :visible.sync="dataGridWin.show"
                   :title="dataGridWin.title"
                   @selectData="confirmData"></data-grid-win>

    <ownership-grid-win :visible.sync="ownershipGridWin.show"
                        :title="ownershipGridWin.title"
                        @selectOwnership="confirmOwnership"></ownership-grid-win>
  </div>
</template>

<script>
  import IForm from '../../../components/common/IForm'
  import IFormItem from '../../../components/common/IFormItem'
  import IWindow from '../../../components/common/IWindow'
  import IButton from '../../../components/common/IButton'
  import IInputbox from '../../../components/common/IInputbox'
  import Tooltip from '../../../components/common/OperationStatusTooltip'
  import DataGridWin from "./DataGridWin";
  import OwnershipGridWin from "./OwnershipGridWin";

  export default {
    name: "OwnershipWin",
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        isShow: this.visible,
        form: {
          dataId: '',
          dataName: '',
          ownershipId: '',
          ownership: ''
        },
        dataGridWin: {
          show: false,
          title: ''
        },
        ownershipGridWin: {
          show: false,
          title: ''
        },
        tooltipConfig: {
          show: false,
          tooltipType: '',
          tooltipMessage: ''
        },
      }
    },
    methods: {
      showDataGridWin(title) {
        this.dataGridWin = {
          show: true,
          title: title
        }
      },

      showOwnershipGridWin(title) {
        this.ownershipGridWin = {
          show: true,
          title: title
        }
      },

      selectDataName() {
        this.showDataGridWin('数据列表');
      },

      selectOwnership() {
        this.showOwnershipGridWin('权属人列表');
      },

      confirmData(dataId, dataName) {
        this.form.dataId = dataId;
        this.form.dataName = dataName;
      },

      confirmOwnership(ownershipId, ownership) {
        this.form.ownershipId = ownershipId;
        this.form.ownership = ownership;
      },

      showTooltip(type, message) {
        this.tooltipConfig = {
          tooltipType: type,
          tooltipMessage: message,
          show: true
        };
      },

      validateForm() {
        if ('' === this.form.dataId) {
          this.showTooltip('icon', '请选择数据');
          return false;
        }
        if ('' === this.form.ownershipId) {
          this.showTooltip('icon', '请选择权属人');
          return false;
        }
        return true;
      },

      submit() {
        if (this.validateForm()) {
          let params = {
            dataId: this.form.dataId,
            ownershipId: this.form.ownershipId
          };
          this.$http.post('./api/dataOwnership/save', params)
            .then(res => {
                if('success' === res.body.status) {
                  this.showTooltip('success', '新增成功');
                  this.$emit('refresh');
                }
              },
              res => {
                this.showTooltip('failed', '新增失败');
              }
            )
        }
      }
    },
    watch: {
      visible(val) {
        this.isShow = val;
      },
      isShow(val) {
        //为true表示显示当前Window
        if (val) {
          this.form = {
            dataId: '',
            dataName: '',
            ownershipId: '',
            ownership: ''
          }
        } else {
          //通过向父组件传递事件的方式修改visible属性所对应的变量的值
          this.$emit('update:visible', val);
        }
      },
      'tooltipConfig.show': function (val) {
        // 当tooltip关闭后，如果是成功类型的说明操作成功了，此时一并将Window一起关闭
        if (!val && "success" === this.tooltipConfig.tooltipType) {
          this.isShow = false;
        }
      }
    },
    components: {
      OwnershipGridWin,
      DataGridWin,
      IWindow,
      IForm,
      IFormItem,
      IButton,
      IInputbox,
      Tooltip
    }
  }
</script>

<style scoped>
  .choose-button {
    position: absolute;
    right: 120px;
    bottom: 2px;
    padding: 2px 8px;
  }
</style>
