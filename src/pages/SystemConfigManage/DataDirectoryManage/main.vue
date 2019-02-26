<template>
    <action-panel classConfig="{width:'22%'}">
        <div slot="searchBar">
            <span>数据目录名称:</span>

            <i-inputbox v-model="gridConfigs.searchFields.name"
                        style="width:180px;height: 30px;margin-right:10px;"
                        placeholder="请输入数据目录名称">
            </i-inputbox>
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
        <!-- 操作 -->
        <div slot="actionBar">
            <i-button :disabled="selectedDir == '0001'"
                      style="margin-right: 10px"
                      type="success"
                      @click="addDataDir">
                新增
            </i-button>

            <i-button type="danger"
                      @click="batchRemove">
                批量删除
            </i-button>
        </div>

        <!-- 左侧栏 -->
        <div slot="actionBox"
             style="height:100%">
            <tree ref="tree"
                  :defaultSelectedId="defaultSelectedId"
                  api="./loginapi/sys/org/getAll"
                  apiType="get"
                  :hasCheckbox="false"
                  :expandLevel="2"
                  :styleConfig="{nodeIcon:'',leafIcon:'&#xe92f;'}"
                  @selected="selected">
            </tree>
        </div>

        <!-- 分页列表 -->
        <div>
            <grid :config="gridConfigs"
                  ref="grid"></grid>
        </div>

        <!-- 新增修改弹窗 -->
        <data-dir-win @search="search"
                      :visible.sync="dataDirWin.show"
                      :title="dataDirWin.title"
                      :entityId="dataDirWin.entityId"
                      :deptId="dataDirWin.deptId"
                      :type="dataDirWin.type">
        </data-dir-win>

        <!-- 确认操作对话框 -->
        <i-dialog v-if="dialogConfig.show"
                  :message="dialogConfig.dialogMessage"
                  :type="dialogConfig.type"
                  @dialogCancel="dialogCancel"
                  @dialogConfirm="dialogConfirm">
        </i-dialog>

        <!-- 信息提示 -->
        <tooltip :show.sync="tooltipConfig.tooltipShow"
                 :showType="tooltipConfig.tooltipType"
                 :message="tooltipConfig.tooltipMessage">
        </tooltip>
    </action-panel>
</template>

