<template>
  <Panel>
    <div slot="searchBar">
      <span>元数据名称:</span>
      <i-inputbox type="text"
                  placeholder="请输入元数据名称"
                  style="width:180px;height: 30px;margin-right:10px;"
                  v-model="gridConfigs.searchFields.name" />
      <i-button type="primary"
                plain
                @click="search">查询</i-button>
      <i-button type="primary"
                plain
                @click="reset">重置</i-button>
    </div>
    <div slot="actionBar">
      <i-button type="success"
                @click="addDataMeta">新增</i-button>
      <i-button type="danger"
                @click="batchRemoveDataMeta">批量删除</i-button>
    </div>
    <div>
      <grid :config="gridConfigs"
            ref="grid"></grid>
    </div>

    <!-- 确认操作的提示框 -->
    <my-dialog v-if="showDialog"
               :message="dialogMessage"
               @dialogCancel="dialogCancel"
               @dialogConfirm="dialogConfirm"></my-dialog>
    <!--　用于显示信息的提示工具　-->
    <my-tooltip :show="showTooltip"
                :showType="tooltipType"
                :message="tooltipMessage"
                @tooltipClosed="tooltipClosed"></my-tooltip>
    <!--新增数据源的对话框-->
    <myWindow v-if="dataMetaWindowConfig.show"
              :config="dataMetaWindowConfig">
      <Tabs v-model='tabConfig.activeTab'
            :config='tabConfig'>
        <TabPane label="标识信息">
          <i-form>
            <i-form-item label="名称"
                         labelWidth="80px">
              <i-inputbox v-model="dataMetaWindowConfig.form.name"
                          :readOnly="dataMetaWindowConfig.readonly" />
            </i-form-item>
            <i-form-item label="日期"
                         labelWidth="80px">
              <i-inputbox v-model="dataMetaWindowConfig.form.recentDate"
                          :readOnly="dataMetaWindowConfig.readonly" />
            </i-form-item>
            <i-form-item label="版本"
                         labelWidth="80px">
              <i-inputbox v-model="dataMetaWindowConfig.form.version"
                          :readOnly="dataMetaWindowConfig.readonly" />
            </i-form-item>
            <i-form-item label="语种"
                         labelWidth="80px">
              <i-inputbox v-model="dataMetaWindowConfig.form.languageCode"
                          :readOnly="dataMetaWindowConfig.readonly" />
            </i-form-item>
            <i-form-item label="范围"
                         labelWidth="80px">
              <i-inputbox v-inputLimit
                          zztype="intOrFloat"
                          style="text-align:center"
                          v-model="dataMetaWindowConfig.form.northLatitude"
                          :readOnly="dataMetaWindowConfig.readonly"
                          placeholder="请输入北纬"
                          width="82px" /> &nbsp;
              <!--北纬<i-inputbox style='width:40px' v-model="dataMetaWindowConfig.form.northLatitude" :readOnly="dataMetaWindowConfig.readonly"-->
              <!--/>-->
              <i-inputbox v-inputLimit
                          zztype="intOrFloat"
                          style="text-align:center"
                          v-model="dataMetaWindowConfig.form.southLatitude"
                          :readOnly="dataMetaWindowConfig.readonly"
                          placeholder="请输入南纬"
                          width="82px" /> &nbsp;
              <!--&nbsp;南纬<i-inputbox style='width:40px' v-model="dataMetaWindowConfig.form.southLatitude" :readOnly="dataMetaWindowConfig.readonly"-->
              <!--/>-->
              <i-inputbox v-inputLimit
                          zztype="intOrFloat"
                          style="text-align:center"
                          v-model="dataMetaWindowConfig.form.westLatitude"
                          :readOnly="dataMetaWindowConfig.readonly"
                          placeholder="请输入西经"
                          width="82px" /> &nbsp;
              <!--&nbsp;西经<i-inputbox style='width:40px' v-model="dataMetaWindowConfig.form.westLatitude" :readOnly="dataMetaWindowConfig.readonly"-->
              <!--/>-->
              <i-inputbox v-inputLimit
                          zztype="intOrFloat"
                          style="text-align:center"
                          v-model="dataMetaWindowConfig.form.eastLatitude"
                          :readOnly="dataMetaWindowConfig.readonly"
                          placeholder="请输入东经"
                          width="82px" />
              <!--&nbsp;东经<i-inputbox style='width:40px' v-model="dataMetaWindowConfig.form.eastLatitude" :readOnly="dataMetaWindowConfig.readonly"-->
              <!--/>-->
            </i-form-item>
            <i-form-item label="垂向"
                         labelWidth="80px">
              <i-inputbox v-inputLimit
                          zztype="intOrFloat"
                          style="text-align:center"
                          v-model="dataMetaWindowConfig.form.minVertical"
                          :readOnly="dataMetaWindowConfig.readonly"
                          placeholder="请输入最小"
                          width="82px" /> &nbsp;
              <!--最小<i-inputbox style='width:40px' v-model="dataMetaWindowConfig.form.minVertical" :readOnly="dataMetaWindowConfig.readonly"-->
              <!--/>-->
              <i-inputbox v-inputLimit
                          zztype="intOrFloat"
                          style="text-align:center"
                          v-model="dataMetaWindowConfig.form.maxVertical"
                          :readOnly="dataMetaWindowConfig.readonly"
                          placeholder="请输入最大"
                          width="82px" /> &nbsp;
              <!--&nbsp;最大<i-inputbox style='width:40px' v-model="dataMetaWindowConfig.form.maxVertical" :readOnly="dataMetaWindowConfig.readonly"-->
              <!--/>-->
              <i-inputbox v-inputLimit
                          zztype="intOrFloat"
                          style="text-align:center"
                          v-model="dataMetaWindowConfig.form.verticalUnit"
                          :readOnly="dataMetaWindowConfig.readonly"
                          placeholder="请输入平均"
                          width="82px" />
              <!--&nbsp;平均<i-inputbox style='width:40px' v-model="dataMetaWindowConfig.form.verticalUnit" :readOnly="dataMetaWindowConfig.readonly"-->
              <!--/>-->
            </i-form-item>
            <i-form-item label="安全等级"
                         labelWidth="80px">
              <i-inputbox v-model="dataMetaWindowConfig.form.securityLevel"
                          :readOnly="dataMetaWindowConfig.readonly" />
            </i-form-item>
          </i-form>
        </TabPane>
        <TabPane label="负责单位联系信息"
                 @click="alert(9)">
          <i-form>
            <i-form-item label="单位名称"
                         labelWidth="80px">
              <i-inputbox v-model="dataMetaWindowConfig.form.responsibleDepartment"
                          :readOnly="dataMetaWindowConfig.readonly" />
            </i-form-item>
            <i-form-item label="联系人"
                         labelWidth="80px">
              <i-inputbox v-model="dataMetaWindowConfig.form.contacts"
                          :readOnly="dataMetaWindowConfig.readonly" />
            </i-form-item>
            <i-form-item label="职责"
                         labelWidth="80px">
              <i-inputbox v-model="dataMetaWindowConfig.form.job"
                          :readOnly="dataMetaWindowConfig.readonly" />
            </i-form-item>
            <i-form-item label="电话"
                         labelWidth="80px">
              <i-inputbox v-model="dataMetaWindowConfig.form.telephone"
                          :readOnly="dataMetaWindowConfig.readonly" />
            </i-form-item>
            <i-form-item label="传真"
                         labelWidth="80px">
              <i-inputbox v-model="dataMetaWindowConfig.form.fax"
                          :readOnly="dataMetaWindowConfig.readonly" />
            </i-form-item>
            <i-form-item label="通信地址"
                         labelWidth="80px">
              <i-inputbox v-model="dataMetaWindowConfig.form.address"
                          :readOnly="dataMetaWindowConfig.readonly" />
            </i-form-item>
            <i-form-item label="邮政编码"
                         labelWidth="80px">
              <i-inputbox v-model="dataMetaWindowConfig.form.zipCode"
                          :readOnly="dataMetaWindowConfig.readonly" />
            </i-form-item>
            <i-form-item label="邮箱"
                         labelWidth="80px">
              <i-inputbox v-model="dataMetaWindowConfig.form.email"
                          :readOnly="dataMetaWindowConfig.readonly" />
            </i-form-item>
            <i-form-item label="网址"
                         labelWidth="80px">
              <i-inputbox v-model="dataMetaWindowConfig.form.netAddress"
                          :readOnly="dataMetaWindowConfig.readonly" />
            </i-form-item>
          </i-form>
        </TabPane>
      </Tabs>
    </myWindow>
  </Panel>
