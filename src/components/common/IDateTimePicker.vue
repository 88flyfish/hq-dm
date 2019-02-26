<template>
  <div
    class="datetime-normal"
    :style="{width: width, height: height}"
    @click.stop="show">

    <!-- 文本框 -->
    <input
      type="text"
      class="datetime-input"
      :placeholder="placeholder"
      :disabled="disabled"
      readonly
      v-model="dateTimeValue"
      :class="[
        {'disabled':disabled},
        disabled ? '' : highlight ? 'datetime-input-focus' : 'datetime-input-hover',
      ]"
    />

    <!-- 图标 -->
    <div class="datetime-icon" :style="{lineHeight: height}"></div>

    <transition-group name="fade">
      <!-- 日期选择面板 -->
      <div
        v-if="showPanel.date"
        class="datetime-panel datetime-panel-date"
        key="datetime-date"
        @click.stop="defaultClickOut">

        <!-- 头部 -->
        <div class="datetime-panel-header">
          <div>
            <!-- 上一年 -->
            <span
              class="arrow-prev-year"
              @click.stop="arrowYear('prev')">
            </span>

            <!-- 上一月 -->
            <span
              class="arrow-prev-month"
              style="margin-left: 8px;"
              @click.stop="arrowMonth('prev')">
            </span>
          </div>
          <div>
            <span
              @click.stop="showYearList">
              {{datetime.year}}年
            </span>
            <span
              style="margin-left: 8px;"
              @click.stop="showMonthList">
              {{datetime.month}}月
            </span>
          </div>
          <div>
            <!-- 下一月 -->
            <span
              class="arrow-next-month"
              style="margin-right: 8px;"
              @click.stop="arrowMonth('next')">
            </span>

            <!-- 下一年 -->
            <span
              class="arrow-next-year"
              @click.stop="arrowYear('next')">
            </span>
          </div>
        </div>

        <!-- 周 -->
        <div class="datetime-panel-week">
          <ul>
            <li
              v-for="week in weekList"
              :key="week"
              v-text="week">
            </li>
          </ul>
        </div>

        <!-- 日期 -->
        <div class="datetime-panel-date-list">
          <ul>
            <li v-for="item in dateList">
              <span
                v-text="item.value"
                :class="{
                  'today': item.today,
                  'not-currentMonth-date': !item.currentMonth,
                  'currentMonth-date': item.currentMonth && !item.dateSelected,
                  'date-selected': item.dateSelected
                }"
                @click.stop="pickerDate(item)">
              </span>
            </li>
          </ul>
        </div>

        <!-- 时间选择 -->
        <div
          v-if="type == 'datetime'"
          class="datetime-panel-toolbar">
          <div style="margin-left: 10px; margin-top: 8px; display: inline-block;">
            <i-time-picker v-model="timeValue" width="145px" height="32px"></i-time-picker>
          </div>
          <div style="display: inline-block; margin-left: 54px;">
            <button
              type="button"
              class="now"
              @click.stop="now">
              此刻
            </button>
            <button
              type="button"
              class="confirm"
              @click.stop="confirm">
              确定
            </button>
          </div>
        </div>
      </div>

      <!-- 年份选择面板 -->
      <div
        v-if="showPanel.year"
        class="datetime-panel datetime-panel-year"
        key="datetime-year"
        @click.stop="defaultClickOut">

        <!-- 头部 -->
        <div class="datetime-panel-header">
          <div>
            <span
              class="arrow-prev-year"
              @click.stop="arrowYearList('prev')">
            </span>
          </div>
          <div>
            <span>{{yearStart}}年 - {{yearEnd}}年</span>
          </div>
          <div>
            <span
              class="arrow-next-year"
              @click.stop="arrowYearList('next')">
            </span>
          </div>
        </div>

        <!--年份列表-->
        <div class="datetime-panel-year-list">
          <ul>
            <li v-for="item in yearList">
              <span
                v-text="item"
                :class="{'year-month-selected': datetime.valueYear == item}"
                @click.stop="pickerYear(item)">
              </span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 月份选择面板 -->
      <div
        v-if="showPanel.month"
        class="datetime-panel datetime-panel-month"
        key="datetime-month"
        @click.stop="defaultClickOut">
        <!-- 头部 -->
        <div class="datetime-panel-header">
          <div>
            <span
              class="arrow-prev-year"
              @click.stop="arrowYear('prev')">
            </span>
          </div>
          <div>
            <span @click.stop="showYearList">{{datetime.year}}年</span>
          </div>
          <div>
            <span
              class="arrow-next-year"
              @click.stop="arrowYear('next')">
            </span>
          </div>
        </div>

        <!--月份列表-->
        <div class="datetime-panel-month-list">
          <ul>
            <li v-for="item in monthList">
              <span
                v-text="item.label"
                :class="{'year-month-selected': datetime.month == item.value && datetime.valueYear == datetime.year}"
                @click.stop="pickerMonth(item.value)">
              </span>
            </li>
          </ul>
        </div>
      </div>

    </transition-group>

  </div>
