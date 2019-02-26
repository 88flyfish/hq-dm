<template lang="html">
  <div class="date">
    <div class="dateInput">
      <span class="iconDate">&#xe915;</span>
      <input type="text" v-model="value" readonly="true" @click="showDay" placeholder="请选择日期">
      <div class="timeInput" v-if=" type==='dateTime'"  @click="showDay">
        <div class="timeSpan">
          <!--<span>{{date.hours==0?'00':date.hours}}</span>-->
          <!--<span>{{date.minutes==0?'00':date.minutes}}</span>-->
          <!--<span style="margin-left: -3px;">{{date.seconds==0?'00':date.seconds}}</span>-->
          <span>{{date.hours==0?'00':date.hours}}</span>
          <span>{{date.minutes==0?'00':date.minutes}}</span>
          <span style="margin-left: -3px;">{{date.seconds==0?'00':date.seconds}}</span>
        </div>
      </div>

    </div>
    <transition-group name="fade">
      <!-- 日期选择面板 -->
      <div class="datePanel" v-if="show.day" key="day" :class="{'noDateTime':type!='dateTime'}">
        <div class="dateHeader" @click="closeTime">
          <div>
            <span class="arrow-left " @click="prevYear">&#xe93e;</span>
            <span class="arrow-left left" @click="prevMonth">&#xe940;</span>
          </div>
          <div>
            <span class="title"><span class="year-date" @click="showYear">{{year}}年</span><span class="month-title"
                                                                                                @click="showMohth">{{month}}月</span></span>
          </div>
          <div>
            <span class="arrow-right right" @click="nextMonth">&#xe94d;</span>
            <span class="arrow-right" @click="nextYear">&#xe93f;</span>
          </div>
        </div>

        <div class="date-week">
          <ul class="week-ul">
            <li>日</li>
            <li>一</li>
            <li>二</li>
            <li>三</li>
            <li>四</li>
            <li>五</li>
            <li>六</li>
          </ul>
        </div>

        <div class="date-body">
          <ul class="ul-box" @click="closeTime">
            <li v-for="item in rows.eles" :class="item.style" @click="selectDate(item)">
              {{item.value}}
            </li>
          </ul>
          <div class="toolbar" v-if="type == 'dateTime'">

            <button class="sure" @click="confirm">确认</button>
            <span class="now" @click="showNow">此刻</span>


            <div class="timeBox">
              <div>
                <div class="timeSpan" id="onlyTime">
                  <span>{{date.hours==0?'00':date.hours}}</span>
                  <span>{{date.minutes==0?'00':date.minutes}}</span>
                  <span style="margin-left: -3px;">{{date.seconds==0?'00':date.seconds}}</span>
                </div>

                <input type="text" class="showTime" @click="showTime" readonly="true">
              </div>
              <transition name="fade" @enter="enter">
                <div class="selectBox" v-if="showtime" @click="clickTime">

                  <div class="coverBox">
                    <div class="hours" @scroll="checkTime" id="hours">
                      <ul class="ul-time">
                        <li v-for="hour in time.hours" :class="{select:hour.selected}">
                          {{hour.value}}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="coverBox">
                    <div class="minutes" @scroll="checkTime" id="minutes">
                      <ul class="ul-time">
                        <li v-for="minute in time.minutes" :class="{select:minute.selected}">
                          {{minute.value}}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="coverBox">
                    <div class="seconds" @scroll="checkTime" id="seconds">
                      <ul class="ul-time">
                        <li v-for="second in time.seconds" :class="{select:second.selected}">
                          {{second.value}}
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div class="checkBox">
                  </div>

                </div>

              </transition>
            </div>
          </div>
        </div>
      </div>
      <!-- 月份选择面板 -->
      <div class="monthPanel" v-if="show.month" key="month">
        <div class="dateHeader">
          <div>
            <span class="arrow-left " @click="prevYear">&#xe93e;</span>
          </div>
          <div>
            <span class="title"><span class="year-month">{{year}}年</span></span>
          </div>
          <div>
            <span class="arrow-right " @click="nextYear">&#xe93f;</span>
          </div>
        </div>

        <div class="date-body">
          <ul class="ul-month">
            <li v-for="item in rows.months" class="month" @click="selectMonth(item)">
              {{item}}
            </li>
          </ul>
        </div>
      </div>


      <!-- 年份选择面板 -->
      <div class="yearPanel" v-if="show.year" key="year">
        <div class="dateHeader">
          <div>
            <span class="arrow-left " @click="showYear('-')">&#xe93e;</span>
          </div>
          <div>
            <span class="title"><span class="year-year">{{leftYear}}年 - {{rightYear}}</span></span>
          </div>
          <div>
            <span class="arrow-right " @click="showYear('+')">&#xe93f;</span>
          </div>
        </div>

        <div class="date-body">
          <ul class="ul-year">
            <li v-for="item in rows.years" :class="item.style" @click="selectYear(item)">
              {{item.value}}
            </li>
          </ul>
        </div>
      </div>


    </transition-group>

  </div>
