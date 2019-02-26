<template>
  <div class="folder">
    <div class="breadCrumbs">
      <span v-if="pathArr.length>1"
            class='text colorBlue'
            @click="back()">返回上一级&nbsp;|</span>
      <span class='text colorBlue'
            @click='backRoot()'>全部文件</span>
      <span v-for="(node,index) in pathArr"
            @click.stop="navigate(node,index)">
        <span class='text'
              :class="{ colorBlue : index!==(pathArr.length-1)}">{{node.name}}</span>
        <span v-if='index!==(pathArr.length-1)'
              class="colorBlue">&nbsp;>&nbsp;</span>
      </span>
      <!-- <i-button class="" style="float:right;margin:4px 5px 0 0" @click.stop="addFolder">新建文件夹</i-button> -->

      <button class="button"
              style="float:right;margin:4px 5px 0 0"
              @click.stop="addFolder">新建文件夹</button>
    </div>
    <ul class='folder-header'>
      <!-- <li style="float:left;width:30px;">#</li> -->
      <li style="float:left;width:50px;height:100%">
        <span>
          <CheckBox v-if="config.hasCheckbox"
                    v-model="isCheckedAll"></CheckBox>
          <b v-if="totalChecked&&config.hasCheckbox"
             style="font-weight:normal;position:absolute;color:#20a0ff"> ({{totalChecked}})</b>
        </span>
      </li>
      <li v-for='fieldConfig in config.fields'
          :style="fieldConfig.style"
          @click="sort(fieldConfig)">
        <span :class="{
            sortField: fieldConfig.isSortField,
            asc: 'asc' == fieldConfig.sortType,
            desc: 'desc' == fieldConfig.sortType
          }">{{fieldConfig.title}}</span>
      </li>
      <li v-if="config.operations.length > 0"
          style="float:right;text-align:center;width:120px;">操作</li>
    </ul>
    <template v-if="hasFolder==1">
      <ul v-for="(r,index) in rows"
          @click="next(r)"
          class="folder-row"
          :class="{'selected':r.isChecked}">
        <li style="width:50px;float:left;text-align:center;">
          <CheckBox v-model="r.isChecked"
                    @click="selectRow(r,index)"
                    @change="checkStatusChange(r,index)"></CheckBox>
        </li>
        <li v-for='(fieldConfig,i) in config.fields'
            :style="fieldConfig.style">
          <!-- <div v-if="getFieldValue(r,fieldConfig.field) == '' || getFieldValue(r,fieldConfig.field) == undefined">
            &nbsp;
          </div> -->
          <span :name="getFieldValue(r,fieldConfig.field)"
                class='titleWrap'>
            <!-- <span v-if="item"></span> -->
            <span v-if="fieldConfig.field=='name'"
                  :class='iconChange(r)'
                  class='icon'></span>

            <span v-if="fieldConfig.field=='size'"
                  :class="['fileSize','title',{'hoverStatus':i==0&&r.isDir==1}]">{{getSize(r,fieldConfig.field)}}</span>
            <span v-else
                  :class="['title',{'hoverStatus':i==0&&r.isDir==1}]"> {{getFieldValue(r,fieldConfig.field)}}</span>
          </span>
        </li>
        <li v-if="config.operations.length > 0"
            style="float:right;text-align:center;cursor: pointer;width:120px;">
          <span v-if="!operation.filter || operation.filter(r)"
                v-for="operation in config.operations"
                :key="operation.name"
                class="operation"
                @click.stop="operation.func(r)"
                :name="operation.name"
                v-html="operation.icon"
                :title="operation.title">
          </span>
        </li>
      </ul>
    </template>
    <NoThings v-if="hasFolder==0"
              class="pic-nofloder"></NoThings>
    <!-- 确认操作的提示框 -->
    <my-dialog v-if="showDialog"
               :message="dialogMessage"
               @dialogCancel="dialogCancel"
               @dialogConfirm="dialogConfirm"></my-dialog>

    <wait-mask :isShow="showMask"
               :maskByParent="true"
               style="height:100%;margin-top:-80px;"></wait-mask>

    <myWindow v-if="addFolderWindowConfig.show"
              :config="addFolderWindowConfig">
      <h4 style="padding-bottom:10px;">请输入文件夹名称：</h4>
      <Iinputbox v-model="floderForm.name"
                 :readOnly="false" />
    </myWindow>
    <MyTooltip :show="showTooltip"
               :showType="tooltipType"
               :message="tooltipMessage"
               @tooltipClosed="tooltipClosed"></MyTooltip>
  </div>