<script>
import ActionPanel from '../../../components/ActionPanel';
import Grid from '../../../components/common/grid';
import IButton from '../../../components/common/IButton';
import Tree from '../../../components/common/Tree';
import DataDirWin from './DataDirWin';
import Tooltip from '../../../components/common/OperationStatusTooltip';
import IDialog from '../../../components/common/Dialog';
import IInputbox from '../../../components/common/IInputbox';
export default {
    name: 'data-directory',
    data () {
        return {
            //默认选中的树节点
            defaultSelectedId: '0001',
            selectedDir: '0001',
            // 新增修改弹窗
            dataDirWin: {
                show: false,
                title: '',
                entityId: '',
                type: '',
                deptId: ''
            },

            // 对话框
            dialogConfig: {
                show: false,
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

            // 数据列表
            gridConfigs: {
                maskByParent: false,
                selectedId: '',
                getSelectedIds: [],
                getSelectedNames: [],
                searchFields: {
                    parentId: '',
                    name: ''
                },
                operations: [
                    //   {
                    //     title: "查看",
                    //     icon: "&#xe9ce",
                    //     func: this.viewDataDir
                    //   },
                    {
                        title: '编辑',
                        icon: '&#xe90a',
                        func: this.modifyDataDir
                    },
                    {
                        title: '删除',
                        icon: '&#xe9ac',
                        func: this.removeDataDir
                    }
                ],
                fields: [
                    {
                        title: '数据目录名称',
                        field: 'name',
                        isSortField: true,
                        style: {
                            width: '25%',
                            float: 'left',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '创建时间',
                        field: 'createDate',
                        isSortField: true,
                        sortType: 'desc',
                        style: {
                            float: 'right',
                            width: '15%',
                            textAlign: 'center'
                        }
                    },
                    {
                        title: '创建人',
                        field: 'user.chinaname',
                        style: {
                            textAlign: 'center'
                        }
                    }
                ],
                currPageNum: 1,
                totalPageNum: 1,
                pageSize: 10,
                api: './api/dataDirectory/getPage'
            }
        };
    },

    methods: {
        // 查询
        // 条件查询
        search () {
            //条件查询时必须将当前页重置为1
            this.$refs.grid.resetCurrentPageNum();
            this.$refs.grid.search();
        },
        //重置、仅清空输入框
        reset () {
            this.gridConfigs.searchFields.name = ''
            this.search()
        },
        // 显示新增/修改弹窗
        showDataDirWin (id, deptId, title, type) {
            this.dataDirWin = {
                show: true,
                entityId: id,
                deptId: deptId,
                title: title,
                type: type
            };
        },

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

        dialogCancel () {
            this.closeDialog();
        },

        // 选中树目录
        selected (id) {
            // this.defaultSelectedId = id

            this.selectedDir = id
            this.gridConfigs.searchFields.parentId = '0001' == id ? '' : id;
            this.reset();
        },

        // 新增
        addDataDir () {
            this.showDataDirWin('', this.selectedDir, '新增数据目录', 'add');
        },

        // 查看
        viewDataDir (item) {
            this.showDataDirWin(
                item.id,
                item.parentId,
                `查看数据目录(只读)-${item.name
                    .replace(/\((.+?)\)/g, '')
                    .replace(/（(.+?)）/g, '')}`,
                'view'
            );
        },

        // 修改
        modifyDataDir (item) {
            this.showDataDirWin(item.id, item.parentId, `修改数据目录名称`, 'modify');
        },

        // 删除对话框
        removeDataDir (item) {
            this.gridConfigs.selectedId = item.id;
            this.showDialog(
                'alert',
                `确认要删除名称为${item.name}的数据目录吗?`,
                'removeDataDir'
            );
        },

        // 批量删除对话框
        batchRemove () {
            this.gridConfigs.getSelectedNames = [];
            this.gridConfigs.getSelectedIds = [];
            var selectItems = this.$refs.grid.getSelectedItems();
            if (selectItems.length == 0) {
                this.showTooltip('failed', '请选择至少一条数据目录');
            } else {
                for (let i in selectItems) {
                    this.gridConfigs.getSelectedIds.push(selectItems[i].id);
                    this.gridConfigs.getSelectedNames.push(selectItems[i].name);
                }
                this.showDialog(
                    'alert',
                    `确认要批量删除名称为：${this.gridConfigs.getSelectedNames.join(
                        '、'
                    )}的数据目录吗?`,
                    'batchRemove'
                );
            }
        },

        // 确认操作
        dialogConfirm () {
            this.closeDialog();

            if ('removeDataDir' == this.dialogConfig.operationType) {
                this.$http
                    .get(
                        './api/dataDirectory/removeFromDbById?id=' +
                        this.gridConfigs.selectedId
                    )
                    .then(
                        res => {
                            if ('success' == res.body.status) {
                                this.showTooltip('success', '删除成功');
                                this.search();
                            } else {
                                this.showTooltip('success', '删除失败');
                            }
                        },
                        res => {
                            this.showTooltip('failed', '服务器异常,请刷新后重试');
                        }
                    );
            } else if ('batchRemove' == this.dialogConfig.operationType) {
                this.$http
                    .post(
                        './api/dataDirectory/batchRemoveFromDb',
                        this.gridConfigs.getSelectedIds
                    )
                    .then(
                        res => {
                            if ('success' == res.body.status) {
                                this.showTooltip('success', '批量删除成功');
                                this.search();
                            } else {
                                this.showTooltip('failed', '批量删除失败');
                            }
                        },
                        res => {
                            this.showTooltip('failed', '服务器异常,请刷新后重试');
                        }
                    );
            }
        }
    },

    components: {
        IButton,
        Grid,
        ActionPanel,
        Tree,
        DataDirWin,
        Tooltip,
        IDialog,
        IInputbox
    }
};
</script>

<style scoped>
</style>
