<template>
  <panel>
    <div slot="txtBar">
      <!-- 委办单位：
      <span class='num'>{{statisticsInfo.deptNum}}</span>&nbsp;家&nbsp;&nbsp;&nbsp;&nbsp; 已提交资源的委办单位：
      <span class='num'>{{statisticsInfo.submittedDeptNum}}</span>&nbsp;家&nbsp;&nbsp;&nbsp;&nbsp; 尚未提交资源的委办单位：
      <span class='num'>{{statisticsInfo.notSubmitDeptNum}}</span>&nbsp;家&nbsp;&nbsp;|&nbsp;&nbsp; 各委办单位共提交的资源：
      <span class='num'>{{statisticsInfo.resourcesNum}}</span>&nbsp;项&nbsp;&nbsp;&nbsp;&nbsp; 已处理的资源：
      <span class='num'>{{statisticsInfo.handledNum}}</span>&nbsp;项&nbsp;&nbsp;&nbsp;&nbsp; 尚未处理的资源：
      <span class='num'>{{statisticsInfo.notHandleNum}}</span>&nbsp;项 -->
      <div class="statistics">
        委办单位：
        <span class='num'>{{statisticsInfo.deptNum}}</span>&nbsp;家
      </div>
      <div class="statistics">
        已提交资源的委办单位：
        <span class='num'>{{statisticsInfo.submittedDeptNum}}</span>&nbsp;家
      </div>
      <div class="statistics">尚未提交资源的委办单位：
        <span class='num'>{{statisticsInfo.notSubmitDeptNum}}</span>&nbsp;家
      </div>
      <div class="statistics">各委办单位共提交的资源：
        <span class='num'>{{statisticsInfo.resourcesNum}}</span>&nbsp;项
      </div>
      <div class="statistics">已处理的资源：
        <span class='num'>{{statisticsInfo.handledNum}}</span>&nbsp;项
      </div>
      <div class="statistics"> 尚未处理的资源：
        <span class='num'
              style="color:#f56c6c">{{statisticsInfo.notHandleNum}}</span>&nbsp;项
      </div>
    </div>
    <div class="tableWrap">
      <div class="tableItem">
        <table class="table">
          <col width="10%" />
          <col width="40%" />
          <col width="15%" />
          <col width="15%" />
          <col width="20%" />
          <thead>
            <tr>
              <th scope="col"
                  :key='i'
                  v-for="(i,index) in deptFileInfo.title">
                <span v-if="index == 2"
                      class="iconPic1"></span>
                <span v-if="index == 3"
                      class="iconPic2"></span>
                <span v-if="index == 4"
                      class="iconPic3"></span>
                <span>{{i}}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item,index) in deptFileInfo.dataList[0]"
                :key="index">
              <td>{{item.numIndex+1}}</td>
              <td>{{item.deptName}}</td>
              <td @click="numBtn(item,'', (item.totalNum||item.totalNum==0)?item.totalNum:'-')">{{(item.totalNum||item.totalNum==0)?item.totalNum:'-'}}</td>
              <td @click="numBtn(item,'3', item.passNum+item.notPassNum||item.passNum+item.notPassNum==0?item.passNum+item.notPassNum:'-')">{{item.passNum+item.notPassNum||item.passNum+item.notPassNum==0?item.passNum+item.notPassNum:'-'}}</td>
              <td @click="numBtn(item,'1', item.checkPendingNum||item.checkPendingNum==0?item.checkPendingNum:'-')"
                  :class="{colR:item.checkPendingNum||item.checkPendingNum==0?true:false}">{{item.checkPendingNum||item.checkPendingNum==0?item.checkPendingNum:'-'}}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="tableItem">
        <table class="table">
          <col width="10%" />
          <col width="40%" />
          <col width="15%" />
          <col width="15%" />
          <col width="20%" />
          <thead>
            <tr>
              <th scope="col"
                  :key='i'
                  v-for="(i,index) in deptFileInfo.title">
                <span v-if="index == 2"
                      class="iconPic1"></span>
                <span v-if="index == 3"
                      class="iconPic2"></span>
                <span v-if="index == 4"
                      class="iconPic3"></span>
                <span>{{i}}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item,index) in deptFileInfo.dataList[1]"
                :key="index">
              <td>{{item.numIndex+1}}</td>
              <td>{{item.deptName}}</td>
              <td @click="numBtn(item,'', (item.totalNum||item.totalNum==0)?item.totalNum:'-')">{{(item.totalNum||item.totalNum==0)?item.totalNum:'-'}}</td>
              <td @click="numBtn(item,'3', item.passNum+item.notPassNum||item.passNum+item.notPassNum==0?item.passNum+item.notPassNum:'-')">{{item.passNum+item.notPassNum||item.passNum+item.notPassNum==0?item.passNum+item.notPassNum:'-'}}</td>
              <td @click="numBtn(item,'1', item.checkPendingNum||item.checkPendingNum==0?item.checkPendingNum:'-')"
                  :class="{colR:item.checkPendingNum||item.checkPendingNum==0?true:false}">{{item.checkPendingNum||item.checkPendingNum==0?item.checkPendingNum:'-'}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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
             :message="tooltipConfig.tooltipMessage">
    </tooltip>

    <!-- 部门资源窗口 -->
    <dept-resource-win @freshList="getDeptFileInfoVo"
                       :visible.sync="deptResourceWindowConfig.show"
                       :title="deptResourceWindowConfig.title"
                       :entityId="deptResourceWindowConfig.entityId"
                       :type="deptResourceWindowConfig.type"
                       :applyStatus="deptResourceWindowConfig.applyStatus">
    </dept-resource-win>

    <!-- 部门已处理资源窗口 -->
    <dept-handled-win @freshList="getDeptFileInfoVo"
                      :visible.sync="deptHandledWinConfig.show"
                      :title="deptHandledWinConfig.title"
                      :entityId="deptHandledWinConfig.entityId"
                      :type="deptHandledWinConfig.type"
                      :flag="deptHandledWinConfig.flag">
    </dept-handled-win>

  </panel>
</template>

<script>
import Panel from '../../components/Panel';
import Tooltip from '../../components/common/OperationStatusTooltip';
import IDialog from '../../components/common/Dialog';
import deptResourceWin from './deptResourceWin.vue';
import deptHandledWin from './deptHandledWin';

export default {
  name: 'resource-overview',

  provide() {
    return {
      getStatisticsInfo: this.getStatisticsInfo
    }
  },

  data () {
    return {
      //获取统计信息接口
      getStatisticsInfoApi: './api/directoryFileInfo/getStatisticsInfo',
      //统计信息列表接口
      getDeptFileInfoVoApi: './api/directoryFileInfo/getDeptFileInfoVo',
      statisticsInfo: {
        deptNum: 0,
        handledNum: 0,
        notHandleNum: 0,
        notSubmitDeptNum: 0,
        resourcesNum: 0,
        submittedDeptNum: 0
      },
      deptFileInfo: {
        title: ['序号', '委办局', '已提交', '已处理', '尚未处理'],
        dataList: [[], []]
      },
      //
      deptResourceWindowConfig: {
        show: false,
        title: '',
        entityId: '',
        type: '',
        applyStatus: ''
      },

      deptHandledWinConfig: {
        show: false,
        title: '',
        entityId: '',
        type: '',
        flag: ''
      },

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
      }
    };
  },

  methods: {
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

    //显示部门资源弹窗
    showDeptResourceWin (id, title, type, applyStatus) {
      this.deptResourceWindowConfig = {
        show: true,
        entityId: id,
        title: title,
        type: type,
        applyStatus: applyStatus
      };
    },

    showdeptHandledWin (id, title, type, flag) {
      this.deptHandledWinConfig = {
        show: true,
        entityId: id,
        title: title,
        type: type,
        flag: flag
      }
    },

    dialogCancel () {
      this.closeDialog();
    },

    numBtn (val, applyStatus, clickFlag) {
      if (0 == clickFlag || '-' == clickFlag) {
        return;
      }

      if (val.deptId == undefined) {
        val.deptId = '-1';
      }

      if (applyStatus == '3') {
        let flag = '1'
        this.showdeptHandledWin(
          val.deptId,
          `查看${val.deptName}资源信息`,
          'view',
          flag
        )
      } else {
        this.showDeptResourceWin(
          val.deptId,
          `查看${val.deptName}资源信息`,
          'view',
          applyStatus
        );
      }
    },

    getStatisticsInfo () {
      this.$http.get(this.getStatisticsInfoApi).then(
        res => {
          if ('success' == res.body.status) {
            this.statisticsInfo = res.body.content;
          } else {
            this.showTooltip('failed', res.body.message);
          }
        },
        res => {
          this.showTooltip('failed', '服务器异常,请刷新后重试');
        }
      );
    },
    getDeptFileInfoVo () {
      this.$http.get(this.getDeptFileInfoVoApi).then(
        res => {
          if ('success' == res.body.status) {
            let resInfo = res.body.content;
            let arrL = resInfo.filter((item, index) => {
              if (index < Math.ceil(resInfo.length / 2)) {
                item.numIndex = index;
                return item;
              }
            });
            this.$set(this.deptFileInfo.dataList, 0, arrL);
            let arrR = resInfo.filter((item, index) => {
              if (index >= Math.ceil(resInfo.length / 2)) {
                item.numIndex = index;
                return item;
              }
            });
            if (resInfo.length % 2 == 1) {
              arrR.push({
                numIndex: resInfo.length,
                deptName: '-'
              });
            }
            this.$set(this.deptFileInfo.dataList, 1, arrR);
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
  mounted () {
    this.getStatisticsInfo();
    this.getDeptFileInfoVo();
  },
  components: {
    Panel,
    Tooltip,
    IDialog,
    deptResourceWin,
    deptHandledWin
  },
  watch: {}
};
</script>

<style scoped>
.statistics {
  display: inline-block;
  padding: 0 10px;
}
.num {
  font-size: 25px;
  color: #44abf5;
}
.colR {
  color: rgb(218, 49, 19) !important;
}
.iconPic1 {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url('../../common/img/total.png') no-repeat;
  vertical-align: middle;
}
.iconPic2 {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url('../../common/img/pass.png') no-repeat;
  vertical-align: middle;
}
.iconPic3 {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url('../../common/img/checkPending.png') no-repeat;
  vertical-align: middle;
}
.tableWrap {
  display: flex;
}
.tableItem {
  width: 50%;
  margin-top: 10px;
}

.table {
  width: calc(100% - 30px);
  margin: 0 auto;
  font-size: 12px;
  text-align: center;
  border-collapse: collapse;
  border: 1px solid #e8edff;
}

th {
  box-sizing: border-box;
  height: 30px;
  line-height: 30px;
  font-size: 15px;
  font-weight: normal;
  text-align: center;
  color: #fff;
  background-color: #44aaf5;
}
th span {
  display: inline-block;
}
tr {
  text-align: center;
}

td {
  font-size: 13px;
  padding: 5px;
  color: #555;
  border: 1px solid #fff;
}

tbody tr:nth-child(2n) {
  background: #e5e5e5;
}

tbody tr:nth-child(2n + 1) {
  background: #eeeeee;
}
tr td:nth-child(n + 3) {
  color: blue;
  /* background: #97dcfb; */
}

tr td:nth-child(n + 3):hover {
  font-size: 13px;
  /* background: #48c6ff; */
  background: #ccc;
  cursor: pointer;
}
.colorSelect {
  color: blue;
}
</style>
