<template>
  <i-window :visible.sync="isShow"
            :title="title"
            width="650px"
            height="200px">
    <i-form style="padding-left: 40px">
      <i-form-item :required="true"
                   label="数据目录名称">
        <i-inputbox v-model="form.name"
                    :readonly="readonly">
        </i-inputbox>
      </i-form-item>
    </i-form>

    <div slot="footer"
         style="float:right;margin-right:20px;">
      <i-button v-if="readonly"
                type="primary"
                @click="isShow = false">
        关闭
      </i-button>

      <i-button v-if="!readonly"
                plain
                @click="isShow = false">
        取消
      </i-button>

      <i-button v-if="!readonly"
                type="primary"
                @click="submit">
        提交
      </i-button>
    </div>

    <!--　用于显示信息的提示工具　-->
    <tooltip :show.sync="tooltipConfig.tooltipShow"
             :showType="tooltipConfig.tooltipType"
             @tooltipClosed="tooltipConfig.tooltipShow = false;"
             :message="tooltipConfig.tooltipMessage">
    </tooltip>
  </i-window>
</template>

<script>
import IWindow from '../../../components/common/IWindow';
import IForm from '../../../components/common/IForm';
import IFormItem from '../../../components/common/IFormItem';
import IInputbox from '../../../components/common/IInputbox';
import tooltip from '../../../components/common/OperationStatusTooltip';
import IButton from '../../../components/common/IButton';

export default {
  name: 'data-dir-win',
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
    }
  },
  data () {
    return {
      isShow: this.visible,
      readonly: false,

      // 信息提示
      tooltipConfig: {
        tooltipShow: false,
        tooltipType: '',
        tooltipMessage: ''
      },

      // 表单
      form: {
        id: '',
        parentId: this.deptId,
        name: ''
      }
    };
  },
  methods: {
    // 信息提示
    showTooltip (type, message) {
      this.tooltipConfig = {
        tooltipType: type,
        tooltipMessage: message,
        tooltipShow: true
      };
    },

    // 表单非空验证
    validateForm () {
      if ('' == this.form.name) {
        this.showTooltip('failed', '请填写数据目录名称');
        return false;
      }
      return true;
    },

    // 通过id查询
    getById () {
      this.$http
        .get('./api/dataDirectory/getById?id=' + this.entityId)
        .then(res => {
          let item = res.body.content;
          this.form = {
            id: item.id,
            name: item.name,
            parentId: item.parentId
          };
        });
    },

    // 提交表单
    submit () {
      if (!this.validateForm()) {
        return;
      }
      let message;
      let url;
      if ('add' == this.type) {
        url = './api/dataDirectory/save';
        message = '新增';
      } else if ('modify' == this.type) {
        url = './api/dataDirectory/modify';
        message = '修改';
      }

      this.$http.post(url, this.form).then(
        res => {
          if ('success' == res.body.status) {
            this.showTooltip('success', message + '成功');
            this.$emit('search');
          } else {
            this.showTooltip('failed', res.body.message);
          }
        },

        res => {
          this.showTooltip('failed', '服务器异常,请刷新后重试');
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
        //新增
        if (this.type == 'add') {
          this.readonly = false;
          this.form = {
            id: '',
            parentId: this.deptId,
            name: ''
          };
        } else if (this.type == 'modify') {
          //修改
          this.readonly = false;
          this.getById();
        } else if (this.type == 'view') {
          //查看
          this.readonly = true;
          this.getById();
        }
      } else {
        //通过向父组件传递事件的方式修改visible属性所对应的变量的值
        this.$emit('update:visible', val);
      }
    },
    'tooltipConfig.tooltipShow': function (val) {
      // 当tooltip关闭后，如果是成功类型的说明操作成功了，此时一并将Window一起关闭
      if (!val && 'success' == this.tooltipConfig.tooltipType) {
        this.isShow = false;
      }
    }
  },
  components: {
    IButton,
    IInputbox,
    IFormItem,
    IForm,
    IWindow,
    tooltip
  }
};
</script>

<style scoped>
</style>
