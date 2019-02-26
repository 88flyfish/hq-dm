<template>
  <div class="manualCopy">
    <IForm style="width:50%;min-width:700px;margin:50px auto; height: 500px;">
      <IFormItem label="选择数据" labelWidth="100px" height="40px">
        <DataInput @setData="setData" type="table_data" height="40px"></DataInput>
      </IFormItem>
      <br>
      <IFormItem label="备份文件源" labelWidth="100px" height="40px">
        <sourceInput @setFileSource="setFileSource" height="40px"></sourceInput>
      </IFormItem>
      <br>
      <IFormItem label="备份文件路径" labelWidth="100px" height="40px">
        <dirInput @setDir="setDir" :fileSourceId="form.fileSourceId" height="40px" readonly=true></dirInput>
      </IFormItem>
      <br>
      <IFormItem label="文件名称" labelWidth="100px" height="40px">
        <Iinput v-model="form.fileName" height="40px"></Iinput>
      </IFormItem>

      <div style="margin-top:30px;text-align:center;">
        <button class="submit" @click="submit">开始备份</button>
      </div>
    </IForm>

    <my-tooltip :show="showTooltip" :showType="tooltipType" :message="tooltipMessage" @tooltipClosed="showTooltip = false;"></my-tooltip>
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
import DataInput from '../../components/dataInput';
import sourceInput from '../../components/sourceInput';
import dirInput from '../../components/dirInput';

export default {
  methods: {
    setData(dataId, dataName) {
      this.form.dataId = dataId;
      this.form.dataName = dataName;
    },
    setFileSource(fileSourceId, fileSourceName) {
      this.form.fileSourceId = fileSourceId;
      this.form.fileSourceName = fileSourceName;
    },
    setDir(dir) {
      this.form.dir = dir;
    },
    submit() {
      var { ...params } = this.form;
      delete params.dataName;
      delete params.fileSourceName;

      this.$http.post('./api/dataBackup/manual', params).then(
        res => {
          res = res.body;
          if (res.status == 'success') {
            this.getTip('备份成功', 'success');
          } else {
            this.getTip(res.message, 'failed');
          }
        },
        err => {
          this.getTip('备份失败', 'failed');
        }
      );
    },
    //消息提示方法
    getTip(msg, type) {
      this.tooltipMessage = msg;
      this.tooltipType = type;
      this.showTooltip = true;
    }
  },
  data() {
    return {
      showTooltip: false,
      tooltipMessage: '',
      tooltipType: '',
      readonly: true,
      form: {
        dataId: '',
        dataName: '',
        fileSourceId: '',
        fileSourceName: '',
        dir: '',
        fileName: ''
      }
    };
  },
  mounted() {},
  components: {
    WaitMask,
    IForm,
    IFormItem,
    Iinput,
    checkbox,
    Iselect,
    grid,
    MyDialog,
    MyTooltip,
    MyWindow,
    DatePicker,
    AsynTree,
    Panel,
    DataInput,
    sourceInput,
    dirInput
  }
};
</script>

<style lang="less" scoped>
.manualCopy {
  margin: 20px;
  overflow: auto;
  vertical-align: top;
  background-color: #ffffff;
  box-shadow: 0px 1px 2px 1px #ccc;
  border-radius: 6px;
  padding: 10px;
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  min-height: calc(100% - 150px);
  .submit {
    height: 40px;
    padding: 0 20px;
    margin: 0 6px;
    background: #20a0ff;
    color: #fff;
    border-radius: 4px;
    letter-spacing: 1px;

    &:hover {
      opacity: 0.75;
      filter: Alpha(opacity=75);
      -webkit-transition: opacity 0.5s;
      -moz-transition: opacity 0.5s;
      -ms-transition: opacity 0.5s;
      -o-transition: opacity 0.5s;
      transition: opacity 0.5s;
    }
  }
}
</style>
