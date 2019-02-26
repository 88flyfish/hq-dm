<template>
  <div class="dataBaseGrid">
    <div class="table-wrapper">
      <ul class="table-header" :style="{width:ulWidth>wrapWidth?(ulWidth+'px'):(wrapWidth+'px')}">
        <li style="float:left;width:30px;">#</li>
        <li v-if="config.hasCheckbox" style="float:left;width:50px;">
          <span><checkbox v-model="isCheckedAll" @change="setAllCheckedStatus"></checkbox></span>
        </li>
        <li style="float:left;text-align:center;padding:0 10px;" :style="{width:fieldConfig.width}"
            v-for="(fieldConfig,i) in config.columns"
            @click="$emit('sortTable',fieldConfig,i)">
        <span :class="{'sortField': true,'asc': fieldConfig.sortType=='asc','desc':fieldConfig.sortType=='desc'}">
          {{fieldConfig.name,fieldConfig.sortType}}
        </span>
        </li>
      </ul>

      <div v-if="config.rows.length > 0">
        <!--@click="selectRow(r,index)"-->
        <ul v-for="(r,index) in config.rows"

            :style="{width:ulWidth>wrapWidth?(ulWidth+'px'):(wrapWidth+'px')}"
            class="table-row" :class="{'selected':r.isChecked}">
          <li style="width:30px;float:left;text-align:center;">{{index + 1}}</li>
          <li v-if="config.hasCheckbox" style="width:50px;float:left;text-align:center;">
            <checkbox v-model="r.isChecked" @change="checkStatusChange(r,index)"></checkbox>
          </li>
          <li style="float:left;text-align:center;padding:0 10px;" :style="{width:fieldConfig.width}"
              v-for="(fieldConfig,i) in config.columns">
            <div class="tdBox">

              <IInput class="textInput" type="text" v-model="r[fieldConfig.name]"
                      @blur="saveByBlur($event,r,fieldConfig.name,index,config.tableName)"></IInput>

              <!--<date-picker symbol="-" :type="'dateTime'" v-model="r[fieldConfig.field]"></date-picker>-->

              <span class="mask" :title="r[fieldConfig.name]" @dblclick="tdEdit($event)"></span>
            </div>
          </li>
        </ul>
      </div>
      <div v-else>
        <ul>
          <li>
            <div style="line-height:200px;text-align: center;vertical-align: middle;">&nbsp;{{message}}&nbsp;</div>
          </li>
        </ul>
      </div>
    </div>
    <pagination @paging="paging" @changePageSize="changePageSize"
                :currPageNum="config.currPageNum" :totalPageNum="config.totalPageNum"
                :pageSize="config.pageSize"/>
    <wait-mask :isShow="config.showMask" :maskByParent="config.maskByParent"></wait-mask>
  </div>
</template>

