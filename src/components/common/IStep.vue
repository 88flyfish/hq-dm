<template>
  <div class="step"
       :class="{
          current : currentIdx == index,
          finished : currentIdx > index }"
       :style="{width : width}">
    <div class="step-line-container" :style="{width : index == totalSteps ? '0px' : '100%'}">
      <span class="step-line"></span>
      <span class="step-finished-line" v-if="index != totalSteps"></span>
    </div>
    <div class="step-icon" @click="selectStep">
      <span>{{currentIdx > index ? '&#xebf6;' : index}}</span>
    </div>
    <div class="step-title" @click="selectStep">
      <span>{{title}}</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: "i-step",
    props: {
      title: {
        type: String,
        default: ""
      },
      width: {
        type: String,
        default: "30%"
      },
      canStep: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        index: -1,
        currentIdx: -1,
        totalSteps: -1,
        canSelectStep: this.canStep
      };
    },
    methods: {
      selectStep() {
        this.$emit('stepSelected', this.index);
        if (this.canSelectStep) {
          this.$parent.$emit("update:active", this.index);
        }
      }
    },
    beforeCreate() {
      this.$parent.steps.push(this);
    },
    watch: {
      canStep(newVal) {
        this.canSelectStep = newVal;
      }
    }
  }
</script>

<style scoped>
  .step {
    position: relative;
    display: inline-block;
    font-family: 'Helvetica', '\5FAE\8F6F\96C5\9ED1', Arial, SimSun, sans-serif;
    height: 100%;
  }

  .step-icon {
    cursor: pointer;
    position: absolute;
    top: 0px;
    left: 0px;
    box-sizing: border-box;
    line-height: 26px;
    height: 30px;
    width: 30px;
    border-radius: 50%;
    font-family: iconfont;
    font-size: 16px;
    text-align: center;
    border: 2px solid #c0c4cc;
    color: #c0c4cc;
    background-color: #ffffff;
    -webkit-transition: background-color .6s;
    -moz-transition: background-color .6s;
    -ms-transition: background-color .6s;
    -o-transition: background-color .6s;
    transition: background-color .6s;
  }

  .step.current .step-icon {
    border-color: #409eff;
    color: #303133;
  }

  .step.current .step-title {
    color: #303133;
  }

  .step.finished .step-icon {
    color: #fff;
    border-color: #409eff;
    background-color: #409eff;
  }

  .step-line-container {
    box-sizing: border-box;
    line-height: 30px;
  }

  .step-line {
    width: 100%;
    vertical-align: middle;
    display: inline-block;
    height: 2px;
    background-color: #c0c4cc;
  }

  .step-finished-line {
    width: 0%;
    display: inline-block;
    height: 2px;
    background-color: #409eff;
    position: absolute;
    top: 14px;
    left: 0px;
    -webkit-transition: width .6s;
    -moz-transition: width .6s;
    -ms-transition: width .6s;
    -o-transition: width .6s;
    transition: width .6s;
  }

  .step.finished .step-finished-line {
    width: 100%;
  }

  .step-title {
    cursor: pointer;
    position: absolute;
    font-size: 16px;
    top: 0px;
    left: 30px;
    line-height: 30px;
    padding-left: 5px;
    background-color: #ffffff;
    color: #c0c4cc;
    -webkit-transition: color .6s;
    -moz-transition: color .6s;
    -ms-transition: color .6s;
    -o-transition: color .6s;
    transition: color .6s;
  }

  .step.finished .step-title {
    color: #303133;
  }
</style>
