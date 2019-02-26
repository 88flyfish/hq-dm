<template>
  <button class='button'>
      <slot></slot>
  </button>
</template>
<script>
  export default {
    props: {
       
    },
    data() {
      return {

      }
    },
    methods: {

    },
    mounted() {

    },
    computed: {

    }
  }

</script>
<style scoped>
  .button {
    display: inline-block;
    line-height: 27px;
    padding: 0 10px;
    margin: 0 6px;
    background: #20a0ff;
    color: #fff;
    border-radius: 4px;
    letter-spacing: 1px;
    box-shadow: none;
    cursor: pointer;
    border: none;
    font-family: "\5FAE\8F6F\96C5\9ED1";
  }
  button:hover{
    opacity: .75;
    filter: Alpha(opacity=75);
    transition: opacity .5s;
  }
  .small-button {
    line-height: 22px;
    padding: 0 5px;
  }
  button.disabled {
    cursor: no-drop;
    background: #EEEEEE;
  }

  button.disabled:hover {
    background: #EEEEEE;
    border-color: #ddd;
  }
  .info{
      background: #6FB3E0;
  }
  .success{
      background: #87B87F;
  }
  .yellow{
      background: #FFB752;
  }
  .red{
      background: #D15B47;
  }
  
</style>
