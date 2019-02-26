<template>
    <div>
        <i-window :visible.sync="isShow"
                  :title="title"
                  :width="width"
                  :height="height">
            <div style="overflow: auto;">
                <div class='title'>基本描述信息</div>
                <div class="baseInfo">
                    <div class="info-row"
                         v-for="(item,index) in shpBaseInfo"
                         :key="item.name">
                        <div class="info-name">{{item.name}}</div>
                        <div :class="{'info-value':true,'no-border':index>1?false:true}">{{item.value}}</div>
                    </div>
                </div>
                <div class='title'>描述项信息</div>
                <no-data :classType="0"
                         v-if="descDataGridConfig.descDataList.length==0"></no-data>
                <toggle-box :title="itemArr.name"
                            v-for="(itemArr) in descDataGridConfig.descDataList"
                            :key="itemArr.name">
                    <p v-if="itemArr.describeInfoList.length==0">暂无数据</p>
                    <table class="table"
                           v-if="itemArr.describeInfoList.length>0">
                        <thead>
                            <tr>
                                <th scope="col"
                                    style="width: 33%;"
                                    :key="i"
                                    v-for="i in descDataGridConfig.descDataTitleList">{{i}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item) in itemArr.describeInfoList"
                                :key="item.id">
                                <td class='shpField'>
                                    <span>{{item.name}}</span>
                                </td>
                                <td>
                                    <span v-if="item.metaDescribeInfo">{{item.metaDescribeInfo.describeValue}}</span>
                                </td>
                                <td>
                                    <span v-for="operation in descDataGridConfig.operations"
                                          class="operation"
                                          @click.stop="operation.func(item)"
                                          :title="operation.title"
                                          :key="operation.icon"
                                          v-if="item.metaDescribeInfo||operation.title=='编辑'"
                                          v-html="operation.icon">
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </toggle-box>

            </div>

            <div slot="footer"
                 style="float:right;margin-right:20px;">
                <i-button type="primary"
                          @click="isShow = false">关闭</i-button>
            </div>
        </i-window>

        <!-- 单项修改操作对话框 -->
        <i-window :visible.sync="DescribeModifyItemWin.show"
                  :title="DescribeModifyItemWin.title"
                  width="600px"
                  height="400px">
            <i-form>
                <i-form-item :required="true"
                             label="名称">
                    <i-inputbox v-model="form.name"
                                :disabled="true"
                                :readonly="true">
                    </i-inputbox>
                </i-form-item>
                <i-form-item :required="true"
                             label="内容">
                    <i-textarea style="height: 100px;"
                                v-model="form.describeValue"
                                :readonly="readonly">
                    </i-textarea>
                </i-form-item>
            </i-form>
            <div slot="footer"
                 style="float:right;margin-right:20px;">
                <i-button plain
                          @click="DescribeModifyItemWin.show = false">
                    取消
                </i-button>
                <i-button type="primary"
                          @click="submit">
                    提交
                </i-button>
            </div>
        </i-window>

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
import IWindow from '../../components/common/IWindow';
import IButton from '../../components/common/IButton';
import Tooltip from '../../components/common/OperationStatusTooltip';
import IDialog from '../../components/common/Dialog';
import IInputbox from '../../components/common/IInputbox';
import ISelect from '../../components/DmComponent/ISelect';
import IOption from '../../components/DmComponent/IOption';
import grid from '../../components/common/grid';
import IForm from "../../components/common/IForm"
import IFormItem from "../../components/common/IFormItem"
import ITextarea from "../../components/common/ITextarea";
import ToggleBox from "../../components/common/ToggleBox"
import noData from "../../components/layout/noData"
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
        },
        type: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            //获取单个数据的基本信息
            getMateDateSingleApi: './api/metaInfo/getById?id=',
            //获取单个数据的描述项信息
            getDescribeApi: './api/metaInfo/getDescribe?metaInfoId=',
            getDescribeItemApi: './api/metaInfo/getDescribeInfoVo?metaInfoId=',
            //新增单个数据的描述项信息
            addDescribeApi: './api/metaDescribeInfo/save',
            //修改单个数据的描述项信息
            modifyDescribeApi: './api/metaDescribeInfo/modify',
            //删除单个数据的描述项信息
            removeDescribeApi: './api/metaDescribeInfo/removeFromDbById?id=',
            // 获取组别描述数据接口
            getDescGroupApi: './api/standardInfo/selectDescribeInfoByStandardId?id=',
            // 获取基础信息
            getMetaAttributeInfoSingleApi: './api/metaAttributeInfo/getByWhere',
            isShow: this.visible,
            width: '800px',
            height: '550px',
            readonly: false,
            shpBaseInfo: [
                {
                    name: '上传人',
                    value: ''
                },
                {
                    name: '上传时间',
                    value: ''
                },
                {
                    name: '最大纬度',
                    value: ''
                },
                {
                    name: '最小纬度',
                    value: ''
                },
                {
                    name: '最大经度',
                    value: ''
                },
                {
                    name: '最小经度',
                    value: ''
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
            metaInfo: {},

            // 表单
            form: {
                id: '',
                name: '',
                describeValue: '',
                describeInfoId: '',
                metaInfoId: ''
            },
            descDataGridConfig: {
                operations: [{
                    title: "编辑",
                    icon: "&#xe90a",
                    func: this.modifyDescribeData
                }, {
                    title: "删除",
                    icon: "&#xe9ac",
                    func: this.removeDescribe
                }],
                operationItem: '',
                descDataTitleList: ['名称', '内容', '操作'],
                descDataList: [],
            },
            DescribeAddItemWin: {
                show: false,
                title: "",
                type: ""
            },
            DescribeModifyItemWin: {
                show: false,
                title: "",
                type: ""
            }
        };
    },
    methods: {
        // 弹窗
        showDescribeAddItemWin (title, type) {
            this.DescribeAddItemWin = {
                show: true,
                title: title,
                type: type
            }
        },
        showDescribeModifyItemWin (title, type) {
            this.DescribeModifyItemWin = {
                show: true,
                title: title,
                type: type
            }
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
            }
        },

        // 关闭对话框
        closeDialog () {
            this.dialogConfig.showDialog = false;
        },

        dialogCancel () {
            this.closeDialog();
        },

        modifyDescribeData (item) {
            if (item.hasOwnProperty('metaDescribeInfo')) {
                //如果有描述项值走修改结构
                this.showDescribeModifyItemWin(`修改描述项-${item.name}`, 'modify')
                this.descDataGridConfig.operationItem = item;
                this.form = {
                    id: item.metaDescribeInfo.id,
                    name: item.name,
                    describeInfoId: item.describeInfoId,
                    describeValue: item.metaDescribeInfo.describeValue,
                    metaInfoId: this.entityId
                };
            } else {
                //如果没有描述项值走新增结构
                this.showDescribeModifyItemWin(`修改描述项-${item.name}`, 'add')
                this.descDataGridConfig.operationItem = item;
                this.form = {
                    id: item.id,
                    name: item.name,
                    describeInfoId: item.id,
                    describeValue: '',
                    metaInfoId: this.entityId
                };
                this.selectConfig = {
                    descOptions: [],
                    descValue: ''
                }
            }

        },
        removeDescribe (item) {
            this.descDataGridConfig.operationItem = item;
            this.showDialog("alert", "确认要删除字段名为:" + item.name + "的描述字段吗?", "remove");
        },
        // 通过id查询某个数据信息
        getMateDateSingle () {
            this.$http.get(this.getMateDateSingleApi + this.entityId).then((res) => {
                var clgInfo = res.body.content;
                this.metaInfo = clgInfo;
                this.getDescGroup();
            },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },
        //获取单个数据的描述信息
        getDescribe () {
            this.$http.get(this.getDescribeItemApi + this.entityId).then((res) => {
                var clgInfoArr = [];
                res.body.content.forEach((itemArr, index) => {
                    clgInfoArr.push(itemArr);
                });
                this.descDataGridConfig.descDataList = clgInfoArr;
            },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },
        //获取单个数据某个规范下的组别描述项
        getDescGroup () {
            var clgInfoArr = [];
            this.$http.get(this.getDescGroupApi + this.metaInfo.standardInfo.id).then((res) => {
                res.body.content.groupInfoList.forEach((itemArr, index) => {
                    itemArr.describeInfoList.forEach((item => {
                        clgInfoArr.push(item);
                    }))
                });
                this.selectConfig.descOptions = clgInfoArr.filter(item => {
                    var flag = true;
                    this.descDataGridConfig.descDataList.forEach(itemInner => {
                        if (item.id == itemInner.describeInfoId) {
                            flag = false;
                        }
                    })
                    return flag;
                });
            },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },
        //获取单个数据的字段校验信息
        getMetaAttributeInfoSingle () {
            let parmas = {
                metaInfoId: this.entityId
            }
            this.$http.post(this.getMetaAttributeInfoSingleApi, parmas).then(
                (res) => {
                    if (res.body.status == 'success') {
                        let clgInfo = res.body.content[0];
                        this.shpBaseInfo.forEach((item) => {
                            switch (item.name) {
                                case '上传人':
                                    item.value = clgInfo.uploadName;
                                    break;
                                case '上传时间':
                                    item.value = clgInfo.uploadDate;
                                    break;
                                case '最大纬度':
                                    item.value = clgInfo.maxY;
                                    break;
                                case '最小纬度':
                                    item.value = clgInfo.minY;
                                    break;
                                case '最大经度':
                                    item.value = clgInfo.maxX;
                                    break;
                                case '最小经度':
                                    item.value = clgInfo.minX;
                                    break;
                            }
                        })
                    }
                },
                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                })
        },
        submit () {
            let message;
            let url;
            let form
            if ('add' == this.DescribeModifyItemWin.type) {
                url = this.addDescribeApi;
                message = '新增';
                form = {
                    describeValue: this.form.describeValue,
                    describeInfoId: this.form.describeInfoId,
                    metaInfoId: this.form.metaInfoId
                }
            } else if ('modify' == this.DescribeModifyItemWin.type) {
                url = this.modifyDescribeApi;
                message = '修改';
                form = {
                    id: this.form.id,
                    describeValue: this.form.describeValue,
                    describeInfoId: this.form.describeInfoId,
                    metaInfoId: this.form.metaInfoId
                }
            }
            if (this.form.describeValue == '' || this.form.describeValue.match(/^\s+$/)) {
                this.showTooltip('failed', '描述信息不能为空');
            } else {
                this.$http.post(url, form).then(
                    (res) => {
                        if ('success' == res.body.status) {
                            this.showTooltip('success', message + '成功');
                            this.getDescribe();
                            this.DescribeAddItemWin.type = '';
                            this.DescribeModifyItemWin.type = '';
                        } else {
                            this.showTooltip('failed', res.body.content);
                        }
                    },

                    (res) => {
                        this.showTooltip('failed', '服务器异常,请刷新后重试');
                    }
                );
            }
            this.closeDialog();
        },

        dialogConfirm () {
            this.closeDialog();
            if ('remove' == this.dialogConfig.operationType) {
                this.$http.get(this.removeDescribeApi + this.descDataGridConfig.operationItem.metaDescribeInfo.id).then(
                    (res) => {
                        if ('success' == res.body.status) {
                            this.showTooltip("success", "删除成功");
                            this.getDescribe();
                        } else {
                            this.showTooltip("success", "删除失败");
                        }
                    },
                    (res) => {
                        this.gridConfigs.selectedId = "";
                        this.showTooltip("failed", "服务器异常,请刷新后重试");
                    }
                )
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
                this.getDescribe();
                this.getMetaAttributeInfoSingle();
            } else {
                //通过向父组件传递事件的方式修改visible属性所对应的变量的值
                this.$emit("update:visible", val);
            }
        },
        "tooltipConfig.tooltipShow": function (val) {
            // 当tooltip关闭后，如果是成功类型的说明操作成功了，此时一并将Window一起关闭
            if (!val && "success" == this.tooltipConfig.tooltipType) {
                this.DescribeAddItemWin.show = false;
                this.DescribeModifyItemWin.show = false;
            }
        },
    },
    mounted () {

    },
    components: {
        ITextarea,
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
        ToggleBox,
        noData
    }
};

