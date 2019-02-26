<template>
    <div>
        <i-window :visible.sync="isShow"
                  :title="title"
                  width="950px"
                  height="550px">
            <div>
                <grid :config="gridConfigs"
                      ref="grid"></grid>
            </div>
        </i-window>
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
import grid from '../../components/common/grid.vue';
import Tooltip from "../../components/common/OperationStatusTooltip"
export default {
    name: 'resource-item-win',
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
        var that = this;
        return {
            isShow: this.visible,
            readonly: false,
            // 信息提示
            tooltipConfig: {
                tooltipShow: false,
                tooltipType: "",
                tooltipMessage: ""
            },
            uploadConfig: {
                files: []
            },
            // 数据列表
            gridConfigs: {
                hasCheckbox: false,
                selectedId: '',
                getSelectedIds: [],
                getSelectedNames: [],
                searchFields: {
                    dfId: that.entityId
                },
                operations: [
                    {
                        title: '下载',
                        icon: '&#xe625',
                        func: this.download
                    }
                ],
                fields: [
                    {
                        title: '文件名',
                        field: 'fileName',
                        isSortField: true,
                        style: {
                            width: '25%',
                            float: 'left',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '版本号',
                        field: 'verNum',
                        isSortField: true,
                        style: {
                            width: '10%',
                            float: 'left',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '上传时间',
                        field: 'createDate',
                        sortType: 'desc',
                        isSortField: true,
                        style: {
                            width: '20%',
                            float: 'right',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '状态',
                        field: 'applyStatus',
                        style: {
                            width: '10%',
                            float: 'right',
                            textAlign: 'center'
                        },
                        styleCallback: function (value) {
                            if ('待审核' == value) {
                                return {
                                    color: 'blue'
                                };
                            } else if ('审核未通过' == value) {
                                return {
                                    color: 'red',
                                };
                            } else if ('已通过' == value) {
                                return {
                                    color: 'green'
                                };
                            }
                        }
                    },
                    {
                        title: '原因描述',
                        field: 'updateReason',
                        style: {
                            textAlign: 'center'
                        }
                    }
                ],
                searchedCallback: function (rows) {
                    if (rows && rows.length > 0) {
                        var temp = [];
                        rows.map(function (item) {
                            if (document.body.clientWidth < 1400) {
                                item.createDate = item.createDate.slice(
                                    0,
                                    item.createDate.indexOf(' ')
                                );
                            }
                            if (item.applyStatus == '1') {
                                item.applyStatus = '待审核';
                                temp.push(item);
                            } else if (item.applyStatus == '2') {
                                item.applyStatus = '审核未通过';
                                temp.push(item);
                            } else if (item.applyStatus == '3') {
                                item.applyStatus = '已通过';
                                temp.push(item);
                            }
                            return true;
                        });
                        rows = temp;
                    }
                    return rows;
                },

                currPageNum: 1,
                totalPageNum: 1,
                pageSize: 5,
                api: `./api/dataDirectoryUpdateFileInfo/getFileList`
            }
        };
    },
    methods: {
        download (item) {
            this.$http.get(`./api/fileDownload/download/${item.fileInfoId}`).then(
                res => {
                    window.location.href = `./api/fileDownload/download/${item.fileInfoId}`;
                    // funDownload(res,'1.zip')
                },
                res => {
                    this.showTooltip('failed', '文件不存在');
                }
            );
        },
        showTooltip (type, message) {
            this.tooltipConfig = {
                tooltipType: type,
                tooltipMessage: message,
                tooltipShow: true
            };
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
                this.$emit('update:visible', val);
            }
        }
    },
    components: {
        grid,
        IWindow,
        Tooltip
    }
};
</script>

<style scoped>
</style>
