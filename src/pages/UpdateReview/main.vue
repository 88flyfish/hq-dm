<template>
    <panel>
        <div slot="searchBar">
            <span>资源名称:</span>
            <i-inputbox v-model="gridConfigs.searchFields.resourceName"
                        style="width:200px;height: 30px;margin-right:10px;"
                        placeholder="请输入资源名称"></i-inputbox>
            <i-button type="primary"
                      plain
                      @click="search">
                查询
            </i-button>
            <i-button type="primary"
                      plain
                      @click="reset">
                重置
            </i-button>
        </div>

        <div>
            <grid :config="gridConfigs"
                  ref="grid"></grid>
        </div>

        <!--　用于显示信息的提示工具　-->
        <tooltip :show.sync="tooltipConfig.tooltipShow"
                 :showType="tooltipConfig.tooltipType"
                 :message="tooltipConfig.tooltipMessage"></tooltip>

        <!-- 用于查看当前数据源信息的窗口组件 -->
        <my-window :visible.sync="dataWindowConfig.show"
                   :title="dataWindowConfig.title"
                   :width="dataWindowConfig.width"
                   :height="dataWindowConfig.height">
            <i-form>
                <i-form-item label="审核结果">
                    <i-radio v-model="review"
                             name="check"
                             label="3">
                        <small>批准</small>
                    </i-radio>&nbsp;&nbsp;
                    <i-radio v-model="review"
                             name="check"
                             label='2'>
                        <small>驳回</small>
                    </i-radio>
                </i-form-item>

                <i-form-item label="驳回原因描述" style="line-height: 150px;"
                             v-if="review!=='3'&& (status == '审核未通过'||status == '')">
                    <i-textarea style="height: 150px; width: 100%"
                                :disabled="review!=='2'&& status == ''"
                                v-model="rejectReason"
                                :readonly="review!=='2'&& status == ''">
                    </i-textarea>
                </i-form-item>

            </i-form>
            <div slot="footer"
                 style="float:right;margin-right:20px">
                <i-button v-if="!dataWindowConfig.readonly"
                          @click="cancel">
                    取消
                </i-button>
                <i-button v-if="!dataWindowConfig.readonly"
                          type="primary"
                          @click="submit">
                    提交
                </i-button>
            </div>
        </my-window>

        <!-- 文件记录 -->
        <file-record-win v-if="fileRecordWin.show"
                         @search="search"
                         :visible.sync="fileRecordWin.show"
                         :title="fileRecordWin.title"
                         :entityId="fileRecordWin.entityId"
                         :type="fileRecordWin.type">
        </file-record-win>

    </panel>
</template>