</script>

<style scoped>
.table {
  margin: 0 auto;
  font-size: 12px;
  text-align: center;
  border-collapse: collapse;
  border: 1px solid #e8edff;
  width: calc(100% - 50px);
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

td span {
  display: inline-block;
  height: 30px;
}

tr td:not(:last-child) span {
  line-height: 30px;
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
.title {
  width: calc(100% - 50px);
  margin: 10px auto;
  /* color: #336199; */
  line-height: 20px;
  font-size: 16px;
}
.baseInfo {
  box-sizing: border-box;
  width: calc(100% - 50px);
  margin: 10px auto;
  border: 1px solid #dcebf7;
  display: flex;
  flex-wrap: wrap;
}
.baseInfo .info-row {
  display: flex;
  width: 50%;
  height: 32px;
}
.info-row .info-name {
  color: #336199;
  background-color: #edf3f4;
  border-top: 1px solid #f7fbff;
  text-align: right;
  height: 32px;
  line-height: 32px;
  font-weight: 400;
  color: #667e99;
  width: 110px;
  padding-right: 10px;
  vertical-align: middle;
}
.info-row .info-value {
  width: calc(100% - 110px);
  border-top: 1px dotted #dcebf7;
  padding-left: 12px;
  height: 32px;
  line-height: 32px;
}
.info-row .no-border {
  border-top: none;
}
</style>
