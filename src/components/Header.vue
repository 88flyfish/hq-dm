<template>
  <div class="header">
    <div class="wrap">
      <div class="nav-normal icon-area"
           :class="{ 'nav-folded' : folded }">
        <div>
          <span>&#xe912;</span>
          <span style="margin-left:10px;"
                v-show="!folded">数据管理平台</span>
        </div>
      </div>
      <div class="header-body">
        <div class="colorPickerBox">
          <ColorPicker></ColorPicker>
        </div>
        <span class="exit"
              title="退出"
              @click="exit()"></span>
        <span>&#xe90d;</span>
        <span>&#xeca8;</span>
        <span title="修改密码"
              @click="editPwd">&#xebdf;</span>
        <span>&#xeb6e;</span>
        <span class="user-info"
              @click="showUser">{{userWindowConfig.form.username}}</span>
        <span class="header-zoom-button"
              @click="headerZoom()"></span>
        <Breadcrumb></Breadcrumb>
      </div>
    </div>
    <!-- 对话弹框 -->
    <my-dialog v-if="showDialog"
               :message="dialogMessage"
               @dialogCancel="dialogCancel"
               @dialogConfirm="dialogConfirm">
    </my-dialog>

    <!-- 当前用户信息弹窗 -->
    <my-window v-if="userWindowConfig.show"
               :config="userWindowConfig">
      <!--弹框表单的样式为公用，-->
      <!-- <div class="content-body-form">
        <div>
          <label>ID：</label>
          <input readonly
                 v-model="userWindowConfig.form.id"
                 type="text" />
        </div>
        <div>
          <label>账号：</label>
          <input readonly
                 v-model="userWindowConfig.form.loginName"
                 type="text" />
        </div>
        <div>
          <label>姓名：</label>
          <input readonly
                 v-model="userWindowConfig.form.username"
                 type="text" />
        </div>
        <div>
          <label>工号：</label>
          <input readonly
                 v-model="userWindowConfig.form.jobNum"
                 type="text" />
        </div>
        <div>
          <label>电话：</label>
          <input readonly
                 v-model="userWindowConfig.form.phone"
                 type="text" />
        </div>
        <div>
          <label>邮箱：</label>
          <input readonly
                 v-model="userWindowConfig.form.email"
                 type="text" />
        </div>
      </div> -->
      <IForm class="content-body-form">
        <IFormItem label="ID"
                   labelWidth="90px">
          <!--<SourceInput @setFileSource="setFileSource"></SourceInput>-->
          <Iinput v-model="userWindowConfig.form.id"></Iinput>
        </IFormItem>
        <IFormItem label="账号"
                   labelWidth="90px">
          <Iinput v-model="userWindowConfig.form.loginName"></Iinput>
        </IFormItem>
        <IFormItem label="姓名"
                   labelWidth="90px">
          <Iinput v-model="userWindowConfig.form.username"></Iinput>
        </IFormItem>
        <IFormItem label="工号"
                   labelWidth="90px">
          <Iinput v-model="userWindowConfig.form.jobNum"></Iinput>
        </IFormItem>
        <IFormItem label="电话"
                   labelWidth="90px">
          <Iinput v-model="userWindowConfig.form.phone"></Iinput>
        </IFormItem>
        <IFormItem label="邮箱"
                   labelWidth="90px">
          <Iinput v-model="userWindowConfig.form.email"></Iinput>
        </IFormItem>
      </IForm>
    </my-window>

    <!-- 修改密码 -->
    <my-window :config="editPwdConfig"
               v-if="editPwdConfig.show">
      <IForm>
        <IFormItem label="原密码"
                   labelWidth="90px">
          <!--<SourceInput @setFileSource="setFileSource"></SourceInput>-->
          <Iinput v-model="editPwdConfig.form.oldPassword"
                  type="password"></Iinput>
        </IFormItem>
        <IFormItem label="新密码"
                   labelWidth="90px">
          <Iinput v-model="editPwdConfig.form.password"></Iinput>
        </IFormItem>
        <IFormItem label="确认密码"
                   labelWidth="90px">
          <Iinput v-model="editPwdConfig.form.rePwd"></Iinput>
        </IFormItem>
      </IForm>
      <!-- <div class="content-body-form">
        <div style="margin-left:45px;">
          <label>原密码：</label>
          <input v-model="editPwdConfig.form.oldPassword"
                 type="password" />
        </div>
        <div style="margin-left:45px;">
          <label>新密码：</label>
          <input v-model="editPwdConfig.form.password"
                 type="password" />
        </div>
        <div style="margin-left:45px;">
          <label>确认密码：</label>
          <input v-model="editPwdConfig.form.rePwd"
                 type="password" />
        </div>
      </div> -->
    </my-window>

    <!-- 消息提示 -->
    <my-tooltip :show="showTooltip"
                :showType="tooltipType"
                :message="tooltipMessage"
                @tooltipClosed="tooltipClosed"></my-tooltip>
  </div>
</template>

<script>
import MyDialog from "./common/Dialog.vue"
import MyWindow from "./common/Window.vue"
import MyTooltip from "./common/OperationStatusTooltip.vue"
import IForm from './common/IForm.vue'
import IFormItem from './common/IFormItem.vue'
import Iinput from './common/IInputbox'
import Breadcrumb from './Breadcrumb'
import ColorPicker from './ColorPicker'

