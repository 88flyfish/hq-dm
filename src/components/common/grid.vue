<template>
  <div class="grid">
    <ul class="table-header">
      <li v-if="config.operations.length > 0"
          style="float:right;"
          :style="{width: config.operationColumnWidth}">操作
      </li>
      <li style="float:left;width:30px; font-weight: normal;">#</li>
      <li v-if="config.hasCheckbox"
          style="float:left;width:59px;">
        <span>
          <checkbox v-model="isCheckedAll"
                    style="position:relative;font-weight: normal"></checkbox>
          <b v-if="totalChecked"
             style="font-weight:normal;position:absolute;color:#ccc"> ({{totalChecked}})</b>
        </span>
      </li>

      <li v-for="fieldConfig in config.fields"
          :style="fieldConfig.style"
          @click="sort(fieldConfig)">
        <span :class="{
              sortField: fieldConfig.isSortField,
              asc: 'asc' == fieldConfig.sortType,
              desc: 'desc' == fieldConfig.sortType
            }">
          {{fieldConfig.title}}
        </span>
      </li>
    </ul>
    <template v-if="rows.length > 0">
      <ul v-for="(r,index) in rows"
          @click="selectRow(r,index)"
          class="table-row"
          :class="{'selected':r.isChecked}">
        <li v-if="config.operations.length > 0"
            style="float:right;text-align:center;cursor: pointer;"
            :style="{width: config.operationColumnWidth}">

          <el-tooltip v-for="(operation, index) in config.operations"
                      :content="operation.title"
                      placement="bottom"
                      effect="dark"
                      :key="operation.title"
                      v-show="$permissionValid(operation.permission) && showOperation(operation,r)">
            <span @click.stop="operation.func(r)"
                  class="operation"
                  v-html="operation.icon">
            </span>
          </el-tooltip>

        </li>
        <li style="width:30px;float:left;text-align:center;">{{index + 1}}</li>
        <li v-if="config.hasCheckbox"
            style="width:50px;float:left;text-align:center;margin:0 5px">
          <checkbox v-model="r.isChecked"
                    @change="checkStatusChange(r,index)"></checkbox>
        </li>
        <li v-for="fieldConfig in config.fields"
            :style="getFieldStyle(r,fieldConfig)">
          <div v-if="getFieldValue(r,fieldConfig.field) == '' || getFieldValue(r,fieldConfig.field) == undefined">
            &nbsp;
          </div>

          <el-tooltip v-else
                      :content="getFieldValue(r,fieldConfig.field)"
                      placement="bottom"
                      effect="dark">
            <span>{{getFieldValue(r,fieldConfig.field)}}</span>
          </el-tooltip>
        </li>
      </ul>
    </template>
    <template v-else>
      <ul>
        <li>
          <div style="line-height:200px;text-align: center;vertical-align: middle;">&nbsp;{{message}}&nbsp;</div>
        </li>
      </ul>
    </template>

    <pagination @paging="paging"
                @changePageSize="changePageSize"
                :currPageNum="currPageNum"
                :totalPageNum="totalPageNum"
                :pageSize="pageSize" />
    <wait-mask :isShow="showMask"
               :maskByParent="config.maskByParent"></wait-mask>
  </div>
</template>

<script>
import pagination from "./Pagination.vue";
import WaitMask from "./WaitMask.vue";
import Checkbox from "./Checkbox.vue"

