<template>
    <div :style="selectStyle"
         @click.stop="click"
         class="normal"
         :class="{'opened':open}">
        <span style="display:inline-block;height:100%;overflow:hidden;width:84%;">{{title}}</span>
        <input ref="input"
               :value="value"
               style="display: none" />
        <div class="select-btn"></div>
        <div class="select-content"
             :style="treeStyle"
             @click.stop="stopGlobalClick">
            <div class='searchBox'
                 v-if="hasSearch">
                <input name='search'
                       ref='search'
                       v-model="condition"
                       v-show="hasSearch" />
                <span class="deleteIcon"
                      v-if="condition.length>0"
                      @click='deleteValue'></span>
                <span class="searchIcon"
                      @click='search'></span>
            </div>
            <tree ref='tree'
                  @selected="selected"
                  @defaultSelected="defaultSelected"
                  :defaultSelectedId="defaultValue"
                  :addChildren="addChildren"
                  :hasSearch="hasSearch"
                  :api="api"
                  :condition='condition'
                  :field="field"
                  :expandLevel="1"
                  :styleConfig="treeStyleConfig"></tree>
        </div>
    </div>
</template>

<script>
import Tree from "./Tree.vue"

export default {
    props: {
        value: String,
        api: String,
        hasSearch: {
            type: Boolean,
            default: false
        },
        readonly: {
            type: Boolean,
            default: false
        },
        field: {
            type: String,
            default: "name"
        },
        addChildren: {
            type: String,
            default: ""
        },
        selectStyle: {
            type: Object,
            default: function () {
                return {
                    /*width: "400px",
                    height: "32px"*/
                }
            }
        },
        treeStyleConfig: {
            type: Object,
            default: function () {
                return {};
            }
        }
    },
    data () {
        return {
            treeStyle: {
                display: "none",
                width: this.selectStyle.width
            },
            defaultValue: this.value,
            title: "",
            condition: '',
            open: false
        }
    },
    methods: {
        defaultSelected: function (id, title) {
            this.title = title;
            this.$emit('input', id)
        },
        selected: function (id, title) {
            this.title = title;
            this.$emit('input', id.toString());
            this.$emit('change', id.toString());
            this.open = false;
            $('.select-content').slideUp('fast');
        },
        click: function (event) {
            if (!this.readonly) {
                this.open = !this.open;

                if (this.open) {
                    this.$root.bus.$emit("selctClicked", this);
                    $(event.currentTarget).find('.select-content').slideDown('fast');
                } else {
                    $(event.currentTarget).find('.select-content').slideUp('fast');
                }
            }
        },
        // 阻止全局关闭事件(点击下拉面板中的空白地方也会收回该面板)
        stopGlobalClick () {
            return false;
        },
        handleClickOut () {
            this.open = false;
            $('.select-content').slideUp('fast');
        },
        deleteValue () {
            this.$refs.search.value = '';
            this.condition = '';
            this.search();
        },
        search () {
            this.$refs.tree.search();
        }
    },
    mounted () {
        var that = this;
        this.globalClick(this.handleClickOut);
        this.$root.bus.$on("selctClicked", function (obj) {
            if (obj != that) {
                that.open = false;
                $('.select-content').hide();
            };
        })
    },

    components: {
        Tree: Tree
    },

    watch: {
        /* open(newValue) {
           $(".select-content").slideToggle("fast");
         },*/
        value (val) {
            this.defaultValue = val;
        },
        condition (val) {
            let timer = setTimeout(this.search, 300);
            this.$once('hook:beforeDestroy', () => {
                clearTimeout(timer);
            })
        }
    }
}
</script>

<style scoped>
.normal {
  margin: 0px;
  border: 1px solid #a9a9a9;
  border-radius: 4px;
  background-color: #ffffff;
  padding: 5px;
  padding-left: 10px;
  cursor: default;
  text-align: left;
  line-height: normal;
  width: 100%;
  height: 100%;
  position: relative;
  color: #606266;
}

.select-btn {
  margin: 0px;
  /*border: 1px solid #a9a9a9;*/
  padding: 1px;
  float: right;
  border-radius: 2px;
  height: 100%;
  line-height: 100%;
}

.select-btn:before :hover {
  color: #5cadff;
}

.select-btn:before {
  font-family: 'iconfont';
  font-size: 18pt;
  content: '\e313';
}

.opened .select-btn:before {
  font-family: 'iconfont';
  content: '\e313';
  color: #5cadff;
}

.opened,
.normal:hover {
  border: 1px solid #5cadff;
  -webkit-box-shadow: 0px 0px 10px #d6ebff;
  -moz-box-shadow: 0px 0px 10px #d6ebff;
  box-shadow: 0px 0px 10px #d6ebff;
}

.select-content {
  background-color: #ffffff;
  width: 100%;
  height: 260px;
  position: absolute;
  margin-top: 8px;
  margin-left: -11px;
  border: 1px solid #5cadff;
  -webkit-box-shadow: 0px 0px 10px #d6ebff;
  -moz-box-shadow: 0px 0px 10px #d6ebff;
  box-shadow: 0px 0px 10px #d6ebff;
  z-index: 999;
}
.hasSearch {
  height: calc(100% - 45px) !important;
}
.searchBox {
  position: relative;
  width: calc(100% - 20px);
  margin: 10px 0px 5px 10px;
  height: 25px;
}
input[name='search'] {
  height: 25px;
  width: 100%;
  padding-right: 40px;
}
.deleteIcon {
  position: absolute;
  right: 25px;
  top: 5px;
}
.searchIcon {
  position: absolute;
  right: 5px;
  top: 5px;
}
.deleteIcon::before {
  font-size: 16px;
  font-family: 'iconfont';
  content: '\e604';
}
.searchIcon::before {
  font-size: 16px;
  color: #2196f7;
  font-family: 'iconfont';
  content: '\e90d';
}
.deleteIcon:hover:before {
  cursor: pointer;
}
</style>
