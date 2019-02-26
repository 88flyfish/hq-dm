<template>
  <div class="toggleBox">
    <div class="titleBox" @click='iconConfig.func'>
      <span>{{title}}</span>
      <span class='fontClass' :title='iconConfig.title' v-html='iconConfig.icon' ></span>
    </div>
    <transition name="fade">
      <div class="contentBox" v-if='isShow'>
        <slot></slot>
      </div>
    </transition>

  </div>
</template>

<script>
  export default {
    name: 'tabPane',
    props: {
      title: {
        type: String,
        default: ''
      },
      show:{
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
          isShow : this.show
      }
    },
    computed: {
      iconConfig() {
        return {
          title: this.isShow ? "收起" : "展开",
          icon: this.isShow ? "&#xeaed" : "&#xeaef",
          func: this.toggleBox
        }
      }
    },
    methods: {
      toggleBox() {
        this.isShow = !this.isShow;
      }
    },
    mounted() {

    },
    watch: {
        show(val){
            this.isShow = val;
        }
    }
  }

</script>

<style scoped>
  .toggleBox {
    box-sizing: border-box;
    width: calc(100% - 50px);
    margin: 10px auto;
  }

  .titleBox {
    box-sizing: border-box;
    width: 100%;
    height: 45px;
    padding: 0 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 45px;
    color: #fff!important;
    background: #307ECC;
    border-color: #307ECC;
  }

  .fontClass {
    cursor: pointer;
    font-family: iconfont;
    padding: 8px;
    font-size: 20px;
    -webkit-user-select:none;
    -moz-user-select:none;
    -ms-user-select:none;
    user-select:none;
  }

  .contentBox {
    width: 100%;
    box-sizing: border-box;
    padding: 5px;
    border: 1px solid #bce8f1;
  }

</style>
