<template>
  <div class='wrapBox'
       :style='colorLine'>
    <h5 :style='colorTitle'>{{title}}</h5>
    <div class="box"
         :style='colorContent'>
      <slot></slot>
    </div>
  </div>
</template>
  <script>
export default {
  props: {
    themeNum: {
      type: String
    },
    title: {
      type: String
    }
  },
  data () {
    return {
      theme: [
        {
          colorTitle: 'background-color: #ECF1F4;',
          colorContent: 'background-color: #F2F6F9;',
          colorLine: ' border-left: 3px solid #DAE1E5;'
        },
        {
          colorTitle: 'background-color: #EEEEEE;',
          colorContent: 'background-color: #F3F3F3;',
          colorLine: ' border-left: 3px solid #DBDBDB;'
        }
      ]
    }
  },
  methods: {

  },
  mounted () {

  },
  computed: {
    themeNumber () {
      if (parseInt(this.themeNum) > this.theme.length) {
        return '0'
      } else {
        return this.themeNum
      }
    },
    colorLine () {
      return this.theme[this.themeNumber].colorLine
    },
    colorContent () {
      return this.theme[this.themeNumber].colorContent
    },
    colorTitle () {
      return this.theme[this.themeNumber].colorTitle
    }
  }
}
</script>
  
  <style scoped>
.wrapBox {
  margin-top: 10px;
}
h5 {
  line-height: 30px;
  border-bottom: 1px solid #dce8f1;
  color: #4383b4;
  padding: 1px 10px;
  font-size: 14px;
}
.box {
  font-size: 14px;
  padding: 10px;
}
</style>
  