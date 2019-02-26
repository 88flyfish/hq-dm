<template>
    <transition name='fade'>
        <div>
            <i-window :visible.sync="isShow"
                      :title="gridConfigs.title"
                      :width="width"
                      :height="height">
                <div style="width:100%;background-color:#eff1f5;padding: 12px 10px;border:1px solid #aaaaaa;border-bottom: 0px;height: 50px;">
                    <div class="fl control-list-search">
                        <span>资源名称:</span>
                        <i-inputbox style="width: 150px;height: 30px"
                                    placeholder="请输入资源名称"
                                    v-model="gridConfigs.searchFields.resourceName" />

                        <i-button style="margin-left: 10px; padding: 1px 8px"
                                  type="primary"
                                  plain
                                  @click="search">
                            查询
                        </i-button>
                        <i-button style="padding: 1px 8px"
                                  type="primary"
                                  plain
                                  @click="reset">
                            重置
                        </i-button>
                    </div>
                </div>

                <div style="height:calc(100% - 50px);border:1px solid #aaaaaa;overflow: auto;width: 100%;">
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
            </i-window>

            <!-- 修改历史版本弹窗 -->
            <resource-record-win @emitCoordinate="emitCoordinate"
                                 @emitShpField="emitShpField"
                                 v-if="resourceRecordWin.show"
                                 :visible.sync="resourceRecordWin.show"
                                 :title="resourceRecordWin.title"
                                 :entityId="resourceRecordWin.entityId"
                                 :type="resourceRecordWin.type">
            </resource-record-win>

            <!--　用于显示信息的提示工具　-->
            <tooltip :show.sync="tooltipConfig.tooltipShow"
                     :showType="tooltipConfig.tooltipType"
                     :message="tooltipConfig.tooltipMessage"
                     @tooltipClosed="tooltipConfig.tooltipShow = false;">
            </tooltip>
        </div>
    </transition>

</template>

<script>
import IWindow from "../../../components/common/IWindow";
import grid from '../../../components/common/grid.vue';
import IButton from '../../../components/common/IButton';
import resourceRecordWin from "./resourceRecordWin";
import IInputbox from '../../../components/common/IInputbox';
import Tooltip from '../../../components/common/OperationStatusTooltip';

export default {
    name: "resource-list-win",
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
        deptId: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: ""
        }
    },
    data () {
        var that = this;
        return {
            width: '700px',
            height: '450px',
            isShow: this.visible,
            readonly: false,
            // 信息提示
            tooltipConfig: {
                tooltipShow: false,
                tooltipType: "",
                tooltipMessage: ""
            },
            // 查看历史版本弹窗

            resourceRecordWin: {
                show: false,
                title: '',
                entityId: '',
                type: '',
            },
            // 数据列表
            recordItem: null,
            // 数据列表
            gridConfigs: {
                title: '选择资源',
                selectedId: '',
                //grid 列是否可以点击
                rowChecked: false,
                operationColumnWidth: '60px',
                hasCheckbox: false,
                getSelectedIds: [],
                getSelectedNames: [],
                searchFields: {
                    resourceName: '',
                    deptId: '',
                    applyStatus: ''
                },
                operations: [
                    {
                        title: '文件列表',
                        icon: "&#xe9b9",
                        func: this.fileRecord
                    }
                ],
                fields: [
                    {
                        title: "资源名称",
                        field: "resourceName",
                        isSortField: true,
                        style: {
                            width: "27%",
                            float: "left",
                            textAlign: "center"
                        }
                    },
                    {
                        title: "资源目录",
                        field: "dataDirectory.name",
                        isSortField: true,
                        style: {
                            width: "27%",
                            float: "left",
                            textAlign: "center"
                        }
                    },
                    {
                        title: "资源描述",
                        field: "fileDes",
                        style: {
                            float: "left",
                            width: "27%",
                            textAlign: "center"
                        }
                    }
                ],

                currPageNum: 1,
                totalPageNum: 1,
                pageSize: 10,
                api: "./api/directoryFileInfo/getAllFileInfoPage"
            },
        }
    },
    methods: {
        search () {
            //条件查询时必须将当前页重置为1
            this.$refs.grid.resetCurrentPageNum();
            this.$refs.grid.search();
        },
        reset () {
            this.gridConfigs.searchFields.resourceName = "";
            this.search(true);
        },
        // 信息提示
        showTooltip (type, message) {
            this.tooltipConfig = {
                tooltipType: type,
                tooltipMessage: message,
                tooltipShow: true
            };
        },
        // 显示历史版本弹窗
        showResourceRecordWin (id, title, type) {
            this.resourceRecordWin = {
                show: true,
                entityId: id,
                title: title,
                type: type
            }
        },
        // 文件列表
        fileRecord (item) {
            this.showResourceRecordWin(item.id, `文件记录`, 'view');
            this.$refs.grid.rows = this.$refs.grid.rows.map(item => {
                item.isChecked = false;
                return item;
            })
            this.recordItem = null;
            item.isChecked = true;
        },
        //确认查询
        emitCoordinate (info) {
            this.$emit('emitCoordinate', info);
        },
        emitShpField (info) {
            this.$emit('emitShpField', info);
        }
    },

    watch: {
        visible (val) {
            this.isShow = val;
        },
        isShow (val) {
            //为true表示显示当前Window
            if (val) {

            } else {
                //通过向父组件传递事件的方式修改visible属性所对应的变量的值
                this.$emit("update:visible", val);
            }
        },

    },
    components: {
        grid,
        IWindow,
        IButton,
        resourceRecordWin,
        IInputbox,
        Tooltip
    }
}
</script>

<style scoped>
    .fade-leave-active {
  animation-name: fade-in;
  animation-duration: 0.3s;
  -webkit-transition: opacity 0.3s linear;
  -moz-transition: opacity 0.3s linear;
  -ms-transition: opacity 0.3s linear;
  -o-transition: opacity 0.3s linear;
  transition: opacity 0.3s linear;
}
.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>
