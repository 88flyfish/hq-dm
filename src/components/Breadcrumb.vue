<template>
  <div class="breadcrumb">
    <span class="level1" v-if="showParentName">{{parentName}} <b>/</b></span>
    <transition name="breadcrumb">
      <span class="level2" v-if="showChildName">{{childName}}</span>
    </transition>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  export default {
    name: "Breadcrumb",
    beforeDestroy(){
      const _this=this;
      clearTimeout(_this.timer);
      this.timer=null;
    },
    watch:{
      menuList(menuList){
        if(menuList.length){
          this.getChildName(menuList)
        }
      },
      '$route'(to,from){
        console.log(this)
        this.showChildName=false;
        const _this=this;
        this.timer=setTimeout(()=>{
          _this.getChildName(this.menuList)
        },400)
      }
    },
    computed:{
      ...mapGetters(['menuList'])
    },
    data(){
      return {
        timer:null,
        showParentName:false,
        showChildName:false,
        parentName:'',
        childName:''
      }
    },
    methods:{
      getChildName(menuList,bool,parent){
        var currentRouteName=this.$route.name;

        for(var i=0;i<menuList.length;i++){
          if(menuList[i].code==currentRouteName){
            this.childName=menuList[i].name;
            this.parentName=parent?parent:'';
            this.showParentName=bool?true:false;
            break;
          }else{
            this.getChildName(menuList[i].children,true,menuList[i].name);
          }
        }
        this.showChildName=true;

      }
    },
    mounted(){

    }
  }
</script>

<style lang="less" scoped>
  .breadcrumb-enter-active, .breadcrumb-leave-active {
    transition: all .4s;
  }

  .breadcrumb-enter, .breadcrumb-leave-to {
    opacity: 0;

    transform: translateX(30px);
    -webkit-transform: translateX(30px);
    -moz-transform: translateX(30px);
    -ms-transform: translateX(30px);
  }
  .breadcrumb {
    float: left;
    height: 36px;
    line-height: 36px;
    span.level1 {
      font-size: 14px;
      color: #666;
      b {
        font-weight: normal;
        margin-left: 8px;
        color: #c0c4cc;
      }
    }
    span.level2{
      margin-left:8px;
      position:absolute;
    }
  }
</style>
