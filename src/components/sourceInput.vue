<template>
  <div class="sourceInput">
    <MyWindow v-if="dataSourceWindowConfig.show"
              :config="dataSourceWindowConfig">
        <div class="win-search-bar">
          <span>数据储存类型:</span>
          <Iselect v-model="dataSourceGridConfigs.searchFields.dataType"
                   :config="typeConfig"></Iselect>
          <span style="margin-left:10px;">数据源类型:</span>
          <Iselect v-model="dataSourceGridConfigs.searchFields.sourceType"
                   :config="sourceTypeConfig"
                   ref="sourceType1"
                   @change="dataSourceSearch"></Iselect>
          <div style="display:inline-block;vertical-align: top;">
            <span style="margin-left:10px;">数据源名称:</span>
            <Iinput placeholder="请输入数据源名称"
                    v-model="dataSourceGridConfigs.searchFields.name"
                    width="160px"
                    height="30px"></Iinput>
            <i-button type="primary" plain
                      @click="dataSourceSearch">查询</i-button>
            <i-button type="primary" plain
                    @click="dataSourceReset">重置</i-button>
          </div>
        </div>
        <div class="win-grid">
          <grid :config="dataSourceGridConfigs"
                ref="dataSourceGrid"></grid>
        </div>

    </MyWindow>
    <div class="input-box">
      <Iinput v-model="fileSourceName"
              :height="height"></Iinput>
      <button class="choose-btn"
              @click="dataSourceWindowConfig.show = true;"
              :style="{height:height?height:'32px'}">
        选择数据源
      </button>
    </div>
  </div>
</template>

