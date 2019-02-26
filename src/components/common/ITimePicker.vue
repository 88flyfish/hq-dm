<template lang="html">
  <div class="date">
    <div>
      <div class="timeSpan" style="border: 1px solid #a9a9a9" @click="showTime">
        <span>{{date.hours==0?'00':date.hours}}</span>
        <span>{{date.minutes==0?'00':date.minutes}}</span>
        <span style="margin-left: -3px;">{{date.seconds==0?'00':date.seconds}}</span>
      </div>
    </div>
    <transition-group name="fade">
      <div class="timeBox" key="timeBox">
        <transition name="fade" @enter="enter">
          <div class="selectBox" v-if="showtime"  @click="clickTime" >
            <div class="coverBox">
              <div class="hours"  @scroll="checkTime" id="hours">
                <ul class="ul-time">
                  <li v-for="hour in time.hours"  :class="{select:hour.selected}" >
                    {{hour.value}}
                  </li>
                </ul>
              </div>
            </div>
            <div class="coverBox">
              <div class="minutes" @scroll="checkTime" id="minutes">
                <ul class="ul-time" >
                  <li v-for="minute in time.minutes" :class="{select:minute.selected}">
                    {{minute.value}}
                  </li>
                </ul>
              </div>
            </div>
            <div class="coverBox">
              <div class="seconds"  @scroll="checkTime" id="seconds">
                <ul class="ul-time">
                  <li v-for="second in time.seconds" :class="{select:second.selected}">
                    {{second.value}}
                  </li>
                </ul>
              </div>
            </div>
            <div style="height: 30px;margin-top: 150px;border-top:1px solid #E4E7ED;">
              <button type="button" style="margin-left: 120px;margin-top:2px;padding: 3px;
              background: lightgray;color: white;border-radius: 4px;" @click.stop="cancel">取消</button>
              <button type="button" style="margin-left: 5px;margin-top:2px;padding: 3px;
              background: #20a0ff;color: white;border-radius: 4px;" @click.stop="ok">确定</button>
            </div>

            <div class="checkBox">
            </div>

          </div>

        </transition>
      </div>
    </transition-group>

  </div>
</template>

<script>
  export default {
    props:{
      pattern:{
        type:String,
        default:"hh:mm:ss"
      },
      value: String
    },
    data(){
      return {
        date:{
          hours:0,
          minutes:0,
          seconds:0
        },
        temp: {
          hour: "",
          minute: "",
          second: ""
        },
        showtime:false,
        timer:null, //定时器
        time:{
          hours:[],
          minutes:[],
          seconds:[]
        }
      }
    },
    mounted(){
      if (this.value != "" && typeof this.value != "undefined") {
        let str = this.value.split(":");
        this.date.hours = str[0];
        this.date.minutes = str[1];
        this.date.seconds = str[2];
        this.temp.hour = str[0];
        this.temp.minute = str[1];
        this.temp.second = str[2];
      } else {
        this.temp.hour = "00";
        this.temp.minute = "00";
        this.temp.second = "00";
      }
    },
    methods:{
      enter(el){
        document.getElementById("hours").scrollTop = this.date.hours*25;
        document.getElementById("minutes").scrollTop = this.date.minutes*25;
        document.getElementById("seconds").scrollTop = this.date.seconds*25;
      },

      // 点击确定关闭面板
      ok() {
        this.showtime = false;
        this.temp.hour = this.date.hours;
        this.temp.minute = this.date.minutes ;
        this.temp.second = this.date.seconds;
        this.$emit("input", `${this.date.hours}:${this.date.minutes}:${this.date.seconds}`);
      },
      // 取消
      cancel() {
        this.showtime = false;
        this.date.hours = this.temp.hour;
        this.date.minutes = this.temp.minute;
        this.date.seconds = this.temp.second;
        this.$emit("input", `${this.date.hours}:${this.date.minutes}:${this.date.seconds}`);
      },

      showTime(){
        //每次先清空数据
        this.time = {
          hours:[],
          minutes:[],
          seconds:[]
        }

        var d = this.date;

        for(var i=0;i<24;i++){
          var el = {};
          if(i<10){
            el.value = '0'+i;
          }else{
            el.value = i;
          }
          el.selected = false;
          if(parseInt(d.hours) === i  ){
            el.selected = true;
          }
          el.status = 'h';
          this.time.hours.push(el);
        }

        for(var i=0;i<60;i++){
          var el = {};
          if(i<10){
            el.value = "0"+i;
          }else{
            el.value = i;
          }
          el.selected = false;
          if( parseInt(d.minutes) === i ){
            el.selected = true;
          }

          el.status = 'm';
          this.time.minutes.push(el);
        }

        for(var i=0;i<60;i++){
          var el = {};
          if(i<10){
            el.value = '0'+i;
          }else{
            el.value = i;
          }

          el.selected = false;
          if(parseInt(d.seconds) === i ){
            el.selected = true;
          }
          el.status = 's';

          this.time.seconds.push(el);
        }

        this.showtime = !this.showtime;
        this.$emit("input", `${this.date.hours}:${this.date.minutes}:${this.date.seconds}`);
      },
      //滑动锁定事件
      checkTime(e){
        var target = e.srcElement || e.target;
        var scrollTop = target.scrollTop, //移动的偏移量
          domClass = target.className,
          ele,
          len = 0,
          d = this.date;
        if(this.timer!=null){
          clearTimeout(this.timer);
        }

        switch(domClass){
          case "hours":
            domClass = "hours";
            len = 24;
            ele = this.time.hours;
            break;
          case "minutes":
            domClass = "minutes";
            len = 60;
            ele = this.time.minutes;
            break;
          case "seconds":
            domClass = "seconds";
            len = 60;
            ele = this.time.seconds;
            break;
          default :
            throw Error("domClass 错误");
        }

        this.timer = setTimeout(function(){
          for(let i = 0;i<len;i++){
            if((i*25-scrollTop)<=15&&(i*25-scrollTop)>=0){
              ele[i].selected = true;
              d[domClass] = ele[i].value;
              var dom = document.getElementById(domClass);
              var t = setInterval(function(){
                if(dom.scrollTop<i*25){
                  dom.scrollTop += 1;
                }else{
                  clearInterval(t);
                }
              },30);
            } else if((scrollTop-i*25)<=10&&(scrollTop-i*25)>=0){
              ele[i].selected = true;
              d[domClass] = ele[i].value;
              var dom = document.getElementById(domClass);
              var t = setInterval(function(){
                if(dom.scrollTop>i*25){
                  dom.scrollTop -= 1;
                } else{
                  clearInterval(t);
                }
              },30);
            }else{
              if(scrollTop===i*25){
                d[domClass] = ele[i].value;
                ele[i].selected = true;
              }else{
                ele[i].selected = false;
              }
            }
          };

        },300);

      },
      clickTime(e){
        var target = e.srcElement || e.target;
        var className = target.parentNode.parentNode.className,
          val = target.innerText,
          timer = null,
          dom =  document.getElementById(className);

        var temp = val>=10?val:val.substring(1);
        if(this.time[className][temp].selected && this.time[className][temp].selected === true){
          return ;
        }
        this.date[className] = val;

        timer = setInterval(function(){
          if(dom.scrollTop<val*25){
            dom.scrollTop += 1;
          }else if(dom.scrollTop>val*25){
            dom.scrollTop -= 1;
          } else{
            clearInterval(timer);
          }
        },3);

        for(var idx in this.time[className]){
          if(idx != val){
            this.time[className][idx].selected = false;
          }else{
            this.time[className][idx].selected = true;

          }
        }

      },
    }
  }
