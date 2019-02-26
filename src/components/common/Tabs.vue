<template>
  <section class="tabs" :style='config.style'>
    <div class="tabs-bar">
      <div :class="tabCls(item)" v-for="(item,index) in navList" @click="handleChange(index)">
        {{item.label}}
      </div>
    </div>
    <div class="tabs-content">
      <!--这里的slot就是嵌套的tabPane组件的内容-->
      <slot></slot>
    </div>
  </section>
</template>

<script>
  export default {
    props: {
      //接收父组件的value
      value: {
        type: [Number]
      },
      config: {
        type: Object
      }
    },
    data() {
      return {
        //将tabPane的标题保存到数组中
        navList: [],
        //保存父组件的value到currentValue变量中，以便在本地维护
        currentValue: this.value
      }
    },
    methods: {
      //使用$children遍历子组件，得到所有的tabPane组件
      getTabs: function () {
        return this.$children.filter(function (item) {
          return item.$options.name === 'tabPane';
        })
      },
      //更新tabs
      updateNav() {
        this.navList = [];
        var _this = this;

        this.getTabs().forEach(function (tabPane, index) {
          _this.navList.push({
            label: tabPane.label,
            name: tabPane.name || index
          });
          //如果没有设置name，默认设置为索引值
          if (!tabPane.name) {
            tabPane.name = index;
          }
          //设置第一个tabPane为当前显示的tab
          if (index === 0) {
            if (!_this.currentValue) {
              _this.currentValue = tabPane.name || index;
            }
          }
        });
        this.updateStatus();
      },
      updateStatus() {
        var tabs = this.getTabs();
        var _this = this;
        //显示当前选中的tab对应的tabPane组件，隐藏没有选中的
        tabs.forEach(function (tab) {
          return tab.show = tab.name === _this.currentValue;
        })
      },
      tabCls: function (item) {
        return [
          'tabs-tab',
          {
            //为当前选中的tab加一个tabs-tab-active class
            'tabs-tab-active': item.name === this.currentValue
          }
        ]
      },
      //点击tab标题触发
      handleChange: function (index) {
        var nav = this.navList[index];
        var name = nav.name;
        //改变当前选中的tab，触发watch
        this.currentValue = name;
        //实现子组件与父组件通信
        this.$emit('input', name);
      }
    },
    mounted() {

    },
    watch: {
      value: function (val) {
        this.currentValue = val;
      },
      currentValue: function () {
        //tab发生变化时，更新tabPane的显示状态
        this.updateStatus();
      }
    }
  }

</script>

<style scoped>
  .tabs {
    font-size: 14px;
    color: #657180;
    border: 1px solid #dcdfe6;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
    margin:0 auto;
  }

  .tabs-bar {
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    cursor: pointer;
  }

  .tabs-tab {
    padding: 0 20px;
    height: 40px;
    box-sizing: border-box;
    line-height: 40px;
    display: inline-block;
    list-style: none;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    position: relative;

    transition: all .2s cubic-bezier(.645, .045, .355, 1);
    border: 1px solid transparent;
    margin: -1px -1px 0;
    color: #909399;
  }

  .tabs-tab-active {
    color: #409eff;
    background-color: #fff;
    border-right-color: #dcdfe6;
    border-left-color: #dcdfe6;
    border-top-color: #dcdfe6;
    border-bottom-color: #fff;
  }

  .tabs-content {
    box-sizing: border-box;
    padding: 5px 10px 10px;
    height: 100%;
    border-radius: 0 0 5px 5px;
  }

</style>
