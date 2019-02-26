<template>
    <div id="progress">
      <div :class="outer" :style="{height:strokeWidth+'px'}">
        <div :class="inner" :style="{width:percentage+'%',backgroundColor:progressColor,height:strokeWidth+'px',lineHeight:strokeWidth+'px'}">
           <span class="inner_text" v-if="textInside">{{percentage+'%'}}</span>
        </div>
      </div>
      <span :class="text" v-if="!textInside">{{percentage<100?percentage+'%':undefined}}</span>
    </div>
</template>

<script>
    export default {
        name: "IProgress",
        props:{
          percentage:{ //进度条所占百分比
            type:Number
          },
          color:{
            type:String,
            default:'#409eff'
          },
          strokeWidth:{
            type:Number,
            default:10
          },
          textInside:{
            type:Boolean,
            default:false
          }
      },
      data(){
        return {
            outer:'outer',
            inner:'inner',
            text:'text',
            progressColor: this.color,
        }
      },

      watch:{
        percentage(newValue){
            if(newValue == 100){
              this.progressColor = '#67c23a';
              this.text = 'success_text';
            }
        }
      }
    }
</script>

<style scoped>
  .outer{
    width: 200px;
    background-color: #ebeef5;
    border-radius: 100px;
    overflow: hidden;
    display: inline-block;
  }

  .inner{
    border-radius: 100px;
  }

  .text{
    font-size: 14px;
    color: #606266;
    display: inline-block;
    position: relative;
  }
  .inner_text{
     float: right;
     margin-right: 10px;
     color:#ffffff;
   }
  .success_text{

  }
  .success_text:after{
    display: inline-block;
    position: relative;
    font-family: iconfont;
    color:#67c23a;
    content: "\e63b";
  }
</style>