</template>

<script>
import MyTooltip from './OperationStatusTooltip.vue';
import Iinputbox from './IInputbox.vue';
import WaitMask from './WaitMask.vue';
import myWindow from './Window.vue';
import TreeUtil from '../../utils/TreeUtil';
import CheckBox from './Checkbox.vue';
import IButton from '../layout/IButton.vue';
import myDialog from './Dialog.vue';
import NoThings from '../layout/NoThings.vue';

export default {
  props: {
    config: Object
  },
  data () {
    var selectedMap = new Array();
    if (typeof this.config.hasCheckbox == 'undefined') {
      this.config.hasCheckbox = true;
    }
    return {
      totalChecked: 0,
      showTooltip: false,
      tooltipType: '',
      tooltipMessage: '',
      addFolderWindowConfig: {
        type: 'add', //add modify view 分别表示新增，修改以及查看
        show: false,
        parent: this,
        width: '600px',
        height: '180px',
        title: '新建文件夹',
        method: {
          close () {
            this.addFolderWindowConfig.show = false;
          },
          cancel () {
            this.addFolderWindowConfig.show = false;
          },
          confirm () {
            if (this.operationType == 'addFolder') {
              // this.floderForm = {
              //   id: '',
              //   userId: this.currentUserId,
              //   fileId: '',
              //   name: '新建文件夹',
              //   isDir: '1',
              //   path: ''
              // };
              if (this.floderForm.name.trim() == '') {
                this.tooltipType = 'failed';
                this.tooltipMessage = '请输入文件夹名称!';
                this.showTooltip = true;
              } else {
                this.addFolderWindowConfig.show = false;

                this.floderForm.userId = this.currentUserId;
                this.floderForm.isDir = '1';
                if (this.pathArr.length !== 0) {
                  if (this.pathArr[this.pathArr.length - 1].parentPath == '/') {
                    this.floderForm.path =
                      this.pathArr[this.pathArr.length - 1].parentPath +
                      this.floderForm.name;
                  } else {
                    this.floderForm.path =
                      this.pathArr[this.pathArr.length - 1].parentPath +
                      '/' +
                      this.floderForm.name;
                  }
                } else {
                  this.floderForm.path = '/' + this.floderForm.name;
                  this.floderForm.parentPath = '/';
                }
                this.$http
                  .post(
                    this.addFolderApi + this.config.sourceId,
                    this.floderForm
                  )
                  .then(
                    res => {
                      this.tooltipType = 'success';
                      this.tooltipMessage = '新建成功!';
                      this.showTooltip = true;
                      this.getFolders();
                    },
                    res => {
                      this.tooltipType = 'failed';
                      this.tooltipMessage =
                        res.body.message ||
                        res.body.resultBean.message ||
                        '新建失败!';
                      this.showTooltip = true;
                    }
                  );
              }
            }
          }
        }
      },
      //新建文件夹API
      addFolderApi: './api/fileSourceView/createDirectory/',
      // 获取当前用户信息
      getCurrentUserApi: './api/sys/getCurrentUser',
      operationType: '',
      showDialog: false,
      isCheckedAll: false,
      hasFolder: -1,
      //新增文件夹的时候不需要改变pathArr，第一次需要push进初始化页面路径
      pathChangeFlag: true,
      message: '',
      bread: '',
      pathArr: [],
      rows: [],
      showMask: true,
      selectedMap: selectedMap,
      floderForm: {
        id: '',
        userId: '',
        fileId: '',
        name: '新建文件夹',
        parentPath: '',
        isDir: '',
        path: ''
      }
    };
  },
  methods: {
    tooltipClosed () {
      this.showTooltip = false;
    },
    getFolders (obj) {
      this.selectedMap = new Array();
      this.isCheckedAll = false;

      this.totalChecked = 0;
      this.message = '数据加载中．．．';
      this.showMask = true;
      var fields = this.config.fields;
      var orderFields = new Array();
      var conditions = this.config.searchFields;

      //未设置查询条件则重置为空对象
      if (!conditions) {
        conditions = {};
      }

      for (var idx in fields) {
        if (fields[idx].isSortField === true) {
          if (fields[idx].sortType != '') {
            var orderBy = fields[idx].orderBy;
            // 未指定orderby字段时直接使用field字段做为排序字段
            if (
              typeof orderBy == 'undefined' ||
              orderBy == '' ||
              orderBy == null
            ) {
              orderBy = fields[idx].field;
            }
            orderFields.push({
              field: orderBy,
              sortType: fields[idx].sortType
            });
          }
        }
      }
      var form = {
        parentPath: this.config.apiDir,
        name: this.config.searchFields.name
      };
      this.config.fields.some(ele => {
        if (ele.sortType) {
          form.orderField = ele.field;
          if (ele.field == 'createDate') form.orderField = 'time';
          form.desc = ele.sortType == 'asc' ? '0' : '1';
          return true;
        }
        return false;
      });
      this.$http
        .post(this.config.api + this.config.sourceId, form)
        .then(res => {
          this.showMask = false;
          var rows = res.body.content;
          if (rows.length > 0) this.hasFolder = 1;
          else this.hasFolder = 0;
          if (
            this.pathChangeFlag == true &&
            this.config.pathChangeParentFlag == true
          ) {
            function PathObj (name, parentPath, path, clickFlag) {
              this.name = name;
              this.parentPath = parentPath;
              this.path = path;
              this.clickFlag = clickFlag;
            }

            if (rows.length > 0) {
              var index = rows[0].parentPath.lastIndexOf('/');
              var name = rows[0].parentPath.substr(index + 1);
              var parentPath = rows[0].parentPath;
              var path = rows[0].path;
              var clickFlag = true;
              this.pathArr.push(new PathObj(name, parentPath, path, clickFlag));
            } else if (obj) {
              var name = obj.name;
              if (obj.parentPath == '/')
                var parentPath = obj.parentPath + obj.name;
              else var parentPath = obj.parentPath + '/' + obj.name;
              var path = obj.path;
              var clickFlag = false;
              this.pathArr.push(new PathObj(name, parentPath, path, clickFlag));
            }
          }
          this.$emit('getPathArr', this.pathArr);
          //初始化未选择状态
          for (var idx in rows) {
            var row = rows[idx];
            if (
              typeof this.selectedMap[row.id] != 'undefined' &&
              this.selectedMap[row.id] != null
            ) {
              row.isChecked = true;
            } else {
              row.isChecked = false;
            }
          }
          this.rows = res.body.content;
          var fields = ['creator', 'creatTime', 'modifier', 'modifyTime'];

          if (typeof this.config.searchedCallback != 'undefined') {
            //执行回调函数, 这样允许使用组件方可以对查调结果进行自定义处理
            var row = this.config.searchedCallback(this.rows);
            this.rows = row;
          }

          if (this.rows.length < 1) {
            this.message = '未查找到相关记录！';
          }
        })
        .catch(err => {
          this.showMask = false;
          this.tooltipType = 'failed';
          this.tooltipMessage = err.body.resultBean
            ? err.body.resultBean.message || err.body.resultBean.content
            : '';
          this.showTooltip = true;
        });
    },
    next (r) {
      this.config.pathChangeParentFlag = true;
      if (r.isDir === '1') {
        // if (this.config.apiDir !== '/') {
        //   this.config.apiDir = this.config.apiDir + '/' + r.name;
        // } else {
        // }
        this.config.apiDir = r.path;
        this.pathChangeFlag = true;
        this.getFolders(r);
      }
    },

    navigate (node, index) {
      if (node.clickFlag == true) {
        this.config.apiDir = node.parentPath;
        this.pathArr = this.pathArr.slice(0, index);
        this.pathChangeFlag = true;
        this.config.pathChangeParentFlag = true;
        this.getFolders();
      }
    },
    back () {
      this.config.apiDir = this.pathArr[this.pathArr.length - 2].parentPath;
      this.pathArr = this.pathArr.slice(0, this.pathArr.length - 2);
      this.pathChangeFlag = true;
      this.config.pathChangeParentFlag = true;
      this.getFolders();
    },
    backRoot () {
      this.config.apiDir = '/';
      this.pathArr = [];
      this.pathChangeFlag = true;
      this.config.pathChangeParentFlag = true;
      this.getFolders();
    },
    addFolder () {
      this.dialogMessage = '确认需要新增文件夹吗?';
      this.operationType = 'addFolder';
      // this.showDialog = true;
      //新建文件夹时，将表单数据置空
      this.floderForm = {
        id: '',
        userId: '',
        fileId: '',
        name: '新建文件夹',
        parentPath: '',
        isDir: '',
        path: ''
      };
      this.addFolderWindowConfig.show = true;
      this.pathChangeFlag = false;
    },
    dialogCancel () {
      //对值进行重置,不然不会触发change事件
      this.showDialog = false;
    },
    dialogConfirm () {
      this.showDialog = false;
      if (this.operationType == 'addFolder') {
        // this.floderForm = {
        //   id: '',
        //   userId: this.currentUserId,
        //   fileId: '',
        //   name: '新建文件夹',
        //   isDir: '1',
        //   path: ''
        // };
        this.floderForm.userId = this.currentUserId;
        this.floderForm.isDir = '1';
        if (this.pathArr.length !== 0) {
          if (this.pathArr[this.pathArr.length - 1].parentPath == '/') {
            this.floderForm.path =
              this.pathArr[this.pathArr.length - 1].parentPath +
              this.floderForm.name;
          } else {
            this.floderForm.path =
              this.pathArr[this.pathArr.length - 1].parentPath +
              '/' +
              this.floderForm.name;
          }
        }
        this.$http
          .post(this.addFolderApi + this.config.sourceId, this.floderForm)
          .then(
            res => {
              this.tooltipType = 'success';
              this.tooltipMessage = '新建成功!';
              this.showTooltip = true;
              this.getFolders();
            },
            res => {
              this.tooltipType = 'failed';
              this.tooltipMessage =
                res.body.message || res.body.resultBean.message || '新建失败!';
              this.showTooltip = true;
            }
          );
      }
    },
    showOperation (operation, row) {
      if (typeof operation.condition != 'undefined') {
        return operation.condition(row);
      } else {
        return true;
      }
    },
    paging (pageNum) {
      this.currPageNum = pageNum;
      this.getFolders();
    },
    changePageSize (pageSize) {
      //修改每页多少条记录时需要将当前页重置为1
      this.currPageNum = 1;
      this.pageSize = parseInt(pageSize);
      this.getFolders();
    },
    sort (fieldConfig) {
      //允许进行排序的字段上点击才进排序操作
      this.config.pathChangeParentFlag = false;
      if (fieldConfig.isSortField) {
        var sortType = fieldConfig.sortType;
        var fields = this.config.fields;
        for (var idx in fields) {
          fields[idx].sortType = '';
        }
        if ('asc' == sortType) {
          fieldConfig.sortType = 'desc';
        } else {
          fieldConfig.sortType = 'asc';
        }
        //排序时将当前页设置为第一页进行显示
        this.currPageNum = 1;
        this.getFolders();
      }
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
          // this.selectedMap[row.id] = null;
          this.selectedMap = new Array();
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
        // this.selectedMap[row.id] = null;
        this.selectedMap = new Array();
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
    getSize (row, fieldName) {
      if (row.isDir == '1') return '-';
      let size = this.getFieldValue(row, fieldName);
      let unit = 1;
      if (size && size >= 0) {
        let unit = 1;
        let unitArr = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        for (let inx = 0; inx < unitArr.length; inx++) {
          const ele = unitArr[inx];
          if (size < (unit *= 1024))
            return Math.round(size / unit * 1024) + ' ' + ele;
        }
        return size + ' B';
      } else {
        return '0 B';
      }
    },
    getFieldValue (row, field) {
      var fields = field.split('.');
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
    iconChange (value) {
      const iconConfig = {
        folder: 'icon-folder2',
        txt: 'icon-txt',
        doc: 'icon-word',
        docx: 'icon-word',
        rar: 'icon-rar',
        zip: 'icon-rar'
      };
      var icon;
      if (value.isDir == '1') {
        icon = 'icon-folder2';
      } else {
        if (value.name.match(/\.(\w+)$/) == null) {
          var iconKey = '';
        } else {
          var iconKey = value.name.match(/\.(\w+)$/)[1];
        }
        icon = iconConfig[iconKey] || 'icon-unknow';
      }
      return icon;
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
    this.getFolders();
  },
  computed: {},
  filters: {},
  components: {
    MyTooltip,
    Iinputbox,
    myWindow,
    CheckBox,
    IButton,
    myDialog,
    NoThings,
    WaitMask
  },
  mounted () {
    this.$http.get(this.getCurrentUserApi).then(res => {
      this.currentUserId = res.body.content.id;
    });
  },
  watch: {
    isCheckedAll: function (newValue) {
      this.totalChecked = 0;
      for (var idx in this.rows) {
        var row = this.rows[idx];
        row.isChecked = newValue;
        if (row.isChecked) {
          this.selectedMap[row.id] = row.id;
        } else {
          // this.selectedMap[row.id] = null;
          this.selectedMap = new Array();
        }
      }
      this.getTotalCheked();
    },
    '$route' (to, from) {
      this.pathArr = [];
    }
  }
};
</script>
<style lang="less" scoped>
.folder {
  .fileSize {
    display: inline-block;
    width: 50px;
    text-align: center;
  }

  .hoverStatus {
    &:hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
}

ul {
  margin: 0;
}

.sortField {
  cursor: default;
}

.asc:after {
  font-family: iconfont;
  content: "\ea3a";
  font-size: 16px;
}

.desc:after {
  font-family: iconfont;
  content: "\ea3e";
  font-size: 16px;
}

.button {
  display: inline-block;
  line-height: 27px;
  padding: 0 10px;
  margin: 0 6px;
  background: #20a0ff;
  color: #fff;
  border-radius: 4px;
  letter-spacing: 1px;
  box-shadow: none;
  cursor: pointer;
  border: none;
  font-family: "\5FAE\8F6F\96C5\9ED1";
}

.button:hover {
  opacity: 0.75;
  filter: Alpha(opacity=75);
  transition: opacity 0.5s;
}

.breadCrumbs {
  line-height: 35px;
  background-color: #eff1f5;
  padding-left: 10px;
}

.colorBlue {
  font-size: 13px;
  color: #4287ed;
  margin: 0 1px;
}

.folder {
  /*font-family: iconfont;*/
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
  text-decoration: underline;
}

.folder-header > li > span:hover {
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

.folder-row > li:nth-child(2):hover {
  color: #3b8cff;
}

.folder-row li {
  height: 100%;
  cursor: default;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.operation {
  font-family: iconfont;
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
  top: -2px;
}

.folder-row > li:nth-child(2) .title {
  margin-left: 30px;
}

.icon-folder2 {
  display: inline-block;
  width: 25px;
  height: 20px;
  background: url("../../assets/img/icon.png") no-repeat 0 0;
}

.icon-txt {
  display: inline-block;
  width: 25px;
  height: 20px;
  background: url("../../assets/img/icon.png") no-repeat -80px 0;
}

.icon-word {
  display: inline-block;
  width: 25px;
  height: 20px;
  background: url("../../assets/img/icon.png") no-repeat -105px 0;
}

.icon-pdf {
  display: inline-block;
  width: 25px;
  height: 20px;
  background: url("../../assets/img/icon.png") no-repeat -105px 0;
}

.icon-rar {
  display: inline-block;
  width: 25px;
  height: 20px;
  background: url("../../assets/img/icon.png") no-repeat -29px 0;
}

.icon-unknow {
  display: inline-block;
  width: 25px;
  height: 20px;
  background: url("../../assets/img/icon.png") no-repeat -230px 0;
}
</style>