</template>

<script>
  import ITimePicker from './ITimePicker'
  import IButton from "./IButton";

    export default {
      name: "i-datetime-picker",

      props: {
        value: {
          type: String,
          default: ""
        },

        type: {
          type: String,
          default: "date"
        },

        width: {
          type: String,
          default: "220px"
        },

        height: {
          type: String,
          default: "35px"
        },

        disabled: {
          type: Boolean,
          default: false
        }
      },

      data() {
        return {
          placeholder: this.type == 'datetime' ? '请选择日期时间' : '请选择日期',
          showPanel: {
            year: false,
            month: false,
            date: false
          },
          weekList: ['日','一','二','三','四','五','六'],
          monthList:[
            {value: 1, label: "一月"},{value: 2, label: "二月"},{value: 3, label: "三月"},
            {value: 4, label: "四月"},{value: 5, label: "五月"},{value: 6, label: "六月"},
            {value: 7, label: "七月"},{value: 8, label: "八月"},{value: 9, label: "九月"},
            {value: 10, label: "十月"},{value: 11, label: "十一月"},{value: 12, label: "十二月"},
          ],
          datetime: {
            year: "",
            month: "",
            date: "",
            valueYear: "",
            valueMonth: "",
            valueDate: ""
          },
          yearStart: "",
          yearEnd: "",
          timeValue: "",
          dateTimeValue: this.value
        }
      },

      methods: {
        // 显示面板并初始化数据
        show() {
          if (!this.disabled) {
            if ("" == this.dateTimeValue || null == this.dateTimeValue) {
              let now = new Date();
              this.datetime.year = now.getFullYear();
              this.datetime.month = now.getMonth() + 1;
              this.datetime.date = now.getDate();
            } else {
              let date = this.dateTimeValue.split(" ")[0].split("-");
              this.datetime.year = this.datetime.valueYear = date[0];
              this.datetime.month = this.datetime.valueMonth = parseInt(date[1]);
              this.datetime.date = this.datetime.valueDate = date[2];
              if ("datetime" == this.type) {
                this.timeValue = this.dateTimeValue.split(" ")[1];
              }
            }

            if (!this.showPanel.year && !this.showPanel.month) {
              this.showPanel.date = !this.showPanel.date;
            }
          }
        },

        // 上/下一年
        arrowYear(flag) {
          if ("prev" == flag) {
            this.datetime.year--;
          }
          if ("next" == flag) {
            this.datetime.year++;
          }
        },

        // 上/下一月
        arrowMonth(flag) {
          if ("prev" == flag) {
            if (this.datetime.month == 1) {
              this.datetime.year-- ;
              this.datetime.month = 12;
            } else {
              this.datetime.month--;
            }
          }
          if ("next" == flag) {
            if (this.datetime.month == 12) {
              this.datetime.year++;
              this.datetime.month = 1;
            } else {
              this.datetime.month++;
            }
          }
        },

        showPanelFlag(yearFlag, monthFlag, dateFlag) {
          this.showPanel = {
            year: yearFlag,
            month: monthFlag,
            date: dateFlag
          }
        },

        // 显示年份列表
        showYearList() {
          this.showPanelFlag(true, false, false);
        },

        // 显示月份列表
        showMonthList() {
          this.showPanelFlag(false, true, false);
        },

        // 年份选择列表
        arrowYearList(flag) {
          if ("prev" == flag) {
            this.yearStart -= 10;
          }
          if ("next" == flag) {
            this.yearStart += 10;
          }
        },

        // 选择年份
        pickerYear(value) {
          this.datetime.year = value;
          this.showPanelFlag(false, true, false);
        },

        // 选择月份
        pickerMonth(value) {
          this.datetime.month = value;
          this.showPanelFlag(false, false, true);
        },

        // 选则日期
        pickerDate(item) {
          // 如果是当前面板的上个月
          if (item.prevMonth) {
            if (this.datetime.month == 1) {
              this.datetime.year-- ;
              this.datetime.month = 12;
            } else {
              this.datetime.month--;
            }
          }
          // 如果是当前面板的下个月
          if (item.nextMonth) {
            if (this.datetime.month == 12) {
              this.datetime.year++ ;
              this.datetime.month = 1;
            } else {
              this.datetime.month++;
            }
          }
          this.datetime.date = item.value;
          let month = this.datetime.month < 10 ? `0${parseInt(this.datetime.month)}` : this.datetime.month;
          if (this.datetime.date < 10) {
            this.datetime.date = `0${this.datetime.date}`;
          }
          if ("date" == this.type) {
            this.dateTimeValue = `${this.datetime.year}-${month}-${this.datetime.date}`;
            this.showPanelFlag(false, false, false);
          } else {
            if ("" == this.timeValue || null == this.timeValue) {
              this.timeValue = "00:00:00";
            }
            this.datetime.valueYear = this.datetime.year;
            this.datetime.valueMonth = this.datetime.month;
            this.datetime.valueDate = this.datetime.date;
            this.dateTimeValue = `${this.datetime.year}-${month}-${this.datetime.date} ${this.timeValue}`;
          }
        },

        // 确定
        confirm() {
          this.showPanelFlag(false, false, false);
        },

        // 格式化当前时间
        formatNowTime() {
          let date = new Date();
          let year = date.getFullYear();
          let month = (date.getMonth() + 1) >= 10 ? date.getMonth() : `0${date.getMonth() + 1}`;
          let day = (date.getDate()) >= 10 ? date.getDate() : `0${date.getDate()}`;
          let hour = (date.getHours()) >= 10 ? date.getHours() : `0${date.getHours()}`;
          let minute = (date.getMinutes()) >= 10 ? date.getMinutes() : `0${date.getMinutes()}`;
          let second = (date.getSeconds()) >= 10 ? date.getSeconds() : `0${date.getSeconds()}`;
          return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
        },

        // 此刻
        now() {
          this.dateTimeValue = this.formatNowTime();
          this.showPanelFlag(false, false, false);
        },

        // 阻止全局关闭事件影响
        defaultClickOut() {
          return false;
        },

        // 全局关闭事件
        handleClickOut() {
          this.showPanelFlag(false, false, false);
          this.yearStart = "";
        }
      },

      computed: {
        // 面板显示文本框高亮
        highlight() {
          return this.showPanel.year || this.showPanel.month || this.showPanel.date;
        },

        // 渲染日期
        dateList() {
          let now = new Date();
          let currentYear = now.getFullYear();
          let currentMonth = now.getMonth() + 1;
          let currentDay = now.getDate();
          // 计算月份总天数
          let currentMonthTotalDay = new Date(this.datetime.year, this.datetime.month, 0).getDate();
          let dateList = Array.from({length: currentMonthTotalDay}, (value, index) => {
            return {
              value: index + 1,
              currentMonth: true,
              today: this.datetime.year == currentYear && this.datetime.month == currentMonth && currentDay == index + 1,
              dateSelected: this.datetime.year == this.datetime.valueYear && this.datetime.month == this.datetime.valueMonth && this.datetime.valueDate == index + 1
            }
          });
          // 计算当月第一天是星期几,确定在一号前要插入多少天
          let currentMonthStartWeek = new Date(this.datetime.year, this.datetime.month - 1, 1).getDay();

          // 计算上一个月总天数
          let prevMonthTotalDay = new Date(this.datetime.year, this.datetime.month - 1, 0).getDate();

          // 计算上个月最后一天是星期几
          let prevMonthLastWeek = new Date(this.datetime.year, this.datetime.month - 1, 0).getDay();

          // 在一号前插入上个月日期
          if (currentMonthStartWeek != 0) {
            for (let i = 0; i < currentMonthStartWeek; i++) {
              dateList = [{value: prevMonthTotalDay - i, prevMonth: true}, ...dateList];
            }
          } else {
            // 如果第一天是星期天
            for (let i = 6; i >= 0; i--) {
              dateList = [{value: prevMonthTotalDay - prevMonthLastWeek + i, prevMonth: true}, ...dateList];
            }
          }

          // 补全剩余位置
          for (let i = 0, item = 1; i < 42; i++, item++) {
            if (dateList.length < 42) {
              dateList[dateList.length] = {value: item, nextMonth: true};
            }
          }
          return dateList;
        },

        // 渲染年份列表，列表显示10年
        yearList() {
          let yearList = new Array();
          // 开始年份
          if ("" == this.yearStart) {
            this.yearStart = this.datetime.year - this.datetime.year % 10;
          }
          for (let i = 0; i < 10; i++) {
            yearList[i] = this.yearStart + i;
          }
          this.yearEnd = yearList[9];
          return yearList;
        }
      },

      mounted() {
        // 全局关闭面板
        this.globalClick(this.handleClickOut);
      },

      watch:{
        value(newVal) {
          this.dateTimeValue = newVal;
        },
        dateTimeValue(newVal) {
          this.$emit("input", newVal);
        },
        timeValue(newVal) {
          this.dateTimeValue = `${this.dateTimeValue.split(" ")[0]} ${newVal}`;
        }
      },

      components: {
        IButton,
        ITimePicker
      }
    }
