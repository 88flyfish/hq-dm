<template>
  <i-window :visible.sync="isShow"
            :title="title"
            width="1000px"
            height="680px">
    <div class="win-search-bar">
      <div>
        <span>数据名称:</span>
        <i-inputbox style="width: 150px;height: 30px"
                    placeholder="请输入数据名称"
                    v-model="gridConfigs.searchFields.name"/>

        <i-button style="margin-left: 10px; padding: 1px 8px"
                  type="primary"
                  plain
                  @click="searchOwnership">查询</i-button>

        <i-button style="padding: 1px 8px"
                  type="primary"
                  plain
                  @click="resetOwnership">重置</i-button>
      </div>
    </div>

    <div class="win-grid">
      <div class="dept-tree-panel">
        <tree ref="tree"
              :defaultSelectedId="defaultSelectedId"
              api="./loginapi/sys/org/getAll"
              apiType="get"
              :hasCheckbox="false"
              :styleConfig="{nodeIcon:'',leafIcon:'&#xe92f;'}"
              @selected="orgSelected">
        </tree>
      </div>
      <div class="user-grid-panel">
        <grid :config="gridConfigs" ref="grid"></grid>
      </div>
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
  import Tree from "../../../components/common/Tree";
  import Tooltip from '../../../components/DmComponent/OperationStatusTooltip'

  export default {
    name: "ownership-grid-win",
    props: {
      visible: {
        type: Boolean,
        default: true
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
        defaultSelectedId: '',
        // 数据列表
        gridConfigs: {
          searchFields: {
            id: ''
          },
          operations: [],
          fields: [
            {
              title: '账号',
              field: 'loginName',
              style: {
                float: 'left',
                width: '150px',
                textAlign: 'center'
              }
            },
            {
              title: '姓名',
              field: 'username',
              style: {
                float: 'left',
                width: '100px',
                textAlign: 'center'
              }
            },
            {
              title: '所属机构',
              field: 'organization.name',
              style: {
                float: 'left',
                width: '200px',
                textAlign: 'center'
              }
            },
            {
              title: '电话',
              field: 'phone',
              style: {
                textAlign: 'center'
              }
            }
          ],
          currPageNum: 1,
          totalPageNum: 1,
          pageSize: 10,
          api: './loginapi/sys/user/getUserPageByOrgId'
        },
      }
    },
    methods: {
      searchOwnership() {
        //条件查询时必须将当前页重置为1
        this.$refs.grid.resetCurrentPageNum();
        this.$refs.grid.search();
      },
      resetOwnership() {
        this.gridConfigs.searchFields.name = '';
        this.searchOwnership();
      },
      showTooltip (type, message) {
        this.tooltipConfig = {
          tooltipType: type,
          tooltipMessage: message,
          show: true
        };
      },
      orgSelected(orgId) {
        this.gridConfigs.searchFields.id = orgId;
        this.searchOwnership();
      },
      submit() {
        let ownership = this.$refs.grid.getSelectedItems();
        if (0 === ownership.length) {
          this.showTooltip('icon', '请从权属人列表中选择一条数据');
          return false;
        }
        this.$emit('selectOwnership', ownership.id, ownership.username);
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
      Tree,
      IButton,
      IInputbox,
      IWindow,
      Grid,
      Tooltip
    }
  }
</script>

<style scoped lang="scss">
  .win-search-bar {
    width: 100%;
    background-color: #eff1f5;
    padding: 8px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .win-grid {
    height: calc(100% - 50px);
    overflow: auto;
    width: 100%;
    padding: 20px 5px 8px;
    & > div {
      height: 100%;
      background-color: #fff;
      border-radius: 6px;
      box-shadow: 0 1px 2px 1px #ccc;
      float: left;
      overflow: hidden;
      vertical-align: top;
    }
    .dept-tree-panel {
      width: 26%;
      padding: 20px 5px 20px 10px;
    }
    .user-grid-panel {
      padding: 10px;
      margin-left: 15px;
      width: calc(74% - 15px);
      overflow: auto;
    }
  }
</style>
