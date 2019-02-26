<template>
  <div :class="[
          'step-tab-panel',
          index == currentIdx ? 'panel-show' : 'panel-hide',
          ]">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    props: {
      label: {
        type: String,
        default: ""
      },
      labelWidth: {
        type: String,
        default: "30%"
      }
    },
    data() {
      return {
        index: -1,
        currentIdx: -1,
        totalTabs: -1
      };
    },
    beforeCreate() {
      this.$parent.tabs.push(this);
    },
    name: "i-step-tab-panel"
  }
</script>

<style scoped>
  .step-tab-panel {
    box-sizing: border-box;
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    overflow: auto;
  }

  .panel-show {
    display: block;
  }

  .panel-hide {
    display: none;
  }
</style>
