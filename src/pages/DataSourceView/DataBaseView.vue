<template>
  <div class="dataBaseView">

    <!-- 数据源选择弹窗 -->
    <Window v-if="sourceWindowConfig.show"
            :config="sourceWindowConfig">
      <Grid :config="sourceGridConfig"
            ref="sourceGrid"
            @selected="chooseSource"></Grid>
    </Window>

    <!-- 表明重命名弹窗 -->
    <Window v-if="renameWindowConfig.show"
            :config="renameWindowConfig">
      <IInput v-model="renameWindowConfig.form.tableName"></IInput>
    </Window>

    <!-- 新增表命名弹窗 -->
    <Window v-if="newTableWindowConfig.show"
            :config="newTableWindowConfig">
      <IInput v-model="newTableWindowConfig.form.tableName"></IInput>
    </Window>

    <!-- 新增sql语句弹窗 -->
    <Window v-if="sqlTextWindowConfig.show"
            :config="sqlTextWindowConfig">
      <IInput v-model="sqlTextWindowConfig.form.name"></IInput>
    </Window>

    <!-- 消息提示 -->
    <my-tooltip :show="showTooltip"
                :showType="tooltipType"
                :message="tooltipMessage"
                @tooltipClosed="tooltipClosed"></my-tooltip>

    <!-- 对话框 -->
    <my-dialog v-if="showDialog"
               :message="dialogMessage"
               @dialogCancel="dialogCancel"
               @dialogConfirm="dialogConfirm"></my-dialog>

    <!-- tab页 -->
    <div class="pageTabs">
      <ul class="pageSign">
        <p class="iconBox">
          <i class="icon-arrow-double-left"></i>
        </p>
        <div class="tab-box">
          <div style="display:inline-block;"
               class="left-tab">
            <li :class="{'active':(!showNewTableTabActive)&&activeTabIndex==-1}"
                @click="showNewTableTabActive=false;activeTabIndex=-1"><img src="../../assets/img/home.png">
              <span>运行及展示</span>
            </li>
            <MouseRightMenu :config="firstTabRightMenuConfig"></MouseRightMenu>
          </div>
          <div style="display:inline-block;"
               class="center-tab">
            <li v-if="tab.gridConfigs.isDeleted!='isDeleted'"
                :class="{'active':(!showNewTableTabActive)&&activeTabIndex==index}"
                v-for="(tab,index) in allGridConfigs"
                @click.self="showNewTableTabActive=false;toggleTab(tab,index)">
              <img v-if="tab.gridConfigs.type=='table'"
                   @click.self="showNewTableTabActive=false;toggleTab(tab,index)"
                   src="../../assets/img/calendar.png">
              <img v-else
                   @click.self="showNewTableTabActive=false;toggleTab(tab,index)"
                   src="../../assets/img/config.png">
              <span @click.self="showNewTableTabActive=false;toggleTab(tab,index)"
                    v-if="tab.gridConfigs.type=='table'">{{tab.gridConfigs.tableName}}</span>
              <span @click.self="showNewTableTabActive=false;toggleTab(tab,index)"
                    v-else>设计 {{tab.gridConfigs.tableName}}</span>
              <i class="icon-guanbi5"
                 @click.self="deleteTab(index)"></i>
            </li>
            <MouseRightMenu :config="rightMenuConfig"
                            @change="getMouseRightIndex"></MouseRightMenu>
          </div>
          <div v-if="showNewTableTab"
               class="right-tab"
               style="display:inline-block;">
            <li :class="{'active':showNewTableTabActive}"
                @click.self="showNewTableTabActive=true">
              <span @click.self="showNewTableTabActive=true">新增表</span>
              <i class="icon-guanbi5"
                 @click="closeNewTab"></i>
            </li>
          </div>
        </div>
        <p class="iconBox2">
          <i class="icon-arrow-double-right"></i>
        </p>
      </ul>
    </div>

    <div class="left">
      <DataBaseTree :treeConfig="treeConfig"
                    :showMask="showTreeMask"
                    @otherSource="sourceWindowConfig.show=true"
                    @changeTable="changeTable"
                    @setTableByRightMouse="setTableByRightMouse"
                    @tableRename="tableRename"
                    @deleteTable="deleteTable"
                    @getMouseRightTableName="getMouseRightTableName"
                    @addTable="addTable"></DataBaseTree>
    </div>

    <div class="right">
      <template v-if="!showNewTableTabActive">
        <!-- 当tab页在运行及展示时 -->
        <div class="home"
             v-show="activeTabIndex==-1">
          <div class="level1">
            <div class="panel-bar">
              <button type="button"
                      @click="excuteSql">执行</button>
              <button type="button"
                      @click="emptySql">清空</button>
              <button type="button"
                      @click="saveSql">SQL保存</button>
            </div>
            <div class="panel-body">
              <!-- sql语句输入处 -->
              <textarea id="code"
                        v-model="sqlText"></textarea>
            </div>
          </div>
          <div class="level2">
            <div class="panel-bar">
              <img src="../../assets/img/application-view-icons.png"> 运行结果
            </div>
            <div class="panel-body"
                 style="box-shadow: 0px 1px 2px 1px #ccc;border-radius: 6px;">
              <div class="show-area"
                   style="margin:0;overflow:hidden;">
                <!-- 执行sql语句返回的消息 -->
                <ul class="back-result">
                  <li>执行语句：
                    <span>{{sqlResultGridConfig.result.executeSql}}</span>
                  </li>
                  <li>结果：
                    <span>{{sqlResultGridConfig.result.result}}</span>
                  </li>
                  <li>消耗时间：
                    <span>{{sqlResultGridConfig.result.time}}</span>
                  </li>
                </ul>
                <div style="height: calc(100% - 80px);">
                  <!-- 执行sql语句查询到的表格 -->
                  <SqlResultGrid :config="sqlResultGridConfig"
                                 v-if="sqlResultGridConfig.columns.length>0"
                                 style="overflow:auto;height:100%"></SqlResultGrid>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tableDetail"
             v-show="activeTabIndex>-1">
          <!-- 当tab页在展示各个表的时候 -->
          <Panel v-if="viewType=='table'">
            <div slot="searchBar">
              <button type="button"
                      @click="addRow">添加</button>
              <!--<button type="button" @click="copyOneRow">复制</button>-->
              <button type="button"
                      @click="deleteRow">删除</button>
              <button type="button"
                      @click="setTable">设计表</button>
              <button type="button">导出</button>
              <button type="button"
                      class="refresh"
                      @click="refresh">刷新</button>
              <button type="button"
                      @click="saveTable">保存</button>
              <button type="button"
                      class="cancel"
                      @click="refresh">取消</button>
            </div>
            <div>
              <WaitMask :isShow="showOutMask"></WaitMask>
              <DataBaseGrid :config="currentConfigs"
                            ref="dataBaseGrid"
                            @getTip="getTip"
                            @refresh="refresh"
                            @paging="paging"
                            @changePageSize="changePageSize"
                            @sortTable="sortTable"></DataBaseGrid>
            </div>
          </Panel>
          <!-- 当tab页在设计新表时 -->
          <Panel v-if="viewType=='setTable'">
            <div slot="searchBar">
              <button @click="addColumn">添加</button>
              <button @click="deleteColumn">删除</button>
              <!--<button>修改</button>-->
              <!--<button>上移</button>-->
              <!--<button>下移</button>-->
              <button @click="refreshSetTable">刷新</button>
              <button @click="saveSetTable">保存</button>
              <button @click="refreshSetTable">取消</button>
            </div>
            <div>
              <DataBaseSetGrid :typeConfig="typeConfig"
                               :config="currentConfigs"
                               ref="dataBaseSetGrid"
                               @getTip="getTip"></DataBaseSetGrid>
            </div>
          </Panel>
        </div>
      </template>

      <!-- 当tab页在新增表 -->
      <div class="tableDetail"
           v-if="showNewTableTabActive">
        <Panel>
          <div slot="searchBar">
            <button @click="newTableAddColumn">添加</button>
            <button @click="newTableDeleteColumn">删除</button>
            <!--<button>修改</button>-->
            <!--<button>上移</button>-->
            <!--<button>下移</button>-->
            <!--<button >刷新</button>-->
            <button @click="newTableSaveSetTable">保存</button>
            <!--<button >取消</button>-->
          </div>
          <div>
            <WaitMask :isShow="showOutMask"></WaitMask>
            <DataBaseSetGrid :typeConfig="typeConfig"
                             :config="newTableConfigs"
                             ref="newGrid"
                             @getTip="getTip"></DataBaseSetGrid>
          </div>
        </Panel>
      </div>
    </div>
  </div>
</template>

<script>
import Grid from '../../components/common/grid';
import Window from '../../components/common/Window.vue';
import WaitMask from '../../components/common/WaitMask.vue';
import IInput from '../../components/common/IInputbox';
import Panel from '../../components/Panel.vue';
import DataBaseTree from '../../components/DataBaseTree.vue';
import DataBaseGrid from '../../components/DataBaseGrid.vue';
import DataBaseSetGrid from '../../components/DataBaseSetGrid.vue';
import SqlResultGrid from '../../components/SqlResultGrid.vue';
import Pagination from '../../components/common/Pagination';
import myTooltip from '../../components/common/OperationStatusTooltip';
import myDialog from '../../components/common/Dialog.vue';
import MouseRightMenu from '../../components/MouseRightMenu';
import IButton from '../../components/common/IButton';

