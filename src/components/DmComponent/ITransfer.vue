<template>
    <div class="normal">
        <!-- 左边的选择框 -->
        <div class="normal-panel">
            <div class="normal-title">
                <checkbox v-model="isCheckedAllLeft"></checkbox>
                <span class="normal-span">{{title[0]}}</span>
                <span class="normal-count">{{leftSelectMap.length}}/{{sourceData.length}}</span>
            </div>
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
            <ul class="content"
                :class="{'hasSearch':hasSearch}">
                <li v-for="item in sourceData"
                    @click.stop="selectItem(item, 'left')"
                    :class="{'checked':item.isChecked}">
                    <checkbox v-model="item.isChecked"
                              @change="checkStatusChange(item, 'left')"></checkbox>
                    <span class="normal-span"
                          @mouseenter="showFullName(item.label, $event)">{{item.label}}</span>
                </li>
            </ul>
        </div>
        <!-- 中间的操作按钮 -->
        <div class="operation-panel normal-panel">
            <div class="operation-button"
                 @click="moveToLeft"
                 :class="{'disabled': rightSelectMap.length<=0, 'hasChecked':rightSelectMap.length>0}">&#xe940;
            </div>
            <div class="operation-button"
                 @click="moveToRight"
                 :class="{'disabled': leftSelectMap.length<=0,'hasChecked':leftSelectMap.length>0}"
                 style="margin-top:15px">&#xe94d;
            </div>
        </div>
        <!-- 右边的选择框 -->
        <div class="normal-panel">
            <div class="normal-title">
                <checkbox v-model="isCheckedAllRight"></checkbox>
                <span class="normal-span">{{title[1]}}</span>
                <span class="normal-count">{{rightSelectMap.length}}/{{destData.length}}</span>
            </div>
            <ul class="content">
                <li v-for="(item,index) in destData"
                    @click.stop="selectItem(item, 'right')"
                    :class="{'checked':item.isChecked}"
                    class="rightItem">
                    <checkbox v-model="item.isChecked"
                              @change="checkStatusChange(item,'right')"></checkbox>
                    <span class="normal-span"
                          style="width: calc(100% - 81px)"
                          @mouseenter="showFullName(item.label, $event)">{{item.label}}</span>
                    <div class="toolBox">
                        <span v-for="operation in operations"
                              class="operation"
                              v-if="(index==0&&operation.title !=='上移'&&destData.length!==1)||
                                    (index==(destData.length-1)&&operation.title!=='下移'&&destData.length!==1)||
                                    index!==0&&index!==(destData.length-1)"
                              @click.stop="operation.func(item,index)"
                              :title="operation.title"
                              :key="operation.icon"
                              v-html="operation.icon">
                        </span>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import Checkbox from "./Checkbox.vue"

