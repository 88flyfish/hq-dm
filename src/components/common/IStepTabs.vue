<template>
  <div class="step-tabs">
    <i-steps :active="active">
      <i-step v-for="tab in tabs" :key="tab.label"
              :title="tab.label" :width="tab.labelWidth"
              @stepSelected="stepSelected"></i-step>
    </i-steps>
    <div class="step-tabs-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  import ISteps from "./ISteps"
  import IStep from "./IStep"

  export default {
    props: {
      active: {
        type: Number,
        default: 1
      }
    },
    data() {
      return {
        tabs: []
      }
    },
    methods: {
      stepSelected(selectedIndex) {
        this.$emit("update:active", selectedIndex)
      }
    },
    watch: {
      active(newVal, oldVal) {
        if (newVal < 1) {
          this.$emit('update:active', 1)
        } else if (newVal > this.tabs.length) {
          this.$emit('update:active', this.tabs.length)
        } else {
          this.$emit('change', newVal, oldVal);

          this.tabs.forEach((child) => {
            child.currentIdx = newVal;
          });
        }
      },
      tabs(tabs) {
        tabs.forEach((child, index) => {
          child.index = index + 1;
          child.currentIdx = this.active;
          child.totalTabs = this.tabs.length;
        });
      }
    },
    components: {
      ISteps,
      IStep
    },
    name: "i-step-tabs"
  }
</script>

<style scoped>
  .step-tabs {
    width: 100%;
    height: 100%;
  }

  .step-tabs-content {
    position: relative;
    margin-top: 10px;
    width: 100%;
    height: calc(100% - 40px);
    border: 1px solid #cccccc;
    box-shadow: 0px 1px 2px 1px #dddddd;
  }
</style>
