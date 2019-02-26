<template>
    <div class="normal">
      <!-- 左边的选择框 -->
      <div class="normal-panel">
        <div class="normal-title">
          <checkbox v-model="isCheckedAllLeft"></checkbox>
          <span class="normal-span">{{title[0]}}</span>
          <span class="normal-count">{{leftSelectMap.length}}/{{sourceData.length}}</span>
        </div>
        <ul class="content">
          <li v-for="item in sourceData" @click.stop="selectItem(item, 'left')" :class="{'checked':item.isChecked}">
            <checkbox v-model="item.isChecked" @change="checkStatusChange(item, 'left')"></checkbox>
            <span class="normal-span">{{item.label}}</span>
          </li>
        </ul>
      </div>
      <!-- 中间的操作按钮 -->
      <div class="operation-panel normal-panel">
        <div class="operation-button" @click="moveToLeft"
             :class="{'disabled': rightSelectMap.length<=0, 'hasChecked':rightSelectMap.length>0}">&#xe940;</div>
        <div class="operation-button" @click="moveToRight"
             :class="{'disabled': leftSelectMap.length<=0,'hasChecked':leftSelectMap.length>0}"
             style="margin-top:15px">&#xe94d;</div>
      </div>
      <!-- 右边的选择框 -->
      <div class="normal-panel">
        <div class="normal-title">
          <checkbox v-model="isCheckedAllRight"></checkbox>
          <span class="normal-span">{{title[1]}}</span>
          <span class="normal-count">{{rightSelectMap.length}}/{{destData.length}}</span>
        </div>
        <ul class="content">
          <li v-for="item in destData" @click.stop="selectItem(item, 'right')" :class="{'checked':item.isChecked}">
            <checkbox v-model="item.isChecked" @change="checkStatusChange(item,'right')"></checkbox>
            <span class="normal-span">{{item.label}}</span>
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
          default(){
            return ["左列表", "右列表"];
          }
        },
        originalData: {
          type: Array,
          default(){
            return [];
          }
        },
        value: {
          type: Array,
          default(){
            return [];
          }
        }
      },
      data() {
        return {
          isCheckedAllLeft: false,
          isCheckedAllRight: false,
          sourceData: this.originalData,
          destData: this.value,
          leftSelectMap: [],
          rightSelectMap: []
        }
      },
      methods: {
        // 移到左边列表
        moveToLeft() {
          if (this.rightSelectMap.length > 0) {
            for(let item of this.rightSelectMap) {
              this.sourceData.push({value: item.value, label: item.label});
              this.destData = this.destData.filter(o => item.value != o.value);
            }
            this.rightSelectMap = [];
            this.isCheckedAllRight = false;
            this.$emit("input", this.destData);
          }
        },
        // 移到右边列表
        moveToRight() {
          if (this.leftSelectMap.length > 0) {
            for(let item of this.leftSelectMap) {
              this.destData.push({value: item.value, label: item.label});
              this.sourceData = this.sourceData.filter(o => item.value != o.value);
            }
            this.$emit("input", this.destData);
            this.leftSelectMap = [];
            this.isCheckedAllLeft = false;
          }
        },
        checkStatusChange(item, flag) {
          if ("left" == flag) {
            if (item.isChecked) {
              this.leftSelectMap.push({value:item.value, label:item.label});
            } else {
              this.leftSelectMap = this.leftSelectMap.filter(o => o.value != item.value);
            }
          }
          if ("right" == flag) {
            if (item.isChecked) {
              this.rightSelectMap.push({value:item.value, label:item.label});
            } else {
              this.rightSelectMap = this.rightSelectMap.filter(o => o.value != item.value);
            }
          }
        },
        selectItem(item, flag) {
          item.isChecked = !item.isChecked;
          this.checkStatusChange(item, flag);
        }
      },
      mounted() {
        for (let item of this.destData) {
          this.sourceData = this.sourceData.filter(o => o.value != item.value);
        }
      },
      watch: {
        "isCheckedAllLeft": function(newValue) {
          this.leftSelectMap = [];
          for (let item of this.sourceData) {
            item.isChecked = newValue;
            if (item.isChecked) {
              this.leftSelectMap.push({value:item.value, label:item.label});
            } else {
              this.leftSelectMap = this.leftSelectMap.filter(o => o.value != item.value);
            }
          }
        },
        "isCheckedAllRight": function(newValue) {
          this.rightSelectMap = [];
          for (let item of this.destData) {
            item.isChecked = newValue;
            if (item.isChecked) {
              this.rightSelectMap.push({value:item.value, label:item.label});
            } else {
              this.rightSelectMap = this.rightSelectMap.filter(o => o.value != item.value);
            }
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
    height: 300px;
    border: none;
  }
  .normal-span {
    margin-left: 5px;
  }
  .normal-panel {
    float: left;
    border-radius: 4px;
    width: 38%;
    height: 100%;
  }
  .normal-panel:first-child,.normal-panel:last-child {
    border: 1px solid lightgray
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
    background: #F5F7FA;
    padding-left: 20px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border-bottom: 1px solid lightgray;
  }
  .operation-panel {
    width: 24%;
    margin: auto;
  }
  .operation-button {
    font-family: "iconfont";
    background: #F5F7FA;
    border: 1px solid #E6E8EE;
    color: #999999;
    margin:auto;
    margin-top: 102px;
    border-radius: 50%;
    cursor: pointer;
    height: 40px;
    width: 40px;
    line-height: 40px;
    text-align: center;
  }
  .content {
    display: inline-block;
    height: 258px;
    width: 100%;
    overflow: auto;
    padding-left: 20px;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    list-style: none;
    background: #ffffff;
  }
  .content li {
    padding-top: 10px;
    cursor: pointer;
    height: 30px;
    line-height: 30px;
  }
  .content li:hover {
    color: #0374d0;
  }
  .disabled {
    cursor: not-allowed;
  }
  .hasChecked {
    /*background: #5cadff;*/
    background: #20a0ff;
    color: #ffffff;
    /*border: 1px solid #5cadff;*/
    border: 1px solid #20a0ff;
  }
  .checked {
    /*color: #5cadff;*/
    color: #20a0ff;
  }
</style>