<script>
  import pagination from "./common/Pagination.vue";
  import WaitMask from "./common/WaitMask.vue";
  import Checkbox from "./common/Checkbox.vue"
  import DatePicker from './common/DatePicker'
  import IInput from './common/IInputbox'

  export default {
    props: {
      config: Object
    },
    computed: {
      sourceId() {
        return this.$route.query.sourceId ? this.$route.query.sourceId : 3
      },
      ulWidth() {
        return 80 + (this.config.columns.length - this.config.longTdNum) * 120 + this.config.longTdNum * 200;
      }
    },
    data() {
      if (typeof this.config == "undefined") {
        throw "组件的config属性未配置"
      }
      //未设置操作列时将默认设置为空数组
      if (typeof this.config.operations == "undefined") {
        this.config.operations = new Array();
      }

      if (typeof this.config.maskByParent == "undefined") {
        this.config.maskByParent = true;
      }

      if (typeof this.config.hasCheckbox == "undefined") {
        this.config.hasCheckbox = true;
      }

      // if (typeof this.config.selectedIds == "undefined") {
      //   this.config.selectedIds = new Array();
      // }
      if (typeof this.config.selectedIndex == "undefined") {
        this.config.selectedIndex = [];
      }

      if (typeof this.config.operationColumnWidth == "undefined") {
        this.config.operationColumnWidth = "180px";
      }

      // var selectedMap = new Array();
      // var selectedMap =[];
      //
      // for (var i in this.config.selectedIds) {
      //   var id = this.config.selectedIds[i];
      //   selectedMap[id] = id;
      // }

      return {
        wrapWidth: 0,
        message: "",
        isCheckedAll: false,
        selectedMap: []
      }
    },
    methods: {
      //判断内容是否日期格式
      isDate(val) {
        var reg = new RegExp("^[1-2]\\d{3}-(0?[1-9]||1[0-2])-(0?[1-9]||[1-2][1-9]||3[0-1])$");
        return reg.test(val);
      },
      //判断内容是否时间格式
      isTime(val) {
        var reg = new RegExp("^(20|21|22|23|[0-1]\\d):[0-5]\\d:[0-5]\\d$");
        return reg.test(val);
      },
      //判断内容是否 日期+时间 格式
      isDateTime(val) {
        var reg = new RegExp("^[1-9]\\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\\s+(20|21|22|23|[0-1]\\d):[0-5]\\d:[0-5]\\d$");
        return reg.test(val);
      },
      // 点击复制按钮后，触发组件内的afterCopy方法，让第一行激活focus状态
      afterCopy() {
        $('.dataBaseGrid span.mask').eq(0).addClass('hide').siblings('input').focus();
      },
      saveByBlur($event, row, fieldName, index, tableName) {
        var _this = this;
        if (row.oldData) {
          if (row[fieldName] != row.oldData[fieldName]) {
            if (this.config.rows[index].isChanged.indexOf(fieldName) == -1) {
              this.config.rows[index].isChanged.push(fieldName)
            }

            // $($event.target).siblings('.mask').removeClass('hide');
            $($event.target).closest('.tdBox').removeClass('focus');
            // var ele = $event.relatedTarget;
            // if (ele != null && ele.className == 'cancel') {
            //   // this.config.rows[index][fieldName]=this.config.rows[index].oldData[fieldName];
            // } else if (ele != null && ele.className == 'refresh') {
            //   //如果是点击刷新，这里什么都不干，父组件对刷新有触发的方法
            // } else {

            // var newData = Object.assign({}, row);
            // delete newData.oldData;
            // delete newData.isChecked;
            // this.$http.post('./api/dbSource/updataTableData', {
            //   id: this.sourceId,
            //   tableName: tableName,
            //   dataSourceUpdataParams: [{
            //     oldData: row.oldData,
            //     newData: newData
            //   }],
            // }).then(
            //   res => {
            //     res = res.body;
            //     console.log(res);
            //     if (res.status == 'success') {
            //       this.$emit('getTip', '修改成功', 'success')
            //       this.$emit('refresh');
            //     }
            //   },
            //   err => {
            //     this.$emit('getTip', '修改失败', 'failed')
            //   }
            // )
            // }
          } else {
            if (_this.config.rows[index].isChanged.indexOf(fieldName) > -1) {
              this.config.rows[index].isChanged.splice(_this.config.rows[index].isChanged.indexOf(fieldName), 1);
            }
            // $($event.target).siblings('.mask').removeClass('hide');
            $($event.target).closest('.tdBox').removeClass('focus');
          }

        } else {
          // $($event.target).siblings('.mask').removeClass('hide');
        }
      },
      tdEdit($event) {
        let ele = $event.target;
        // $('.dataBaseGrid .tdBox .textInput').removeClass('active').blur();
        // $('.dataBaseGrid .tdBox .mask').removeClass('hide');
        // $(ele).addClass('hide').siblings('input').focus();
        $(ele).closest('.tdBox').addClass('focus').find('input').focus();
      },
      showOperation(operation, row) {
        if (typeof operation.condition != 'undefined') {
          return operation.condition(row);
        } else {
          return true;
        }
      },
      paging(pageNum) {
        this.$emit('paging', pageNum)
      },
      changePageSize(pageSize) {
        //修改每页多少条记录时需要将当前页重置为1
        // this.currPageNum = 1;
        // this.pageSize = parseInt(pageSize);
        // this.search();


        this.$emit('changePageSize', pageSize);
      },
      sort(fieldConfig) {
        //允许进行排序的字段上点击才进排序操作
        if (fieldConfig.isSortField) {
          var sortType = fieldConfig.sortType
          var fields = this.config.fields;

          for (var idx in fields) {
            fields[idx].sortType = ""
          }

          if ("asc" == sortType) {
            fieldConfig.sortType = "desc";
          } else {
            fieldConfig.sortType = "asc";
          }

          //排序时将当前页设置为第一页进行显示
          this.currPageNum = 1;
          this.search();
        }
      },
      search() {
        this.message = "查询中．．．";

        var rows = this.config.rows;
        //初始化未选择状态
        for (var idx in rows) {
          var row = rows[idx];

          if (typeof this.selectedMap[row.id] != "undefined" && this.selectedMap[row.id] != null) {
            row.isChecked = true;
          } else {
            row.isChecked = false;
          }
        }
        /*
         * 判断是否定义的查询后的回调函数
         */
        if (typeof this.config.searchedCallback === "function") {
          //执行回调函数, 这样允许使用组件方可以对查调结果进行自定义处理
          this.config.searchedCallback(rows);
        }

        if (rows.length < 1) {
          this.message = "未查找到相关记录！";
        }

        this.config.rows = rows;
      },
      selectRow(row, index) {
        if (this.config.hasCheckbox) {

          row.isChecked = !row.isChecked;

          if (row.isChecked) {
            this.config.selectedIndex.push(index);
          } else {
            this.config.selectedIndex.splice(this.config.selectedIndex.indexOf(index), 1);
          }
        } else {
          for (var i in this.rows) {
            var r = this.rows[i];
            r.isChecked = false;
          }

          row.isChecked = true;
          this.$emit('selected', row);
        }
      },
      setAllCheckedStatus() {
        this.config.selectedIndex = [];
        for (var idx in this.config.rows) {
          var row = this.config.rows[idx];
          row.isChecked = this.isCheckedAll;

          if (this.isCheckedAll) {
            this.config.selectedIndex.push(idx);
          } else {
            this.config.selectedIndex = [];
          }

          // if (row.isChecked) {
          //   this.selectedMap[row.id] = row.id;
          // } else {
          //   this.selectedMap[row.id] = null;
          // }
        }
      },
      checkStatusChange(row, index) {
        // if (row.isChecked) {
        //   this.selectedMap[row.id] = row.id;
        // } else {
        //   this.selectedMap[row.id] = null;
        // }
        if (row.isChecked) {
          this.config.selectedIndex.push(index);
          if (this.config.selectedIndex.length == this.config.rows.length) {
            this.isCheckedAll = true;
          }
        } else {
          this.isCheckedAll = false;
          this.config.selectedIndex.splice(this.config.selectedIndex.indexOf(index), 1);
        }
        var [...rows] = this.config.rows;
        this.config.rows=rows;

      },
      resetCurrentPageNum() {
        this.currPageNum = 1;
      },
      getSelectedItems() {
        var selectedRows = [];

        for (var idx in this.config.rows) {
          var row = this.config.rows[idx];

          if (row.isChecked) {
            let rowCopy = Object.assign({}, row);
            delete rowCopy.isChecked;
            delete rowCopy.oldData;
            selectedRows.push(rowCopy);
          }
        }

        return selectedRows;
      },
      getFieldValue(row, field) {
        var fields = field.split(".");
        var value = row;
        for (var i in fields) {
          value = value[fields[i]] || '';

        }

        return value;
      },
      getFieldStyle(row, fieldConfig) {
        var styleCallback = fieldConfig.styleCallback;

        if (typeof styleCallback === 'function') {
          var fieldValue = this.getFieldValue(row, fieldConfig.field);
          var dynamicStyle = styleCallback(fieldValue);
          dynamicStyle = dynamicStyle == undefined ? {} : dynamicStyle;

          return Object.assign(dynamicStyle, fieldConfig.style);
        } else {
          return fieldConfig.style;
        }
      }
    },
    created() {
      var fields = this.config.fields;
      for (var idx in fields) {
        if (typeof fields[idx].sortType == "undefined") {
          this.$set(fields[idx], "sortType", "")
        }
      }
    },
    mounted() {
      this.wrapWidth = $('.panel-content').outerWidth() - 20;
      const _this = this;
      $(window).on('resize', function () {
        _this.wrapWidth = $('.panel-content').outerWidth() - 20;
      })
      this.search();
    },
    components: {
      pagination: pagination,
      WaitMask: WaitMask,
      Checkbox: Checkbox,
      DatePicker: DatePicker,
      IInput: IInput
    },
    watch: {
      "config": {

        handler(newValue, oldValue) {
          // this.config = newValue;
          //组件接收父组件的配置项对象时，data()应该重新走一遍
          if (typeof this.config == "undefined") {
            throw "组件的config属性未配置"
          }
          //未设置操作列时将默认设置为空数组
          if (typeof this.config.operations == "undefined") {
            this.config.operations = new Array();
          }

          if (typeof this.config.maskByParent == "undefined") {
            this.config.maskByParent = true;
          }

          if (typeof this.config.hasCheckbox == "undefined") {
            this.config.hasCheckbox = true;
          }

          // if (typeof this.config.selectedIds == "undefined") {
          //   this.config.selectedIds = new Array();
          // }
          if (typeof this.config.selectedIndex == "undefined") {
            this.config.selectedIndex = [];
          }

          if (typeof this.config.operationColumnWidth == "undefined") {
            this.config.operationColumnWidth = "180px";
          }

          // var selectedMap = [];

          // for (var i in this.config.selectedIds) {
          //   var id = this.config.selectedIds[i];
          //   selectedMap[id] = id;
          // }
        },
        immediate: true,
        deep: true
      }
    }
  }
