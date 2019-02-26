<template>
  <ul class="tree">
    <li v-for='(item,index) in treeData'>
      <p @click="$emit('item-click',item)" :class="[ {'currentActive': currentItem.id == item.id }, { 'openActive': item.open } ]">
        <span class="iconfont" :class="item.orgIcon"></span>
        <span class="icon-close" v-if="(item.open)&&(item.isLeafDir=='0')"></span>
        <span class="icon-open" v-if="(!item.open)&&(item.isLeafDir=='0')"></span>
        <span class='foldPic'></span>
        <span class='text'>{{item.name}}</span>
        <slot :name="item.id"></slot>
      </p>
      <tree @item-click="itemClick" :treeData="item.children" :currentItem="currentItem" v-show="item.open"></tree>
    </li>
  </ul>
</template>
<script>
  export default {
    name: 'tree',
    props: ['treeData', 'currentItem'],
    data() {
      return {
        sortCurrent: 0,
        item: false,
        currentItemId: ''
      }
    },
    methods: {
      itemClick(item) {
        this.$emit('item-click', item);
      },
      selectitem(item) {
        if (this.config.hasCheckbox) {
          item.isChecked = !item.isChecked;
          if (item.isChecked) {
            this.selectedMap[item.id] = item.id;
          } else {
            this.selectedMap[item.id] = null;
          }
        } else {
          for (var i in this.items) {
            var r = this.items[i];
            r.isChecked = false;
          }
          item.isChecked = true;
          this.$emit('selected', item);
        }
      },
    },
    mounted() {

    },
    watch: {

    }
  }

</script>
<style scoped>
  .openActive {
    /* font-weight: bold; */
  }

  .currentActive {
    /* border: 1px solid #fff; */
    /* border-width: 1px 0; */
    background: #e5f0fb;
    border-color: #BBD4EF #fff;
  }

  .tree {
    display: block;
    width: 100%;
    overflow-x: hidden;
    font-size: 13px;
    color: #333;
  }

  .tree {
    position: relative;
  }

  .tree li {
    display: block;
    width: calc(99%);
    padding-left: 20px;
    line-height: 28px;
  }

  .tree li p {
    font-family: iconfont;
    position: relative;
    display: block;
  }

  .foldPic {
    position: absolute;
    top: 5px;
    display: inline-block;
    width: 20px;
    height: 16px;
    background: url('../../assets/img/icon.png') no-repeat 0 0;
    margin-right: 5px;
    /* background-size: contain; */
  }

  .text {
    margin-left: 27px;
  }

  .icon-open,
  .icon-close {
    display: inline-block;
    width: 0 ;
    line-height: 27px;
  }

  .icon-open:before {
    position: absolute;
    width: 0;
    left: -20px;
    top: 0;
    font-size: 20px;
    content: "\e628"
  }

  .icon-close:before {
    position: absolute;
    width: 0;
    left: -20px;
    top: 0;
    font-size: 20px;
    content: "\e673"
  }

</style>
