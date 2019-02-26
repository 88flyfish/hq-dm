<template>
  <span class="normal"
        @click.stop="toggleSwitch"
        :class="checked?'switch-on switch-on-background':'switch-off switch-off-background'">
    <span class="switch-text switch-on-text"
          v-show="checked">
      {{onText}}
    </span>
    <span class="switch-text switch-off-text"
          v-show="!checked">
      {{offText}}
    </span>
  </span>
</template>

<script>
export default {
  name: "i-switch",
  props: {
    value: {
      type: Boolean,
      default: true
    },
    onText: {
      type: String,
      default: "开"
    },
    offText: {
      type: String,
      default: "关"
    }
  },
  data () {
    return {
      checked: this.value
    }
  },
  methods: {
    toggleSwitch () {
      this.checked = !this.checked;
      this.$emit("input", this.checked);
      this.$emit("change", this.checked);
    }
  },
  watch: {
    "value": function (newValue) {
      this.checked = newValue;
    }
  },
}
</script>

<style scoped>
.normal {
  display: inline-block;
  width: 44px;
  height: 24px;
  border-radius: 24px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  line-height: 22px;
  vertical-align: middle;
  position: relative;
}
.normal:before {
  content: "";
  width: 20px;
  border-radius: 50%;
  background-color: #ffffff;
  cursor: pointer;
  position: absolute;
  bottom: 1px;
  top: 1px;
}
.switch-on:before {
  right: 1px;
}
.switch-on-background {
  background: #5cadff;
  /* background: #20a0ff; */
}
.switch-text {
  position: absolute;
  font-size: 14px;
  color: #ffffff;
  line-height: 24px;
  font-weight: bold;
}
.switch-on-text {
  left: 5px;
}
.switch-off-text {
  right: 5px;
}
.switch-off:before {
  left: 1px;
}
.switch-off-background {
  background: lightgray;
}
</style>
