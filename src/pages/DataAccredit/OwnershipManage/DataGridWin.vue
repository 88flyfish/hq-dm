<template>
  <i-window :visible.sync="isShow"
            :title="title"
            width="720px"
            height="650px">
    <div class="win-search-bar">
      <div>
        <span>数据名称:</span>
        <i-inputbox style="width: 150px;height: 30px"
                    placeholder="请输入数据名称"
                    v-model="gridConfigs.searchFields.name"/>

        <i-button style="margin-left: 10px; padding: 1px 8px"
                  type="primary"
                  plain
                  @click="searchData">查询</i-button>

        <i-button style="padding: 1px 8px"
                  type="primary"
                  plain
                  @click="resetData">重置</i-button>
      </div>
    </div>

    <div class="win-grid">
      <grid :config="gridConfigs" ref="grid"></grid>
    </div>

    <div slot="footer"
         style="float:right;margin-right:20px;">
      <i-button plain @click="isShow = false">取消</i-button>

      <i-button type="primary" @click="submit">提交</i-button>
    </div>

    <!--　用于显示信息的提示工具　-->
    <tooltip :show.sync="tooltipConfig.show"
             :showType="tooltipConfig.tooltipType"
             :message="tooltipConfig.tooltipMessage"
             @tooltipClosed="tooltipConfig.show = false"></tooltip>
  </i-window>
</template>

<script>
  import Grid from "../../../components/common/grid";
  import IWindow from "../../../components/common/IWindow";
  import IInputbox from "../../../components/common/IInputbox";
  import IButton from "../../../components/common/IButton";
  import Tooltip from '../../../components/DmComponent/OperationStatusTooltip';

  export default {
    name: "DataGridWin",
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ''
      }
    },
    data() {
      return{
        isShow: this.visible,
        tooltipConfig: {
          show: false,
          tooltipType: '',
          tooltipMessage: ''
        },
        // 数据列表
        gridConfigs: {
          hasCheckbox: false,
          maskByParent: true,
          searchFields: {
            name: ''
          },
          fields: [
            {
              title: '数据名称',
              field: 'name',
              isSortField: true,
              style: {
                width: '24%',
                float: 'left',
                textAlign: 'center',
              }
            },
            {
              title: '数据类型',
              field: 'type',
              isSortField: true,
              style: {
                width: '30%',
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
                width: '25%',
                float: 'left',
                textAlign: 'center'
              }
            },
          ],
          currPageNum: 1,
          totalPageNum: 1,
          pageSize: 10,
          api: './api/data/getPage',
          searchedCallback: rows => {
            rows.forEach(item => {
              switch (item.type) {
                case 'file_data':
                  item.type = '文件数据';
                  break;
                case 'table_data':
                  item.type = '表数据';
                  break;
                default:
                  break;
              }
            });
          }
        }
      }
    },
    methods: {
      searchData() {
        //条件查询时必须将当前页重置为1
        this.$refs.grid.resetCurrentPageNum();
        this.$refs.grid.search();
      },
      resetData() {
        this.gridConfigs.searchFields.name = '';
        this.searchData();
      },
      showTooltip (type, message) {
        this.tooltipConfig = {
          tooltipType: type,
          tooltipMessage: message,
          show: true
        };
      },
      submit() {
        let data = this.$refs.grid.getSelectedItems();
        if (0 === data.length) {
          this.showTooltip('icon', '请从数据列表中选择一条数据');
          return false;
        }
        this.$emit('selectData', data[0].id, data[0].name);
        this.isShow = false;
      }
    },
    watch: {
      visible(val) {
        this.isShow = val;
      },
      isShow(val) {
        //为true表示显示当前Window
        if (val) {

        } else {
          //通过向父组件传递事件的方式修改visible属性所对应的变量的值
          this.$emit('update:visible', val);
        }
      },
    },
    components: {
      IButton,
      IInputbox,
      IWindow,
      Grid,
      Tooltip
    }
  }
</script>

<style scoped>
  .win-grid {
    height: calc(100% - 50px);
    border: 1px solid #ccc;
    overflow: auto;
    border-radius: 0 0 4px 4px;
  }

  .win-search-bar {
    width: 100%;
    background-color: #eff1f5;
    padding: 8px 10px;
    border: 1px solid #ccc;
    border-bottom: 0;
    border-radius: 4px 4px 0 0;
  }
</style>
