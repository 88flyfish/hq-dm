<template>
    <div>
        <i-window :visible.sync="isShow"
                  :title="title"
                  :width="width"
                  :height="height">

            <div style="width: 600px; margin: auto;margin-top: 15px;">
                <i-transfer :title="transferConfig.transferTitle"
                            v-model="transferConfig.existingGroup"
                            :hasSearch="transferConfig.hasSearch"
                            :originalData="transferConfig.originalData">
                </i-transfer>
            </div>

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
        </i-window>

        <!--　用于显示信息的提示工具　-->
        <tooltip :show.sync="tooltipConfig.tooltipShow"
                 :showType="tooltipConfig.tooltipType"
                 @tooltipClosed="tooltipConfig.tooltipShow = false;"
                 :message="tooltipConfig.tooltipMessage">
        </tooltip>

    </div>
</template>

<script>
import IWindow from "../../../components/common/IWindow"
import IButton from "../../../components/common/IButton"
import Tooltip from "../../../components/common/OperationStatusTooltip"
import grid from "../../../components/common/grid"
import IInputbox from "../../../components/common/IInputbox"
import ISelect from "../../../components/DmComponent/ISelect"
import IOption from "../../../components/DmComponent/IOption"
import IForm from "../../../components/common/IForm"
import IFormItem from "../../../components/common/IFormItem"
import ITransfer from "../../../components/DmComponent/ITransfer"

export default {
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
    data () {
        return {
            isShow: this.visible,
            width: "700px",
            height: "530px",
            tooltipConfig: {
                tooltipShow: false,
                tooltipType: "",
                tooltipMessage: ""
            },
            transferConfig: {
                hasSearch: true,
                transferTitle: ["未配置组别", "已配置组别"],
                originalData: [],
                existingGroup: []
            }
        }
    },
    methods: {
        showTooltip (type, message) {
            this.tooltipConfig = {
                tooltipType: type,
                tooltipMessage: message,
                tooltipShow: true
            };
        },
        // 配置组别
        submit () {
            let standardInfoList = [];
            if (this.transferConfig.existingGroup.length > 0) {
                this.transferConfig.existingGroup.forEach((item, index) => {
                    standardInfoList.push({
                        standardInfoId: this.entityId,
                        groupInfoId: item.value,
                        orderNum: ++index
                    });
                });
            } else {
                standardInfoList.push({
                    standardInfoId: this.entityId,
                    groupInfoId: null
                })
            }

            this.$http.post('./api/standardGroupInfo/batchSave', standardInfoList).then(
                (res) => {
                    if ('success' == res.body.status) {
                        this.showTooltip('success', '配置成功');
                    } else {
                        this.showTooltip('failed', '配置失败');
                    }
                },

                (res) => {
                    this.showTooltip('failed', '服务器异常,请刷新后重试');
                }
            )
        },

        getDescGroup () {
            this.$http.get('./api/standardInfo/selectDescribeInfoByStandardId?id=' + this.entityId).then(
                (res) => {
                    this.transferConfig.existingGroup = [];

                    if (res.body.content.groupInfoList.length > 0) {
                        // 所有该规范下的组别
                        this.transferConfig.existingGroup = res.body.content.groupInfoList.map((item) => {
                            return {
                                value: item.id,
                                label: item.name,
                            }
                        });
                    }

                    // 所有组别
                    this.$http.get('./api/groupInfo/getAll').then(
                        (res) => {
                            if (res.body.content.length > 0) {
                                this.transferConfig.originalData = res.body.content.map((item) => {
                                    return {
                                        value: item.id,
                                        label: item.name,
                                    }
                                });

                                // 过滤已配置组别
                                this.transferConfig.existingGroup.forEach(item => {
                                    this.transferConfig.originalData = this.transferConfig.originalData.filter(o => o.value != item.value);
                                })
                            }
                        }
                    )
                }
            )
        }
    },
    watch: {
        visible (val) {
            this.isShow = val;
        },
        isShow (val) {
            //为true表示显示当前Window
            if (val) {
                // 组别
                this.getDescGroup();
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
        IWindow,
        IButton,
        Tooltip,
        grid,
        IInputbox,
        ISelect,
        IOption,
        IForm,
        IFormItem,
        ITransfer
    }
}
</script>

<style scoped>
</style>
