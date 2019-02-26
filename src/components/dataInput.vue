<template>
  <div class="dataInput">
    <MyWindow v-if="chooseWindowConfig.show" :config="chooseWindowConfig">
      <div>
        <div class="win-search-bar">
          <span>数据名称:</span>
          <Iinput width="200px" height="30px" type="text" placeholder="请输入数据名称"
                  v-model="dataGridConfigs.searchFields.name"/>
          <i-button type="primary" plain @click="search2">查询</i-button>
          <i-button type="primary" plain @click="reset">重置</i-button>
        </div>
        <div class="win-grid">
          <grid :config="dataGridConfigs" ref="dataGrid"></grid>
        </div>
      </div>

    </MyWindow>
    <div class="input-box">
      <Iinput v-model="dataName" :height="height" :readOnly="readOnly"></Iinput>
      <button v-if="!readOnly" class="choose-btn" @click="chooseWindowConfig.show = true;" :style="{height:height?height:'32px'}">
        选择数据
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
  import IButton from "./common/IButton";


  export default {
    components:{
      IButton,
      WaitMask,grid,MyWindow,Iinput,Panel
    },
    name: "dataInput",
    props:['type','height','readOnly'],
    created(){
      if(this.type){
        this.dataGridConfigs.searchFields.type=this.type;
      }
    },
    data(){
      return {
        dataId:'',
        dataName:'',
        dataGridConfigs: {
          hasCheckbox: false,
          api: "./api/data/getPage",
          currPageNum: 1,
          totalPageNum: 1,
          pageSize: 10,
          searchFields: {
            name: '',
            type:''
          },
          getSelectedNames: [],
          selectedIds: [],
          fields: [{
            title: '数据名称',
            field: 'name',
            style: {
              width: '25%',
              float: 'left',
              textAlign: 'center'
            }
          }, {
            title: '描述',
            field: 'description',
            style: {
              width: '20%',
              float: 'left',
              textAlign: 'center'
            }
          }, {
            title: '创建人',
            field: 'creator',
            style: {
              width: '20%',
              float: 'left',
              textAlign: 'center'
            }
          }, {
            title: "创建时间",
            field: "createDate",
            style: {
              width: "20%",
              float: "left",
              textAlign: "center"
            }
          }]
        },
        chooseWindowConfig: {
          show: false,
          width: '800px',
          height: '660px',
          type: 'add',
          title: '选择数据',
          parent: this,
          readonly: false,
          form: {
            name: ''
          },
          method: {
            close() {
              this.chooseWindowConfig.show = false;
            },
            cancel() {
              this.chooseWindowConfig.show = false;
            },
            confirm() {
              var selectItems = this.$refs.dataGrid.getSelectedItems();
              if (selectItems.length == 0) {
                this.tooltipType = "failed";
                this.tooltipMessage = "请先选择数据!"
                this.showTooltip = true;
                return;
              } else {
                this.dataGridConfigs.getSelectedNames = [];
                this.dataGridConfigs.selectedIds = [];
                selectItems.forEach(item => {
                  this.dataGridConfigs.selectedIds.push(item.id)
                  this.dataGridConfigs.getSelectedNames.push(item.name)
                })
                // this.addWindowConfig.form.dataId = selectItems[0].id;
                // this.addWindowConfig.form.dataName = selectItems[0].name;

                this.dataId=selectItems[0].id
                this.dataName=selectItems[0].name
                this.$emit('setData',selectItems[0].id,selectItems[0].name)
                this.chooseWindowConfig.show = false;
              }
            }
          }
        }
      }
    },
    methods:{
      search2() {
        //条件查询时必须将当前页重置为1
        this.$refs.dataGrid.resetCurrentPageNum();
        this.$refs.dataGrid.search();
      },
      reset() {
        this.dataGridConfigs.searchFields.name = '';
        this.search2();
      }
    }
  }
</script>

<style lang="less" scoped>
  .dataInput{
    .input-box {
      position: relative;
      .choose-btn {
        position: absolute;
        right: 0px;
        top: 0px;
        width:80px;
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
    overflow:hidden;
  }
  .win-grid {
    height: calc(100% - 50px);
    border: 1px solid #aaaaaa;
    overflow: auto;
    width: 100%;
  }
</style>