</script>

<style lang="less" scoped>
  .dataBaseGrid {
    .tdBox {
      &.focus {
        input {
          background-color: #fff;
          /*border: 1px solid #5cadff;*/
          border: 1px solid #20a0ff;
          /*-webkit-box-shadow: 0px 0px 10px #d6ebff;*/
          -webkit-box-shadow: 0px 0px 2px #20a0ff;
          /*-moz-box-shadow: 0px 0px 10px #d6ebff;*/
          -moz-box-shadow: 0px 0px 2px #20a0ff;
          /*box-shadow: 0px 0px 10px #d6ebff;*/
          box-shadow: 0px 0px 2px #20a0ff;
          cursor: pointer;
        }
        span.mask {
          display: none;
        }
      }

      height: 100%;
      position: relative;
      input {
        width: 100%;
        height: 100%;
        border: 1px solid transparent;
        background-color: transparent;
        text-decoration: none;
        text-align: center;
        &.focus {
          background-color: #fff;
          /*border: 1px solid #5cadff;*/
          border: 1px solid #20a0ff;
          /*-webkit-box-shadow: 0px 0px 10px #d6ebff;*/
          -webkit-box-shadow: 0px 0px 2px #20a0ff;
          /*-moz-box-shadow: 0px 0px 10px #d6ebff;*/
          -moz-box-shadow: 0px 0px 2px #20a0ff;
          /*box-shadow: 0px 0px 10px #d6ebff;*/
          box-shadow: 0px 0px 2px #20a0ff;
          cursor: pointer;
        }
        &:focus {
          background-color: #fff;
          /*border: 1px solid #5cadff;*/
          border: 1px solid #20a0ff;
          /*-webkit-box-shadow: 0px 0px 10px #d6ebff;*/
          -webkit-box-shadow: 0px 0px 2px #20a0ff;
          /*-moz-box-shadow: 0px 0px 10px #d6ebff;*/
          -moz-box-shadow: 0px 0px 2px #20a0ff;
          /*box-shadow: 0px 0px 10px #d6ebff;*/
          box-shadow: 0px 0px 2px #20a0ff;
          cursor: pointer;
        }
        &.active {
          background-color: #fff;
          /*border: 1px solid #5cadff;*/
          border: 1px solid #20a0ff;
          /*-webkit-box-shadow: 0px 0px 10px #d6ebff;*/
          -webkit-box-shadow: 0px 0px 2px #20a0ff;
          /*-moz-box-shadow: 0px 0px 10px #d6ebff;*/
          -moz-box-shadow: 0px 0px 2px #20a0ff;
          /*box-shadow: 0px 0px 10px #d6ebff;*/
          box-shadow: 0px 0px 2px #20a0ff;
          cursor: pointer;
        }
      }
      span.mask {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        &.hide {
          display: none;
        }
      }
    }
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .table-header {
    line-height: 40px;
    height: 41px;
    clear: both;
    border-bottom: 1px solid #dddddd;
  }

  .table-header li {
    text-align: center;
    cursor: default;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .table-header > li > span:hover {
    background-color: rgba(222, 233, 246, 0.8);
    border-radius: 4px;
    padding: 5px 5px;
    border: 1px solid #dddddd;
    -webkit-transition: background-color .5s;
    -moz-transition: background-color .5s;
    -ms-transition: background-color .5s;
    -o-transition: background-color .5s;
    transition: background-color .5s;
  }

  .table-row {
    height: 40px;
    line-height: 38px;
    clear: both;
    border-top: 1px solid #dddddd;
  }

  .table-row:hover {
    background-color: #f7f7f7;
    -webkit-transition: background-color .5s;
    -moz-transition: background-color .5s;
    -ms-transition: background-color .5s;
    -o-transition: background-color .5s;
    transition: background-color .5s;
  }

  .table-row li {
    height: 100%;
    cursor: default;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .sortField {
    cursor: default;
  }

  .asc:after {
    font-family: iconfont;
    content: '\ea3a';
    font-size: 16px;
  }

  .desc:after {
    font-family: iconfont;
    content: '\ea3e';
    font-size: 16px;
  }

  .operation {
    font-family: iconfont;
    padding: 8px;
  }

  .operation:hover {
    background-color: #cccccc;
    color: #0374d0;
    -webkit-transition: background-color .5s;
    -moz-transition: background-color .5s;
    -ms-transition: background-color .5s;
    -o-transition: background-color .5s;
    transition: background-color .5s;
  }

  .dataBaseGrid .selected {
    background-color: #ffefbb;
    -webkit-transition: background-color .5s;
    -moz-transition: background-color .5s;
    -ms-transition: background-color .5s;
    -o-transition: background-color .5s;
    transition: background-color .5s;
  }

  .dataBaseGrid .selected:hover {
    background-color: #ffefbb;
  }
</style>