<script>
import WaitMask from './common/WaitMask'
import grid from "./common/grid.vue"
import MyWindow from "./common/Window.vue"
import Iinput from './common/IInputbox'
import Panel from "./Panel.vue"
import Iselect from './common/ISelect'
import IButton from "./common/IButton";
export default {
  props: ['height'],
  components: {
    IButton,
    WaitMask, grid, MyWindow, Iinput, Panel, Iselect
  },
  methods: {
    dataSourceSearch () {
      //条件查询时必须将当前页重置为1
      this.$refs.dataSourceGrid.resetCurrentPageNum();
      this.$refs.dataSourceGrid.search();
    },
    dataSourceReset () {
      this.dataSourceGridConfigs.searchFields.dataType = '';
      this.dataSourceGridConfigs.searchFields.sourceType = "";
      this.dataSourceGridConfigs.searchFields.name = "";
      this.dataSourceSearch();
    }
  },
  name: "sourceInput",
  data () {
    return {
      nosqlDbItemApi: "./loginapi/sys/dictionary/getListByCode?code=nosql_db_item",
      nosqlDbItemOptions: [],
      relationalDbItemApi: "./loginapi/sys/dictionary/getListByCode?code=relational_db_item",
      relationalDbItemOptions: [],
      spatialDbItemApi: "./loginapi/sys/dictionary/getListByCode?code=spatial_db_item",
      spatialDbItemOptions: [],
      fileSysItemApi: "./loginapi/sys/dictionary/getListByCode?code=file_sys_item",
      fileSysItemOptions: [],
      typeConfig: {
        width: '150px',
        height: '30px',
        options: []
      },
      sourceTypeConfig: {
        width: '150px',
        height: '30px',
        options: []
      },
      fileSourceId: '',
      fileSourceName: '',
      dataSourceGridConfigs: {
        hasCheckbox: false,
        searchFields: {
          dataType: "",
          sourceType: "",
          name: ""
        },
        getSelectedNames: [],
        selectedIds: [],
        fields: [{
          title: "数据源名称",
          field: "name",
          style: {
            width: "25%",
            float: "left",
            textAlign: "center"
          },
        }, {
          title: "数据源编号",
          field: "code",
          style: {
            width: "20%",
            float: "left",
            textAlign: "center"
          }
        }, {
          title: "存储类型",
          field: "dataType",
          style: {
            width: "20%",
            float: "left",
            textAlign: "center"
          }
        }, {
          title: "数据源类型",
          field: "sourceType",
          isSortField: true,
          sortType: "desc",
          style: {
            width: "25%",
            float: "left",
            textAlign: "center"
          }
        }],
        currPageNum: 1,
        totalPageNum: 1,
        pageSize: 10,
        api: './api/dataSource/getPage',
        searchedCallback: function (rows) {
          for (var i in rows) {
            var row = rows[i];
            switch (row.dataType) {
              case 'relational_db':
                row.dataType = "关系型数据库";
                break;
              case 'file_sys':
                row.dataType = "文件系统";
                break;
              case 'nosql_db':
                row.dataType = "NoSQL数据库";
                break;
              case 'spatial_db':
                row.dataType = "空间数据库";
                break;
            }
          }
        }
      },
      dataSourceWindowConfig: {
        type: 'add',
        show: false,
        parent: this,
        title: '请选择数据源',
        height: '710px',
        width: '950px',
        readonly: false,
        method: {
          close () {
            this.dataSourceWindowConfig.show = false;
          },
          cancel () {
            this.dataSourceWindowConfig.show = false;
          },
          confirm () {
            //待改动
            var selectItems = this.$refs.dataSourceGrid.getSelectedItems();
            if (selectItems.length == 0) {
              this.tooltipType = "failed";
              this.tooltipMessage = "请选择一条数据!"
              this.showTooltip = true;
              return;
            } else {
              this.dataSourceGridConfigs.getSelectedNames = [];
              this.dataSourceGridConfigs.selectedIds = [];
              selectItems.forEach(item => {
                this.dataSourceGridConfigs.selectedIds.push(item.id)
                this.dataSourceGridConfigs.getSelectedNames.push(item.name)
              })
              // this.addWindowConfig.form.fileSourceId = this.dataSourceGridConfigs.selectedIds[0]
              this.fileSourceId = this.dataSourceGridConfigs.selectedIds[0]
              this.fileSourceName = this.dataSourceGridConfigs.getSelectedNames[0]
              this.$emit('setFileSource', this.dataSourceGridConfigs.selectedIds[0], this.dataSourceGridConfigs.getSelectedNames[0])
              this.dataSourceWindowConfig.show = false;
            }
          }
        }
      }
    }
  },
  created () {
    // 数据存储类型接口
    this.$http.get('./loginapi/sys/dictionary/getListByCode?code=datatype').then(
      (res) => {
        let arr = res.body.content;
        arr.forEach(item => {
          item.value = item.dictCode;
          item.label = item.name;
        })
        this.typeConfig.options = arr;

      });
    // 数据源类型接口
    this.$http.get(this.nosqlDbItemApi).then(
      res => {
        let arr = res.body.content;
        arr.forEach(item => {
          item.value = item.dictCode;
          item.label = item.name;
        })
        // arr.unshift({value: '', label: '全部'})
        this.nosqlDbItemOptions = arr;
      }
    )
    this.$http.get(this.relationalDbItemApi).then(
      res => {
        let arr = res.body.content;
        arr.forEach(item => {
          item.value = item.dictCode;
          item.label = item.name;
        })
        // arr.unshift({value: '', label: '全部'})
        this.relationalDbItemOptions = arr;
      }
    )
    this.$http.get(this.spatialDbItemApi).then(
      res => {
        let arr = res.body.content;
        arr.forEach(item => {
          item.value = item.dictCode;
          item.label = item.name;
        })
        // arr.unshift({value: '', label: '全部'})
        this.spatialDbItemOptions = arr;
      }
    )
    this.$http.get(this.fileSysItemApi).then(
      res => {
        let arr = res.body.content;
        arr.forEach(item => {
          item.value = item.dictCode;
          item.label = item.name;
        })
        // arr.unshift({value: '', label: '全部'})
        this.fileSysItemOptions = arr;
      }
    )
  },
  watch: {
    'dataSourceGridConfigs.searchFields.dataType' (val) {
      if (val == 'relational_db') {
        this.sourceTypeConfig.options = this.relationalDbItemOptions;
      } else if (val == 'nosql_db') {
        this.sourceTypeConfig.options = this.nosqlDbItemOptions;
      } else if (val == 'spatial_db') {
        this.sourceTypeConfig.options = this.spatialDbItemOptions;
      } else if (val == 'file_sys') {
        this.sourceTypeConfig.options = this.fileSysItemOptions;
      } else if (val == '') {
        this.sourceTypeConfig.options = [];
      }

      // this.$refs.sourceType1.text = '请选择';
      this.dataSourceGridConfigs.searchFields.sourceType = '';
      this.dataSourceSearch();
    },
  }
}
</script>

<style lang="less" scoped>
.sourceInput {
  .input-box {
    position: relative;
    .choose-btn {
      position: absolute;
      right: 0;
      top: 0px;
      width: 80px;
      height: 32px;
      border-radius: 4px;
      /*background: #13ce66;*/
      background: #20a0ff;
      color: #fff;
      cursor: pointer;
    }
  }
}
.win-search-bar {
  width: 100%;
  background-color: #eff1f5;
  padding: 8px 10px;
  border: 1px solid #aaa;
  border-bottom: 0px;
}
.win-grid {
  height: calc(100% - 50px);
  border: 1px solid #aaaaaa;
  overflow: auto;
  width: 100%;
}
</style>
