<template>
    <panel>
        <div slot="searchBar">
            <span>数据名称:</span>
            <i-inputbox placeholder="请输入数据名称"
                        v-model="gridConfigs.searchFields.metaName"
                        style="width:180px; height: 30px; margin-right:20px;"></i-inputbox>
            <span>资源目录:</span>
            <div style="display:inline-block;vertical-align: middle;">
                <tree-select :selectStyle="treeSelectSearchConfig.selectStyle"
                             :api="treeSelectSearchConfig.api"
                             v-model="gridConfigs.searchFields.themeId"
                             :hasSearch="treeSelectSearchConfig.hasSearch"
                             :treeStyleConfig="{leafIcon:'&#xe92f;'}"
                             ref="treeSelect"></tree-select>
            </div>
            <i-button type="primary"
                      plain
                      @click="search">查询</i-button>
            <i-button type="primary"
                      plain
                      @click="reset">重置</i-button>
        </div>
        <div slot="actionBar">
            <i-button type="success"
                      @click="addMetaData"
                      style="margin-right: 10px;">新增</i-button>
            <!-- <i-button type="danger" @click="batchRemoveMetaData">批量删除</i-button> -->
        </div>
        <div>
            <grid :config="gridConfigs"
                  ref="grid"></grid>
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
        <!-- 数据窗口 -->
        <meta-data-win @freshGrid='search'
                       :visible.sync="metaDataWindowConfig.show"
                       :title="metaDataWindowConfig.title"
                       :entityId="metaDataWindowConfig.entityId"
                       :type="metaDataWindowConfig.type">
        </meta-data-win>
        <!-- 数据基本信息修改窗口 -->
        <meta-data-base-win :visible.sync="metaDataBaseWindowConfig.show"
                            :title="metaDataBaseWindowConfig.title"
                            :entityId="metaDataBaseWindowConfig.entityId"
                            :type="metaDataBaseWindowConfig.type">
        </meta-data-base-win>
        <!-- 字段描述项窗口 -->
        <desc-data-win :visible.sync="descDataWindowConfig.show"
                       :title="descDataWindowConfig.title"
                       :entityId="descDataWindowConfig.entityId"
                       :type="descDataWindowConfig.type">
        </desc-data-win>
        <!-- 数据更新窗口 -->
        <update-meta-data-win @freshGrid='search'
                              :visible.sync="updateMetaDataWindowConfig.show"
                              :title="updateMetaDataWindowConfig.title"
                              :entityId="updateMetaDataWindowConfig.entityId"
                              :standardInfoId="updateMetaDataWindowConfig.standardInfoId"
                              :type="updateMetaDataWindowConfig.type">
        </update-meta-data-win>

        <!--错误信息提示窗口-->
        <i-window :visible.sync="errorMessage.showDialog"
                  :title="errorMessage.title"
                  width="600px"
                  height="400px">
            <i-form>
                <i-textarea style="height: 300px;"
                            v-model="errorMessage.dialogMessage"
                            :readonly="true">
                </i-textarea>
            </i-form>
            <div slot="footer"
                 style="float:right;margin-right:20px;">
                <i-button plain
                          @click="errorMessage.showDialog = false">
                    关闭
                </i-button>
            </div>
        </i-window>
    </panel>
</template>

