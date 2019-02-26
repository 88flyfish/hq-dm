<template>
  <div class="action-panel">
    <div class="panel-bar">
      <div class="search-bar">
        <slot name="searchBar"></slot>
      </div>
      <div class="action-bar">
        <slot name="actionBar"></slot>
      </div>
    </div>
    <div class="panel-main"
         style="padding:10px;">
      <div class="left-action-box"
           :style="classConfig">
        <div style="height:100%;width:100%;overflow: auto;">
          <slot name="actionBox"></slot>
        </div>
      </div>
      <div style="display: table-cell;width:15px;"></div>
      <div class="panel-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    classConfig: {
      type: String,
      default: {},
    }
  },
  data () {
    return {}
  },
  methods: {},
  components: {}
}
</script>

<style scoped>
.action-panel {
  width: 100%;
  height: 100%;
}

.panel-bar {
  width: 100%;
  padding: 5px 20px;
  overflow: hidden;
  background: #eff1f5;
  border-bottom: 1px solid #ddd;
  height: 50px;
  line-height: 40px;
}

.panel-bar input {
  height: 27px;
  border-radius: 4px;
  font-family: "\5FAE\8F6F\96C5\9ED1";
}

.search-bar {
  float: left;
}

.action-bar {
  float: right;
}

.panel-main {
  width: 100%;
  display: table;
  table-layout: fixed;
  height: calc(100% - 50px);
  min-height: calc(100vh - 150px);
}

.left-action-box {
  vertical-align: top;
  width: 18%;
  padding: 20px 5px 20px 10px;
  display: table-cell;
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0px 1px 2px 1px #ccc;
  border-radius: 6px;
  height: 100%;
}

.panel-content {
  vertical-align: top;
  display: table-cell;
  background-color: #ffffff;
  overflow: hidden;
  box-shadow: 0px 1px 2px 1px #ccc;
  border-radius: 6px;
  padding: 10px;
  overflow: auto;
}
</style>

