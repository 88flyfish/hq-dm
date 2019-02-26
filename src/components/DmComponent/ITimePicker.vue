<template>
  <section class="time-normal" @click.stop="slideTime($event)" :style="{width: width, height: height}">
    <!-- 时间显示文本框 -->
    <input type="text" class="time-input" :disabled="disabled"
           :class="[
              {'disabled':disabled},
              disabled ? '' : showPanel ? 'time-input-focus' : 'time-input-hover',
           ]"
           readonly placeholder="请选择时间" v-model="timeValue">

    <!-- 时间图标 -->
    <span class="time-icon" :style="{lineHeight: height}"></span>

    <!-- 时间选择面板 -->
    <transition name="fade" @enter="enterTime">
      <div class="time-panel" v-if="showPanel" @click.stop="function() {return false;}">
        <div class="time-scroll">

          <!-- 选择小时 -->
          <div class="time-out-box">
            <div class="time-box" id="hour" @scroll.passive="timePicker($event, 'hour')">
              <ul class="time">
                <li v-for="item in hours" :key="item.value" @click.stop="clickPicker(item.value, 'hour')"
                    :class="{'selected':item.selected, 'time-not-now':item.value != hour}">
                  {{item.value}}
                </li>
              </ul>
            </div>
          </div>

          <!-- 选择分钟 -->
          <div class="time-out-box">
            <div class="time-box" id="minute" @scroll.passive="timePicker($event, 'minute')">
              <ul class="time">
                <li v-for="item in minutes" :key="item.value" @click.stop="clickPicker(item.value, 'minute')"
                    :class="{'selected':item.selected, 'time-not-now':item.value != minute}">
                  {{item.value}}
                </li>
              </ul>
            </div>
          </div>

          <!-- 选择秒 -->
          <div class="time-out-box">
            <div class="time-box" id="second" @scroll.passive="timePicker($event, 'second')">
              <ul class="time">
                <li v-for="item in seconds" :key="item.value" @click.stop="clickPicker(item.value, 'second')"
                    :class="{'selected':item.selected, 'time-not-now':item.value != second}">
                  {{item.value}}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 用户参照线 -->
        <div class="flag-line"></div>

        <!-- 操作按钮 -->
        <div class="time-toolbar">
          <button type="button" class="time-toolbar-confirm" @click.stop="confirm">确定</button>
          <button type="button" class="time-toolbar-cancel" @click.stop="cancel">取消</button>
        </div>
      </div>
    </transition>
  </section>
</template>

<script>
  export default {
    name: "i-time-picker",
    props: {
      value: String,

      disabled: {
        type: Boolean,
        default: false
      },

      width:{
        type: String,
        default: "200px"
      },

      height: {
        type: String,
        default: "35px"
      }
    },
    data() {
      return {
        showPanel: false,
        hours: [],
        minutes: [],
        seconds: [],
        hour: "",
        minute: "",
        second: "",
        timer: null, // 定时器
        temp: {
          hour: "",
          minute: "",
          second: ""
        }
      }
    },
    methods: {
      // 初始选中时间
      enterTime() {
        if ("" != this.hour && "" != this.minute && "" != this.second) {
          document.getElementById("hour").scrollTop = this.hour * 36;
          document.getElementById("minute").scrollTop = this.minute * 36;
          document.getElementById("second").scrollTop = this.second * 36;
        }
      },
      // 展开或收起时间选择面板
      slideTime(event) {
        if (!this.disabled) {
          this.hours = [];
          this.minutes = [];
          this.seconds = [];
          // 填充小时
          for (let i = 0; i < 24; i++) {
            this.hours.push({
              value: i < 10 ? `0${i}`:i.toString(),
              selected: this.hour == (i < 10 ? `0${i}`:i.toString())
            });
          }
          // 填充分钟和秒
          for (let i = 0; i < 60; i++) {
            this.minutes.push({
              value: i < 10 ? `0${i}`:i.toString(),
              selected: this.minute == (i < 10 ? `0${i}`:i.toString())
            });

            this.seconds.push({
              value: i < 10 ? `0${i}`:i.toString(),
              selected: this.second == (i < 10 ? `0${i}`:i.toString())
            });
          }
          this.showPanel = !this.showPanel;
        }
      },

      // 滚动选择时间
      timePicker(event, flag) {
        let element = event.srcElement ? event.srcElement : event.target;

        if (null != this.timer) {
          clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
          let count = Math.floor(element.scrollTop / 36);
          let remainder = element.scrollTop % 36;
          if (remainder >= 18) {
            count ++;
          }
          element.scrollTop = count * 36;
          switch (flag) {
            case "hour":
              this.hours.forEach(hour => {
                hour.selected = false;
              });
              this.hours[count].selected = true;
              this.hour = this.hours[count].value;
              break;
            case "minute":
              this.minutes.forEach(minute => {
                minute.selected = false;
              });
              this.minutes[count].selected = true;
              this.minute = this.minutes[count].value;
              break;
            case "second":
              this.seconds.forEach(second => {
                second.selected = false;
              });
              this.seconds[count].selected = true;
              this.second = this.seconds[count].value;
              break;
          }
        },150);
      },

      // 点击选择时间
      clickPicker(value, flag) {
        switch (flag) {
          case "hour":
            this.hour = value;
            document.getElementById("hour").scrollTop = parseInt(value) * 36;
            break;
          case "minute":
            this.minute = value;
            document.getElementById("minute").scrollTop = parseInt(value) * 36;
            break;
          case "second":
            this.second = value;
            document.getElementById("second").scrollTop = parseInt(value) * 36;
            break;
        }
      },

      // 确定
      confirm() {
        this.temp.hour = this.hour;
        this.temp.minute = this.minute;
        this.temp.second = this.second;
        this.showPanel = false;
      },

      // 取消
      cancel() {
        this.showPanel = false;
        this.hour = this.temp.hour;
        this.minute = this.temp.minute;
        this.second = this.temp.second;
      },

      // 全局关闭事件
      handleClickOut() {
        this.temp.hour = this.hour;
        this.temp.minute = this.minute;
        this.temp.second = this.second;
        this.showPanel = false;
      }
    },
    computed: {
      timeValue: {
        get() {
          if ("" != this.hour && "" != this.minute && "" != this.second) {
            return `${this.hour}:${this.minute}:${this.second}`;
          }
        },
        set() {

        }
      }
    },
    watch: {
      value(){
        if ("" != this.value && typeof this.value != "undefined") {
          let time = this.value.split(":");
          this.hour = time[0];
          this.minute = time[1];
          this.second = time[2];
        }
      },
      timeValue(newValue) {
        this.$emit("input", newValue);
      }
    },
    mounted() {
      this.globalClick(this.handleClickOut);

      // 默认时间
      if (typeof this.value != 'undefined' && "" != this.value) {
        let str = this.value.split(':');
        this.hour = str[0];
        this.minute = str[1];
        this.second = str[2];

        // 临时变量记录，取消时用
        this.temp.hour = str[0];
        this.temp.minute = str[1];
        this.temp.second = str[2];
      }
    }
  }
