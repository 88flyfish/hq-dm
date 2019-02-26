<template>
  <div class="steps">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    props: {
      active: {
        type: Number,
        default: 1
      }
    },
    data() {
      return {
        steps: []
      };
    },
    watch: {
      active(newVal, oldVal) {
        this.$emit('change', newVal, oldVal);

        this.steps.forEach((child) => {
          child.currentIdx = newVal;
        });
      },
      steps(steps) {
        steps.forEach((child, index) => {
          child.index = index + 1;
          child.currentIdx = this.active;
          child.totalSteps = this.steps.length;
        });
      }
    },
    components: {},
    name: "i-steps"
  }
</script>

<style scoped>
  .steps {
    width: 100%;
    font-size: 0pt;
    height: 30px;
  }
</style>
