<template>
  <div class="folder">
    <div class="breadCrumbs">
      <span v-if="path.length>1" class='back' @click="back()">返回上一级&nbsp;|</span>
      <span class='text' @click='backRoot()'>全部文件</span>
      <span v-for="(node,index) in path" @click.stop="navigate(node,index)">
        <span class='text'>{{node.name}}</span>
        <span v-if='index!==(path.length-1)'>></span>
      </span>
    </div>
    <ul class='folder-header'>
      <!-- <li style="float:left;width:30px;">#</li> -->
      <li v-if="" style="float:left;width:50px;">
        <span>
          <CheckBox v-model="isCheckedAll"></CheckBox>
        </span>
      </li>
      <li v-for='item in config.fields' :style="item.style">
        <span>{{item.title}}</span>
      </li>
      <li v-if="config.operations.length > 0" style="float:right;width:180px;">操作</li>
    </ul>
    <template v-if="this.rows.length >0">
      <ul v-for="(r,index) in rows" @click="selectRow(r)" @dblclick="next(r)" class="folder-row" :class="{'selected':r.isChecked}">
        <!-- <li style="width:30px;float:left;text-align:center;">{{index + 1}}</li> -->
        <li style="width:50px;float:left;text-align:center;">
          <CheckBox v-model="r.isChecked" @change="checkStatusChange(r)"></CheckBox>
        </li>
        <li v-for='item in config.fields' :style="item.style">
          <div v-if="getFieldValue(r,item.field) == '' || getFieldValue(r,item.field) == undefined">
            &nbsp;
          </div>
          <span v-else :name="r[item.field]" class='titleWrap'>
            <!-- <span v-if="item"></span> -->
            <span v-if="item.field=='name'" :class='getFieldValue(r,item.field )|iconChange' class='icon'>
            </span>
            <span class='title'> {{getFieldValue(r,item.field)}}</span>
          </span>
        </li>
        <li v-if="config.operations.length > 0" style="float:right;width:180px;text-align:center;">
          <span v-if="" v-for="operation in config.operations" class="operation" @click.stop="operation.func(r)" :name="operation.name"
            v-html="operation.icon">
          </span>
        </li>
      </ul>
    </template>
    <template v-else>
      <ul>
        <li>
          <div style="line-height:200px;text-align: center;vertical-align: middle;font-size:30px;font-weight:bold;color:#ccc">&nbsp;暂无文件&nbsp;</div>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
  import TreeUtil from "../../utils/TreeUtil"
  import CheckBox from './Checkbox.vue'
  var arr2 = [
  {
      'id': "1",
      'parentId': "0",
      "name": "userID1",
      "path": "/userID1",
      "type": "directory",
      'name': '系统.rar',
      'creator': '张三',
      'creatTime': '2015-10-12',
      'modifier': '王五',
      'modifyTime': '2018-10-12'
    },
    {
      'id': "22",
      'parentId': "1",
      "name": "poi4.shp",
      "path": "hdfs://192.168.1.214:9000/userID1/poi3/poi4.shp",
      "type": "file",
      'creator': '李四',
      'creatTime': '2015-10-12',
      'modifier': '王五',
      'modifyTime': '2018-10-12'
    },
    {
      'id': "7",
      'parentId': "22",
      "name": "poi.shp",
      "path": "hdfs://192.168.1.214:9000/userID1/poi.shp",
      "type": "file",
      'creator': '赵柳',
      'creatTime': '2015-10-12',
      'modifier': '王五',
      'modifyTime': '2018-10-12'
    },
    {
      'id': "8",
      'parentId': "22",
      'name': 'sql.word',
      'creator': '尔尔',
      'creatTime': '2015-10-12',
      'modifier': '王五',
      'modifyTime': '2018-10-12'
    },
    {
      "id": "616448001",
      "parentId": "1",
      "name": "poi3",
      "path": "hdfs://192.168.1.214:9000/userID1/poi3",
      "type": "directory"
    }
  ];


  var arr = arr2
  export default {
    props: {
      config: Object
    },
    data() {
      var selectedMap = new Array()
      return {
        isCheckedAll: false,
        message: "",
        bread: '',
        path: [],
        rows: {},
        showMask: true,
        selectedMap: selectedMap
      }
    },
    methods: {
      getFolders() {
        this.message = "数据加载中．．．";
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
        this.$http.post(this.config.api, {}).then(
          (res) => {
            this.showMask = false;
            var rows = res.body.content
            // var rows = arr2
            //初始化未选择状态
            for (var idx in rows) {
              var row = rows[idx];
              if (typeof this.selectedMap[row.id] != "undefined" && this.selectedMap[row.id] != null) {
                row.isChecked = true;
              } else {
                row.isChecked = false;
              }
            }
            this.rows = res.body.content
            // this.rows = arr2
            var fields = [
              'creator',
              'creatTime',
              'modifier',
              'modifyTime'
            ]
            this.rows = TreeUtil(rows, fields).children;
            this.path.push(this.rows);
            /*
             * 判断是否定义的查询后的回调函数
             */

            if (typeof this.config.searchedCallback != "undefined") {
              //执行回调函数, 这样允许使用组件方可以对查调结果进行自定义处理
              this.config.searchedCallback(this.rows);
            }

            if (this.rows.length < 1) {
              this.message = "未查找到相关记录！";
            }
          }
        )
      },
      next(arr) {
        if (arr.children.length !== 0) {
          this.rows = arr.children
          this.add(arr);
        } else {
          return true
        }
      },
      isArray(o) {
        return Object.prototype.toString.call(o) === '[object Array]';
      },
      add(node) {
        this.path.push(node);
      },
      navigate(node, index) {
        if (this.path.length !== 0) {
          this.rows = node.children;
        } else {
          return true;
        }
        this.path.splice(index + 1)
      },
      back() {
        this.path.pop();
        if (this.path.length !== 0) {
          if (this.isArray(this.path[this.path.length - 1].children)) {
            this.rows = this.path[this.path.length - 1].children
          } else {
            this.rows = this.path[this.path.length - 1]
          }
        } else {
          return true;
        }
      },
      backRoot() {
        this.rows = this.path[0];
        this.path.splice(1)
      },
      getFieldValue(row, field) {
        var fields = field.split(".");
        var value = row;
        for (var i in fields) {
          value = value[fields[i]];
          if (fields[i] === 'name') {
            var str = row[fields[i]];
          }
        }
        return value;
      },

      selectRow(row) {
        if (this.hasCheckbox) {
          row.isChecked = !row.isChecked;
          if (row.isChecked) {
            this.selectedMap[row.id] = row.id;
          } else {
            this.selectedMap[row.id] = null;
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
      checkStatusChange(row) {
        if (row.isChecked) {
          this.selectedMap[row.id] = row.id;
        } else {
          this.selectedMap[row.id] = null;
        }
      },

      getSelectedItems() {
        var selectedRows = new Array();
        for (var idx in this.rows) {
          var row = this.rows[idx];
          if (row.isChecked) {
            selectedRows.push(row);
          }
        }
        return selectedRows;
      },
    },
    created() {

    },
    created() {
      this.getFolders();
    },
    computed: {

    },
    filters: {
      iconChange(value) {
        const iconConfig = {
          'txt': 'icon-txt',
          'word': 'icon-word',
          'rar': 'icon-rar'
        };
        if(value.match(/\.(\w+)$/)==null){
          var iconKey = ''
        }else{
          var iconKey = value.match(/\.(\w+)$/)[1];
        }
        console.log(222,iconKey)
        const icon = iconConfig[iconKey]||'icon-unknow';
        return icon
      }
    },
    components: {
      CheckBox
    },
    watch: {
      "isCheckedAll": function (newValue) {
        for (var idx in this.rows) {
          var row = this.rows[idx];
          row.isChecked = newValue;
          if (row.isChecked) {
            this.selectedMap[row.id] = row.id;
          } else {
            this.selectedMap[row.id] = null;
          }
        }
      }
    }
  }

</script>
<style scoped>
  ul {
    margin: 0;
  }

  .breadCrumbs {
    line-height: 35px;
    background-color: #eff1f5;
  }

  .back {
    height: 10px;
    font-size: 13px;
    color: #4287ed;
  }

  .folder {
    font-family: iconfont;
  }

  .folder-header {
    line-height: 40px;
    height: 41px;
    clear: both;
    border-bottom: 1px solid #dddddd;
  }

  .folder-header li {
    text-align: center;
    cursor: default;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    /* list-style:none */
  }

  .back:hover,
  .breadCrumbs .text:hover {
    background-color: rgba(222, 233, 246, 0.8);
    /* border: 1px solid #dddddd; */
    border-radius: 4px;
    padding: 5px 0px;
    cursor: pointer;
  }

  .folder-header>li>span:hover {
    background-color: rgba(222, 233, 246, 0.8);
    border-radius: 4px;
    padding: 5px 5px;
    border: 1px solid #dddddd;
  }

  .folder-row {
    height: 40px;
    line-height: 38px;
    clear: both;
    border-top: 1px solid #dddddd;
  }

  .folder .selected {
    background-color: #ffefbb;
  }

  .folder .selected:hover {
    background-color: #ffefbb;
  }

  .folder-row:last-child {
    border-bottom: 1px solid #dddddd;
  }

  .folder-row:hover {
    background-color: #daebfe;
  }

  .folder-row li {
    height: 100%;
    cursor: default;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .operation {
    padding: 8px;
  }

  .operation:hover {
    background-color: #cccccc;
    color: #0374d0;
  }

  .titleWrap {
    position: relative;
  }

  .icon {
    position: absolute;
    top: -5px;
  }

  .title {
    margin-left: 25px;
  }

  .icon-txt {
    display: inline-block;
    width: 18px;
    height: 20px;
    background: url('../../assets/img/icon.png') no-repeat -83px 0;
  }

  .icon-word {
    display: inline-block;
    width: 18px;
    height: 20px;
    background: url('../../assets/img/icon.png') no-repeat -108px 0;
  }

  .icon-rar {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url('../../assets/img/icon.png') no-repeat -31px 0;
  }
  .icon-unknow{
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url('../../assets/img/icon.png') no-repeat -233px 0;
  }
</style>