</template>

<script>
//获取当前的时间
var currentDate = new Date(),
  nowDate = new Date(),
  //获取当前年份 四位数字
  year = currentDate.getFullYear(),
  month = currentDate.getMonth(), //
  day = currentDate.getDate(), //当前的天数
  curYear = nowDate.getFullYear(), //当前年
  curMonth = nowDate.getMonth(), //当前月
  curDay = nowDate.getDate(); //当的天

export default {
  props: {
    symbol: {
      type: String,
      default: '-'
    },
    type: {
      type: String,
      default: 'date'
    },
    partten: {
      type: String,
      default: 'hh:mm:ss'
    }
  },
  data() {
    return {
      timeConifg: {
        height: '25px',
        width: '150px'
      },
      date: {
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      year: '',
      month: '',
      leftYear: '',
      rightYear: '',
      showDate: {
        year: '',
        month: '',
        day: ''
      },
      showtime: false,
      show: {
        year: false,
        month: false,
        day: false
      },
      timer: null, //定时器
      rows: {
        eles: [],
        months: [
          '一月',
          '二月',
          '三月',
          '四月',
          '五月',
          '六月',
          '七月',
          '八月',
          '九月',
          '十月',
          '十一月',
          '十二月'
        ],
        years: []
      },
      time: {
        hours: [],
        minutes: [],
        seconds: []
      },
      value: ''
      // value:new Date().getFullYear()+'-'+(new Date().getMonth()+1<10?'0'+(new Date().getMonth()+1):new Date().getMonth())+'-'+(new Date().getDate()<10?('0'+new Date().getDate()):new Date().getDate())
    };
  },
  mounted() {
    var _this = this;
    _this.globalClick(function(e) {
      if ($(e.target).closest('.date').length == 0) {
        _this.show.day = false;
      }
    });
    this.render();
    // this.confirm();
  },
  methods: {
    formart(y, m, d, symbol) {
      symbol = symbol || '-';
      m = m.toString()[1] ? m : '0' + m;
      d = d.toString()[1] ? d : '0' + d;
      return y + symbol + m + symbol + d;
    },

    confirm() {
      this.show.day = false;
      this.showtime = false;
      var forceValue =
        new Date().getFullYear() +
        '-' +
        (new Date().getMonth() + 1 < 10
          ? '0' + (new Date().getMonth() + 1)
          : new Date().getMonth()) +
        '-' +
        (new Date().getDate() < 10
          ? '0' + new Date().getDate()
          : new Date().getDate());
      if (this.value == '') {
        this.value = forceValue;
      }
      var dateTime =
        this.value +
        ' ' +
        (this.date.hours == 0 ? '00' : this.date.hours) +
        ':' +
        (this.date.minutes == 0 ? '00' : this.date.minutes) +
        ':' +
        (this.date.seconds == 0 ? '00' : this.date.seconds);
      this.$emit('input', dateTime);
    },
    formartTime() {},
    enter(el) {
      document.getElementById('hours').scrollTop = this.date.hours * 25;
      document.getElementById('minutes').scrollTop = this.date.minutes * 25;
      document.getElementById('seconds').scrollTop = this.date.seconds * 25;
    },
    //渲染
    render() {
      this.year = year;
      this.month = month + 1;
      this.rows.eles = [];
      var fullDay = new Date(year, month + 1, 0).getDate(), //当月天数
        startWeek = new Date(year, month, 1).getDay(), //当月第一天是周几
        total =
          (fullDay + startWeek) % 7 == 0
            ? fullDay + startWeek
            : fullDay + startWeek + (7 - (startWeek + fullDay) % 7), //总元素个数
        lastMonthDay = new Date(year, month, 0).getDay(), //上个月的最后一天星期几
        lastMonth = new Date(year, month, 0).getDate(); //上个月的总天数

      total = total / 7 == 6 ? total : total + 7; //保持默认显示元素为42个

      var i = 0;
      //预处理  起始日期为星期日的情况 增加上月的七天
      if (startWeek === 0) {
        while (i < 7) {
          var ele = {};
          ele.style = 'other';
          ele.value = lastMonth - lastMonthDay + i;
          ele.status = 'prev'; //月份标志 上个月
          this.rows.eles.push(ele);
          i++;
        }
        startWeek = 7;
      }
      for (; i < total; i++) {
        if (i < startWeek) {
          //上个月
          var ele = {};
          ele.style = 'other';
          ele.value = lastMonth - lastMonthDay + i;
          ele.status = 'prev'; //月份标志 上个月
          this.rows.eles.push(ele);
        } else if (i < fullDay + startWeek) {
          //本月
          var ele = {};
          ele.value = i - startWeek + 1;

          ele.style = ' current';
          if (ele.value === day && month === curMonth && year === curYear) {
            ele.style += '  today';
          } else if (
            ele.value === this.showDate.day &&
            this.showDate.month === month &&
            year === this.showDate.year
          ) {
            ele.style = ' selected';
          }
          ele.status = 'current'; //月份标志 当前月
          this.rows.eles.push(ele);
        } else {
          //下个月
          var ele = {};
          ele.style = 'other';
          ele.value = i - (fullDay + startWeek) + 1;
          ele.status = 'next'; //月份标志 下个月
          this.rows.eles.push(ele);
        }
      }
    },

    showDay() {
      this.show.year = false;
      this.show.month = false;
      this.show.day = !this.show.day;
    },
    showMohth() {
      this.show.year = false;
      this.show.month = !this.show.month;
      this.show.day = false;
    },
    showYear(type) {
      if (this.leftYear === '') {
        this.leftYear = year - year % 10;
        this.rightYear = year % 10 == 9 ? year : parseInt(year / 10) * 10 + 9;
      }

      if (type === '+') {
        this.leftYear += 10;
        this.rightYear += 10;
      }

      if (type === '-') {
        this.leftYear -= 10;
        this.rightYear -= 10;
      }

      if (this.leftYear < 1900) {
        this.leftYear = 1900;
        this.rightYear = 1910;
        return;
      }
      this.rows.years = [];

      for (var i = this.leftYear, len = this.rightYear; i <= len; i++) {
        var y = {};
        y.style = 'year';
        y.value = i;
        if (i === year) {
          y.style += '  selectedYear';
        }
        this.rows.years.push(y);
      }
      this.show.year = true;
      this.show.month = false;
      this.show.day = false;
    },
    selectDate(element) {
      var m = month;
      if (element.status === 'prev') {
        if (month <= 1) {
          year--;
          month = 11;
        } else {
          month--;
        }
      } else if (element.status === 'next') {
        if (month === 11) {
          year++;
          month = 0;
        } else {
          month++;
        }
      }
      this.value = this.formart(year, month + 1, element.value, this.symbol);
      this.showDate = {
        year: year,
        month: month,
        day: element.value
      };
      this.year = year;
      this.month = month + 1;
      currentDate = new Date(year, month, element.value);
      this.render();

      this.show.year = false;
      this.show.month = false;
      if (this.type === 'date') {
        this.show.day = false;
        this.$emit('input', this.value);
      }
    },
    selectMonth(element) {
      switch (element) {
        case '一月':
          month = 0;
          break;
        case '二月':
          month = 1;
          break;
        case '三月':
          month = 2;
          break;
        case '四月':
          month = 3;
          break;
        case '五月':
          month = 4;
          break;
        case '六月':
          month = 5;
          break;
        case '七月':
          month = 6;
          break;
        case '八月':
          month = 7;
          break;
        case '九月':
          month = 8;
          break;
        case '十月':
          month = 9;
          break;
        case '十一月':
          month = 10;
          break;
        case '十二月':
          month = 11;
          break;
      }
      this.show.year = false;
      this.show.month = false;
      this.show.day = true;
      this.render();
    },
    selectYear(element) {
      year = element.value;
      this.show.year = false;
      this.show.month = false;
      this.show.day = true;
      this.render();
    },

    showNow() {
      this.value = this.formart(curYear, curMonth + 1, curDay, this.symbol);
      var date = new Date(),
        curHours = date.getHours(),
        curMinuters = date.getMinutes(),
        curSeconds = date.getSeconds();
      this.date = {
        hours: curHours >= 10 ? curHours : '0' + curHours.toString(),
        seconds: curSeconds >= 10 ? curSeconds : '0' + curSeconds.toString(),
        minutes: curMinuters >= 10 ? curMinuters : '0' + curMinuters.toString()
      };

      var dateTime =
        this.value +
        ' ' +
        (this.date.hours == 0 ? '00' : this.date.hours) +
        ':' +
        (this.date.minutes == 0 ? '00' : this.date.minutes) +
        ':' +
        (this.date.seconds == 0 ? '00' : this.date.seconds);
      this.$emit('input', dateTime);

      this.showDate = {};
      this.render();
      this.show.year = false;
      this.show.month = false;
      this.show.day = false;
      this.showtime = false;
    },

    showTime() {
      //每次先清空数据
      this.time = {
        hours: [],
        minutes: [],
        seconds: []
      };

      var d = this.date;

      for (var i = 0; i < 24; i++) {
        var el = {};
        if (i < 10) {
          el.value = '0' + i;
        } else {
          el.value = i;
        }
        el.selected = false;
        if (parseInt(d.hours) === i) {
          el.selected = true;
        }
        el.status = 'h';
        this.time.hours.push(el);
      }

      for (var i = 0; i < 60; i++) {
        var el = {};
        if (i < 10) {
          el.value = '0' + i;
        } else {
          el.value = i;
        }
        el.selected = false;
        if (parseInt(d.minutes) === i) {
          el.selected = true;
        }

        el.status = 'm';
        this.time.minutes.push(el);
      }

      for (var i = 0; i < 60; i++) {
        var el = {};
        if (i < 10) {
          el.value = '0' + i;
        } else {
          el.value = i;
        }

        el.selected = false;
        if (parseInt(d.seconds) === i) {
          el.selected = true;
        }
        el.status = 's';

        this.time.seconds.push(el);
      }

      this.showtime = !this.showtime;
    },
    //滑动锁定事件
    checkTime(e) {
      var target = e.srcElement || e.target;
      var scrollTop = target.scrollTop, //移动的偏移量
        domClass = target.className,
        ele,
        len = 0,
        d = this.date;
      if (this.timer != null) {
        clearTimeout(this.timer);
      }

      switch (domClass) {
        case 'hours':
          domClass = 'hours';
          len = 24;
          ele = this.time.hours;
          break;
        case 'minutes':
          domClass = 'minutes';
          len = 60;
          ele = this.time.minutes;
          break;
        case 'seconds':
          domClass = 'seconds';
          len = 60;
          ele = this.time.seconds;
          break;
        default:
          throw Error('domClass 错误');
      }

      this.timer = setTimeout(function() {
        for (let i = 0; i < len; i++) {
          if (i * 25 - scrollTop <= 15 && i * 25 - scrollTop >= 0) {
            ele[i].selected = true;
            d[domClass] = ele[i].value;
            var dom = document.getElementById(domClass);
            var t = setInterval(function() {
              if (dom.scrollTop < i * 25) {
                dom.scrollTop += 1;
              } else {
                clearInterval(t);
              }
            }, 30);
          } else if (scrollTop - i * 25 <= 10 && scrollTop - i * 25 >= 0) {
            ele[i].selected = true;
            d[domClass] = ele[i].value;
            var dom = document.getElementById(domClass);
            var t = setInterval(function() {
              if (dom.scrollTop > i * 25) {
                dom.scrollTop -= 1;
              } else {
                clearInterval(t);
              }
            }, 30);
          } else {
            if (scrollTop === i * 25) {
              d[domClass] = ele[i].value;
              ele[i].selected = true;
            } else {
              ele[i].selected = false;
            }
          }
        }
      }, 300);
    },
    clickTime(e) {
      var target = e.srcElement || e.target;
      var className = target.parentNode.parentNode.className,
        val = target.innerText,
        timer = null,
        dom = document.getElementById(className);

      var temp = val >= 10 ? val : val.substring(1);
      if (
        this.time[className][temp].selected &&
        this.time[className][temp].selected === true
      ) {
        return;
      }
      this.date[className] = val;

      timer = setInterval(function() {
        if (dom.scrollTop < val * 25) {
          dom.scrollTop += 1;
        } else if (dom.scrollTop > val * 25) {
          dom.scrollTop -= 1;
        } else {
          clearInterval(timer);
        }
      }, 3);

      for (var idx in this.time[className]) {
        if (idx != val) {
          this.time[className][idx].selected = false;
        } else {
          this.time[className][idx].selected = true;
        }
      }
    },
    closeTime() {
      this.showtime = false;
    },
    prevYear() {
      year = year - 1;
      this.render();
    },
    prevMonth() {
      if (month - 1 < 0) {
        year--;
        month = 11;
      } else {
        month--;
      }
      this.render();
    },
    nextMonth() {
      if (month === 11) {
        year++;
        month = 0;
      } else {
        month++;
      }
      this.render();
    },
    nextYear() {
      year++;
      this.render();
    }
  }
};
</script>

<style lang="less" scoped>
.date {
  position: relative;
  font-family: iconfont;
  display: inline-block;
}

::-webkit-scrollbar {
  display: none;
}

@keyframes mymove {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@-webkit-keyframes mymove {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.datePanel,
.yearPanel,
.monthPanel {
  font-family: iconfont;
  position: absolute;
  width: 320px;
  height: 380px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  border: 1px solid #ccc;
  border-radius: 5px;
  z-index: 2;
}

.datePanel:before {
  content: ' ';
  position: absolute;
  width: 0;
  height: 0;
  left: 31px;
  top: -10px;
  border-left: 13px solid transparent;
  border-right: 13px solid transparent;
  border-bottom: 10px solid #ccc;
}

.datePanel:after {
  content: ' ';
  position: absolute;
  width: 0;
  height: 0;
  left: 35px;
  top: -10px;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-bottom: 9px solid #fff;
}

.dateInput > input {
  height: 30px;
  /*width: 320px;*/
  width: 190px;
  padding-left: 25px;
  box-shadow: 2px 2px 2px rgba(122, 33, 22, 0.5);
  border-radius: 5px;
  margin-bottom: 10px;
}

.iconDate {
  position: absolute;
  left: 5px;
  top: 0;
  color: #ccc;
  line-height: 30px;
}

.arrow-left,
.title,
.arrow-right {
  position: absolute;
  top: 10px;
  cursor: pointer;
}

.arrow-right {
  right: 10px;
  cursor: pointer;
}

.left {
  margin-left: 20px;
}

.right {
  margin-right: 20px;
}

.title {
  left: 36%;
}

.arrow-left:hover,
.arrow-right:hover {
  color: #20a0ff;
}

.dateHeader {
  height: 30px;
  width: 100%;
}

.dateHeader div {
  float: left;
  margin-left: 10px;
  margin-bottom: 10px;
}

.today {
  color: #20a0ff;
  cursor: pointer;
}

.date-week {
  margin-top: 20px;
  width: 100%;
  height: 30px;
  border-bottom: 1px solid #ccc;
  text-align: center;
  color: #606266;
}

.week-ul > li,
.ul-box > li {
  list-style: none;
  width: 11%;
  margin-left: 9px;
  text-align: center;
  padding-right: 1px;
  padding-top: 1px;
  float: left;
}

.ul-box {
  overflow: hidden;
  margin-top: 10px;
}

.date-body {
  width: 100%;
  height: 80%;
}

.selected {
  border-radius: 50%;
  background-color: #20a0ff;
  color: #fff;
}

.other,
.current,
.selected {
  padding-bottom: 15px;
  cursor: pointer;
  height: 35px;
  line-height: 35px;
}

.year-year {
  margin-left: -10px;
}

.year-month {
  margin-left: 10px;
}

.year-date {
  margin-left: -5px;
}

.year-date:hover,
.year-year:hover,
.year-month:hover {
  color: #20a0ff;
}

.month-title:hover {
  color: #20a0ff;
}

.month-title {
  margin-left: 8px;
}

.other {
  color: #c4cfda;
}

.current:hover {
  color: #20a0ff;
}

.ul-month,
.ul-year {
  margin-left: 10px;
  margin-top: 20px;
  margin-right: 10px;
  border-top: 1px solid #ccc;
}

.ul-month > li,
.ul-year > li {
  width: 33.3%;
  float: left;
  list-style: none;
  text-align: center;
  padding: 10px;
  padding-top: 25px;
}

.ul-month > li:hover,
.ul-year > li:hover {
  color: #20a0ff;
}

.selectedYear {
  color: #20a0ff;
}

.toolbar {
  position: relative;
  border-top: 1px solid #ccc;
  width: 100%;
  height: 35px;
  padding-top: 20px;
  margin-top: 10px;
}

.now {
  position: relative;
  float: right;
  margin-right: 10px;
  padding-top: 3px;
  color: #20a0ff;
  cursor: pointer;
}

.sure {
  float: right;
  margin-right: 10px;
  height: 25px;
  width: 50px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.sure:hover {
  border: 1px solid #20a0ff;
  color: #20a0ff;
}

.timeBox {
  position: relative;
  left: 5px;
}

.showTime,
.timeSpan {
  position: absolute;
  width: 110px;
  height: 30px;
  left: 5px;
  top: 0px;
  border-radius: 3px;
  padding-left: 30px;
  line-height: 30px;
  text-align: center;
}

.showTime {
  background: rgba(255, 255, 255, 0.1);
}

.timeSpan > span {
  display: inline-block;
  float: left;
  width: 25px;
  color: #606266;
  font-size: 13px;
}

.timeSpan > span:first-child:after,
.timeSpan > span:nth-child(2):after {
  content: ':';
  margin-left: 3px;
}

#onlyTime:before {
  content: '\e735';
  font-size: 12pt;
  margin-left: -275px;
}

.selectBox {
  position: absolute;
  z-index: 3;
  top: 40px;
  left: 3px;
  width: 200px;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  border: 1px solid #ccc;
  border-radius: 5px;
}

.selectBox:before {
  content: ' ';
  position: absolute;
  border-style: dashed solid solid dashed;
  left: 20px;
  top: -24px;
  border-width: 12px;
  border-color: transparent transparent #cccccc transparent;
}

.selectBox:after {
  content: ' ';
  position: absolute;
  border-style: dashed solid solid dashed;
  left: 23px;
  top: -19px;
  border-width: 9px;
  border-color: transparent transparent #ffffff transparent;
}

.coverBox {
  float: left;
  overflow: hidden;
  width: 55px;
  height: 150px;
  margin-left: 8px;
}

.hours,
.minutes,
.seconds {
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  overflow-y: scroll;
  overflow-x: hidden;
  width: 80px;
}

.coverBox > div:before {
  content: '';
  display: inline-block;
  width: 40px;
  height: 60px;
}

.coverBox > div:after {
  content: '';
  display: inline-block;
  width: 40px;
  height: 65px;
}

.yearPanel {
  height: 280px;
}

.monthPanel {
  height: 280px;
}

.ul-time {
  width: 50px;
  text-align: center;
}

.ul-time > li {
  position: relative;
  margin-top: 5px;
  height: 25px;
  line-height: 25px;
  margin: 0;
  padding: 0;
  font-size: 12px;
  color: #606266;
}

.ul-time > li:hover {
  background-color: #edeff2;
  cursor: pointer;
}

.checkBox {
  position: absolute;
  top: 51%;
  height: 25px;
  margin-top: -15px;
  left: 0;
  right: 0;
  z-index: -1;
  color: #000000;
  box-sizing: border-box;
  text-align: left;
  border-top: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
}

.select {
  color: #000000;
  font-weight: 700;
}

.timeInput {
  position: absolute;
  top: 1px;
  left: 63px;
}

.noDateTime {
  height: 305px;
}
</style>