</template>

  <script>
import grid from '../../components/common/grid.vue';
import Panel from '../../components/Panel.vue';
import MyDialog from '../../components/common/Dialog.vue';
import MyTooltip from '../../components/common/OperationStatusTooltip.vue';
import MyWindow from '../../components/common/Window.vue';
import Tree from '../../components/common/Tree.vue';
import TreeSelect from '../../components/common/TreeSelect.vue';
import Checkbox from '../../components/common/Checkbox.vue';
import Tabs from '../../components/common/Tabs.vue';
import TabPane from '../../components/common/TabPane.vue';
import IForm from '../../components/common/IForm';
import IFormItem from '../../components/common/IFormItem';
import IInputbox from '../../components/common/IInputbox';
import ITextarea from '../../components/common/ITextarea';
import IButton from '../../components/common/IButton';
export default {
  props: {},
  data () {
    return {
      // 获取用户信息接口
      getUserMessageApi: './api/sys/getCurrentUser',
      // 获取单个元数据信息接口
      getSingleDataMetaApi: './api/dataMetadata/getById?id=',
      // 增加元数据接口
      addDataMetaApi: './api/dataMetadata/save',
      // 修改元数据信息接口
      modifyDataMetaApi: './api/dataMetadata/modify',
      // 删除元数据源信息接口
      removeDataMetaApi: './api/dataMetadata/removeFromDbById?id=',
      // 批量删除元数据信息接口
      removeDataMetaBatchApi: './api/dataMetadata/batchRemoveFromDb',
      dataTypeAll: [],
      dataSourceTypeAll: [],
      tabConfig: {
        activeTab: 0,
        style: {
          width: '100%',
          height: 'auto'
        }
      },
      showDialog: false,
      dialogMessage: '',
      showTooltip: false,
      tooltipType: '',
      tooltipMessage: '',
      iconEditFlag: false,
      iconCloseFlag: false,
      gridConfigs: {
        operationColumnWidth: '10%',
        operations: [
          {
            title: '编辑',
            icon: '&#xe90a',
            func: this.modifyDataMeta
          },
          {
            title: '浏览',
            icon: '&#xe9ce',
            func: this.viewDataMeta
          },
          {
            title: '删除',
            icon: '&#xe9ac',
            func: this.removeDataMeta
          }
        ],
        searchFields: {
          type: '',
          sourceType: '',
          name: ''
        },
        operationType: '',
        operationItem: {},
        getSelectedNames: [],
        getSelectedIds: [],
        fields: [
          {
            title: '数据名称',
            field: 'name',
            isSortField: true,
            sortType: 'asc',
            style: {
              width: '19%',
              float: 'left',
              textAlign: 'left',
              paddingLeft: '2%'
            }
          },
          {
            title: '日期',
            field: 'dataMetadata.recentDate',
            style: {
              width: '13%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '版本',
            field: 'dataMetadata.version',
            style: {
              width: '15%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '语种',
            field: 'dataMetadata.languageCode',
            style: {
              width: '9%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '负责单位',
            field: 'dataMetadata.responsibleDepartment',
            style: {
              width: '11%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '联系人',
            field: 'dataMetadata.contacts',
            style: {
              float: 'left',
              width: '11%',
              textAlign: 'center'
            }
          }
          // {
          //   title: "电话",
          //   field: "dataMetadata.telephone",
          //   style: {
          //     float: "left",
          //     width: "9%",
          //     textAlign: "center"
          //   }
          // },
          // {
          //   title: "邮箱",
          //   field: "dataMetadata.email",
          //   style: {
          //     textAlign: "center"
          //   }
          // }
        ],
        currPageNum: 1,
        totalPageNum: 1,
        pageSize: 10,
        api: './api/data/getPage'
      },
      dataMetaWindowConfig: {
        type: '', //add modify view 分别表示新增，修改以及查看
        show: false,
        parent: this,
        title: '',
        height: '600px',
        width: '800px',
        form: {
          id: '',
          name: '',
          dataId: '',
          recentData: '',
          version: '',
          languageCode: '',
          summary: '',
          northLatitude: '',
          southLatitude: '',
          westLatitude: '',
          eastLatitude: '',
          areaName: '',
          startData: '',
          endData: '',
          minVertical: '',
          maxVertical: '',
          verticalUnit: '',
          securityLevel: '',
          responsibleDepartment: '',
          contacts: '',
          job: '',
          telephone: '',
          fax: '',
          address: '',
          zipCode: '',
          email: '',
          netAddress: ''
        },
        method: {
          close () {
            this.dataMetaWindowConfig.show = false;
          },
          cancel () {
            this.dataMetaWindowConfig.show = false;
          },
          confirm () {
            if (this.dataMetaWindowConfig.type === 'add') {
              this.$http
                .post(this.addDataMetaApi, this.dataMetaWindowConfig.form)
                .then(
                  res => {
                    if (res.body.status == 'success') {
                      this.search();
                      this.tooltipType = 'success';
                      this.tooltipMessage = '添加成功!';
                      this.showTooltip = true;
                    } else {
                      this.tooltipType = 'failed';
                      this.tooltipMessage = res.body.message;
                      this.showTooltip = true;
                    }
                  },
                  res => {
                    this.tooltipType = 'failed';
                    this.tooltipMessage = res.body.message;
                    this.showTooltip = true;
                  }
                );
            } else if (this.dataMetaWindowConfig.type === 'modify') {
              this.$http
                .post(this.modifyDataMetaApi, this.dataMetaWindowConfig.form)
                .then(
                  res => {
                    this.dataMetaWindowConfig.show = false;
                    //新增完按创建时间降序排序，方便查看最新增加的信息
                    if (res.body.status == 'success') {
                      for (var idx in this.gridConfigs.fields) {
                        var field = this.gridConfigs.fields[idx];
                      }
                      this.search();
                      this.tooltipType = 'success';
                      this.tooltipMessage = '修改成功!';
                      this.showTooltip = true;
                    } else {
                      this.tooltipType = 'failed';
                      this.tooltipMessage = res.body.message;
                      this.showTooltip = true;
                    }
                  },
                  res => {
                    this.tooltipType = 'failed';
                    this.tooltipMessage = '修改失败!';
                    this.showTooltip = true;
                  }
                );
            }
            this.dataMetaWindowConfig.show = false;
          }
        }
      }
    };
  },
  methods: {
    search () {
      //条件查询时必须将当前页重置为1
      this.$refs.grid.resetCurrentPageNum();
      this.$refs.grid.search();
    },
    reset () {
      this.gridConfigs.searchFields.type = '';
      this.gridConfigs.searchFields.sourceType = '';
      this.gridConfigs.searchFields.name = '';
      this.search();
    },
    dialogCancel () {
      //对值进行重置,不然不会触发change事件
      this.showDialog = false;
    },
    tooltipClosed () {
      this.showTooltip = false;
    },
    addDataMeta () {
      //新增时清空数据
      this.dataMetaWindowConfig.form = {
        id: '',
        name: '',
        dataId: '',
        recentData: '',
        version: '',
        languageCode: '',
        summary: '',
        northLatitude: '',
        southLatitude: '',
        westLatitude: '',
        eastLatitude: '',
        areaName: '',
        startData: '',
        endData: '',
        minVertical: '',
        maxVertical: '',
        verticalUnit: '',
        securityLevel: '',
        responsibleDepartment: '',
        contacts: '',
        job: '',
        telephone: '',
        fax: '',
        address: '',
        zipCode: '',
        email: '',
        netAddress: ''
      };
      this.dataMetaWindowConfig.show = true;
      this.dataMetaWindowConfig.title = '新增数据源';
      this.dataMetaWindowConfig.readonly = false;
      this.dataMetaWindowConfig.type = 'add';
      this.tabConfig.activeTab = 0;
    },
    modifyDataMeta (item) {
      this.$http
        .get(this.getSingleDataMetaApi + item.dataMetadata.id)
        .then(res => {
          var clgInfo = res.body.content;
          this.dataMetaWindowConfig.form = {
            id: clgInfo.id,
            name: clgInfo.name,
            dataId: clgInfo.dataId,
            recentData: clgInfo.recentData,
            version: clgInfo.version,
            languageCode: clgInfo.languageCode,
            summary: clgInfo.summary,
            northLatitude: clgInfo.northLatitude,
            southLatitude: clgInfo.southLatitude,
            westLatitude: clgInfo.westLatitude,
            eastLatitude: clgInfo.eastLatitude,
            areaName: clgInfo.areaName,
            startData: clgInfo.startData,
            endData: clgInfo.endData,
            minVertical: clgInfo.minVertical,
            maxVertical: clgInfo.maxVertical,
            verticalUnit: clgInfo.verticalUnit,
            securityLevel: clgInfo.securityLevel,
            responsibleDepartment: clgInfo.responsibleDepartment,
            contacts: clgInfo.contacts,
            job: clgInfo.job,
            telephone: clgInfo.telephone,
            fax: clgInfo.fax,
            address: clgInfo.address,
            zipCode: clgInfo.zipCode,
            email: clgInfo.email,
            netAddress: clgInfo.netAddress
          };
          this.dataMetaWindowConfig.show = true;
          this.dataMetaWindowConfig.title = '编辑数据源信息';
          this.dataMetaWindowConfig.type = 'modify';
          this.dataMetaWindowConfig.readonly = false;
          this.dataMetaWindowConfig.parentClgReadonly = true;
          this.tabConfig.activeTab = 0;
        });
    },
    removeDataMeta (item) {
      this.dialogMessage = '确认需要移除' + item.description + '这个数据源吗?';
      this.operationType = 'removeDataMeta';
      this.operationItem = item;
      this.showDialog = true;
    },
    batchRemoveDataMeta () {
      this.gridConfigs.getSelectedNames = [];
      this.gridConfigs.getSelectedIds = [];
      var selectItems = this.$refs.grid.getSelectedItems();
      if (selectItems.length == 0) {
        this.tooltipType = 'failed';
        this.tooltipMessage = '请先选择角色!';
        this.showTooltip = true;
        return;
      } else {
        for (var i in selectItems) {
          this.gridConfigs.getSelectedIds.push(selectItems[i].id);
          this.gridConfigs.getSelectedNames.push(selectItems[i].name);
        }
        this.dialogMessage =
          '确认要批量删除：' + this.gridConfigs.getSelectedNames + ' 的角色吗?';
        this.operationType = 'removeDataMetaBatch';
        this.showDialog = true;
      }
    },
    viewDataMeta (item) {
      this.$http
        .get(this.getSingleDataMetaApi + item.dataMetadata.id)
        .then(res => {
          var clgInfo = res.body.content;
          this.dataMetaWindowConfig.form = {
            id: clgInfo.id,
            name: clgInfo.name,
            dataId: clgInfo.dataId,
            recentData: clgInfo.recentData,
            version: clgInfo.version,
            languageCode: clgInfo.languageCode,
            summary: clgInfo.summary,
            northLatitude: clgInfo.northLatitude,
            southLatitude: clgInfo.southLatitude,
            westLatitude: clgInfo.westLatitude,
            eastLatitude: clgInfo.eastLatitude,
            areaName: clgInfo.areaName,
            startData: clgInfo.startData,
            endData: clgInfo.endData,
            minVertical: clgInfo.minVertical,
            maxVertical: clgInfo.maxVertical,
            verticalUnit: clgInfo.verticalUnit,
            securityLevel: clgInfo.securityLevel,
            responsibleDepartment: clgInfo.responsibleDepartment,
            contacts: clgInfo.contacts,
            job: clgInfo.job,
            telephone: clgInfo.telephone,
            fax: clgInfo.fax,
            address: clgInfo.address,
            zipCode: clgInfo.zipCode,
            email: clgInfo.email,
            netAddress: clgInfo.netAddress
          };
          this.dataMetaWindowConfig.show = true;
          this.dataMetaWindowConfig.title = '预览数据源';
          this.dataMetaWindowConfig.type = 'view';
          this.dataMetaWindowConfig.readonly = true;
          this.dataMetaWindowConfig.parentClgReadonly = true;
          this.tabConfig.activeTab = 0;
        });
    },
    dialogConfirm () {
      this.showDialog = false;
      if (this.operationType == 'removeDataMeta') {
        this.$http.get(this.removeDataMetaApi + this.operationItem.id).then(
          res => {
            this.tooltipType = 'success';
            this.tooltipMessage = '删除成功!';
            this.showTooltip = true;
            this.search();
          },
          res => {
            this.tooltipType = 'failed';
            this.tooltipMessage = '删除失败!';
            this.showTooltip = true;
          }
        );
      } else if (this.operationType == 'removeDataMetaBatch') {
        this.$http
          .post(this.removeDataMetaBatchApi, this.gridConfigs.getSelectedIds)
          .then(
            res => {
              this.tooltipType = 'success';
              this.tooltipMessage = '批量删除成功!';
              this.showTooltip = true;
              this.search();
              this.gridConfigs.getSelectedIds = [];
            },
            res => {
              this.tooltipType = 'failed';
              this.tooltipMessage = '批量删除失败!';
              this.showTooltip = true;
              this.gridConfigs.getSelectedIds = [];
            }
          );
      }
    }
  },
  mouted () {
    // 数据存储类型接口
    this.$http.get(this.dataTypeApi).then(res => {
      this.dataTypeAll = res.body.content;
    });
    // 数据源类型接口
    this.$http.get(this.dataSourceTypeApi).then(res => {
      this.dataSourceTypeAll = res.body.content;
    });
  },
  components: {
    grid,
    Panel,
    MyDialog,
    MyTooltip,
    MyWindow,
    TreeSelect,
    Tree,
    Checkbox,
    TabPane,
    Tabs,
    IForm,
    IFormItem,
    IInputbox,
    ITextarea,
    IButton
  }
};
</script>

  <style scoped>
</style>
