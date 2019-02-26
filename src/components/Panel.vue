<template>
  <div class="panel">
    <div class="panel-bar">
      <div class="search-bar">
        <slot name="searchBar"></slot>
      </div>
      <div class="action-bar">
        <slot name="actionBar"></slot>
      </div>
      <div class="action-txt">
        <slot name="txtBar"></slot>
      </div>
    </div>
    <div class="panel-main"
         style="padding:10px;">
      <div class="panel-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  data () {
    return {};
  },
  methods: {},
  components: {}
};
</script>

<style scoped>
.panel {
  width: 100%;
  height: 100%;
}

.panel-bar {
  width: 100%;
  padding: 5px 20px;
  background: #eff1f5;
  border-bottom: 1px solid #ddd;
  min-height: 50px;
  line-height: 40px;
}

.search-bar {
  float: left;
}

.action-bar {
  float: right;
}
.action-txt {
  text-align: center;
  font-size: 15px;
}

.panel-main {
  width: 100%;
  height: calc(100% - 25px);
}

.panel-content {
  vertical-align: top;
  background-color: #ffffff;
  box-shadow: 0px 1px 2px 1px #ccc;
  border-radius: 6px;
  padding: 10px;
  height: calc(100% - 35px);
  min-height: calc(100vh - 185px);
  overflow: auto;
}
</style>