export default {
  mounted () {
    // console.log(this.allGridConfigs);
    if (this.$route.query.sourceId) {
      this.sourceWindowConfig.show = false;
      // this.showDialog = true;
      // this.dialogMessage = '请先选择数据源';
      // this.operationType = 'chooseSourceId';
    } else {
      this.sourceWindowConfig.show = true;
    }

    $('#code').setTextareaCount({
      width: '30px',
      bgColor: '#eff1f5',
      color: '#666',
      display: 'inline-block'
    });

    this.wrapWidth = $('.dataBaseView>.right').outerWidth() - 20;
    const _this = this;
    $(window).on('resize', function () {
      _this.wrapWidth = $('.dataBaseView>.right').outerWidth() - 20;

      var tabBoxWidth = $('.tab-box').outerWidth();
      var rightTabWidth = $('.right-tab').outerWidth()
        ? $('.right-tab').outerWidth() + 4
        : 0;
      var w =
        $('.left-tab').outerWidth() +
        $('.center-tab').outerWidth() +
        4 +
        rightTabWidth;
      if (w > tabBoxWidth) {
        $('.iconBox,.iconBox2').show();
      } else {
        $('.iconBox,.iconBox2').hide();
      }
    });

    var tabBoxWidth = $('.tab-box').outerWidth();
    $('.iconBox').on('click', function () {
      var scrollLeft = $('.tab-box').scrollLeft();
      var left = scrollLeft > tabBoxWidth ? scrollLeft - tabBoxWidth : 0;
      $('.tab-box').animate({ scrollLeft: left }, 500);
    });
    $('.iconBox2').on('click', function () {
      var scrollLeft = $('.tab-box').scrollLeft();
      var left = scrollLeft + tabBoxWidth;
      $('.tab-box').animate({ scrollLeft: left }, 1000);
    });
  },
  updated () {
    this.$nextTick(() => {
      var tabBoxWidth = $('.tab-box').outerWidth();
      var rightTabWidth = $('.right-tab').outerWidth()
        ? $('.right-tab').outerWidth() + 4
        : 0;
      var w =
        $('.left-tab').outerWidth() +
        $('.center-tab').outerWidth() +
        4 +
        rightTabWidth;
      if (w > tabBoxWidth) {
        $('.iconBox,.iconBox2').show();
      } else {
        $('.iconBox,.iconBox2').hide();
      }
    });
  },
  computed: {
    sourceId () {
      return this.$route.query.sourceId;
    },
    currentConfigs () {
      return this.allGridConfigs[this.activeTabIndex].gridConfigs;
    },
    viewType () {
      return this.activeTabIndex == -1
        ? 'home'
        : this.allGridConfigs[this.activeTabIndex].gridConfigs.type;
    },
    currentTableName () {
      return this.allGridConfigs[this.activeTabIndex].gridConfigs.tableName;
    },
    dynamicWidth () {
      return this.wrapWidth - 340;
    }
  },
  created () {
    this.getTreeConfig();
    if (this.$route.query.sourceId) {
      this.$http
        .get('./api/dbSource/getTypeList?id=' + this.$route.query.sourceId)
        .then(
          res => {
            res = res.body;
            if (res.status == 'success') {
              this.typeConfig.options = res.content.map((item, index) => {
                return {
                  value: item,
                  label: item
                };
              });
            }
          },
          err => {
            this.getTip(err.body.resultBean.message, 'failed');
          }
        );
    }
  },
  data () {
    const _this = this;
    var _dataType = this.$route.query.dataType
      ? this.$route.query.dataType + '_db'
      : 'relational_db';
    return {
      sqlText: '',
      sourceGridConfig: {
        hasCheckbox: false,
        searchFields: {
          dataType: _dataType,
          sourceType: '',
          name: ''
        },
        fields: [
          {
            title: '数据源名称',
            field: 'name',
            style: {
              width: '26%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '存储类型',
            field: 'dataType',
            style: {
              width: '14%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '数据源类型',
            field: 'sourceType',
            isSortField: true,
            sortType: 'desc',
            style: {
              width: '18%',
              float: 'left',
              textAlign: 'center'
            }
          },
          {
            title: '创建日期',
            field: 'createDate',
            isSortField: true,
            style: {
              float: 'left',
              width: '22%',
              textAlign: 'center'
            }
          },
          {
            title: '创建人',
            field: 'creator',
            style: {
              width: '14%',
              textAlign: 'center'
            }
          }
        ],
        currPageNum: 1,
        totalPageNum: 1,
        pageSize: 10,
        api: './api/dataSource/getPage',
        searchedCallback: function (rows) {
          for (var i in rows) {
            var row = rows[i];
            switch (row.dataType) {
              case 'relational_db':
                row.dataType = '关系型数据库';
                break;
              case 'file_sys':
                row.dataType = '文件系统';
                break;
              case 'nosql_db':
                row.dataType = 'NoSQL数据库';
                break;
              case 'spatial_db':
                row.dataType = '空间数据库';
                break;
            }
          }
        }
      },
      showOutMask: false,
      showTreeMask: true,
      typeConfig: {
        width: '',
        height: '30px',
        options: []
      },
      showNewTableTabActive: false,
      showNewTableTab: false,
      showNewTable: false,
      newTableConfigs: {},
      sqlTextWindowConfig: {
        type: 'add',
        width: '500px',
        height: '150px',
        title: '请输入sql语句的名称',
        show: false,
        parent: this,
        readonly: false,
        form: {
          sourceId: '',
          name: '新建sql语句',
          sqlText: ''
        },
        method: {
          close () {
            this.sqlTextWindowConfig.show = false;
          },
          cancel () {
            this.sqlTextWindowConfig.show = false;
          },
          confirm () {
            var _this = this;
            _this.sqlTextWindowConfig.form.sourceId = _this.sourceId;
            _this.sqlTextWindowConfig.form.sqlText = _this.sqlText;
            if (!_this.sqlTextWindowConfig.form.name) {
              this.getTip('表名不能为空', 'failed');
            } else {
              var params = Object.assign({}, _this.sqlTextWindowConfig.form);
              console.log(params);
              this.showOutMask = true;
              this.$http.post('./api/dataSourceSqlInfo/save', params).then(
                res => {
                  this.showOutMask = false;
                  res = res.body;
                  if (res.status == 'success') {
                    _this.sqlTextWindowConfig.show = false;
                    _this.getTip2('sql语句保存成功', 'success');
                  }
                },
                err => {
                  this.showOutMask = false;
                  this.getTip(err.body.resultBean.message, 'failed');
                }
              );
            }
          }
        }
      },
      newTableWindowConfig: {
        type: 'modify',
        width: '500px',
        height: '150px',
        title: '请输入新增表的名称',
        show: false,
        parent: this,
        readonly: false,
        form: {
          tableName: ''
        },
        method: {
          close () {
            this.newTableWindowConfig.show = false;
          },
          cancel () {
            this.newTableWindowConfig.show = false;
          },
          confirm () {
            var _this = this;
            if (!_this.newTableWindowConfig.form.tableName) {
              this.getTip('表名不能为空', 'failed');
            } else {
              var params = Object.assign({}, _this.newTableWindowConfig.form);
              params.id = _this.sourceId;
              var _rows = JSON.parse(
                JSON.stringify(_this.newTableConfigs.rows)
              );
              _rows.forEach(item => {
                delete item.isChecked
                item.notNull = _this.toParamStr(item.notNull);
                item.primaryKey = _this.toParamStr(item.primaryKey);
              });
              params.columns = _rows;
              this.showOutMask = true;
              this.$http.post('./api/dbSource/saveTable', params).then(
                res => {
                  this.showOutMask = false;
                  res = res.body;
                  if (res.status == 'success') {
                    _this.newTableWindowConfig.show = false;
                    _this.getTip2('新增表成功', 'success');
                    _this.changeTable(
                      _this.newTableWindowConfig.form.tableName
                    );
                    _this.newTableWindowConfig.form.tableName = '';
                    _this.showNewTable = false;
                    _this.showNewTableTab = false;
                    _this.showNewTableTabActive = false;
                    _this.getTreeConfig();
                  }
                },
                err => {
                  this.showOutMask = false;
                  this.getTip(err.body.resultBean.message, 'failed');
                }
              );
            }
          }
        }
      },
      sourceWindowConfig: {
        type: 'view',
        width: '820px',
        height: '600px',
        title: '请选择数据源',
        show: false,
        parent: this,
        readonly: false,
        method: {
          close () {
            this.sourceWindowConfig.show = false;
          },
          cancel () {
            this.sourceWindowConfig.show = false;
          }
        }
      },
      renameWindowConfig: {
        type: 'modify',
        width: '500px',
        height: '150px',
        title: '请输入新表名',
        show: false,
        parent: this,
        readonly: false,
        form: {
          oldTableName: '',
          tableName: ''
        },
        method: {
          close () {
            this.renameWindowConfig.show = false;
          },
          cancel () {
            this.renameWindowConfig.show = false;
          },
          confirm () {
            if (!this.renameWindowConfig.form) {
              this.getTip('表名不能为空', 'failed');
            } else {
              let params = Object.assign({}, this.renameWindowConfig.form);
              params.id = this.sourceId;
              this.showOutMask = true;
              this.$http.post('./api/dbSource/renameTable', params).then(
                res => {
                  this.showOutMask = false;
                  res = res.body;
                  if (res.status == 'success') {
                    this.allGridConfigs.forEach(item => {
                      if (
                        item.gridConfigs.tableName ==
                        this.renameWindowConfig.form.oldTableName
                      ) {
                        item.gridConfigs.tableName = this.renameWindowConfig.form.tableName;
                      }
                    });
                    this.getTreeConfig(); //改名后，重新渲染左侧树的接口
                    this.renameWindowConfig.show = false;
                    this.getTip2('修改成功', 'success');
                  }
                },
                err => {
                  this.showOutMask = false;
                  this.getTip(err.body.resultBean.message, 'failed');
                }
              );
            }
          }
        }
      },
      firstTabRightMenuConfig: [
        {
          icon: '',
          title: '关闭其他选项卡',
          callback: function () {
            _this.activeTabIndex = -1;
            this.allGridConfigs = [];
          }
        }
      ],
      rightMenuConfig: [
        {
          icon: '',
          title: '关闭选项卡',
          callback: function () {
            if (_this.mouseRightIndex == _this.activeTabIndex) {
              if (_this.mouseRightIndex + 1 in _this.allGridConfigs) {
                _this.activeTabIndex = _this.mouseRightIndex;
              } else {
                _this.activeTabIndex = _this.mouseRightIndex - 1;
              }
            } else if (_this.mouseRightIndex > _this.activeTabIndex) {
            } else if (_this.mouseRightIndex < _this.activeTabIndex) {
              _this.activeTabIndex--;
            }
            _this.allGridConfigs.splice(_this.mouseRightIndex, 1);
            if (_this.allGridConfigs.length == 0) {
              _this.activeTabIndex = -1;
            }
          }
        },
        {
          icon: '',
          title: '关闭其他选项卡',
          callback: function () {
            _this.activeTabIndex = 0;
            const currentArr = _this.allGridConfigs.slice(
              _this.mouseRightIndex,
              _this.mouseRightIndex + 1
            );
            _this.allGridConfigs = [].concat(currentArr);
          }
        },
        {
          icon: '',
          title: '关闭左侧选项卡',
          callback: function () {
            if (_this.mouseRightIndex == 0) {
              return;
            } else {
              const distance = _this.mouseRightIndex;
              _this.activeTabIndex -= distance;
              _this.allGridConfigs = _this.allGridConfigs.slice(
                _this.mouseRightIndex
              );
            }
          }
        },
        {
          icon: '',
          title: '关闭右侧选项卡',
          callback: function () {
            if (_this.allGridConfigs.length == _this.mouseRightIndex + 1) {
              return;
            } else {
              if (_this.activeTabIndex > _this.mouseRightIndex) {
                _this.activeTabIndex = _this.mouseRightIndex;
              }
              _this.allGridConfigs = _this.allGridConfigs.slice(
                0,
                _this.mouseRightIndex + 1
              );
            }
          }
        },
        {
          icon: '',
          title: '关闭所有选项卡',
          callback: function () {
            _this.activeTabIndex = -1;
            _this.allGridConfigs = [];
          }
        }
      ],
      wrapWidth: 0,
      showMask: false,
      showTooltip: false,
      tooltipType: '',
      showDialog: false,
      dialogMessage: '',
      tooltipMessage: '',
      treeConfig: [],
      activeTabIndex: -1,
      mouseRightIndex: '',
      mouseRightTableName: '',
      // currentTableName: '',
      allGridConfigs: [
        // {
        //   gridConfigs: {
        //     type: 'table',    右侧内容为展示数据库表详情的展示类型
        //     tableName: '',
        //     operationType: "",
        //     operationItem: {},
        //     getSelectedNames: [],
        //     getSelectedIndex: [],
        //     currPageNum: 1,
        //     totalPageNum: 1,
        //     pageSize: 10,
        //     showMask: false,
        //     rows: [],
        //     columns: [],
        //     longTdNum: 0
        //   }
        // },
        // {
        //   gridConfigs:{
        //     type:'setTable', 右侧内容为设计表的展示类型
        //     tableName:'',
        //     operationType:'',
        //     operationItem:{},
        //     getSelectedIndex:[],
        //     showMask:false,
        //     rows:[],
        //     columns:[],
        //   }
        // }
      ],
      sqlResultGridConfig: {
        result: {},
        tableName: '',
        showMask: false,
        rows: [],
        columns: []
      }
    };
  },
  methods: {
    chooseSource (row) {
      let id = row.id;
      var path = this.$route.path;
      var _dataType = this.$route.query.dataType
        ? this.$route.query.dataType
        : '';
      this.$router.push(path + '?sourceId=' + id + '&dataType=' + _dataType);
    },
    closeNewTab () {
      this.showNewTable = false;
      this.showNewTableTab = false;
      this.showNewTableTabActive = false;
      //以下代码为解决关掉删除表的tab后，对sql输入域的界面有影响的bug
      this.$nextTick(() => {
        $('#code').setTextareaCount({
          width: '30px',
          bgColor: '#eff1f5',
          color: '#666',
          display: 'inline-block'
        });
      });
    },
    dialogCancel () {
      this.showDialog = false;
      if ((this.operationType = 'chooseSourceId')) {
        // 如果地址栏没有携带参数sourceId，就跳转到我的数据源页面
        // this.$router.push('/MyDataSource');
      }
    },
    // 点击选项卡的“x”关闭单个
    deleteTab (index) {
      if (index == this.activeTabIndex) {
        if (index + 1 in this.allGridConfigs) {
          this.activeTabIndex = index;
        } else {
          this.activeTabIndex = index - 1;
        }
      } else if (index > this.activeTabIndex) {
      } else if (index < this.activeTabIndex) {
        this.activeTabIndex--;
      }
      this.allGridConfigs.splice(index, 1);
      if (this.allGridConfigs.length == 0) {
        this.activeTabIndex = -1;
      }
    },
    addTable () {
      this.showNewTableTabActive = true;
      this.showNewTableTab = true;
      this.showNewTable = true;
      this.newTableConfigs = {
        type: 'newTable',
        tableName: '新增表',
        operationType: '',
        operationItem: {},
        getSelectedIndex: [],
        showMask: false,
        rows: [
          {
            autoIncrement: null,
            length: null,
            name: null,
            notNull: false,
            oldName: null,
            preColumnName: null,
            primaryKey: false,
            remark: null,
            type: null
          }
        ],
        columns: [
          {
            title: '字段名',
            name: 'name',
            // width: this.dynamicWidth * 1 / 4 + 'px',
            width: '16%'
          },
          {
            title: '类型',
            name: 'type',
            // width: this.dynamicWidth * 1 / 4 + 'px',
            width: '16%'
          },
          {
            title: '长度',
            name: 'length',
            // width: this.dynamicWidth * 1 / 10 + 'px',
            width: '10%'
          },
          {
            title: '精度',
            name: 'subLength',
            // width: this.dynamicWidth * 1 / 10 + 'px',
            width: '10%'
          },
          {
            title: '注释',
            name: 'remark',
            // width: this.dynamicWidth * 3 / 10 + 'px',
            width: '20%'
          },
          {
            title: '禁止空值',
            name: 'notNull',
            // width: '100px'
            width: '80px'
          },
          {
            title: '主键设置',
            name: 'primaryKey',
            width: '80px'
          }
        ]
      };
    },
    getTreeConfig () {
      //渲染左侧的表菜单的接口
      if (this.sourceId) {
        this.showTreeMask = true;
        this.$http.get('./api/dbSource/findAllTable?id=' + this.sourceId).then(
          res => {
            this.showTreeMask = false;
            res = res.body;
            if (res.status == 'success') {
              this.treeConfig = res.content;
            }
          },
          err => {
            this.showTreeMask = false;
            this.getTip(err.body.resultBean.message, 'failed');
          }
        );
      } else {
        this.showTreeMask = false;
      }
    },
    getMouseRightIndex (index) {
      this.mouseRightIndex = index;
    },
    toggleTab (tab, index) {
      this.activeTabIndex = index;
      // this.currentTableName = tab.gridConfigs.tableName;
      this.$nextTick(() => {
        var idx = this.allGridConfigs[this.activeTabIndex].gridConfigs
          .highLightIndex;
        if (this.currentConfigs.type == 'table') {
          $('.dataBaseGrid .table-row .tdBox').removeClass('focus');
          if (idx !== undefined) {
            $('.dataBaseGrid .table-row')
              .eq(idx)
              .find('.tdBox')
              .addClass('focus');
          }
        } else if (this.currentConfigs.type == 'setTable') {
          $('.dataBaseSetGrid .table-row .tdBox').removeClass('focus');
          if (idx !== undefined) {
            $('.dataBaseSetGrid .table-row')
              .eq(idx)
              .find('.tdBox')
              .addClass('focus');
          }
        }
      });
    },
    dialogConfirm () {
      this.showDialog = false;
      if (this.operationType == 'deleteRow') {
        var selectedRows = this.$refs.dataBaseGrid.getSelectedItems();
        var params = {};
        params.id = this.sourceId;
        params.tableName = this.currentTableName;
        params.columnInformations = selectedRows;
        params.columnInformations.forEach(item => {
          delete item.isChanged;
        });
        this.showOutMask = true;
        this.$http.post('./api/dbSource/deleteTableData', params).then(
          res => {
            this.showOutMask = false;
            res = res.body;
            if (res.status == 'success') {
              this.getTip2('删除成功', 'success');
              this.refresh();
            }
          },
          err => {
            this.showOutMask = false;
            this.getTip(err.body.resultBean.message, 'failed');
          }
        );
      } else if (this.operationType == 'deleteColumn') {
        var selectedRows = this.$refs.dataBaseSetGrid.getSelectedItems();
        var columnNames = selectedRows.map(item => {
          return item.name;
        });
        this.showOutMask = true;
        this.$http
          .post('./api/dbSource/deleteTableLine', {
            id: this.sourceId,
            tableName: this.currentTableName,
            columnNames: columnNames
          })
          .then(
            res => {
              this.showOutMask = false;
              res = res.body;
              if (res.status == 'success') {
                this.getTip2('删除成功', 'success');
                this.refreshSetTable();
              } else {
                this.getTip(res.message, 'failed');
              }
            },
            err => {
              this.showOutMask = false;
              this.getTip(err.body.resultBean.message, 'failed');
            }
          );
      } else if (this.operationType == 'deleteTable') {
        this.showOutMask = true;
        this.$http
          .post('./api/dbSource/deleteTable', {
            id: this.sourceId,
            tableName: this.mouseRightTableName
          })
          .then(
            res => {
              this.showOutMask = false;
              res = res.body;
              if (res.status == 'success') {
                this.getTreeConfig();
                this.allGridConfigs.forEach((item, index) => {
                  if (item.gridConfigs.tableName == this.mouseRightTableName) {
                    item.gridConfigs.isDeleted = 'isDeleted';
                    if (this.activeTabIndex == index) {
                      this.activeTabIndex = -1;
                    }
                  }
                });
                this.getTip2('删除成功', 'success');
              }
            },
            err => {
              this.showOutMask = false;
              this.getTip(err.body.resultBean.message, 'failed');
            }
          );
      } else if (this.operationType == 'tip') {
        this.showDialog = false;
      } else if ((this.operationType = 'chooseSourceId')) {
        // 如果地址栏没有携带参数sourceId，就跳转到我的数据源页面
        this.$router.push('/MyDataSource');
      }
    },
    // 点击复制按钮，复制一行数据到最顶端显示，并赋予其focus状态
    copyOneRow () {
      var currentGrid = this.allGridConfigs[this.activeTabIndex].gridConfigs;
      if (
        this.allGridConfigs[this.activeTabIndex].gridConfigs.selectedIndex
          .length > 0
      ) {
        var willBeCopyRow = Object.assign(
          {},
          currentGrid.rows[currentGrid.selectedIndex[0]]
        );
        willBeCopyRow.isChecked = false;
        this.allGridConfigs[this.activeTabIndex].gridConfigs.rows.unshift(
          willBeCopyRow
        );
        this.$refs.dataBaseGrid.afterCopy();
      } else {
        this.getTip2('请先选择一行数据！', 'failed');
      }
    },
    deleteRow () {
      if (
        this.allGridConfigs[this.activeTabIndex].gridConfigs.selectedIndex
          .length > 0
      ) {
        this.operationType = 'deleteRow';
        this.showDialog = true;
        this.dialogMessage = '确认删除选中的数据吗？';
      } else {
        this.getTip2('请先选择一行数据！', 'failed');
      }
    },
    addRow () {
      this.currentConfigs.highLightIndex = this.currentConfigs.rows.length;
      var rowClone = {};
      const columns = this.currentConfigs.columns;
      columns.forEach((item, index) => {
        rowClone[item.name] = null;
      });
      rowClone.isChecked = false;
      this.currentConfigs.rows.push(rowClone);
      this.$nextTick(() => {
        $('.dataBaseGrid .table-row:last .tdBox').addClass('focus');
        $('.dataBaseGrid .table-row:last input:first').focus();
      });
    },
    addColumn () {
      this.currentConfigs.highLightIndex = this.currentConfigs.rows.length;
      this.allGridConfigs[this.activeTabIndex].gridConfigs.rows.push({
        autoIncrement: null,
        length: null,
        name: null,
        notNull: false,
        oldName: null,
        preColumnName: null,
        primaryKey: false,
        remark: null,
        type: null
      });
      this.$nextTick(() => {
        $('.dataBaseSetGrid .table-row:last .tdBox').addClass('focus');
      });
    },
    newTableAddColumn () {
      this.newTableConfigs.rows.push({
        autoIncrement: null,
        length: null,
        name: null,
        notNull: false,
        oldName: null,
        preColumnName: null,
        primaryKey: false,
        remark: null,
        type: null
      });
      this.$nextTick(() => {
        // $('.dataBaseSetGrid .table-row:last .textInput:first').focus().siblings('.mask').addClass('hide');
      });
    },
    //新增表的删除一行的方法
    newTableDeleteColumn () {
      if (this.newTableConfigs.selectedIndex.length > 0) {
        // this.operationType = 'deleteNewTableColumn';
        // this.showDialog = true;
        // this.dialogMessage = '确认删除选中的数据吗？'
        for (var i = this.newTableConfigs.rows.length; i >= 0; i--) {
          if (this.newTableConfigs.selectedIndex.indexOf(i) > -1) {
            this.newTableConfigs.rows.splice(i, 1);
          }
        }
        this.newTableConfigs.selectedIndex = [];
      } else {
        this.getTip2('请先选择一行数据！', 'failed');
      }
    },
    deleteColumn () {
      if (
        this.allGridConfigs[this.activeTabIndex].gridConfigs.selectedIndex
          .length > 0
      ) {
        this.operationType = 'deleteColumn';
        this.showDialog = true;
        this.dialogMessage = '确认删除选中的数据吗？';
      } else {
        this.getTip2('请先选择一行数据！', 'failed');
      }
    },
    //新增表的保存逻辑
    newTableSaveSetTable () {
      var rows = this.newTableConfigs.rows;
      var num = 0;
      rows.forEach((item, index) => {
        if (!item.name || !item.type) {
          num++;
          this.getTip('字段名和类型不能为空', 'failed');
        }
      });
      if (num == 0) {
        this.newTableWindowConfig.show = true;
      }
    },
    saveTable () {
      //保存数据表新增的行

      var rows = this.allGridConfigs[this.activeTabIndex].gridConfigs.rows;
      var newRows = [];
      rows.forEach(item => {
        if (!item.oldData) {
          newRows.push(item);
        }
      });
      newRows.forEach(item => {
        delete item.isChecked;
      });
      this.showOutMask = true;
      var p = new Promise((resolve, reject) => {
        if (newRows.length > 0) {
          this.$http
            .post('./api/dbSource/createTableData', {
              id: this.sourceId,
              tableName: this.currentTableName,
              columnInformations: newRows
            })
            .then(
              res => {
                res = res.body;
                if (res.status == 'success') {
                  $('.dataBaseGrid .table-row:last .tdBox').removeClass(
                    'focus'
                  );
                  resolve('添加成功');
                } else {
                  resolve(res.message);
                }
              },
              err => {
                resolve(err.body.resultBean.message);
              }
            );
        } else {
          resolve('');
        }
      });
      p.then(data => {
        var dataSourceUpdataParams = [];
        this.currentConfigs.rows.forEach((row, i) => {
          if (row.oldData && row.isChanged.length > 0) {
            var newData = Object.assign({}, row);
            var oldData = Object.assign({}, row.oldData);
            delete newData.oldData;
            delete newData.isChecked;
            delete newData.isChanged;
            dataSourceUpdataParams.push({
              oldData: oldData,
              newData: newData
            });
          }
        });
        if (dataSourceUpdataParams.length > 0) {
          this.$http
            .post('./api/dbSource/updataTableData', {
              id: this.sourceId,
              tableName: this.currentConfigs.tableName,
              dataSourceUpdataParams: dataSourceUpdataParams
            })
            .then(
              res => {
                this.showOutMask = false;
                res = res.body;
                if (res.status == 'success') {
                  if (data == '') {
                    data += '修改成功';
                  } else {
                    data += '<br><br>' + '修改成功';
                  }
                } else {
                  if (data == '') {
                    data += res.message;
                  } else {
                    data += '<br><br>' + res.message;
                  }
                }
                this.getTip(data);
                this.refresh();
              },
              err => {
                this.showOutMask = false;
                data += '<br><br>' + err.body.resultBean.message;
                this.getTip(data);
                this.refresh();
              }
            );
        } else {
          this.showOutMask = false;
          if (data == '') {
            this.getTip('方案无修改');
          } else {
            this.getTip(data);
            this.refresh();
          }
        }
      });
    },
    saveSetTable () {
      //保存设计表新增的行
      var rows = this.allGridConfigs[this.activeTabIndex].gridConfigs.rows;
      var newRows = [];
      rows.forEach((item, index) => {
        if (!item.oldData) {
          item.preColumnName = rows[index - 1].name;
          newRows.push(item);
        }
      });
      var keys = [];
      this.allGridConfigs[this.activeTabIndex].gridConfigs.rows.forEach(
        (item, index) => {
          if (item.primaryKey) {
            keys.push(item.name);
          }
        }
      );
      var num = 0;
      newRows.forEach(item => {
        item.notNull = this.toParamStr(item.notNull);
        item.primaryKey = this.toParamStr(item.primaryKey);
        if (!item.name || !item.type) {
          num++;
          this.getTip('字段名和类型不能为空', 'failed');
        }
      });
      if (num == 0) {
        this.showOutMask = true;
        if (newRows.length > 0) {
          var p = new Promise((resolve, reject) => {
            this.$http
              .post('./api/dbSource/createTableLine', {
                id: this.sourceId,
                tableName: this.currentTableName,
                columns: newRows,
                primaryKeys: keys
              })
              .then(
                res => {
                  res = res.body;
                  if (res.status == 'success') {
                    $('.dataBaseSetGrid .table-row:last .tdBox').removeClass(
                      'focus'
                    );
                    resolve('添加成功');
                  } else {
                    resolve(res.message);
                  }
                },
                err => {
                  resolve(err.body.resultBean.message);
                }
              );
          });
          p.then(data => {
            var columns = [];
            this.currentConfigs.rows.forEach((row, i) => {
              if (row.oldData && row.isChanged.length > 0) {
                var newData = Object.assign({}, row);
                delete newData.oldData;
                delete newData.isChecked;
                delete newData.isChanged;
                newData.preColumnName = rows[i - 1].name;
                newData.notNull = this.toParamStr(newData.notNull);
                newData.primaryKey = this.toParamStr(newData.primaryKey);
                newData.oldName = row.oldData.name;
                columns.push(newData);
              }
            });
            var keys = [];
            this.currentConfigs.rows.forEach((item, index) => {
              if (item.primaryKey) {
                keys.push(item.name);
              }
            });
            if (columns.length > 0) {
              this.$http
                .post('./api/dbSource/updataTableLine', {
                  id: this.sourceId,
                  tableName: this.currentTableName,
                  columns: columns,
                  primaryKeys: keys
                })
                .then(
                  res => {
                    this.showOutMask = false;
                    res = res.body;
                    if (res.status == 'success') {
                      data += '<br><br>' + '修改成功';
                    } else {
                      data += '<br><br>' + res.message;
                    }
                    this.getTip(data);
                    this.refreshSetTable();
                  },
                  err => {
                    this.showOutMask = false;
                    data += '<br><br>' + err.body.resultBean.message;
                    this.getTip(data);
                    this.refreshSetTable();
                  }
                );
            } else {
              this.showOutMask = false;
              this.getTip(data);
              this.refreshSetTable();
            }
          });
        } else {
          // 如果没有增加，就直接走修改的请求
          var columns = [];
          this.currentConfigs.rows.forEach((row, i) => {
            if (row.oldData && row.isChanged.length > 0) {
              var newData = Object.assign({}, row);
              newData.preColumnName = i > 0 ? rows[i - 1].name : '';
              delete newData.oldData;
              delete newData.isChecked;
              delete newData.isChanged;
              newData.notNull = this.toParamStr(newData.notNull);
              newData.primaryKey = this.toParamStr(newData.primaryKey);
              newData.oldName = row.oldData.name;
              columns.push(newData);
            }
          });
          var keys = [];
          this.currentConfigs.rows.forEach((item, index) => {
            if (item.primaryKey) {
              keys.push(item.name);
            }
          });
          if (columns.length > 0) {
            this.$http
              .post('./api/dbSource/updataTableLine', {
                id: this.sourceId,
                tableName: this.currentTableName,
                columns: columns,
                primaryKeys: keys
              })
              .then(
                res => {
                  this.showOutMask = false;
                  res = res.body;
                  if (res.status == 'success') {
                    this.getTip2('修改成功', 'success');
                    this.refreshSetTable();
                  } else {
                    this.getTip(res.message);
                    this.refreshSetTable();
                  }
                },
                err => {
                  this.showOutMask = false;
                  this.getTip(err.body.resultBean.message);
                  this.refreshSetTable();
                }
              );
          } else {
            this.showOutMask = false;
            this.getTip('方案无修改');
          }
        }
      }
    },
    //刷新设计表页面
    refreshSetTable () {
      this.$refs.dataBaseSetGrid.isCheckedAll = false;
      var currentGrid = this.allGridConfigs[this.activeTabIndex].gridConfigs;
      this.currentConfigs.showMask = true;
      const _this = this;
      this.$http
        .post('./api/dbSource/slelectTable', {
          id: this.sourceId,
          tableName: this.currentTableName
        })
        .then(
          res => {
            res = res.body;
            if (res.status == 'success') {
              currentGrid.selectedIndex = [];

              currentGrid.rows = res.content;
              currentGrid.rows.forEach((item, index) => {
                item.notNull = this.toBool(item.notNull);
                item.primaryKey = this.toBool(item.primaryKey);
                var obj = Object.assign({}, item);
                item.oldData = obj;
                item.isChanged = [];
              });
            } else {
              this.getTip(res.message, 'failed');
            }
            this.currentConfigs.showMask = false;
          },
          err => {
            this.currentConfigs.showMask = false;
            this.getTip(err.body.resultBean.message, 'failed');
          }
        );
    },
    // 分页的回调方法
    paging (num) {
      var currentGrid = this.allGridConfigs[this.activeTabIndex].gridConfigs;
      currentGrid.currPageNum = parseInt(num);
      this.refresh();
    },
    //切换每页条数后的回调方法
    changePageSize (size) {
      var currentGrid = this.allGridConfigs[this.activeTabIndex].gridConfigs;
      currentGrid.currPageNum = 1;
      currentGrid.pageSize = parseInt(size);
      this.refresh();
    },
    //刷新该页面
    refresh () {
      var sortArr = [];
      this.currentConfigs.columns.forEach((item, index) => {
        if (item.sortType) {
          sortArr.push({
            field: item.name,
            sortType: item.sortType
          });
        }
      });
      this.$refs.dataBaseGrid.isCheckedAll = false;
      var currentGrid = this.allGridConfigs[this.activeTabIndex].gridConfigs;
      this.currentConfigs.showMask = true;
      this.$http
        .post('./api/dbSource/findAllData', {
          id: this.sourceId,
          param: {
            pageNumber: currentGrid.currPageNum,
            tableName: currentGrid.tableName,
            pageSize: currentGrid.pageSize,
            orderFields: sortArr
          }
        })
        .then(
          res => {
            res = res.body;
            if (res.status == 'success') {
              currentGrid.selectedIndex = [];

              currentGrid.rows = res.content.rows;
              currentGrid.rows.forEach((item, index) => {
                for (var key in item) {
                  if (typeof item[key] == 'string') {
                    item[key] = item[key].trim();
                  }
                }
                var obj = Object.assign({}, item);
                item.oldData = obj;
                item.isChanged = [];
              });
              currentGrid.totalPageNum = res.content.totalPageNum;

              currentGrid.columns = res.content.columns;
              currentGrid.columns.forEach((v, i) => {
                if (
                  v.type.toLowerCase().indexOf('time') > -1 ||
                  v.type.toLowerCase().indexOf('date') > -1 ||
                  v.type.toLowerCase().indexOf('id') > -1
                ) {
                  v.width = '200px';
                  currentGrid.longTdNum = currentGrid.longTdNum + 1;
                } else {
                  v.width = '120px';
                }
                v.sortType = '';
                sortArr.forEach((item, index) => {
                  if (v.name == item.field) {
                    v.sortType = item.sortType;
                  }
                });
              });
            } else {
              this.getTip(res.message, 'failed');
            }
            this.currentConfigs.showMask = false;
          },
          err => {
            this.currentConfigs.showMask = false;
            this.getTip(err.body.resultBean.message, 'failed');
          }
        );
    },
    //获取左侧的树菜单右键所点击的那个菜单名
    getMouseRightTableName (mouseRightTableName) {
      this.mouseRightTableName = mouseRightTableName;
    },
    //左侧的菜单栏，右键菜单点击‘删除’
    deleteTable (mouseRightTableName) {
      this.operationType = 'deleteTable';
      this.dialogMessage = `确认删除${mouseRightTableName}这个表吗？`;
      this.showDialog = true;
    },
    //左侧的菜单栏，右键菜单点击‘重命名’
    tableRename (mouseRightTableName) {
      this.renameWindowConfig.form.oldTableName = mouseRightTableName;
      this.renameWindowConfig.show = true;
    },
    //左侧的菜单栏，右键菜单点击‘设计表’
    setTableByRightMouse (mouseRightTableName) {
      this.showNewTableTabActive = false;
      this.mouseRightTableName = mouseRightTableName;
      var num = 0;
      this.allGridConfigs.forEach((gridItem, index) => {
        if (
          gridItem.gridConfigs.tableName == this.mouseRightTableName &&
          gridItem.gridConfigs.type == 'setTable'
        ) {
          num++;
          this.activeTabIndex = index;
        }
      });
      if (num == 0) {
        this.allGridConfigs.push({
          gridConfigs: {
            type: 'setTable',
            tableName: this.mouseRightTableName,
            operationType: '',
            operationItem: {},
            getSelectedIndex: [],
            showMask: false,
            rows: [],
            columns: [
              {
                title: '字段名',
                name: 'name',
                // width: this.dynamicWidth * 1 / 4 + 'px',
                width: '16%'
              },
              {
                title: '类型',
                name: 'type',
                // width: this.dynamicWidth * 1 / 4 + 'px',
                width: '16%'
              },
              {
                title: '长度',
                name: 'length',
                // width: this.dynamicWidth * 1 / 10 + 'px',
                width: '10%'
              },
              {
                title: '精度',
                name: 'subLength',
                // width: this.dynamicWidth * 1 / 10 + 'px',
                width: '10%'
              },
              {
                title: '注释',
                name: 'remark',
                // width: this.dynamicWidth * 3 / 10 + 'px',
                width: '20%'
              },
              {
                title: '禁止空值',
                name: 'notNull',
                // width: '100px'
                width: '80px'
              },
              {
                title: '主键设置',
                name: 'primaryKey',
                // width: '100px'
                width: '80px'
              }
            ]
          }
        });
        this.$nextTick(() => {
          var tabBoxWidth = $('.tab-box').outerWidth();
          var scrollLeft = $('.tab-box').scrollLeft();
          var left = scrollLeft + tabBoxWidth;
          $('.tab-box').animate({ scrollLeft: left }, 500);
        });
        this.activeTabIndex = this.allGridConfigs.length - 1;
        var cacheIndex = this.allGridConfigs.length - 1;
        // this.allGridConfigs[this.allGridConfigs.length - 1].gridConfigs.showMask = true;
        this.allGridConfigs[cacheIndex].gridConfigs.showMask = true;
        this.$http
          .post('./api/dbSource/slelectTable', {
            id: this.sourceId,
            tableName: this.mouseRightTableName
          })
          .then(
            res => {
              this.allGridConfigs[cacheIndex].gridConfigs.showMask = false;
              res = res.body;
              this.allGridConfigs[cacheIndex].gridConfigs.rows = res.content;

              this.allGridConfigs[cacheIndex].gridConfigs.rows.forEach(
                (item, index) => {
                  item.notNull = this.toBool(item.notNull);
                  item.primaryKey = this.toBool(item.primaryKey);
                  var obj = Object.assign({}, item);
                  item.oldData = obj;
                  item.isChanged = [];
                }
              );
            },
            err => {
              this.getTip(err.body.resultBean.message, 'failed');
            }
          );
      } else {
        this.$nextTick(() => {
          var idx = this.allGridConfigs[this.activeTabIndex].gridConfigs
            .highLightIndex;
          $('.dataBaseSetGrid .table-row .tdBox').removeClass('focus');
          if (idx !== undefined) {
            $('.dataBaseSetGrid .table-row')
              .eq(idx)
              .find('.tdBox')
              .addClass('focus');
          }
        });
      }
    },
    setTable () {
      var num = 0;
      this.allGridConfigs.forEach((gridItem, index) => {
        if (
          gridItem.gridConfigs.tableName == this.currentTableName &&
          gridItem.gridConfigs.type == 'setTable'
        ) {
          num++;
          this.activeTabIndex = index;
        }
      });
      if (num == 0) {
        this.allGridConfigs.push({
          gridConfigs: {
            type: 'setTable',
            tableName: this.currentTableName,
            operationType: '',
            operationItem: {},
            getSelectedIndex: [],
            showMask: false,
            rows: [],
            columns: [
              {
                title: '字段名',
                name: 'name',
                // width: this.dynamicWidth * 1 / 4 + 'px',
                width: '16%'
              },
              {
                title: '类型',
                name: 'type',
                // width: this.dynamicWidth * 1 / 4 + 'px',
                width: '16%'
              },
              {
                title: '长度',
                name: 'length',
                // width: this.dynamicWidth * 1 / 10 + 'px',
                width: '10%'
              },
              {
                title: '精度',
                name: 'subLength',
                // width: this.dynamicWidth * 1 / 10 + 'px',
                width: '10%'
              },
              {
                title: '注释',
                name: 'remark',
                // width: this.dynamicWidth * 3 / 10 + 'px',
                width: '20%'
              },
              {
                title: '禁止空值',
                name: 'notNull',
                // width: '100px'
                width: '80px'
              },
              {
                title: '主键设置',
                name: 'primaryKey',
                // width: '100px'
                width: '80px'
              }
            ]
          }
        });
        this.$nextTick(() => {
          var tabBoxWidth = $('.tab-box').outerWidth();
          var scrollLeft = $('.tab-box').scrollLeft();
          var left = scrollLeft + tabBoxWidth;
          $('.tab-box').animate({ scrollLeft: left }, 500);
        });
        this.activeTabIndex = this.allGridConfigs.length - 1;
        var cacheIndex = this.allGridConfigs.length - 1;
        // this.allGridConfigs[this.allGridConfigs.length - 1].gridConfigs.showMask = true;
        this.allGridConfigs[cacheIndex].gridConfigs.showMask = true;
        this.$http
          .post('./api/dbSource/slelectTable', {
            id: this.sourceId,
            tableName: this.currentTableName
          })
          .then(
            res => {
              // this.allGridConfigs[cacheIndex].gridConfigs.showMask = false;
              this.allGridConfigs[cacheIndex].gridConfigs.showMask = false;
              res = res.body;
              this.allGridConfigs[cacheIndex].gridConfigs.rows = res.content;

              this.allGridConfigs[cacheIndex].gridConfigs.rows.forEach(
                (item, index) => {
                  item.notNull = this.toBool(item.notNull);
                  item.primaryKey = this.toBool(item.primaryKey);
                  var obj = Object.assign({}, item);
                  item.oldData = obj;
                  item.isChanged = [];
                }
              );
            },
            err => {
              this.getTip(err.body.resultBean.message, 'failed');
            }
          );
      } else {
        this.$nextTick(() => {
          var idx = this.allGridConfigs[this.activeTabIndex].gridConfigs
            .highLightIndex;
          $('.dataBaseSetGrid .table-row .tdBox').removeClass('focus');
          if (idx !== undefined) {
            $('.dataBaseSetGrid .table-row')
              .eq(idx)
              .find('.tdBox')
              .addClass('focus');
          }
        });
      }
    },
    changeTable (item) {
      const _this = this;
      this.showNewTableTabActive = false;
      // 如果曾经点击请求过，就不再请求，从allGridConfigs里面搜查出来
      // this.currentTableName = item;
      var num = 0;
      this.allGridConfigs.forEach((gridItem, index) => {
        if (
          gridItem.gridConfigs.tableName == item &&
          gridItem.gridConfigs.type == 'table'
        ) {
          num++;
          this.activeTabIndex = index;
        }
      });
      if (num == 0) {
        //如果没有被请求渲染过，就要请求，渲染右侧表详情的接口
        this.allGridConfigs.push({
          gridConfigs: {
            type: 'table',
            tableName: item,
            operationType: '',
            operationItem: {},
            getSelectedNames: [],
            // getSelectedIds: [],
            selectedIndex: [],
            currPageNum: 1,
            totalPageNum: 1,
            pageSize: 10,
            showMask: false,
            rows: [],
            columns: [],
            longTdNum: 0
          }
        });
        this.$nextTick(() => {
          var tabBoxWidth = $('.tab-box').outerWidth();
          var scrollLeft = $('.tab-box').scrollLeft();
          var left = scrollLeft + tabBoxWidth;
          $('.tab-box').animate({ scrollLeft: left }, 500);
        });
        this.activeTabIndex = this.allGridConfigs.length - 1;
        var cacheIndex = this.allGridConfigs.length - 1;

        // this.allGridConfigs[this.allGridConfigs.length - 1].gridConfigs.showMask = true;
        this.allGridConfigs[cacheIndex].gridConfigs.showMask = true;
        this.$http
          .post('./api/dbSource/findAllData', {
            id: this.sourceId,
            param: {
              pageNumber: this.allGridConfigs[cacheIndex].gridConfigs
                .currPageNum,
              tableName: this.allGridConfigs[cacheIndex].gridConfigs.tableName,
              pageSize: this.allGridConfigs[cacheIndex].gridConfigs.pageSize,
              orderFields: []
            }
          })
          .then(
            res => {
              // this.allGridConfigs[this.allGridConfigs.length - 1].gridConfigs.showMask = false;
              this.allGridConfigs[cacheIndex].gridConfigs.showMask = false;
              res = res.body;
              this.allGridConfigs[cacheIndex].gridConfigs.rows =
                res.content.rows;
              this.allGridConfigs[cacheIndex].gridConfigs.rows.forEach(
                (item, index) => {
                  for (var key in item) {
                    if (typeof item[key] == 'string') {
                      item[key] = item[key].trim();
                    }
                  }
                  var obj = Object.assign({}, item);
                  item.oldData = obj;
                  item.isChanged = [];
                }
              );
              this.allGridConfigs[cacheIndex].gridConfigs.totalPageNum =
                res.content.totalPageNum;

              this.allGridConfigs[cacheIndex].gridConfigs.columns =
                res.content.columns;
              this.allGridConfigs[cacheIndex].gridConfigs.columns.forEach(
                (v, i) => {
                  if (
                    v.type.toLowerCase().indexOf('time') > -1 ||
                    v.type.toLowerCase().indexOf('date') > -1 ||
                    v.type.toLowerCase().indexOf('id') > -1
                  ) {
                    v.width = '200px';
                    this.allGridConfigs[cacheIndex].gridConfigs.longTdNum =
                      this.allGridConfigs[cacheIndex].gridConfigs.longTdNum + 1;
                  } else {
                    v.width = '120px';
                  }
                  v.sortType = '';
                }
              );
            },
            err => {
              // this.allGridConfigs[this.allGridConfigs.length - 1].gridConfigs.showMask = false;
              this.allGridConfigs[cacheIndex].gridConfigs.showMask = false;
              this.getTip(err.body.resultBean.message, 'failed');
            }
          );
      } else {
        this.$nextTick(() => {
          var idx = this.allGridConfigs[this.activeTabIndex].gridConfigs
            .highLightIndex;
          $('.dataBaseGrid .table-row .tdBox').removeClass('focus');
          if (idx !== undefined) {
            $('.dataBaseGrid .table-row')
              .eq(idx)
              .find('.tdBox')
              .addClass('focus');
          }
        });
      }
    },
    // 表格字段排序功能的方法
    sortTable (columnItem, index) {
      var sortArr = [];
      this.currentConfigs.columns.forEach((item, index) => {
        if (item.sortType) {
          sortArr.push({
            field: item.name,
            sortType: item.sortType
          });
        }
      });

      if (columnItem.sortType == '') {
        sortArr.unshift({ field: columnItem.name, sortType: 'asc' });
        this.currentConfigs.showMask = true;
        var cacheIndex = this.activeTabIndex;
        this.$http
          .post('./api/dbSource/findAllData', {
            id: this.sourceId,
            param: {
              pageNumber: 1,
              tableName: this.allGridConfigs[this.activeTabIndex].gridConfigs
                .tableName,
              pageSize: this.allGridConfigs[this.activeTabIndex].gridConfigs
                .pageSize,
              orderFields: sortArr
            }
          })
          .then(
            res => {
              this.currentConfigs.showMask = false;
              res = res.body;
              this.allGridConfigs[cacheIndex].gridConfigs.rows =
                res.content.rows;
              this.allGridConfigs[cacheIndex].gridConfigs.rows.forEach(
                (item, index) => {
                  for (var key in item) {
                    if (typeof item[key] == 'string') {
                      item[key] = item[key].trim();
                    }
                  }
                  var obj = Object.assign({}, item);
                  item.oldData = obj;
                  item.isChanged = [];
                }
              );
              this.allGridConfigs[cacheIndex].gridConfigs.totalPageNum =
                res.content.totalPageNum;

              this.allGridConfigs[cacheIndex].gridConfigs.columns =
                res.content.columns;
              this.allGridConfigs[cacheIndex].gridConfigs.columns.forEach(
                (v, i) => {
                  if (
                    v.type.toLowerCase().indexOf('time') > -1 ||
                    v.type.toLowerCase().indexOf('date') > -1 ||
                    v.type.toLowerCase().indexOf('id') > -1
                  ) {
                    v.width = '200px';
                    this.allGridConfigs[cacheIndex].gridConfigs.longTdNum =
                      this.allGridConfigs[cacheIndex].gridConfigs.longTdNum + 1;
                  } else {
                    v.width = '120px';
                  }
                  v.sortType = '';
                  sortArr.forEach((item, index) => {
                    if (v.name == item.field) {
                      v.sortType = item.sortType;
                    }
                  });
                  if (v.name == columnItem.name) {
                    v.sortType = 'asc';
                  }
                }
              );
            },
            err => {
              this.currentConfigs.showMask = false;
              this.getTip(err.body.resultBean.message, 'failed');
            }
          );
      } else if (columnItem.sortType == 'asc') {
        var moveIndex = '';
        sortArr.forEach((item, index) => {
          if (item.field == columnItem.name) {
            item.sortType = 'desc';
            moveIndex = index;
          }
        });
        sortArr.unshift(...sortArr.splice(moveIndex, 1));

        this.currentConfigs.showMask = true;
        var cacheIndex = this.activeTabIndex;
        this.$http
          .post('./api/dbSource/findAllData', {
            id: this.sourceId,
            param: {
              pageNumber: 1,
              tableName: this.allGridConfigs[cacheIndex].gridConfigs.tableName,
              pageSize: this.allGridConfigs[cacheIndex].gridConfigs.pageSize,
              orderFields: sortArr
            }
          })
          .then(
            res => {
              this.currentConfigs.showMask = false;
              res = res.body;
              this.allGridConfigs[cacheIndex].gridConfigs.rows =
                res.content.rows;
              this.allGridConfigs[cacheIndex].gridConfigs.rows.forEach(
                (item, index) => {
                  for (var key in item) {
                    if (typeof item[key] == 'string') {
                      item[key] = item[key].trim();
                    }
                  }
                  var obj = Object.assign({}, item);
                  item.oldData = obj;
                  item.isChanged = [];
                }
              );
              this.allGridConfigs[cacheIndex].gridConfigs.totalPageNum =
                res.content.totalPageNum;

              this.allGridConfigs[cacheIndex].gridConfigs.columns =
                res.content.columns;
              this.allGridConfigs[cacheIndex].gridConfigs.columns.forEach(
                (v, i) => {
                  if (
                    v.type.toLowerCase().indexOf('time') > -1 ||
                    v.type.toLowerCase().indexOf('date') > -1 ||
                    v.type.toLowerCase().indexOf('id') > -1
                  ) {
                    v.width = '200px';
                    this.allGridConfigs[cacheIndex].gridConfigs.longTdNum =
                      this.allGridConfigs[cacheIndex].gridConfigs.longTdNum + 1;
                  } else {
                    v.width = '120px';
                  }
                  v.sortType = '';
                  sortArr.forEach((item, index) => {
                    if (v.name == item.field) {
                      v.sortType = item.sortType;
                    }
                  });
                  if (v.name == columnItem.name) {
                    v.sortType = 'desc';
                  }
                }
              );
            },
            err => {
              this.currentConfigs.showMask = false;
              this.getTip(err.body.resultBean.message, 'failed');
            }
          );
      } else if (columnItem.sortType == 'desc') {
        var moveIndex = '';
        sortArr.forEach((item, index) => {
          if (item.field == columnItem.name) {
            item.sortType = 'asc';
            moveIndex = index;
          }
        });
        sortArr.unshift(...sortArr.splice(moveIndex, 1));

        this.currentConfigs.showMask = true;
        var cacheIndex = this.activeTabIndex;
        this.$http
          .post('./api/dbSource/findAllData', {
            id: this.sourceId,
            param: {
              pageNumber: 1,
              tableName: this.allGridConfigs[cacheIndex].gridConfigs.tableName,
              pageSize: this.allGridConfigs[cacheIndex].gridConfigs.pageSize,
              orderFields: sortArr
            }
          })
          .then(
            res => {
              this.currentConfigs.showMask = false;
              res = res.body;
              this.allGridConfigs[cacheIndex].gridConfigs.rows =
                res.content.rows;
              this.allGridConfigs[cacheIndex].gridConfigs.rows.forEach(
                (item, index) => {
                  for (var key in item) {
                    if (typeof item[key] == 'string') {
                      item[key] = item[key].trim();
                    }
                  }
                  var obj = Object.assign({}, item);
                  item.oldData = obj;
                  item.isChanged = [];
                }
              );
              this.allGridConfigs[cacheIndex].gridConfigs.totalPageNum =
                res.content.totalPageNum;

              this.allGridConfigs[cacheIndex].gridConfigs.columns =
                res.content.columns;
              this.allGridConfigs[cacheIndex].gridConfigs.columns.forEach(
                (v, i) => {
                  if (
                    v.type.toLowerCase().indexOf('time') > -1 ||
                    v.type.toLowerCase().indexOf('date') > -1 ||
                    v.type.toLowerCase().indexOf('id') > -1
                  ) {
                    v.width = '200px';
                    this.allGridConfigs[cacheIndex].gridConfigs.longTdNum =
                      this.allGridConfigs[cacheIndex].gridConfigs.longTdNum + 1;
                  } else {
                    v.width = '120px';
                  }
                  v.sortType = '';
                  sortArr.forEach((item, index) => {
                    if (v.name == item.field) {
                      v.sortType = item.sortType;
                    }
                  });
                  if (v.name == columnItem.name) {
                    v.sortType = 'asc';
                  }
                }
              );
            },
            err => {
              this.currentConfigs.showMask = false;
              this.getTip(err.body.resultBean.message, 'failed');
            }
          );
      }
    },
    excuteSql () {
      if (!this.sqlText) {
        this.getTip2('请输入执行语句后执行', 'failed');
        return;
      }
      this.$http
        .post('./api/dbSource/executeSql', {
          id: this.sourceId,
          sqlText: this.sqlText
        })
        .then(
          res => {
            let _this = this;
            _this.sqlResultGridConfig.columns = [];
            _this.sqlResultGridConfig.rows = [];
            if (res.body.content.length > 1) {
              _this.sqlResultGridConfig.result = res.body.content.pop();
              let arr = res.body.content;
              Object.keys(arr[0]).forEach(function (val, index) {
                _this.sqlResultGridConfig.columns.push({
                  name: val
                });
              });
              // console.log(_this.sqlResultGridConfig.columns);
              _this.sqlResultGridConfig.rows = arr;
              // console.log(_this.sqlResultGridConfig.rows);
            } else {
              _this.sqlResultGridConfig.result = res.body.content.pop();
              this.getTip2('查询不到数据', 'failed');
            }
          },
          err => {
            this.getTip2(err.body.resultBean.message, 'failed');
          }
        );
    },
    emptySql () {
      this.sqlText = '';
      this.sqlResultGridConfig.rows = [];
      this.sqlResultGridConfig.columns = [];
      this.sqlResultGridConfig.result = {};
    },
    saveSql () {
      if (!this.sqlText) {
        this.getTip2('请输入执行语句后执行', 'failed');
        return;
      }
      this.sqlTextWindowConfig.show = true;
    },
    tooltipClosed () {
      this.showTooltip = false;
    },
    getTip (msg) {
      // this.showTooltip = true;
      // this.tooltipMessage = msg;
      // this.tooltipType = type;
      this.operationType = 'tip';
      this.dialogMessage = msg;
      this.showDialog = true;
    },
    getTip2 (msg, type) {
      this.showTooltip = true;
      this.tooltipMessage = msg;
      this.tooltipType = type;
    }
  },
  components: {
    Grid,
    WaitMask,
    IInput,
    Window,
    Panel,
    DataBaseTree,
    Pagination,
    DataBaseGrid,
    DataBaseSetGrid,
    SqlResultGrid,
    myTooltip,
    myDialog,
    MouseRightMenu,
    IButton
  },
  watch: {
    $route (to, from) {
      this.$router.push('/');
      this.$router.back();
    },
    'sqlResultGridConfig.rows': {
      handler: function (val) {
        if (val) {
        }
      }
    }
  }
};
</script>
<style lang="less">
.dataBaseView {
  .level1 {
    .textarea-wrap {
      height: 160px !important;
    }
  }
  .tableDetail {
    .panel-bar {
      background-color: #eee;
      border-bottom: none;
    }
    .panel-main {
      padding-top: 0 !important;
    }
  }
  .content-body .table-row > li {
    cursor: pointer;
  }
}
</style>
<style lang="less" scoped>
.icon-guanbi5 {
  margin-left: 3px;
  display: inline-block;
  width: 16px;
  height: 16px;
  font-size: 10px;
  line-height: 16px;
  border-radius: 50%;
  text-align: center;
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  transform-origin: 100% 50%;
  &:before {
    transform: scale(0.8);
    display: inline-block;
  }
  &:hover {
    background-color: #b4bccc;
    color: #fff;
  }
}

.dataBaseView {
  width: 100%;
  height: 100%;

  .pageTabs {
    height: 35px;
    background-color: #eff1f5;
    padding-top: 4px;
    border-bottom: 1px solid #ddd;
    ul.pageSign {
      height: 30px;
      line-height: 30px;
      padding-left: 28px;
      padding-right: 28px;
      position: relative;
      overflow: hidden;
      p.iconBox2 {
        display: none;
        position: absolute;
        right: 0;
        top: 0;
        width: 28px;
        height: 35px;
        text-align: center;
        line-height: 38px;
        cursor: pointer;
        &:hover {
          i {
            color: #000;
          }
        }
        i {
          color: #888;
          font-size: 18px;
        }
      }
      p.iconBox {
        display: none;
        position: absolute;
        left: 0;
        top: 0;
        width: 28px;
        height: 35px;
        text-align: center;
        line-height: 38px;
        cursor: pointer;
        &:hover {
          i {
            color: #000;
          }
        }
        i {
          color: #888;
          font-size: 18px;
        }
      }
      .tab-box {
        height: 44px;
        white-space: nowrap;
        overflow-x: auto;
        .center-tab {
          li:not(:first-child) {
            margin-left: 4px;
          }
        }
      }
      li {
        /*float: left;*/
        display: inline-block;
        padding-left: 10px;
        padding-right: 10px;
        border: 1px solid #ddd;
        /*margin-left: 5px;*/
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
        border-bottom: none;
        background-color: #eff1f5;
        cursor: pointer;
        img {
          margin-right: 5px;
        }
        &.active {
          background-color: #fff;
          /*border-bottom: 1px solid #fff;*/
        }
      }
    }
  }
  & > .left {
    width: 18%;
    height: calc(100% - 41px);
    float: left;
    background-color: #fff;
  }
  & > .right {
    padding-right: 20px;
    margin-left: 18%;
    height: calc(100% - 41px);
    overflow-y: auto;
    .tableDetail {
      height: 100%;

      .pageBox {
        background-color: #fff;
      }
    }
    .home {
      height: 100%;
    }
    /*.pageTabs {*/
    /*height: 41px;*/
    /*background-color: #eff1f5;*/
    /*padding-top: 4px;*/
    /*border-bottom: 1px solid #ddd;*/
    /*ul.pageSign {*/
    /*height: 35px;*/
    /*line-height: 35px;*/
    /*li {*/
    /*float: left;*/
    /*padding-left: 10px;*/
    /*padding-right: 10px;*/
    /*border: 1px solid #ddd;*/
    /*margin-left: 5px;*/
    /*border-top-left-radius: 6px;*/
    /*border-top-right-radius: 6px;*/
    /*border-bottom: none;*/
    /*background-color: #eff1f5;*/
    /*cursor: pointer;*/
    /*img {*/
    /*margin-right: 5px;*/
    /*}*/
    /*&.active {*/
    /*background-color: #fff;*/
    /*border-bottom: 1px solid #fff;*/
    /*}*/
    /*}*/
    /*}*/
    /*}*/
    .level2 {
      padding-top: 10px;
      height: calc(100% - 220px);
      .panel-bar {
        height: 40px;
        background-color: #eee;
        padding-left: 10px;
      }
      .panel-body {
        height: calc(100% - 50px);
        background-color: #fff;
        .index {
          width: 30px;
          height: 100%;
          float: left;
          background-color: #eff1f5;
        }
        .show-area {
          margin-left: 30px;
          height: 100%;
          position: relative;
          .back-result {
            padding-left: 30px;
            height: 80px;
            background-color: #32404e;
            color: #adb3b8;
            border-radius: 5px;
            span {
              color: #fff;
            }
          }
        }
      }
    }
    .level1 {
      height: 210px;
      background-color: #fff;
      .panel-body {
        height: 160px;
        #code {
          width: 100%;
          height: 160px;
          overflow: auto;
          border: none;
          padding: 5px;
          box-shadow: none;
        }
        /*.index {*/
        /*width: 28px;*/
        /*height: 100%;*/
        /*float: left;*/
        /*background-color: #eff1f5;*/
        /*}*/
        /*.edit-area {*/
        /*margin-left: 28px;*/
        /*height: 100%;*/
        /*textarea {*/
        /*width: 100%;*/
        /*height: 100%;*/
        /*border: none;*/
        /*}*/
        /*}*/
      }
    }
  }
  .panel-bar {
    height: 50px;
    background-color: #eee;
    padding-top: 11px;
    padding-left: 5px;
    button {
      height: 27px;
      padding: 0 10px;
      margin: 0 6px;
      background: #20a0ff;
      color: #fff;
      border-radius: 4px;
      letter-spacing: 1px;
      &:hover {
        opacity: 0.75;
        filter: Alpha(opacity=75);
        -webkit-transition: opacity 0.5s;
        -moz-transition: opacity 0.5s;
        -ms-transition: opacity 0.5s;
        -o-transition: opacity 0.5s;
        transition: opacity 0.5s;
      }
    }
  }
}
</style>
