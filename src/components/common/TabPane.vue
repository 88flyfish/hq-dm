<template>
    <div class="pane" v-show="show">        
        <slot></slot>
    </div>
</template>

<script>
  export default {
    name:'tabPane',
    props: {
        //设置pane的标识
        // name:{
        //     type:String
        // },
        //label是设置标题
        label:{
            type:String,
            default:''
        }
    },
    data() {
        return {
            show:true
        }
    },
    methods: {
        updateNav:function(){
            //$parent 父链，通知父组件（tabs）进行更新。
            //说明：在业务中尽可能不要使用$parent来操作父组件，$parent适合标签页这样的独立组件
            this.$parent.updateNav();
        }
    },
    mounted() {
        this.updateNav();
    },
    watch:{
        label(){
            this.updateNav();
        }
    },
  }

</script>

<style scoped>


</style>
