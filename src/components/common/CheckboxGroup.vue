<template>
  <div class="CheckboxGroup">
    <p style="margin-bottom:20px;">
      <Checkbox v-if="true" v-model="value.length>0" :halfSelected="isHalf" @change="allChange">全选</Checkbox>
    </p>

    <Checkbox v-for="(item,index) in options" v-model="value.indexOf(item)>-1" @change="change(item)" :key="index">{{item}}</Checkbox>
  </div>
</template>

<script>
  import Checkbox from './Checkbox'
  export default {
    computed:{
      isHalf(){
        return (this.value.length!=this.options.length)&&this.value.length>0;
      }
    },
    name: "CheckboxGroup",
    components:{
      Checkbox
    },
    props:{
      value:{
        type:Array,
        default:[]
      },
      options:{
        type:Array,
        default:[]
      }
    },
    methods:{
      allChange(bool){
        if(bool){
          this.$emit('checkAll');
        }else{
          this.$emit('checkNone')
        }
      },
      change(item){
        if(this.value.indexOf(item)>-1){
          this.value.splice(this.value.indexOf(item),1)
        }else{
          this.value.push(item);
        }
      }
    }
  }
</script>

<style lang="less" scoped>
.CheckboxGroup{

}
</style>