export default {
    name: "i-transfer",
    props: {
        title: {
            type: Array,
            default () {
                return ["左列表", "右列表"];
            }
        },
        originalData: {
            type: Array,
        },
        value: {
            type: Array,
            default () {
                return [];
            }
        },
        hasSearch: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            isCheckedAllLeft: false,
            isCheckedAllRight: false,
            sourceData: this.originalData,
            destData: this.value,
            leftSelectMap: [],
            rightSelectMap: [],
            condition: '',
            operations: [{
                title: "上移",
                icon: "&#xea3a",
                func: this.rowUp
            }, {
                title: "下移",
                icon: "&#xea3e",
                func: this.rowDown
            }],
        }
    },
    methods: {
        // 移到左边列表
        moveToLeft () {
            if (this.rightSelectMap.length > 0) {
                let temp = JSON.parse(localStorage.getItem('sourceData'));
                this.rightSelectMap.forEach(item => {
                    this.sourceData.push({ value: item.value, label: item.label });
                    this.destData = this.destData.filter(o => item.value != o.value);
                    temp.push({ value: item.value, label: item.label });
                });
                localStorage.setItem('sourceData', JSON.stringify(temp));
                this.rightSelectMap = [];
                this.isCheckedAllRight = false;
                this.$emit("input", this.destData);
            }
        },
        // 移到右边列表
        moveToRight () {
            if (this.leftSelectMap.length > 0) {
                let temp = JSON.parse(localStorage.getItem('sourceData'));
                this.leftSelectMap.forEach(item => {
                    this.destData.push({ value: item.value, label: item.label });
                    this.sourceData = this.sourceData.filter(o => item.value != o.value);
                    temp = temp.filter(o => item.value != o.value);
                });
                localStorage.setItem('sourceData', JSON.stringify(temp));
                this.leftSelectMap = [];
                this.isCheckedAllLeft = false;
                this.$emit("input", this.destData);
            }
        },
        checkStatusChange (item, flag) {
            if ("left" == flag) {
                if (item.isChecked) {
                    this.leftSelectMap.push({ value: item.value, label: item.label });
                } else {
                    this.leftSelectMap = this.leftSelectMap.filter(o => o.value != item.value);
                }
                this.isCheckedAllLeft = this.sourceData.length == this.leftSelectMap.length;
            }
            if ("right" == flag) {
                if (item.isChecked) {
                    this.rightSelectMap.push({ value: item.value, label: item.label });
                } else {
                    this.rightSelectMap = this.rightSelectMap.filter(o => o.value != item.value);
                }
                this.isCheckedAllRight = this.destData.length == this.rightSelectMap.length;
            }
        },
        selectItem (item, flag) {
            item.isChecked = !item.isChecked;
            this.checkStatusChange(item, flag);
        },
        //选项上移
        rowUp (item, index) {
            [this.destData[index], this.destData[index - 1]] = [this.destData[index - 1], this.destData[index]];
            this.destData = [...this.destData];
            this.$emit("input", this.destData);
        },
        rowDown (item, index) {
            [this.destData[index], this.destData[index + 1]] = [this.destData[index + 1], this.destData[index]];
            this.destData = [...this.destData];
            this.$emit("input", this.destData);
        },

        // 如果文字溢出则添加title属性
        showFullName (value, event) {
            let element = $(event.currentTarget).get(0);
            let scrollWidth = element.scrollWidth;
            let clientWidth = element.clientWidth;
            if (scrollWidth <= clientWidth) {
                value = ''
            }
            $(event.currentTarget).attr('title', value);
        },
        deleteValue () {
            this.$refs.search.value = '';
            this.condition = '';
            this.search();
        },
        search () {
            this.sourceData = this.sourceData.filter(i => {
                return i.label.indexOf(this.condition) !== -1
            })
        }
    },
    // mounted () {
    //     localStorage.setItem('sourceData', JSON.stringify(this.sourceData));
    // },
    beforeDestroy () {
        localStorage.removeItem('sourceData')
    },
    watch: {
        "isCheckedAllLeft": function (newValue) {
            if (this.leftSelectMap.length != 0 && this.leftSelectMap.length < this.sourceData.length && !newValue) {
                return;
            }
            this.leftSelectMap = [];
            this.sourceData.forEach(item => {
                item.isChecked = newValue;
                if (item.isChecked) {
                    this.leftSelectMap.push({ value: item.value, label: item.label });
                } else {
                    this.leftSelectMap = this.leftSelectMap.filter(o => o.value != item.value);
                }
            });
        },
        "isCheckedAllRight": function (newValue) {
            if (this.rightSelectMap.length != 0 && this.rightSelectMap.length < this.destData.length && !newValue) {
                return;
            }
            this.rightSelectMap = [];
            this.destData.forEach(item => {
                item.isChecked = newValue;
                if (item.isChecked) {
                    this.rightSelectMap.push({ value: item.value, label: item.label });
                } else {
                    this.rightSelectMap = this.rightSelectMap.filter(o => o.value != item.value);
                }
            });
        },
        "originalData": {
            handler (newValue) {
                localStorage.setItem('sourceData', JSON.stringify(newValue));
                //做深拷贝给data的空对象赋值
                this.sourceData = newValue.map(item => {
                    return {
                        isChecked: item.isChecked,
                        value: item.value,
                        label: item.label
                    }
                });
            },
            deep: true
        },
        "value": {
            handler (newValue) {
                this.destData = newValue.map(item => {
                    return {
                        isChecked: item.isChecked,
                        value: item.value,
                        label: item.label
                    }
                });
            },
            deep: true
        },
        'condition': {
            handler (val) {
                if (this.condition.length == 0) {
                    this.sourceData = JSON.parse(localStorage.getItem('sourceData'));
                }
                let timer = setTimeout(this.search, 300);
                this.$once('hook:beforeDestroy', () => {
                    clearTimeout(timer);
                })
            }
        }
    },
    components: {
        Checkbox
    }
}
</script>

<style scoped>
.normal {
  width: 100%;
  min-width: 500px;
  height: 380px;
  border: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.normal-span {
  margin-left: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: absolute;
  width: calc(100% - 21px);
}

.normal-panel {
  float: left;
  border-radius: 4px;
  width: 38%;
  height: 100%;
}

.normal-panel:first-child,
.normal-panel:last-child {
  border: 1px solid #ebeef5;
}

.normal-count {
  display: inline-block;
  float: right;
  margin-right: 7%;
  color: #909399;
}

.normal-title {
  width: 100%;
  height: 40px;
  line-height: 40px;
  background: #f5f7fa;
  padding-left: 20px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom: 1px solid #ebeef5;
  color: #606266;
}

.operation-panel {
  width: 22%;
  margin: auto;
}

.operation-button {
  font-family: 'iconfont';
  background: #f5f7fa;
  border: 1px solid #e6e8ee;
  color: #999999;
  margin: auto;
  margin-top: 143px;
  border-radius: 50%;
  cursor: pointer;
  height: 40px;
  width: 40px;
  line-height: 40px;
  text-align: center;
}

.content {
  display: inline-block;
  height: calc(100% - 40px);
  width: 100%;
  overflow: auto;
  padding-left: 20px;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  list-style: none;
  background: #ffffff;
  color: #606266;
}

.content::-webkit-scrollbar {
  /*滚动条整体部分*/
  width: 10px;
  height: 10px;
}

.content::-webkit-scrollbar-thumb {
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
  background-color: #eee;
}

.content li {
  margin-top: 11px;
  position: relative;
  width: 100%;
}

.content li:hover {
  cursor: pointer;
  color: #0374d0;
}

.disabled {
  cursor: not-allowed;
}

.hasChecked {
  background: #5cadff;
  color: #ffffff;
  border: 1px solid #5cadff;
}

.checked {
  color: #5cadff;
}

.rightItem:hover .toolBox {
  display: block;
}

.toolBox {
  float: right;
  display: none;
}

.operation {
  font-family: iconfont;
  padding: 8px;
}

.operation:hover {
  cursor: pointer;
  background-color: #eee;
  color: #0374d0;
  -webkit-transition: background-color 0.5s;
  -moz-transition: background-color 0.5s;
  -ms-transition: background-color 0.5s;
  -o-transition: background-color 0.5s;
  transition: background-color 0.5s;
}
.hasSearch {
  height: calc(100% - 90px) !important;
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
