<template>
  <my-tooltip :show.sync="show" showType="failed" message="您无权访问！"></my-tooltip>
</template>

<script>
  import MyTooltip from "./common/OperationStatusTooltip.vue"

  export default {
    data() {
      return {
        show: true
      }
    },
    methods: {},
    mounted() {
      var vue = this;
      setTimeout(function () {
        vue.show = false;
      }, 2000)
    },
    watch: {},
    components: {
      MyTooltip: MyTooltip
    }
  }
</script>

<style scoped>

</style>
