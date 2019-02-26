<template>
  <i-window :visible.sync="isShow"
            :title="title"
            width="650px"
            height="500px">
    <i-form>
      <i-form-item :required="true"
                   label="规范名称">
        <i-inputbox :maxlength=30
                    v-model="form.name"
                    :readonly="readonly">
        </i-inputbox>
      </i-form-item>
      <i-form-item :required="true"
                   label="资源目录">
        <tree-select v-model="form.themeId"
                     :readonly="readonly"
                     :selectStyle="selectStyle"
                     :treeStyleConfig="{leafIcon:'&#xe92f;'}"
                     api="./api/theme/getAll">
        </tree-select>
      </i-form-item>

      <i-form-item :required="true"
                   label="规范编码">
        <i-inputbox :maxlength=30
                    v-model="form.standardCode"
                    :readonly="readonly">
        </i-inputbox>
      </i-form-item>

      <i-form-item label="规范描述">
        <i-textarea v-model="form.des"
                    :readonly="readonly"
                    style="height: 100px;">
        </i-textarea>
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
import IWindow from "../../../components/common/IWindow";
import IForm from "../../../components/common/IForm";
import IFormItem from "../../../components/common/IFormItem";
import IInputbox from "../../../components/common/IInputbox";
import tooltip from "../../../components/common/OperationStatusTooltip";
import IButton from "../../../components/common/IButton";
import ITextarea from "../../../components/common/ITextarea";
import TreeSelect from "../../../components/DmComponent/TreeSelect";

export default {
  name: "gis-server-win",
  inject: ['search'],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ""
    },
    entityId: {
      type: String,
      default: ""
    },
    themeId: {
      type: String,
    },
    type: {
      type: String,
      default: ""
    }
  },
  data () {
    return {
      isShow: this.visible,
      readonly: false,
      // 属性下拉菜单
      selectStyle: {
        width: "100%",
        height: "35px",
      },

      // 信息提示
      tooltipConfig: {
        tooltipShow: false,
        tooltipType: "",
        tooltipMessage: ""
      },

      // 表单
      form: {
        id: '',
        themeId: this.themeId,
        name: '',
        standardCode: '',
        des: ''
      }
    }
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

    // 通过id查询
    getById () {
      //   this.form.themeId = '';
      this.$http.get('././api/standardInfo/getById?id=' + this.entityId).then(
        (res) => {
          let item = res.body.content;
          this.form = {
            id: item.id,
            themeId: this.themeId,
            name: item.name,
            standardCode: item.standardCode,
            des: item.des
          }
        }
      )
    },

    // 表单验证
    validateForm () {
      if ('' == this.form.themeId) {
        this.showTooltip('failed', '请选择资源目录');
        return false;
      }

      if ('' == this.form.name) {
        this.showTooltip('failed', '请填写规范名称');
        return false;
      }

      if ('' == this.form.standardCode) {
        this.showTooltip('failed', '请填写规范编码');
        return false;
      }

      let pattern = /^[a-zA-Z][a-zA-Z_0-9]*$/;
      if (!pattern.test(this.form.standardCode)) {
        this.showTooltip('failed', '规范编码只能包含字母数字和下划线，并以字母开头');
        return;
      }

      return true;
    },

    // 提交表单
    submit () {
      if (!this.validateForm()) {
        return;
      }

      let message;
      let url;

      if ('add' == this.type) {
        url = './api/standardInfo/save';
        message = '新增';
      } else if ('modify' == this.type) {
        url = './api/standardInfo/modify';
        message = '修改';
      }

      this.$http.post(url, this.form).then(
        (res) => {
          if ('success' == res.body.status) {
            this.showTooltip('success', message + '成功');
            this.search();
          } else {
            this.showTooltip('failed', res.body.message);
          }
        },

        (res) => {
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
            themeId: '',
            name: '',
            standardCode: '',
            des: ''
          }
        }
        //修改
        else if (this.type == 'modify') {
          this.readonly = false;
          this.getById();
        }
        //查看
        else if (this.type == 'view') {
          this.readonly = true;
          this.getById();
        }
      } else {
        //通过向父组件传递事件的方式修改visible属性所对应的变量的值
        this.$emit("update:visible", val);
      }
    },
    "tooltipConfig.tooltipShow": function (val) {
      // 当tooltip关闭后，如果是成功类型的说明操作成功了，此时一并将Window一起关闭
      if (!val && "success" == this.tooltipConfig.tooltipType) {
        this.isShow = false;
      }
    }
  },
  components: {
    TreeSelect,
    ITextarea,
    IButton,
    IInputbox,
    IFormItem,
    IForm,
    IWindow,
    tooltip
  }
}
</script>

<style scoped>
</style>
