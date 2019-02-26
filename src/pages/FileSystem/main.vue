<template>
  <Panel>
    <div slot="searchBar">
      <span>文件名称:</span>
      <i-inputbox placeholder="请输入文件名称"
                  v-model="folderConfig.searchFields.name"
                  style="width:180px;height: 30px;margin-right:10px;"
                  height="30px"></i-inputbox>
      <i-button type="primary"
                plain
                @click="search">查询
      </i-button>
      <i-button type="primary"
                plain
                @click="reset">重置
      </i-button>
    </div>
    <div slot="actionBar">
      <i-button type="success"
                @click="addFolder">新增文件</i-button>
      <i-button type="danger"
                @click="batchRemoveFolder">批量删除</i-button>
      <i-button type="success"
                @click="batchMoveFolder">批量移动</i-button>
    </div>
    <div>
      <Folder ref='folder'
              :config="folderConfig"
              @getPathArr="getPathArr"></Folder>
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

    <!--上传文件文件的对话框-->
    <myWindow v-if="uploadWindowConfig.show"
              :config="uploadWindowConfig">
      <wrap-box title='选择上传文件'
                themeNum='1'
                style="width:100%">
        <FileUpLoader style="display:inline-block"
                      v-model="folderConfig.uploadConfig.files"
                      :multiple="true"
                      :attach-params="folderConfig.currentPath"
                      class='fileUpButton'
                      @error="uploadError"></FileUpLoader>
      </wrap-box>
    </myWindow>
    <!--修改文件的对话框-->
    <myWindow v-if="folderWindowConfig.show"
              :config="folderWindowConfig">
      <i-form-item label="文件名称">
        <i-inputbox v-model="folderWindowConfig.form.newName"
                    :readOnly="folderWindowConfig.readonly" />
      </i-form-item>
    </myWindow>
    <!--修改文件路径的对话框-->
    <myWindow v-if="movefolderWindowConfig.show"
              :config="movefolderWindowConfig">
      <AsynTree :treeData='treeConfig.data'
                :currentItem='treeConfig.currentItem'
                @item-click="itemClick">
        <span v-for="item in treeConfig.data"
              :slot="item.id">
          <i-button class='success small-button'>注册为数据</i-button>
          <i-button class="info small-button">删除</i-button>
        </span>
      </AsynTree>
    </myWindow>
    <MyTooltip :show="showTooltip"
               :showType="tooltipType"
               :message="tooltipMessage"
               @tooltipClosed="tooltipClosed"></MyTooltip>
  </Panel>
</template>

<script>
import TreeUtil from "../../utils/TreeUtil"
import grid from "../../components/common/grid.vue"
import Panel from "../../components/Panel.vue"
import MyDialog from "../../components/common/Dialog.vue"
import MyTooltip from "../../components/common/OperationStatusTooltip.vue"
import MyWindow from "../../components/common/Window.vue"
import Tree from "../../components/common/Tree.vue"
import TreeSelect from "../../components/common/TreeSelect.vue"
import Checkbox from "../../components/common/Checkbox.vue"
import Tabs from "../../components/common/Tabs.vue"
import TabPane from "../../components/common/TabPane.vue"
import IForm from "../../components/common/IForm"
import IFormItem from "../../components/common/IFormItem"
import IInputbox from "../../components/common/IInputbox"
import FileUpLoader from "../../components/common/FileUploader"
import IButton from '../../components/common/IButton';
import ITextarea from "../../components/common/ITextarea"
import Folder from "../../components/common/Folder"
import AsynTree from "../../components/common/AsynTree"
import WrapBox from "../../components/layout/WrapBox"

