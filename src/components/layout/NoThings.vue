<template>
  <div class="picWrap">
    <div class=''></div>
  </div>
</template>
<script>
export default {
  props: {

  },
  data () {
    return {

    }
  },
  methods: {

  },
  mounted () {

  },
  computed: {

  }
}

</script>
<style scoped>
.picWrap {
  width: 100%;
}
/* 没数据 */
.pic-nodata {
  margin: 100px auto 0;
  width: 150px;
  height: 150px;
  background: url("../../assets/img/nodata.png") no-repeat;
  background-size: contain;
}
/* 没文件 */
.pic-nofloder {
  margin: 100px auto 0;
  width: 150px;
  height: 150px;
  background: url("../../assets/img/nofolder.png") no-repeat;
  background-size: contain;
}
</style>