</script>

<style scoped>
  .datetime-normal {
    position: relative;
    display: inline-block;
    font-family: Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    line-height: normal;
  }
  .datetime-input {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    padding-left: 25px;
    cursor: text;
    color: #606266;
    font-size: 14px;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  }
  .datetime-input-hover:hover {
    border-color: #c0c4cc;
  }
  .datetime-input-focus {
    border-color: #409EFF;
  }
  .datetime-icon {
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
  .datetime-icon:before {
    content: "\e915";
  }
  .datetime-panel {
    width: 322px;
    position: absolute;
    background-color: #ffffff;
    margin-top: 8px;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    z-index: 99;
    color: #606266;
  }
  .datetime-panel:before, .datetime-panel:after {
    position: absolute;
    content: '';
    width: 10px;
    height: 10px;
    top: -5px;
    left: 20%;
    margin-left: -7px;
    z-index: -1;
    pointer-events:none;
    transform: matrix(0.707, 0.707, -0.707, 0.707, 0, 0);
    -ms-transform: matrix(0.707, 0.707, -0.707, 0.707, 0, 0);		/* IE 9 */
    -moz-transform: matrix(0.707, 0.707, -0.707, 0.707, 0, 0);	/* Firefox */
    -webkit-transform: matrix(0.707, 0.707, -0.707, 0.707, 0, 0);	/* Safari and Chrome */
    -o-transform: matrix(0.707, 0.707, -0.707, 0.707, 0, 0);
  }
  .datetime-panel:before {
    background-color: #E4E7ED;
  }
  .datetime-panel:after {
    top: -4px;
    background-color: #ffffff;
  }
  .datetime-panel-date {
    height: 350px;
  }
  .datetime-panel-year, .datetime-panel-month {
    height: 280px;
  }
  .datetime-panel-header{
    font-family: iconfont;
    margin: auto;
    width: 290px;
    height: 52px;
    line-height: 52px;
  }
  .datetime-panel-header > div {
    display: inline-block;
    font-size: 16px;
  }
  .datetime-panel-header span:hover {
    cursor: pointer;
    color: #63AFFF;
  }
  .datetime-panel-header > div:first-child {
    width: 25%;
    text-align: left;
  }
  .datetime-panel-header > div:nth-child(2) {
    width: 50%;
    text-align: center;
  }
  .datetime-panel-header > div:last-child {
    width: 25%;
    text-align: right;
  }
  .arrow-prev-year:before {
    content: "\e93e";
  }
  .arrow-prev-month:before {
    content: "\e940";
  }
  .arrow-next-year:before {
    content: "\e93f"
  }
  .arrow-next-month:before {
    content: "\e94d";
  }
  .datetime-panel-date-list, .datetime-panel-week {
    width: 290px;
    margin: auto;
    color: #606266;
  }
  .datetime-panel-week {
    height: 40px;
    border-bottom: 1px solid #EBEEF5;
  }
  .datetime-panel-date-list {
    height: 240px;
    margin-top: 2px;
  }
  .datetime-panel-date-list ul, .datetime-panel-week ul {
    width: 100%;
    height: 100%;
  }
  .datetime-panel-date-list > ul > li, .datetime-panel-week > ul > li {
    float: left;
    width: 41.4px;
    height: 40px;
    font-size: 12px;
    text-align: center;
    line-height: 40px;
    color: #606266;
  }
  .datetime-panel-date-list span {
    cursor: pointer;
    border-radius: 50%;
    line-height: 32px;
    width: 32px;
    height: 32px;
    display: inline-block
  }
  .today {
    color: #40AAFF;
    font-weight: bolder;
  }
  .currentMonth-date:hover {
    color: #409EFF;
  }
  .not-currentMonth-date {
    color: #c0c4cc;
  }
  .date-selected {
    color: #ffffff;
    background-color: #63AFFF;
    border-radius: 50%;
  }
  .datetime-panel-year-list, .datetime-panel-month-list {
    width: 92%;
    margin: auto;
    height: 218px;
    border-top: 1px solid #EBEEF5;
  }
  .datetime-panel-year-list ul, .datetime-panel-month-list ul {
    width: 100%;
    height: 100%;
  }
  .datetime-panel-year-list > ul > li, .datetime-panel-month-list > ul > li {
    float: left;
    width: 73px;
    height: 72px;
    line-height: 72px;
    text-align: center;
    font-size: 12px;
  }
  .datetime-panel-year-list span:hover, .datetime-panel-month-list span:hover {
    cursor: pointer;
    color: #63AFFF;
  }
  .year-month-selected {
    color: #63AFFF;
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
  .disabled {
    cursor: not-allowed;
    background-color: #F5F7FA;
    color: #A9A9A9;
  }
  .datetime-panel-toolbar {
    width: 322px;
    height: 50px;
    border: 1px solid #EBEEF5;
    border-top: 1px solid #E4E4E4;
    background-color: #ffffff;
    margin-top: 10px;
    margin-left: -1px;
    border-radius: 0px 0px 4px 4px;
  }
  .confirm {
    border: 1px solid #dcdfe6;
    color: #606266;
    margin-left: 6px;
    padding: 5px;
    width: 50px;
    background-color: #fff;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    font-size: 12px;
  }
  .confirm:hover {
    border: 1px solid #409EFF;
    color: #409EFF;
  }
  .now {
    border: none;
    color: #409EFF;
    cursor: pointer;
    background-color: #ffffff;
    font-weight: 500;
    font-size: 12px;
  }
  .now:hover {
    opacity: 0.8;
  }
</style>