export default {

  watch: {
    '$route' (to, from) {
      this.treeConfig = {
        data: [],
        form: {},
        dir: '/',
        currentItem: ''
      };
      this.folderConfig.sourceId = '-2';
      this.folderConfig.apiDir = '/';
      this.folderConfig.searchFields = { name: '' };
      this.folderConfig.pathChangeParentFlag = true;
      this.folderConfig.pathArr = [];
      this.folderConfig.uploadConfig = { files: [] };
      this.folderConfig.currentPath = {};
      this.showDialog = false;
      this.dialogMessage = '';
      this.showTooltip = false;
      this.tooltipType = '';
      this.tooltipMessage = '';
      this.folderWindowConfig.type = '';
      this.folderWindowConfig.show = false;
      this.folderWindowConfig.title = '';
      this.folderWindowConfig.form = {
        id: '',
        name: '',
        path: ''
      };
      this.uploadWindowConfig.type = '';
      this.uploadWindowConfig.show = false;
      this.uploadWindowConfig.title = '';
      this.uploadWindowConfig.form = {
        id: '',
        name: '',
        path: ''
      };
      this.movefolderWindowConfig.type = '';
      this.movefolderWindowConfig.show = false;
      this.movefolderWindowConfig.title = '';
      this.movefolderWindowConfig.form = {
        path: '',
        newPath: ''
      };
      this.$refs.folder.getFolders();
    }
  },
  props: {},
  data () {
    return {
      // 获取用户信息接口
      getUserMessageApi: "./loginapi/sys/getCurrentUser",
      // 增加文件接口
      addFolderApi: "./api/dataMetadata/save",
      // 修改文件名字数据接口
      modifyFolderApi: "./api/fileSourceView/rename/",
      // 删除文件数据接口
      removeFolderApi: "./api/fileSourceView/remove/",
      // 批量删除文件数据接口
      removeFolderBatchApi: "./api/fileSourceView/batchRemove/",
      // 移动文件夹路径接口
      moveFolderApi: "./api/fileSourceView/moveFile/",
      // 批量移动文件夹路径接口
      moveBatchFolderApi: "./api/fileSourceView/batchMove/",
      // 下载文件接口
      dowmloadFolderApi: "./api/fileSourceView/download/",
      //获取文件夹树结构接口
      getFolderTreeApi: "./api/fileSourceView/getFolderList/",
      treeConfig: {
        data: [],
        form: {},
        dir: '/',
        currentItem: ''
      },
      treeSelectConfig: {
        api: "./api/caorg/getAll",
        field: "name",
        selectStyle: {
          height: "32px",
          float: "left"
        }
      },
      folderConfig: {
        sourceId: this.$route.query.sourceId ? this.$route.query.sourceId : '-2',
        api: './api/fileSourceView/getContentList/',
        apiDir: '/',
        searchFields: {
          name: ""
        },
        pathChangeParentFlag: true,
        pathArr: [],
        uploadConfig: {
          files: [],
        },
        currentPath: {},
        operations: [{
          title: "修改",
          icon: "&#xe90a",
          func: this.modifyFolder
        }, {
          title: "下载",
          icon: "&#xea3e",
          func: this.downLoaderFolder,
          filter: function (row) {
            return !+row.isDir;
          }
        }, {
          title: "删除",
          icon: "&#xe9ac",
          func: this.removeFolder
        }, {
          title: "移动文件",
          icon: "&#xea13",
          func: this.moveFolder
        }],
        searchFields: {
          type: "",
          sourceType: "",
          name: ""
        },
        fields: [{
          title: '文件名',
          field: 'name',
          isSortField: true,
          sortType: "asc",
          style: {
            width: "43%",
            float: "left",
            textAlign: "left",
            paddingLeft: '10px'
          }
        }, {
          title: '文件大小',
          field: 'size',
          isSortField: true,
          style: {
            width: "10%",
            float: "left",
            textAlign: "center"
          }
        }, {
          title: '创建人',
          field: 'creator',
          style: {
            width: "12%",
            float: "left",
            textAlign: "center"
          }
        }, {
          title: '创建时间',
          field: 'createDate',
          isSortField: true,
          style: {
            width: "15%",
            float: "left", textAlign: "center",
          }
        }],
        searchedCallback: function (rows) {

          if (rows && rows.length > 0) {
            var temp = [];
            rows.filter(function (item) {
              if (item.isDir && item.isDir == '1') {
                // item.size = '——';
                temp.push(item);
              }
              return true;
            })
            rows.filter(function (item) {
              if (item.isDir && item.isDir == '0') {
                // item.size = item.size ?(item.size/1024/1024).toFixed(3)+"MB":undefined;
                temp.push(item);
              }
              return true;
            })
            rows = temp;
          }
          return rows;
        }
      },
      showDialog: false,
      dialogMessage: "",
      showTooltip: false,
      tooltipType: "",
      tooltipMessage: "",
      folderWindowConfig: {
        type: "", //add modify view 分别表示新增，修改以及查看
        show: false,
        parent: this,
        title: "",
        height: "200px",
        width: "600px",
        form: {
          id: '',
          name: '',
          path: ''
        },
        method: {
          close () {
            this.folderWindowConfig.show = false;
          },
          cancel () {
            this.folderWindowConfig.show = false;
          },
          confirm () {
            if (this.folderWindowConfig.type === "modify") {
              this.$http.post(this.modifyFolderApi + this.sourceId, this.folderWindowConfig.form).then(
                (res) => {
                  // debugger
                  this.folderWindowConfig.show = false;
                  //新增完按创建时间降序排序，方便查看最新增加的信息
                  if (res.body.status == "success") {
                    for (var idx in this.folderConfig.fields) {
                      var field = this.folderConfig.fields[idx];
                    }
                    this.search();
                    this.tooltipType = "success";
                    this.tooltipMessage = "修改成功!";
                    this.showTooltip = true;
                  } else {
                    this.tooltipType = "failed";
                    this.tooltipMessage = res.body.message;
                    this.showTooltip = true;
                  }
                },
                (res) => {
                  this.tooltipType = "failed";
                  this.tooltipMessage = "修改失败!";
                  this.showTooltip = true;
                }
              )
            }
            this.folderWindowConfig.show = false;
          }
        }
      },
      uploadWindowConfig: {
        type: "", //add modify view 分别表示新增，修改以及查看
        show: false,
        parent: this,
        title: "",
        height: "400px",
        width: "600px",
        form: {
          id: '',
          name: '',
          path: ''
        },
        method: {
          close () {
            this.uploadWindowConfig.show = false;
            this.search();
          },
          cancel () {
            this.uploadWindowConfig.show = false;
          },
          confirm () {
            if (this.uploadWindowConfig.type === "modify") {  //如果配置信息是“修改文件”类型
              this.$http.post(this.modifyFolderApi, this.uploadWindowConfig.form).then(
                (res) => {
                  this.uploadWindowConfig.show = false;
                  //新增完按创建时间降序排序，方便查看最新增加的信息
                  if (res.body.status == "success") {
                    for (var idx in this.folderConfig.fields) {
                      var field = this.folderConfig.fields[idx];
                    }
                    this.search();
                    this.tooltipType = "success";
                    this.tooltipMessage = "修改成功!";
                    this.showTooltip = true;
                  } else {
                    this.tooltipType = "failed";
                    this.tooltipMessage = res.body.message;
                    this.showTooltip = true;
                  }
                },
                (res) => {
                  this.tooltipType = "failed";
                  this.tooltipMessage = "修改失败!";
                  this.showTooltip = true;
                }
              )
            }
            this.uploadWindowConfig.show = false;
          }
        }
      },
      movefolderWindowConfig: {
        type: "", //add modify view 分别表示新增，修改以及查看
        show: false,
        parent: this,
        title: "",
        height: "400px",
        width: "600px",
        form: {
          path: '',
          newPath: ''
        },
        method: {
          close () {
            this.movefolderWindowConfig.show = false;
          },
          cancel () {
            this.movefolderWindowConfig.show = false;
          },
          confirm () {
            // debugger
            if (this.movefolderWindowConfig.type === "modify") {
              if (this.treeConfig.currentItem.path === undefined) {
                this.movefolderWindowConfig.form.newPath = '/' + this.operationItem.name;
              } else {
                this.movefolderWindowConfig.form.newPath = this.treeConfig.currentItem.path + '/' + this.operationItem.name;
              }
              this.$http.post(this.moveFolderApi + this.sourceId, this.movefolderWindowConfig.form).then(
                (res) => {
                  this.movefolderWindowConfig.show = false;
                  //新增完按创建时间降序排序，方便查看最新增加的信息
                  if (res.body.status == "success") {
                    for (var idx in this.folderConfig.fields) {
                      var field = this.folderConfig.fields[idx];
                    }
                    this.search();
                    this.tooltipType = "success";
                    this.tooltipMessage = "移动成功!";
                    this.showTooltip = true;
                  } else {
                    this.tooltipType = "failed";
                    this.tooltipMessage = res.body.message;
                    this.showTooltip = true;
                  }
                },
                (res) => {
                  this.tooltipType = "failed";
                  this.tooltipMessage = "移动失败!";
                  this.showTooltip = true;
                }
              )
            } else if (this.movefolderWindowConfig.type === "modifyBatch") {
              var newPath;
              if (this.treeConfig.currentItem.path === undefined) {
                newPath = '/';
              } else {
                newPath = this.treeConfig.currentItem.path + '/';
              }
              var paramsFrom = {
                newPath: newPath,
                pathList: this.movefolderWindowConfig.getSelectedPaths
              }
              // debugger

              this.$http.post(this.moveBatchFolderApi + this.sourceId, paramsFrom).then(
                (res) => {
                  this.movefolderWindowConfig.show = false;
                  //新增完按创建时间降序排序，方便查看最新增加的信息
                  if (res.body.status == "success") {
                    for (var idx in this.folderConfig.fields) {
                      var field = this.folderConfig.fields[idx];
                    }
                    this.search();
                    this.tooltipType = "success";
                    this.tooltipMessage = "批量移动成功!";
                    this.showTooltip = true;
                  } else {
                    this.tooltipType = "failed";
                    this.tooltipMessage = res.body.message;
                    this.showTooltip = true;
                  }
                },
                (res) => {
                  this.tooltipType = "failed";
                  this.tooltipMessage = "批量移动失败!";
                  this.showTooltip = true;
                }
              )
            }
            this.movefolderWindowConfig.show = false;
          }
        }
      }
    }
  },
  methods: {
    uploadError (message) {
      this.tooltipType = "failed";
      this.tooltipMessage = message;
      this.showTooltip = true;
      this.uploadWindowConfig.show = false;
    },
    search () {
      //条件查询时必须将当前页重置为1
      this.$refs.folder.getFolders();
      this.folderConfig.pathChangeParentFlag = false;
    },
    reset () {
      this.folderConfig.searchFields.type = "";
      this.folderConfig.searchFields.sourceType = "";
      this.folderConfig.searchFields.name = "";
      this.search();
    },
    dialogCancel () {
      //对值进行重置,不然不会触发change事件
      this.showDialog = false;
    },
    itemClick (item) {
      // var isCheckedItem = item;
      var path;
      this.treeConfig.currentItem = item;
      if (item.isDir == '1') item.open = !item.open;
      if (item && item.isDir == "1") {
        if (item.parentPath == "") {
          path = '/'
        } else if (item.parentPath == "/") {
          path = item.parentPath + item.name;
        } else {
          path = item.parentPath + "/" + item.name;
        }
        var params = {
          path: path
        }
        this.$http.post(this.getFolderTreeApi + this.sourceId, params).then((res) => {
          var filterDatas = res.body.content;
          var selectedList = this.$refs.folder.getSelectedItems();
          selectedList.push(this.operationItem)
          var newFilterDatas = [];
          filterDatas.forEach(function (ele) {

            var flag = false;
            for (var i = 0, item; item = selectedList[i++];) {
              if (item.name == ele.name) {
                flag = true;
                break;
              }
            }
            if (!flag) {
              newFilterDatas.push(ele);
            }
          })
          this.$set(item, 'children', newFilterDatas);
        });
      }
    },
    tooltipClosed () {
      this.showTooltip = false;
    },
    //获取目前文件夹组件的面包屑导航的path集合
    getPathArr (pathArr) {
      if (pathArr && pathArr[pathArr.length - 1])
        this.folderConfig.currentPath.path = pathArr[pathArr.length - 1].parentPath;
      else
        this.folderConfig.currentPath.path = '/';
      this.folderConfig.currentPath.sourceId = this.sourceId
    },
    addFolder () {
      this.a();
      this.uploadWindowConfig.show = true;
      this.uploadWindowConfig.title = "添加文件";
      this.uploadWindowConfig.readonly = false;
      this.uploadWindowConfig.type = "";
    },
    modifyFolder (item) {
      this.folderWindowConfig.form = {
        newName: item.name,
        path: item.path
      }
      this.folderWindowConfig.show = true;
      this.folderWindowConfig.title = "修改文件";
      this.folderWindowConfig.readonly = false;
      this.folderWindowConfig.type = "modify";
    },
    moveFolder (item) {
      this.treeConfig.data = [{
        name: '全部文件',
        parentPath: '',
        isDir: '1',
        isLeafDir: '0'
      }];
      // this.movefolderWindowConfig.form.id = item.id;
      this.movefolderWindowConfig.form = {
        path: item.path,
        newPath: ''
      }
      this.operationItem = item;
      this.movefolderWindowConfig.show = true;
      this.movefolderWindowConfig.title = "移动文件";
      this.movefolderWindowConfig.type = 'modify';
    },
    batchMoveFolder () {
      this.treeConfig.data = [{
        name: '全部文件',
        parentPath: '',
        isDir: '1',
        isLeafDir: '0'
      }];
      // this.movefolderWindowConfig.form = {
      //   path: item.path,
      //   newPath:''
      // }
      this.movefolderWindowConfig.getSelectedNames = [];
      this.movefolderWindowConfig.getSelectedPaths = [];
      var selectItems = this.$refs.folder.getSelectedItems();
      if (selectItems.length == 0) {
        this.tooltipType = "failed";
        this.tooltipMessage = "请先选择文件!"
        this.showTooltip = true;
        return;
      } else {
        for (var i in selectItems) {
          this.movefolderWindowConfig.getSelectedPaths.push(selectItems[i].path)
          this.movefolderWindowConfig.getSelectedNames.push(selectItems[i].name)
        }
        this.movefolderWindowConfig.show = true;
      }
      // this.operationItem = item;
      this.movefolderWindowConfig.type = "modifyBatch";
      this.movefolderWindowConfig.title = "批量移动文件";
    },
    removeFolder (item) {
      this.dialogMessage = "确认需要移除" + item.name + "这个文件吗?";
      this.operationType = "removeFolder";
      this.operationItem = item;
      this.showDialog = true;
    },
    batchRemoveFolder () {
      this.folderConfig.getSelectedNames = [];
      this.folderConfig.getSelectedPaths = [];
      var selectItems = this.$refs.folder.getSelectedItems();
      if (selectItems.length == 0) {
        this.tooltipType = "failed";
        this.tooltipMessage = "请先选择文件!"
        this.showTooltip = true;
        return;
      } else {
        for (var i in selectItems) {
          this.folderConfig.getSelectedPaths.push(selectItems[i].path)
          this.folderConfig.getSelectedNames.push(selectItems[i].name)
        }
        this.dialogMessage = "确认要批量删除：" + this.folderConfig.getSelectedNames + " 的文件吗?";
        this.operationType = "removeFolderBatch";
        this.showDialog = true;
      }
    },
    downLoaderFolder (item) {
      window.open(this.dowmloadFolderApi + this.sourceId + '?path=' + item.path);
    },
    dialogConfirm () {
      this.showDialog = false;

      if (this.operationType == "removeFolder") {
        var paramsFrom = {
          cascade: true,  //级联删除
          path: this.operationItem.path
        }
        this.$http.post(this.removeFolderApi + this.sourceId, paramsFrom).then(
          (res) => {
            if (res.body.status == 'success') {
              this.tooltipType = "success";
              this.tooltipMessage = "删除成功!"
              this.showTooltip = true;
              this.search();
            } else {
              this.tooltipType = "failed";
              this.tooltipMessage = "删除失败!"
              this.showTooltip = true;
            }
          },
          (err) => {
            this.tooltipType = "failed";
            this.tooltipMessage = "删除失败!"
            this.showTooltip = true;
          }
        )
      } else if (this.operationType == "removeFolderBatch") {
        var paramsFrom = {
          pathList: this.folderConfig.getSelectedPaths
        }
        this.$http.post(this.removeFolderBatchApi + this.sourceId, paramsFrom).then(
          (res) => {
            if (res.body.status == 'success') {
              this.tooltipType = "success";
              this.tooltipMessage = "删除成功!"
              this.showTooltip = true;
              this.folderConfig.getSelectedPaths = []
              this.search();
            } else {
              this.tooltipType = "failed";
              this.tooltipMessage = "删除失败!"
              this.showTooltip = true;
              this.folderConfig.getSelectedPaths = []
            }
          },
          (res) => {
            this.tooltipType = "failed";
            this.tooltipMessage = "批量删除失败!";
            this.showTooltip = true;
            this.folderConfig.getSelectedPaths = []
          }
        )
      }
    }

  },
  computed: {
    sourceId () {
      return this.$route.query.sourceId ? this.$route.query.sourceId : '-2';
    }
  },
  created () {

  },
  mounted () {

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
    Folder,
    FileUpLoader,
    AsynTree,
    IButton,
    WrapBox
  }
}

</script>

<style scoped>
</style>