</script>

<style lang="css" scoped>

  .date{
    position: relative;
    font-family: "iconfont";
  }

  .timeSpan:before {
    content: "\e735";
    font-size: 16px;
    margin-left: -270px;
  }

  ::-webkit-scrollbar{
    display:none;
  }

  @keyframes mymove{
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @-webkit-keyframes mymove{
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to  {
    opacity: 0;
  }

  .timeSpan{
    padding-left: 35px;
    width: 200px;
    height: 32px;
    border-radius: 4px;
    line-height: 30px;
    text-align: center;
  }

  .timeSpan>span{
    display: inline-block;
    float: left;
    width: 25px;
    font-size: 14px;
    color: #606266;
  }
  .timeSpan>span:first-child:after, .timeSpan>span:nth-child(2):after{
    content: ":";
  }

  .selectBox{
    position: absolute;
    z-index: 3;
    top:42px;
    left: -1px;
    width: 200px;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.2);
    border: 1px solid #ccc;
    border-radius: 5px;
  }


  .selectBox:before{
    content: " ";
    position: absolute;
    border-style:dashed solid solid dashed;
    left:20px;
    top:-24px;
    border-width: 12px;
    border-color:transparent transparent #cccccc transparent;
  }

  .selectBox:after{
    content: " ";
    position: absolute;
    border-style:dashed solid solid dashed;
    left:23px;
    top:-19px;
    border-width: 9px;
    border-color:transparent transparent #ffffff transparent;
  }
  .coverBox{
    float: left;
    overflow: hidden;
    width: 55px;
    height: 150px;
    margin-left: 8px;
  }

  .hours,.minutes,.seconds{
    height: 100%;
    background-color:rgba(255,255,255,0.1);
    overflow-y: scroll;
    overflow-x: hidden;
    width:80px;
  }
  .coverBox>div:before{
    content: "";
    display: inline-block;
    width: 40px;
    height: 60px;
  }

  .coverBox>div:after{
    content: "";
    display: inline-block;
    width: 40px;
    height: 65px;
  }

  .ul-time{
    width: 50px;
    text-align: center;
  }
  .ul-time>li{
    position: relative;
    margin-top: 5px;
    height: 25px;
    line-height: 25px;
    margin:0;
    padding: 0;
    font-size: 12px;
    color: #606266;
  }

  .ul-time>li:hover{
    background-color: #EDEFF2;
    cursor: pointer;
  }
  .checkBox{
    position: absolute;
    top: 43%;
    height: 25px;
    margin-top: -15px;
    left: 0;
    right: 0;
    z-index: -1;
    color:#000000;
    box-sizing: border-box;
    text-align: left;
    border-top: 1px solid #e4e7ed;
    border-bottom:  1px solid #e4e7ed;
  }

  .select{
    color:#000000;
    font-weight: 700;
  }
</style>