<script>
import grid from '../../components/common/grid.vue';
import Panel from '../../components/Panel.vue';
import IDialog from '../../components/common/Dialog.vue';
import tooltip from '../../components/common/OperationStatusTooltip.vue';
import IForm from '../../components/common/IForm';
import IFormItem from '../../components/common/IFormItem';
import IInputbox from '../../components/common/IInputbox';
import IButton from '../../components/common/IButton';
import TreeSelect from '../../components/DmComponent/TreeSelect';
import ITextarea from '../../components/common/ITextarea';
import metaDataWin from './metaDataWin';
import metaDataBaseWin from './metaDataBaseWin';
import descDataWin from './descDataWin';
import updateMetaDataWin from './updateMetaDataWin';
import IWindow from '../../components/common/IWindow.vue';
export default {
    name: 'meta-data-manage',
    provide () {
        return {
            search: this.search
        };
    },
    data () {
        var that = this;
        return {
            timer: null,
            timeId: -1,//定时任务状态置
            timerManager: null,//定时任务管理器
            screenWidth: document.body.clientWidth,
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
            },
            // 资源目录树形下拉框
            treeSelectSearchConfig: {
                api: './api/theme/getAll',
                field: 'nameSearch',
                hasSearch: true,
                selectStyle: {
                    width: '200px',
                    height: '30px'
                }
            },
            //表单
            gridConfigs: {
                operations: [
                    {
                        title: '更新',
                        icon: '&#xe92d',
                        func: this.updateMetaData,
                        condition (row) {
                            if ('入库失败' == row.metaStatus) {
                                return false;
                            }
                            return true;
                        }
                    },
                    {
                        title: '编辑',
                        icon: '&#xe90a',
                        func: this.modifyMetaData
                    },
                    {
                        title: '查看',
                        icon: '&#xe9ce',
                        func: this.viewMetaData
                    },
                    {
                        title: '描述项',
                        icon: '&#xe920',
                        func: this.descDataFun
                    },
                    {
                        title: '下载',
                        icon: '&#xe625',
                        func: this.downLoad
                    },
                    {
                        title: '删除',
                        icon: '&#xe9ac',
                        func: this.removeMetaData
                    }
                ],
                searchFields: {
                    type: '',
                    sourceType: '',
                    metaName: '',
                    themeId: ''
                },
                hasCheckbox: false,
                isLoading: true,
                maskByParent: false,
                operationType: '',
                operationItem: {},
                getSelectedNames: [],
                getSelectedIds: [],
                fields: [
                    {
                        title: '数据名称',
                        field: 'metaName',
                        isSortField: true,
                        style: {
                            width: '8%',
                            float: 'left',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '资源目录',
                        field: 'theme.name',
                        style: {
                            width: '8%',
                            float: 'left',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '规范名称',
                        field: 'standardInfo.name',
                        style: {
                            width: '9%',
                            float: 'left',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '数据源名称',
                        field: 'sourceInfo.sourceName',
                        style: {
                            width: '13%',
                            float: 'left',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '表名',
                        field: 'tableName',
                        style: {
                            width: '10%',
                            float: 'left',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '创建人',
                        field: 'createUser.chinaname',
                        style: {
                            float: 'left',
                            width: '8%',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '状态',
                        field: 'metaStatus',
                        style: {
                            width: '8%',
                            float: 'right',
                            textAlign: 'center'
                        },
                        operation: function (row) {
                            if (row.metaStatus == 2 || row.metaStatus == '入库失败' || row.metaStatus == '更新失败') {
                                that.errorMessage.showDialog = true;
                                if (row.failMessage) {
                                    that.errorMessage.dialogMessage = row.failMessage;
                                } else {
                                    that.errorMessage.dialogMessage = "";
                                }
                            }
                        },
                        styleCallback: function (fieldValue) {
                            if ('入库中' == fieldValue || '数据更新中' == fieldValue) {
                                return {
                                    color: 'blue',
                                };
                            } else if ('入库失败' == fieldValue || '更新失败' == fieldValue) {
                                return {
                                    color: 'red',
                                    cursor: 'pointer',
                                };
                            } else if ('入库成功' == fieldValue || '更新成功' == fieldValue) {
                                return {
                                    color: 'green'
                                };
                            }
                        }
                    },
                    {
                        title: '更新时间',
                        field: 'updateDate',
                        isSortField: true,
                        sortType: 'desc',
                        style: {
                            width: '9%',
                            float: 'right',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '创建时间',
                        field: 'createDate',
                        isSortField: true,
                        sortType: 'desc',
                        style: {
                            width: '9%',
                            float: 'right',
                            textAlign: 'center'
                        }
                    },




                ],
                searchedCallback: function (rows) {
                    //监听状态 启动定时任务
                    var isFinished = true;
                    for (var row of rows) {
                        if (row.metaStatus == '入库中' || row.metaStatus == '数据更新中' || row.metaStatus == '0' || row.metaStatus == '3') {
                            isFinished = false;
                        }
                    }
                    if (!isFinished) {
                        that.timeId++;
                    } else {
                        that.timeId = -1;
                    }

                    if (rows && rows.length > 0) {
                        var temp = [];
                        rows.map(function (item) {
                            if (document.body.clientWidth < 1400) {
                                item.createDate = item.createDate.slice(0, item.createDate.indexOf(' '))
                            }
                            if (item.metaStatus == '0') {
                                item.metaStatus = '入库中';
                                temp.push(item);
                            } else if (item.metaStatus == '1') {
                                item.metaStatus = '入库成功';
                                temp.push(item);
                            } else if (item.metaStatus == '2') {
                                item.metaStatus = '入库失败';
                                temp.push(item);
                            } else if (item.metaStatus == '3') {
                                item.metaStatus = '数据更新中';
                                temp.push(item);
                            } else if (item.metaStatus == '4') {
                                item.metaStatus = '更新成功';
                                temp.push(item);
                            } else if (item.metaStatus == '5') {
                                item.metaStatus = '更新失败';
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
                api: './api/metaInfo/getMetaInfoPage'
            },
            metaDataWindowConfig: {
                show: false,
                title: '',
                entityId: '',
                type: ''
            },
            metaDataBaseWindowConfig: {
                show: false,
                title: '',
                entityId: '',
                type: ''
            },
            descDataWindowConfig: {
                show: false,
                title: '',
                entityId: '',
                type: ''
            },
            updateMetaDataWindowConfig: {
                show: false,
                title: '',
                entityId: '',
                standardInfoId: '',
                type: ''
            },
            errorMessage: {
                showDialog: false,
                title: '错误信息提示',
                entityId: '',
                type: 'view',
                dialogMessage: ''
            }
        };
    },
    methods: {
        errorMessageDialogCancel () {
            alert("errorMessageDialogCancel")
            this.errorMessage.showDialog = false;
        },
        errorMessageDialogConfirm () {
            alert("errorMessagedialogConfirm")
            this.errorMessage.showDialog = false;
        },

        search (flag) {
            let showFlag;
            if (typeof flag == 'undefined' || typeof flag == 'object') {
                showFlag = true;
            } else {
                showFlag = false;
            }

            this.gridConfigs.isLoading = showFlag;
            if (this.$refs.grid) {
                this.$refs.grid.resetCurrentPageNum();
                this.$refs.grid.search();
            }
        },
        reset () {
            this.gridConfigs.searchFields.themeId = '';
            this.gridConfigs.searchFields.metaName = '';
            this.$refs.treeSelect.title = '';
            this.search();
        },
        dialogCancel () {
            //对值进行重置,不然不会触发change事件
            this.showDialog = false;
        },
        tooltipClosed () {
            this.showTooltip = false;
        },
        //显示数据弹窗
        showMetaDataWin (id, title, type) {
            this.metaDataWindowConfig = {
                show: true,
                entityId: id,
                title: title,
                type: type
            };
        },
        //显示数据基本信息修改弹窗
        showMetaDataBaseWin (id, title, type) {
            this.metaDataBaseWindowConfig = {
                show: true,
                entityId: id,
                title: title,
                type: type
            };
        },
        //显示数据基本信息更新弹窗
        showUpdateMetaDataWin (id, title, type, standardInfoId) {
            this.updateMetaDataWindowConfig = {
                show: true,
                entityId: id,
                title: title,
                type: type,
                standardInfoId: standardInfoId
            };
        },
        //显示描述项弹窗
        showDescDataWin (id, title, type) {
            this.descDataWindowConfig = {
                show: true,
                entityId: id,
                title: title,
                type: type
            };
        },
        addMetaData () {
            this.showMetaDataWin('', '新增数据', 'add');
        },
        modifyMetaData (item) {
            this.showMetaDataBaseWin(item.id, `修改数据-${item.metaName}`, 'modify');
        },
        updateMetaData (item) {
            this.showUpdateMetaDataWin(item.id, `更新数据-${item.metaName}`, 'update', item.standardInfoId);
        },
        viewMetaData (item) {
            this.showMetaDataWin(item.id, `预览数据-${item.metaName}`, 'view');
        },
        descDataFun (item) {
            this.showDescDataWin(item.id, `描述项-${item.metaName}`, '');
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
            };
        },

        // 关闭对话框
        closeDialog () {
            this.dialogConfig.showDialog = false;
        },

        dialogCancel () {
            this.closeDialog();
        },

        removeMetaData (item) {
            // this.gridConfigs.getSelectedIds = [];
            // this.gridConfigs.getSelectedIds.push(item.id);
            this.gridConfigs.operationItem = item;
            this.showDialog('alert', '确认需要移除名称为：' + item.metaName + '的数据吗?', 'remove');
        },

        batchRemoveMetaData () {
            this.gridConfigs.getSelectedNames = [];
            this.gridConfigs.getSelectedIds = [];
            var selectItems = this.$refs.grid.getSelectedItems();
            if (selectItems.length == 0) {
                this.showTooltip('failed', '请选择至少一条数据');
            } else {
                for (var i in selectItems) {
                    this.gridConfigs.getSelectedIds.push(selectItems[i].id);
                    this.gridConfigs.getSelectedNames.push(selectItems[i].metaName);
                }
                this.showDialog(
                    'alert',
                    `确认要批量删除名称为：${this.gridConfigs.getSelectedNames.join('、')}的数据吗?`,
                    'batchRemove'
                );
            }
        },

        dialogConfirm () {
            this.closeDialog();
            if (this.dialogConfig.operationType == 'remove') {
                this.$http.get('./api/metaInfo/removeById?id=' + this.gridConfigs.operationItem.id).then(
                    res => {
                        if ('success' == res.body.status) {
                            this.showTooltip('success', '删除成功');
                            this.search();
                        } else {
                            this.showTooltip('failed', res.body.message);
                        }
                    },
                    res => {
                        this.showTooltip('failed', message + '删除失败');
                    }
                );
            }
        },
        downLoad (item) {
            this.$http.get(`./api/fileDownload/download/${item.fileInfoId}`).then(
                res => {
                    window.location.href = `./api/fileDownload/download/${item.fileInfoId}`;
                    // funDownload(res,'1.zip')
                },
                res => {
                    this.showTooltip('failed', '文件不存在');
                }
            );
        }
    },
    mounted () {
        const that = this;
        window.onresize = () => {
            return (() => {
                window.screenWidth = document.body.clientWidth
                that.screenWidth = window.screenWidth
            })()
        }
    },

    watch: {
        timeId (val) {
            if (val >= 0) {
                if (!this.timerManager) {
                    this.timerManager = setTimeout(() => {
                        this.timerManager = null;
                        this.search()
                    }, 5000);
                } else {
                    clearTimeout(this.timerManager);
                }
            } else {
                if (this.timerManager) {
                    clearTimeout(this.timerManager);
                    this.timerManager = null;
                }
            }
        },
        screenWidth (val) {
            if (!this.timer) {
                this.screenWidth = val
                this.timer = true
                let that = this
                setTimeout(function () {
                    that.search();
                    that.timer = false
                }, 700)
            }
        }
    },
    components: {
        grid,
        Panel,
        IDialog,
        tooltip,
        IForm,
        IFormItem,
        IInputbox,
        ITextarea,
        IButton,
        metaDataWin,
        metaDataBaseWin,
        updateMetaDataWin,
        descDataWin,
        TreeSelect,
        IWindow
    }
};
</script>

<style scoped>
</style>
