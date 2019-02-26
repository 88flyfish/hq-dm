<template>
  <div class="dataBaseTree">
    <WatiMask :isShow="showMask"></WatiMask>
    <!--<div class="title">-->

    <!--</div>-->
    <div class="tree">
      <div class="title2">
        <!--<span>存储类型：</span>-->
        <!--<div>-->
        <!--<Select v-model="dataType" :config="dataTypeConfig" @change="setDataType"></Select>-->
        <!--</div>-->
        <button @click="$emit('otherSource')">选择其他数据源 <i class="icon-playlist_play"></i></button>
      </div>
      <div class="listWrap">
        <div class="whiteBg">
          <div class="tables">
            <!--<i class="fa fa-chevron-right"></i>-->
            <li>
              <img src="../assets/img/billing.png">
              <span>表</span>
            </li>

            <MouseRightMenu :config="newTableConfig"></MouseRightMenu>
          </div>
          <ul class="tableList">
            <li v-for="(item,index) in treeConfig">
              <p class="tableName"
                 @click="showTableDetail(item)">
                <img src="../assets/img/calendar.png">
                <span>{{item}}</span>
              </p>
            </li>

            <MouseRightMenu :config="rightMenuConfig"
                            @change="getMouseRightIndex"></MouseRightMenu>

          </ul>
        </div>

      </div>

    </div>
  </div>
</template>

<script>
import MouseRightMenu from './MouseRightMenu'
import WatiMask from './common/WaitMask'
import Select from './common/ISelect'

export default {
  components: { MouseRightMenu, WatiMask, Select },
  name: "dataBaseTree",
  data () {
    const _this = this;
    var dataType = this.$route.path.slice(1);
    return {
      dataType: dataType,
      dataTypeConfig: {
        width: '100%',
        height: '28px',
        options: [{
          label: '关系型数据库',
          value: 'relational'
        }, {
          label: 'NoSQL数据库',
          value: 'nosql'
        }]
      },
      mouseRightIndex: -1,
      newTableConfig: [{
        icon: 'icon-jiahao',
        title: '新增表',
        callback: function () {
          _this.$emit('addTable')
        }
      }],
      rightMenuConfig: [{
        icon: 'icon-eye',
        title: '打开表',
        callback: function () {
          if (_this.mouseRightIndex != -1) {
            _this.$emit('changeTable', _this.treeConfig[_this.mouseRightIndex])
          }
        }
      }, {
        icon: 'icon-cogs',
        title: '设计表',
        callback: function () {
          if (_this.mouseRightIndex != -1) {
            _this.$emit('setTableByRightMouse', _this.treeConfig[_this.mouseRightIndex])
          }
        }
      }, {
        icon: 'icon-jiahao',
        title: '新增表',
        callback: function () {
          if (_this.mouseRightIndex != -1) {
            _this.$emit('addTable', _this.treeConfig[_this.mouseRightIndex])
          }
        }
      }, {
        icon: 'icon-pencil1',
        title: '重命名',
        callback: function () {
          if (_this.mouseRightIndex != -1) {
            _this.$emit('tableRename', _this.treeConfig[_this.mouseRightIndex])
          }
        }
      }, {
        icon: 'icon-bin',
        title: '删除',
        callback: function () {
          if (_this.mouseRightIndex != -1) {
            _this.$emit('deleteTable', _this.treeConfig[_this.mouseRightIndex])
          }
        }
      }]
    }
  },
  props: {
    treeConfig: {
      type: Array,
      default: []
    },
    showMask: {
      type: Boolean,
      defalt: false
    }
  },
  methods: {
    setDataType (val) {
      if (this.$route.query.sourceId && val == this.$route.path.slice(1)) {
        return;
      } else {
        if (val != '') {
          this.$router.push('/' + val + '?' + new Date().getTime());
        }
      }
    },
    showTableDetail (item) {
      // let ele = $event.target;
      // $('.dataBaseTree li p').removeClass('active');
      // $(ele).closest('p').addClass('active');
      this.$emit('changeTable', item);
    },
    getMouseRightIndex (index) {
      this.mouseRightIndex = index;
      this.$emit('getMouseRightTableName', this.treeConfig[this.mouseRightIndex])
    }
  },
  mounted () {
    // $('.dataBaseTree i').on('click', function () {
    //   if ($(this).hasClass('fa-chevron-right')) {
    //     $(this).removeClass('fa-chevron-right').addClass('fa-chevron-down')
    //     $(this).parent().siblings('ul').slideDown(200);
    //   } else if ($(this).hasClass('fa-chevron-down')) {
    //     $(this).removeClass('fa-chevron-down').addClass('fa-chevron-right')
    //     $(this).parent().siblings('ul').slideUp(200);
    //   }
    // })
    // $('.dataBaseTree .tree i').trigger('click');
  }
}
</script>

<style lang="less" scoped>
.dataBaseTree {
  font-size: 15px;
  width: 100%;
  height: 100%;
  .tree {
    /*border-top: 1px solid #ddd;*/
    background-color: #eee;
    height: 100%;
    .listWrap {
      padding: 20px;
      height: calc(100% - 50px);
      padding-top: 0;
      .whiteBg {
        background-color: #fff;
        width: 100%;
        height: 100%;
        box-shadow: 0px 1px 2px 1px #ccc;
        border-radius: 6px;
        padding-top: 20px;
        overflow-y: auto;
      }
    }
    ul.tableList {
      /*display: none;*/
    }
    i {
      display: inline-block;
      width: 14px;
      &:hover {
        cursor: pointer;
      }
    }
    div.tables {
      padding-left: 20px;
      margin-bottom: 5px;
    }

    li {
      line-height: 30px;
      p {
        &.active {
          background-color: #eee;
        }
        &.tableName {
          padding-left: 38px;
          padding-right: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          &:hover {
            cursor: pointer;
            color: #00a5e0;
          }
        }
      }
    }
  }
  .title {
    height: 40px;
    background-color: #eff1f5;
    line-height: 40px;
    padding-left: 10px;
  }
  .title2 {
    height: 50px;
    background-color: #eee;
    line-height: 50px;
    padding-left: 20px;
    padding-right: 20px;

    & > button {
      height: 27px;
      padding: 0 10px;
      margin: 0 6px;
      /*background: #13ce66;*/
      background: #20a0ff;
      color: #fff;
      border-radius: 4px;
      letter-spacing: 1px;
      &:hover {
        opacity: 0.75;
        filter: alpha(opacity=75);
        transition: opacity 0.5s;
      }
      i {
        font-size: 16px;
        position: relative;
        top: 2px;
      }
    }
  }
}
</style>