export default {
  props: {
    config: Object
  },
  data () {
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

    if (typeof this.config.selectedIds == "undefined") {
      this.config.selectedIds = new Array();
    }

    if (typeof this.config.operationColumnWidth == "undefined") {
      this.config.operationColumnWidth = "180px";
    }

    var selectedMap = new Array();

    for (var i in this.config.selectedIds) {
      var id = this.config.selectedIds[i];
      selectedMap[id] = id;
    }

    return {
      totalChecked: 0,
      message: "",
      isCheckedAll: false,
      rows: {},
      currPageNum: this.config.currPageNum,
      totalPageNum: this.config.totalPageNum,
      pageSize: this.config.pageSize,
      showMask: true,
      selectedMap: selectedMap
    }
  },
  methods: {
    showOperation (operation, row) {
      if (typeof operation.condition != 'undefined') {
        return operation.condition(row);
      } else {
        return true;
      }
    },
    paging (pageNum) {
      this.currPageNum = pageNum;
      this.search();
    },
    changePageSize (pageSize) {
      //修改每页多少条记录时需要将当前页重置为1
      this.currPageNum = 1;
      this.pageSize = parseInt(pageSize);
      this.search();
    },
    sort (fieldConfig) {
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
    search () {
      this.selectedMap = new Array();
      this.totalChecked = 0;
      this.isCheckedAll = false
      this.message = "查询中．．．";
      this.showMask = true;
      var fields = this.config.fields;
      var orderFields = new Array();
      var conditions = this.config.searchFields;

      //未设置查询条件则重置为空对象
      if (!conditions) {
        conditions = {}
      }

      for (var idx in fields) {
        if (fields[idx].isSortField === true) {
          if (fields[idx].sortType != "") {
            var orderBy = fields[idx].orderBy;

            // 未指定orderby字段时直接使用field字段做为排序字段
            if (typeof orderBy == "undefined" || orderBy == "" || orderBy == null) {
              orderBy = fields[idx].field;
            }

            orderFields.push({
              field: orderBy,
              sortType: fields[idx].sortType
            })
          }
        }
      }
      this.$http.post(this.config.api, {
        "pageSize": this.pageSize,
        "pageNumber": this.currPageNum,
        "orderFields": orderFields,
        "conditions": conditions
      }).then(
        (res) => {
          this.showMask = false;
          this.totalPageNum = res.body.content.totalPageNum;
          var rows = res.body.content.rows;

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

          this.rows = rows;
        }
      )
    },
    selectRow (row, index) {
      if (this.config.hasCheckbox) {
        this.totalChecked = 0;

        row.isChecked = !row.isChecked;

        if (row.isChecked) {
          if (this.config.single) {
            for (var i in this.rows) {
              if (i != index) {
                this.rows[i].isChecked = false;
              }
            }
            this.selectedMap = new Array();
          }
          this.selectedMap[row.id] = row.id;
        } else {
          this.selectedMap[row.id] = null;
        }

        this.getTotalCheked();

      } else {
        for (var i in this.rows) {
          var r = this.rows[i];
          r.isChecked = false;
        }

        row.isChecked = true;
        this.$emit('selected', row);
      }
    },
    checkStatusChange (row, index) {
      this.totalChecked = 0;
      if (row.isChecked) {
        if (this.config.single) {
          for (var i in this.rows) {
            if (i != index) {
              this.rows[i].isChecked = false;
            }
          }
          this.selectedMap = new Array();
        }

        this.selectedMap[row.id] = row.id;
      } else {
        this.selectedMap[row.id] = null;
      }
      this.getTotalCheked();
    },
    resetCurrentPageNum () {
      this.currPageNum = 1;
    },
    getSelectedItems () {
      var selectedRows = new Array();

      for (var idx in this.rows) {
        var row = this.rows[idx];

        if (row.isChecked) {
          selectedRows.push(row);
        }
      }

      return selectedRows;
    },
    getFieldValue (row, field) {
      var fields = field.split(".");
      var value = row;
      for (var i in fields) {
        value = value[fields[i]] || '';

      }

      return value;
    },
    getFieldStyle (row, fieldConfig) {
      var styleCallback = fieldConfig.styleCallback;

      if (typeof styleCallback === 'function') {
        var fieldValue = this.getFieldValue(row, fieldConfig.field);
        var dynamicStyle = styleCallback(fieldValue);
        dynamicStyle = dynamicStyle == undefined ? {} : dynamicStyle;

        return Object.assign(dynamicStyle, fieldConfig.style);
      } else {
        return fieldConfig.style;
      }
    },
    getTotalCheked () {
      for (var key in this.selectedMap) {
        if (this.selectedMap[key] != null) {
          this.totalChecked++;
        }
      }
    }
  },
  created () {
    var fields = this.config.fields;
    for (var idx in fields) {
      if (typeof fields[idx].sortType == "undefined") {
        this.$set(fields[idx], "sortType", "")
      }
    }
  },
  mounted () {
    this.search();
  },
  components: {
    pagination: pagination,
    WaitMask: WaitMask,
    Checkbox: Checkbox
  },
  watch: {
    "isCheckedAll": function (newValue) {
      this.totalChecked = 0;
      for (var idx in this.rows) {
        var row = this.rows[idx];
        row.isChecked = newValue;

        if (row.isChecked) {
          this.selectedMap[row.id] = row.id;
        } else {
          this.selectedMap[row.id] = null;
        }
      }
      this.getTotalCheked();
    },
    "config": {
      handler (newValue, oldValue) {

        var selectedMap = new Array();
        for (var i in this.config.selectedIds) {
          var id = this.config.selectedIds[i];
          selectedMap[id] = id;
        }
        this.selectedMap = selectedMap;
      },
      immediate: true,
      deep: true
    }
  }
}
</script>

<style scoped>
.grid {
}

.table-header {
  line-height: 40px;
  height: 41px;
  clear: both;
  border-bottom: 1px solid #dddddd;
  font-weight: bold;
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
  -webkit-transition: background-color 0.5s;
  -moz-transition: background-color 0.5s;
  -ms-transition: background-color 0.5s;
  -o-transition: background-color 0.5s;
  transition: background-color 0.5s;
}

.table-row {
  height: 40px;
  line-height: 38px;
  clear: both;
  border-top: 1px solid #dddddd;
  color: #606266;
}

.table-row:hover {
  background-color: #f7f7f7;
  -webkit-transition: background-color 0.5s;
  -moz-transition: background-color 0.5s;
  -ms-transition: background-color 0.5s;
  -o-transition: background-color 0.5s;
  transition: background-color 0.5s;
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
  content: "\ea3a";
  font-size: 16px;
  font-weight: normal;
}

.desc:after {
  font-family: iconfont;
  content: "\ea3e";
  font-size: 16px;
  font-weight: normal;
}

.operation {
  font-family: iconfont;
  padding: 8px;
}

.operation:hover {
  background-color: #cccccc;
  color: #0374d0;
  -webkit-transition: background-color 0.5s;
  -moz-transition: background-color 0.5s;
  -ms-transition: background-color 0.5s;
  -o-transition: background-color 0.5s;
  transition: background-color 0.5s;
}

.grid .selected {
  background-color: #ffefbb;
  -webkit-transition: background-color 0.5s;
  -moz-transition: background-color 0.5s;
  -ms-transition: background-color 0.5s;
  -o-transition: background-color 0.5s;
  transition: background-color 0.5s;
}

.grid .selected:hover {
  background-color: #ffefbb;
}
</style>
