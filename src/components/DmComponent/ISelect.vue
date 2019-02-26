<template>
    <div class="select-normal"
         :class="[
        disabled ? '' : showPanel ? 'select-normal-focus' : 'select',
        {'disabled': disabled}
      ]"
         :style="{width: width, height: height}"
         @click.stop="show">

        <!-- 文本框 -->
        <input type="text"
               class="select-input"
               :disabled="disabled"
               readonly
               :class="{'disabled': disabled, 'placeholder': value == null || value == '' || value.length == 0}"
               v-model="multiple ? selectLabels : selectLabel">

        <!-- 图标 -->
        <div class="delete-icon"
             @click.stop="clearValue"
             v-show="clear && !disabled"
             v-if="clear && (this.selectLabel.length!==0&&this.selectLabel!=='请选择') ||
                                                            (this.selectLabels.length!==0&&this.selectLabels[0]!=='请选择') ">&#xebf7;</div>
        <div class="select-icon"
             :style="{lineHeight: height}">&#xe313;</div>

        <!-- 下拉面板 -->
        <transition name="fade">
            <div class="select-panel"
                 v-show="showPanel"
                 @click.stop="stopGlobalClick"
                 :style="{height: panelHeight}">
                <ul>
                    <slot></slot>
                </ul>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'i-select',

    provide () {
        return {
            iSelect: this
        };
    },

    props: {
        value: {
            type: [Number, String, Array],
            default: ''
        },

        placeholder: {
            type: String,
            default: '请选择'
        },

        width: {
            type: String,
            default: '220px'
        },

        height: {
            type: String,
            default: '35px'
        },

        panelHeight: {
            type: String,
            default: '180px'
        },

        disabled: {
            type: Boolean,
            default: false
        },

        multiple: {
            type: Boolean,
            default: false
        },

        clear: {
            type: Boolean,
            default: true
        }
    },

    data () {
        return {
            showPanel: false,
            selectLabel: this.placeholder,
            selectLabels: [this.placeholder],
            selectValues: []
        };
    },

    methods: {
        // 显示或隐藏下拉面板
        show () {
            if (!this.disabled) {
                this.showPanel = !this.showPanel;

                if (this.showPanel) {
                    this.$root.bus.$emit('selctClicked', this);
                }
            }
        },

        // 阻止全局关闭事件(点击下拉面板中的空白地方也会收回该面板)
        stopGlobalClick () {
            return false;
        },

        // 全局关闭
        handleClickOut () {
            this.showPanel = false;
        },

        //清空shuju
        clearValue () {
            this.selectLabels = [];
            this.selectLabel = [];
            this.selectValues = [];
            this.$emit('input', '');
        }
    },

    mounted () {
        // 全局关闭
        this.globalClick(this.handleClickOut);
        var that = this;

        this.$root.bus.$on('selctClicked', function (obj) {
            if (obj != that) {
                that.showPanel = false;
            }
        });
    },

    watch: {
        value (newVal) {
            if ('' == newVal || null == newVal || newVal.length == 0) {
                this.selectLabel = this.placeholder;
                this.selectLabels = [this.placeholder];
            }
        }
    }
};
</script>

<style scoped>
.select-normal {
  position: relative;
  display: inline-block;
  border: 1px solid #a9a9a9;
  border-radius: 4px;
  line-height: normal;
  background-color: #ffffff;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.select-input {
  border-radius: 4px;
  outline: none;
  width: calc(100% - 25px);
  border: none;
  height: 100%;
  padding-left: 10px;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB,
    Microsoft YaHei, SimSun, sans-serif;
  color: #606266;
  box-sizing: border-box;
  cursor: pointer;
  font-size: 14px;
}
.select:hover {
  border-color: #c0c4cc;
}
.select-normal-focus {
  border-color: #409eff;
}
.select-panel {
  width: 100%;
  min-width: 120px;
  background-color: #ffffff;
  position: absolute;
  margin-top: 10px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  z-index: 999;
}
.select-panel:before,
.select-panel:after {
  position: absolute;
  content: '';
  width: 10px;
  height: 10px;
  top: -5px;
  left: 20%;
  margin-left: -7px;
  z-index: -1;
  pointer-events: none;
  transform: matrix(0.707, 0.707, -0.707, 0.707, 0, 0);
  -ms-transform: matrix(0.707, 0.707, -0.707, 0.707, 0, 0); /* IE 9 */
  -moz-transform: matrix(0.707, 0.707, -0.707, 0.707, 0, 0); /* Firefox */
  -webkit-transform: matrix(
    0.707,
    0.707,
    -0.707,
    0.707,
    0,
    0
  ); /* Safari and Chrome */
  -o-transform: matrix(0.707, 0.707, -0.707, 0.707, 0, 0);
}
.select-panel:before {
  background-color: #e4e7ed;
}
.select-panel:after {
  top: -4px;
  background-color: #ffffff;
}
.select-panel ul {
  overflow: auto;
  padding: 6px 0px;
  height: 100%;
}
.fade-enter-active,
.fade-leave-active {
  -webkit-transition: opacity 0.2s linear;
  -moz-transition: opacity 0.2s linear;
  -ms-transition: opacity 0.2s linear;
  -o-transition: opacity 0.2s linear;
  transition: opacity 0.2s linear;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.disabled {
  cursor: not-allowed;
  background-color: #f5f7fa;
}
.placeholder {
  color: #a9a9a9;
}
.select-icon {
  font-family: iconfont;
  color: #606266;
  font-size: 24px;
  width: 25px;
  cursor: pointer;
  display: inline-block;
  position: absolute;
  right: 3px;
  top: 0;
}
.delete-icon {
  font-family: iconfont;
  color: #ccc;
  font-size: 18px;
  width: 25px;
  cursor: pointer;
  display: inline-block;
  position: absolute;
  right: 23px;
  top: 6px;
}
</style>