</script>

<style scoped>
  .time-normal {
    position: relative;
    display: inline-block;
    line-height: normal;
  }
  .time-input {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    padding-left: 25px;
    cursor: text;
    color: #606266;
    font-family: Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif;
    font-size: 14px;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  }
  .time-input-hover:hover {
    border-color: #c0c4cc;
  }
  .time-input-focus {
    border-color: #409EFF;
  }
  .time-icon {
    font-family: iconfont;
    text-align: center;
    position: absolute;
    top: 0;
    left: 0;
    color: #c0c4cc;
    font-size: 12pt;
    display: inline-block;
    width: 25px;
    height: 100%;
  }
  .time-icon:before {
    content: "\e735";
  }
  .time-panel {
    width: 200px;
    height: 224px;
    position: absolute;
    background-color: #ffffff;
    margin-top: 8px;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    z-index: 99;
  }
  .time-scroll {
    width: 100%;
    height: 188px;
  }
  .time-out-box {
    width: 33.3%;
    overflow: hidden;
    float: left;
    height: 100%;
  }
  .time-box {
    float: left;
    overflow: auto;
    height: 100%;
    width: 95px;
  }
  .time-box:before, .time-box:after {
    content: "";
    height: 80px;
    width: 33.3%;
    display: block;
  }
  .time {
    color: #606266;
  }
  .time li {
    width: 66px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    font-size: 12px;
    font-family: Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif;
  }
  .time-not-now:hover {
    background-color: #F5F7FA;
    cursor: pointer;
  }
  .flag-line {
    position: absolute;
    width: 80%;
    height: 36px;
    top: 79px;
    left: 10%;
    border-top: 1px solid lightgray;
    border-bottom: 1px solid lightgray;
    z-index: -1;
  }
  .fade-enter-active, .fade-leave-active {
    -webkit-transition: opacity .3s linear;
    -moz-transition: opacity .3s linear;
    -ms-transition: opacity .3s linear;
    -o-transition: opacity .3s linear;
    transition: opacity .3s linear;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
  ::-webkit-scrollbar {
    display: none;
  }
  .time-panel:before, .time-panel:after {
    position: absolute;
    content: '';
    width: 10px;
    height: 10px;
    top: -5px;
    left: 28%;
    margin-left: -7px;
    pointer-events:none;
    z-index: -1;
    transform: matrix(0.707, 0.707, -0.707, 0.707, 0, 0);
    -ms-transform: matrix(0.707, 0.707, -0.707, 0.707, 0, 0);		/* IE 9 */
    -moz-transform: matrix(0.707, 0.707, -0.707, 0.707, 0, 0);	/* Firefox */
    -webkit-transform: matrix(0.707, 0.707, -0.707, 0.707, 0, 0);	/* Safari and Chrome */
    -o-transform: matrix(0.707, 0.707, -0.707, 0.707, 0, 0);
  }
  .time-panel:before {
    background: #E4E7ED;
  }
  .time-panel:after {
    top: -4px;
    background-color: #ffffff;
  }
  .time-toolbar {
    height: 36px;
    width: 100%;
    border-top: 1px solid #DDDDDD;
    border-radius: 0px 0px 4px 4px;
  }
  .time-toolbar-confirm, .time-toolbar-cancel {
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    float: right;
    margin-top: 5px;
    margin-right: 6px;
    font-size: 12px;
  }
  .time-toolbar-confirm {
    padding: 4px 6px;
    border: none;
    background-color: #5cadff;
    color: #ffffff;
  }
  .time-toolbar-confirm:hover {
    opacity: .65;
    filter: Alpha(opacity=65);
  }
  .time-toolbar-cancel {
    padding: 3.5px 6px;
    border: 1px solid #E1E1E1;
    background-color: #ffffff;
  }
  .time-toolbar-cancel:hover{
    background-color: #ECF5FF;
    color: #409EFF;
  }
  .disabled {
    cursor: not-allowed;
    background-color: #F5F7FA;
    color: #A9A9A9;
  }
  .selected {
    color: #303133;
    font-weight: 700;
  }
</style>