export default {
  name: 'Header',
  components: {
    Breadcrumb,
    MyDialog,
    MyWindow,
    MyTooltip,
    IForm,
    IFormItem,
    Iinput,
    ColorPicker
  },
  data () {
    return {
      showTooltip: false,
      tooltipType: "",
      tooltipMessage: "",
      showDialog: false,
      dialogMessage: "",
      folded: false,
      editPwdConfig: {
        type: "modify",
        parent: this,
        show: false,
        title: "",
        height: "290px",
        width: "450px",
        form: {
          id: "",
          loginName: "",
          oldPassword: "",
          rePwd: "",
          password: ""
        },
        method: {
          confirm () {
            if ("" == this.editPwdConfig.form.oldPassword || "" == this.editPwdConfig.form.password || "" == this.editPwdConfig.form.rePwd) {
              this.showTooltip = true;
              this.tooltipType = "failed";
              this.tooltipMessage = "表单填写不完整";
              return false;
            }
            if (this.editPwdConfig.form.rePwd != this.editPwdConfig.form.password) {
              this.showTooltip = true;
              this.tooltipType = "failed";
              this.tooltipMessage = "密码不一致";
              return false;
            }
            this.$http.post("./restful/user/editPwd", this.editPwdConfig.form).then(
              (res) => {
                if ("success" == res.body.status) {
                  this.showTooltip = true;
                  this.tooltipType = "success";
                  this.editPwdConfig.show = false;
                  this.tooltipMessage = "修改成功";
                } else {
                  this.showTooltip = true;
                  this.tooltipType = "failed";
                  this.tooltipMessage = res.body.message;
                }
              },
              (res) => {
                this.showTooltip = true;
                this.tooltipType = "failed";
                this.tooltipMessage = "修改失败";
              }
            )
          },
          cancel () {
            this.editPwdConfig.show = false;
          },
          close () {
            this.editPwdConfig.show = false;
          }
        }
      },
      userWindowConfig: {
        type: "view",
        parent: this,
        show: false,
        title: "用户信息",
        height: "440px",
        width: "560px",
        form: {
          loginName: "",
          id: "",
          username: "",
          jobNum: "",
          phone: "",
          email: ""
        },
        method: {
          close () {
            this.userWindowConfig.show = false;
          }
        }
      }
    }
  },
  mounted () {
    var vue = this;

    this.$root.bus.$on("FoldNavBar", function () {
      vue.folded = true;
    });

    this.$root.bus.$on("UnfoldNavBar", function () {
      vue.folded = false;
    });

    var user = this.$root.tools.currentUser();
    this.userWindowConfig.form.username = user.username;
    this.userWindowConfig.form.id = user.id;
    this.userWindowConfig.form.loginName = user.loginName;
    this.userWindowConfig.form.jobNum = user.jobNum;
    this.userWindowConfig.form.phone = user.phone;
    this.userWindowConfig.form.email = user.email;
  },
  methods: {
    // 修改密码
    editPwd () {
      this.editPwdConfig.show = true;
      this.editPwdConfig.title = "修改密码-" + this.userWindowConfig.form.username;
      this.editPwdConfig.form = {
        id: this.userWindowConfig.form.id,
        loginName: this.userWindowConfig.form.loginName,
        oldPassword: "",
        rePwd: "",
        password: ""
      }
    },
    //关闭消息提示
    tooltipClosed () {
      this.showTooltip = false;
    },
    //显示用户信息弹窗
    showUser () {
      this.userWindowConfig.show = true;
    },
    //对话框确认
    dialogConfirm () {
      this.$http.get("./api/sys/logout").then(
        (res) => {
          if ("success" == res.body.status) {
            window.location = "./login.html"
          }
        }
      )
    },
    // 取消对话框
    dialogCancel () {
      this.showDialog = false;
    },
    // 导航栏的伸展
    headerZoom () {
      if (this.folded) {
        //触发导航条的展开事件
        this.$root.bus.$emit("UnfoldNavBar");
      } else {
        //触发导航条的折叠事件
        this.$root.bus.$emit("FoldNavBar");
      }
    },
    // 注销登录
    exit () {
      this.showDialog = true;
      this.dialogMessage = "确定退出系统吗？";
    }
  }
}
</script>

<style scoped>
.icon-area {
  display: table-cell;
  height: 100%;
  /*background-color: #20a0ff;*/
  background-color: #20a0ff;
  color: #fff;
  font-size: 20px;
  padding-left: 15px;
  white-space: nowrap;
  overflow: hidden;
  vertical-align: middle;
}

.header-body {
  display: table-cell;
  vertical-align: middle;
  color: #939393;
}

.header-body span {
  font-size: 16pt;
  float: right;
  margin-right: 6px;
  cursor: pointer;
  padding: 5px;
}

.colorPickerBox {
  margin-right: 10px;
  height: 24px;
  margin-top: 4px;
  float: right;
}
span.header-zoom-button {
  float: left;
  margin-left: 10px;
  padding: 5px;
}

.header-zoom-button:before {
  content: "\e90e";
  font-size: 20pt;
}

.exit:before {
  content: "\e90b";
}

span.user-info {
  font-size: 10pt;
  font-family: sans-serif;
  line-height: 14px;
}

.user-info:before {
  content: "\EA1D";
  font-family: "iconfont";
  font-size: 16pt;
  position: relative;
  left: 0px;
  top: 3px;
}

.header-body span:hover {
  background-color: #f8f8f8;
}
</style>
