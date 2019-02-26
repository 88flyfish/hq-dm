<template>
  <button
    @click="handleClick"
    :class="[
      type ? 'button-' + type : '',
      {
        'is-disabled' : buttonDisabled,
        'is-plain' : plain,
        'is-round' : round,
        'is-circle' : circle
      }
    ]">
    <slot></slot>
  </button>
</template>

<script>
  export default {
    props: {
      type: {
        type: String,
        default: "default"
      },
      disabled: Boolean,
      plain: Boolean,
      round: Boolean,
      circle: Boolean
    },
    computed: {
      buttonDisabled() {
        return this.disabled;
      }
    },
    methods: {
      handleClick(evt) {
        if (!this.disabled) {
          this.$emit('click', evt);
        }
      }
    },
    name: "i-button"
  }
</script>

<style scoped>
  button {
    font-family: "\5FAE\8F6F\96C5\9ED1";
    -webkit-transition: 0.6s;
    -moz-transition: 0.6s;
    -ms-transition: 0.6s;
    -o-transition: 0.6s;
    transition: 0.6s;
    outline: none;
    line-height: 25px;
    padding: 2px 15px;
    cursor: pointer;
    font-size: 14px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
  }

  .button-default {
    color: #606266;
    background-color: #ffffff;
  }

  .button-default:focus, .button-default:hover {
    color: #409eff;
    border-color: #c6e2ff;
    background-color: #ecf5ff;
  }

  .button-primary {
    background-color: #409eff;
    border-color: #409eff;
    color: #ffffff;
  }

  .button-primary:focus, .button-primary:hover {
    background-color: #66b1ff;
  }

   .button-blue {
    background-color: #00a0e9;;
    border-color: #00a0e9;
    color: #ffffff;
    width:100px!important;
    box-sizing: border-box;
    border-radius: 3px!important;
    font-size: 11pt;
  }

  .button-blue:focus, .button-blue:hover {
    background-color: #0374d0;
  } 

  .button-success {
    background-color: #67c23a;
    border-color: #67c23a;
    color: #ffffff;
  }

  .button-success:focus, .button-success:hover {
    background-color: #85ce61;
  }

  .button-info {
    background-color: #909399;
    border-color: #909399;
    color: #ffffff;
  }

  .button-info:focus, .button-info:hover {
    background-color: #a6a9ad;
  }

  .button-warning {
    background-color: #e6a23c;
    border-color: #e6a23c;
    color: #ffffff;
  }

  .button-warning:focus, .button-warning:hover {
    background-color: #ebb563;
  }

  .button-danger {
    background-color: #f56c6c;
    border-color: #f56c6c;
    color: #ffffff;
  }

  .button-danger:focus, .button-danger:hover {
    background-color: #f78989;
  }

  .is-disabled {
    cursor: not-allowed;
    background-color: #ebeef5 !important;
    color: #909399 !important;
    border-color: #909399 !important;
  }

  .is-round {
    border-radius: 20px;
  }

  .button-default.is-plain {
    background-color: #ffffff;
  }

  .button-default.is-plain:focus, .button-default.is-plain:hover {
    border-color: #409eff;
  }

  .button-primary.is-plain {
    color: #409eff;
    background: #ecf5ff;
    border-color: #b3d8ff;
  }

  .button-primary.is-plain:focus, .button-primary.is-plain:hover {
    background: #409eff;
    border-color: #409eff;
    color: #fff;
  }

  .button-success.is-plain {
    color: #67c23a;
    background: #f0f9eb;
    border-color: #c2e7b0;
  }

  .button-success.is-plain:focus, .button-success.is-plain:hover {
    background: #67c23a;
    border-color: #67c23a;
    color: #fff;
  }

  .button-info.is-plain {
    color: #909399;
    background: #f4f4f5;
    border-color: #d3d4d6;
  }

  .button-info.is-plain:focus, .button-info.is-plain:hover {
    background: #909399;
    border-color: #909399;
    color: #fff;
  }

  .button-warning.is-plain {
    color: #e6a23c;
    background: #fdf6ec;
    border-color: #f5dab1;
  }

  .button-warning.is-plain:focus, .button-warning.is-plain:hover {
    background: #e6a23c;
    border-color: #e6a23c;
    color: #fff;
  }

  .button-danger.is-plain {
    color: #f56c6c;
    background: #fef0f0;
    border-color: #fbc4c4;
  }

  .button-danger.is-plain:focus, .button-danger.is-plain:hover {
    background: #f56c6c;
    border-color: #f56c6c;
    color: #fff;
  }
</style>
