<template>
  <i-window
    :visible.sync="isShow"
    :title="title"
    width="650px"
    height="480px">
    <i-form>
      <i-form-item
        :required="true"
        label="服务器名称">
        <i-inputbox
          v-model="form.name"
          :readonly="readonly">
        </i-inputbox>
      </i-form-item>

      <i-form-item
        :required="true"
        label="IP地址">
        <i-inputbox
          v-model="form.ip"
          :readonly="readonly">
        </i-inputbox>
      </i-form-item>

      <i-form-item
        :required="true"
        label="端口号">
        <i-inputbox
          v-model="form.port"
          :readonly="readonly">
        </i-inputbox>
      </i-form-item>

      <i-form-item
        :required="true"
        label="账号">
        <i-inputbox
          v-model="form.username"
          :readonly="readonly">
        </i-inputbox>
      </i-form-item>

      <i-form-item
        :required="true"
        label="密码">
        <i-inputbox
          v-model="form.password"
          :readonly="readonly"
          type="password">
        </i-inputbox>
      </i-form-item>
    </i-form>

    <div slot="footer" style="float:right;margin-right:20px;">
      <i-button
        v-if="!readonly"
        type="success"
        style="margin-right: 20px;"
        @click="testConnection">
        连接测试
      </i-button>

      <i-button
        v-if="readonly"
        type="primary"
        @click="isShow = false">
        关闭
      </i-button>

      <i-button
        v-if="!readonly"
        plain
        @click="isShow = false">
        取消
      </i-button>

      <i-button
        v-if="!readonly"
        type="primary"
        @click="submit">
        提交
      </i-button>
    </div>

    <!--　用于显示信息的提示工具　-->
    <tooltip
      :show.sync="tooltipConfig.tooltipShow"
      :showType="tooltipConfig.tooltipType"
      :message="tooltipConfig.tooltipMessage"
      @tooltipClosed="tooltipConfig.tooltipShow = false;">
    </tooltip>

    <tooltip
      :show.sync="connectTooltip.tooltipShow"
      :showType="connectTooltip.tooltipType"
      :message="connectTooltip.tooltipMessage"
      @tooltipClosed="connectTooltip.tooltipShow = false;">
    </tooltip>
  </i-window>
</template>

<script>
  import IWindow from "../../../components/common/IWindow";
  import IForm from "../../../components/common/IForm";
  import IFormItem from "../../../components/common/IFormItem";
  import IInputbox from "../../../components/common/IInputbox";
  import tooltip from "../../../components/common/OperationStatusTooltip"
  import IButton from "../../../components/common/IButton";

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
      type: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        isShow: this.visible,
        readonly: false,

        // 是否通过连接测试
        isConnected: false,

        // 信息提示
        tooltipConfig: {
          tooltipShow: false,
          tooltipType: "",
          tooltipMessage: ""
        },

        connectTooltip: {
          tooltipShow: false,
          tooltipType: "",
          tooltipMessage: ""
        },

        // 表单
        form: {
          id: '',
          name: '',
          username: '',
          password: '',
          ip: '',
          port: ''
        }
      }
    },
    methods: {
      // 信息提示
      showTooltip(type, message) {
        this.tooltipConfig = {
          tooltipType: type,
          tooltipMessage: message,
          tooltipShow: true
        };
      },

      showConnectTooltip(type, message) {
        this.tooltipConfig.tooltipShow = false;
        this.connectTooltip = {
          tooltipType: type,
          tooltipMessage: message,
          tooltipShow: true
        }

        // this.connectTooltip.tooltipShow = false;
      },

      // 表单非空验证
      validateForm() {
        if ('' == this.form.name) {
          this.showTooltip('failed', '请填写服务器名称');
          return false;
        }

        if ('' == this.form.username) {
          this.showTooltip('failed', '请填写账号');
          return false;
        }

        if ('' == this.form.password) {
          this.showTooltip('failed', '请填写密码');
          return false;
        }

        if ('' == this.form.ip) {
          this.showTooltip('failed', '请填写IP地址');
          return false;
        }

        if ('' == this.form.port) {
          this.showTooltip('failed', '请填写端口号');
          return false;
        }

        return true;
      },

      // 连接测试
      testConnection() {
        if (!this.validateForm()) {
          return;
        }
        this.$http.post('./api/gisServer/testConnection', this.form).then(
          (res) => {
            if ('success' == res.body.status) {
              this.isConnected = true;
              this.showConnectTooltip('success', '连接成功');

            } else {
              this.isConnected = false;
              this.showConnectTooltip('failed', '连接失败');
            }
          },

          (res) => {
            this.isConnected = false;
            this.showConnectTooltip('failed', '服务器异常,请刷新后重试');
          }
        )
      },

      // 通过id查询
      getById() {
        this.$http.get('./api/gisServer/getById?id=' + this.entityId).then(
          (res) => {
            let item = res.body.content;
            this.form = {
              id: item.id,
              name: item.name,
              username: item.username,
              password: item.password,
              ip: item.ip,
              port: item.port,
            }
          }
        )
      },

      // 提交表单
      submit() {
        if (!this.validateForm()) {
          return;
        }
        if (!this.isConnected) {
          this.showTooltip('failed', '尚未通过连接测试');
          return;
        }
        let message;
        let url;
        if ('add' == this.type) {
          url = './api/gisServer/save';
          message = '新增';
        } else if ('modify' == this.type) {
          url = './api/gisServer/modify';
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
      visible(val) {
        this.isShow = val;
      },
      isShow(val) {
        //为true表示显示当前Window
        if (val) {
          this.isConnected = false;
          //新增
          if (this.type == 'add') {
            this.readonly = false;
            this.form = {
              id: '',
              name: '',
              username: '',
              password: '',
              ip: '',
              port: ''
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
      },

      // 连接测试，深度监控
      form: {
        handler: function () {
          this.isConnected = false;
        },
        deep: true
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
  }
</script>

<style scoped>

</style>