<script>
import grid from '../../components/common/grid.vue';
import Tooltip from '../../components/common/OperationStatusTooltip.vue';
import MyWindow from '../../components/common/IWindow.vue';
import IButton from '../../components/common/IButton';
import IForm from '../../components/common/IForm';
import IFormItem from '../../components/common/IFormItem';
import Panel from '../../components/Panel';
import IInputbox from '../../components/common/IInputbox';
import ISelect from '../../components/DmComponent/ISelect';
import IOption from '../../components/DmComponent/IOption';
import IRadio from '../../components/common/IRadio';
import ITextarea from '../../components/common/ITextarea';
import fileRecordWin from './fileRecordWin';
export default {
    name: 'data-source',
    components: {
        IInputbox,
        grid,
        Tooltip,
        MyWindow,
        IButton,
        IForm,
        IFormItem,
        Panel,
        ISelect,
        IOption,
        IRadio,
        ITextarea,
        fileRecordWin
    },
    data () {
        var that = this;
        return {
            //审批状态
            review: '3',
            status: '',
            //驳回原因信息
            rejectReason: '',
            selectId: '',
            //保存将要批量删除
            removeForm: {},
            //消息提示
            tooltipConfig: {
                tooltipShow: false,
                tooltipType: '',
                tooltipMessage: ''
            },

            dataWindowConfig: {
                show: false,
                title: '',
                entityId: '',
                type: '',
                width: '600px',
                height: '400px'
            },
            // 新增修改弹窗
            fileRecordWin: {
                show: false,
                title: '',
                entityId: '',
                type: ''
            },

            //表格基本配置
            gridConfigs: {
                hasCheckbox: false,
                maskByParent: false,
                searchFields: {
                    resourceName: '',
                    dfId: that.entityId
                },
                operationColumnWidth: '200px',
                operations: [
                    {
                        title: '审核',
                        icon: '&#xe900;',
                        func: this.reviewResource
                    },
                    {
                        title: '历史版本',
                        icon: '&#xe9b9',
                        func: this.fileRecord
                    },
                    {
                        title: '下载',
                        icon: '&#xe625',
                        func: this.dowload
                    }
                ],
                operationType: '',
                operationItem: {
                    id: ''
                },
                getSelectedNames: [],
                getSelectedIds: [],
                fields: [
                    {
                        title: '资源名称',
                        field: 'resourceName',
                        style: {
                            float: 'left',
                            width: '11%',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '资源目录',
                        field: 'directoryName',
                        style: {
                            width: '10%',
                            float: 'left',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '文件名',
                        field: 'fileName',
                        style: {
                            float: 'left',
                            width: '8%',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '更新版本号',
                        field: 'verNum',
                        style: {
                            float: 'left',
                            width: '9%',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '更新描述',
                        field: 'updateReason',
                        style: {
                            float: 'left',
                            width: '8%',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '所属委办局',
                        field: 'orgName',
                        isSortField: true,
                        orderBy: 'orgName',
                        style: {
                            float: 'left',
                            width: '8%',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '上传人',
                        field: 'uploaderName',
                        isSortField: true,
                        style: {
                            float: 'left',
                            width: '14%',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '上传时间',
                        field: 'createDate',
                        isSortField: true,
                        style: {
                            float: 'left',
                            width: '7%',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '审核状态',
                        field: 'applyStatus',
                        style: {
                            textAlign: 'center'
                        },
                        styleCallback: function (value) {
                            if ('待审核' == value) {
                                return {
                                    color: 'blue'
                                };
                            } else if ('审核未通过' == value) {
                                return {
                                    color: 'red'
                                };
                            } else if ('已通过' == value) {
                                return {
                                    color: 'green'
                                };
                            }
                        }
                    }
                ],
                searchedCallback: function (rows) {
                    if (rows && rows.length > 0) {
                        var temp = [];
                        rows.map(function (item) {
                            //裁剪时间时分秒信息
                            item.createDate = item.createDate.slice(
                                0,
                                item.createDate.indexOf(' ')
                            );
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
                pageSize: 10,
                api: './api/dataDirectoryUpdateFileInfo/getPage'
            }
        };
    },
    methods: {
        // 条件查询
        search () {
            //条件查询时必须将当前页重置为1
            this.$refs.grid.resetCurrentPageNum();
            this.$refs.grid.search();
        },

        // 重置查询条件
        reset () {
            this.gridConfigs.searchFields.resourceName = '';
            this.search();
        },

        // 显示消息提示
        showTooltip (type, message) {
            this.tooltipConfig = {
                tooltipType: type,
                tooltipMessage: message,
                tooltipShow: true
            };
        },


        //审核窗口
        reviewResource (item) {
            this.selectId = item.id;
            if (item.applyStatus == '2' || item.applyStatus == '审核未通过') {
                this.review = '2';
                this.rejectReason = item.rejectReason;
            } else {
                this.review = '3';
                this.rejectReason = ''
            }
            this.dataWindowConfig.show = true;
            this.dataWindowConfig.type = 'add';
            this.dataWindowConfig.title = `审核-${item.fileName}文件`;
            this.dataWindowConfig.readonly = false;
        },

        //下载
        dowload (item) {
            let id = item.url.substr(item.url.lastIndexOf('\/') + 1, );
            this.$http.get(`./api/fileDownload/download/${id}`).then(
                res => {
                    window.location.href = `./api/fileDownload/download/${id}`;
                    // funDownload(res,'1.zip')
                },
                res => {
                    this.showTooltip('failed', '文件不存在');
                }
            );
        },
        // 文件记录
        fileRecord (item) {
            this.showFileRecord(item.dfId, `文件记录`, 'view');
        },

        showFileRecord (id, title, type) {
            this.fileRecordWin = {
                show: true,
                entityId: id,
                title: title,
                type: type
            };
        },

        //关闭或退出数据源信息弹窗
        cancel () {
            this.dataWindowConfig.form = {};
            this.dataWindowConfig.show = false;
        },

        // 提交表单
        submit () {
            let message;
            let url = './api/dataDirectoryUpdateFileInfo/modify';
            var obj = {
                rejectReason: this.rejectReason,
                id: this.selectId,
                applyStatus: this.review
            };
            if (this.review == '2') {
                message = '驳回';
            } else {
                message = '审批';
            }
            this.$http.post(url, obj).then(
                res => {
                    if ('success' == res.body.status) {
                        this.showTooltip('success', message + '成功');
                        this.search();
                        this.dataWindowConfig.show = false;
                        this.rejectReason = '';
                        this.review = '';
                    } else {
                        this.showTooltip('failed', res.body.message);
                    }
                },
                res => {
                    this.showTooltip('failed', message + '失败');
                }
            );
        }
    },
    watch: {
        'dataWindowConfig.show': function (val) {
            //为true表示显示当前Window
            if (val) {
                //新增
            } else {
                //通过向父组件传递事件的方式修改visible属性所对应的变量的值
                this.$emit('update:visible', val);
            }
        }
    }
};
</script>

<style scoped>
</style>

