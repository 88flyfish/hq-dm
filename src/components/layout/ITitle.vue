<template>
    <div class='titlePane'>
        <slot></slot>
    </div>
  </template>
  <script>
    export default {
      props:{
        
      },
      data(){
        return {
          
        }
      },
      methods: {

      },
      mounted() {

      },
      computed:{
        
      }
    }
  </script>
  <style scoped>
      .titlePane{
        line-height: 28px;
        margin-bottom: 16px;
        margin-top: 18px;
        font-size:16px;
        padding-bottom: 4px;
        border-bottom:1px solid #d5e3ef;
        color: #478FCA!important;
        font-weight: lighter;
      }
  </style>
  