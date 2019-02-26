<template>
    <div>
       <div class="slider-runway"
            ref="slider" :style="{width:`${sliderSize}px`}">
         <div class="slider-bar" :style="{width:`${currentWidth}%`}">
         </div>
         <div class="slider-button-wrapper"
              :style="wrapperStyle"
              @mousedown.stop="sliderDown($event)">
           <div class="slider-button"></div>
         </div>
       </div>
      <input readonly class="tip" type="text" v-model="realValue" unselectable='on'>
    </div>
</template>

<script>
    export default {
      name: "i-slider",
      props: {
        value: {
          type: Number,
          default: 0
        },
        min: {
          type: Number,
          default: 0
        },
        max: {
          type: Number,
          default: 100
        },
        sliderSize: {
          type: Number,
          default: 400
        }
      },
      data() {
        return {
          currentWidth: 0,
          startX: 0,
          currentX: 0,
          startPosition: 0,
          newPosition: null,
          oldValue: this.value
        }
      },
      methods: {
        sliderDown(event) {
          event.preventDefault();
          this.onDragStart(event);
          window.addEventListener("mousemove", this.onDragging);
          window.addEventListener("mouseup", this.onDragEnd);
          window.addEventListener("contextmenu", this.onDragEnd);
        },
        onDragStart(event) {
          this.startX = event.clientX;
          this.startPosition = parseFloat(this.currentPosition);
          this.newPosition = this.startPosition;
        },
        onDragging(event) {
          this.currentX = event.clientX;
          let diff = (this.currentX - this.startX) / this.sliderSize * 100;
          this.newPosition = this.startPosition + diff;
          this.currentWidth = this.setPosition(this.newPosition);
        },
        onDragEnd() {
          window.removeEventListener("mousemove", this.onDragging);
          window.removeEventListener("mouseup", this.onDragEnd);
          window.removeEventListener("contextmenu", this.onDragEnd);
        },
        setPosition(newPosition) {
          if (newPosition === null) {
            return;
          }
          if (newPosition > 100) {
            newPosition = 100;
          }
          if (newPosition < 0) {
            newPosition = 0;
          }
          this.$emit("input", this.realValue);
          return newPosition;
        }
      },
      computed: {
        currentPosition() {
          return `${(this.realValue - this.min) / (this.max - this.min) * 100 }%`;
        },
        realValue() {
          if (this.newPosition > 100) {
            this.newPosition = 100;
          }
          if (this.newPosition < 0) {
            this.newPosition = 0;
          }
          let value = Math.round(this.max * this.newPosition / 100);
          if (value < this.min) {
            value = this.min
          }
          return value;
        },
        wrapperStyle() {
          return {left: this.currentPosition};
        }
      },
      mounted() {
        if (this.oldValue > this.max) {
          this.oldValue = this.max;
        }
        if (this.oldValue < this.min) {
          this.oldValue = this.min;
        }
        let tempValue = (this.oldValue - this.min) / (this.max - this.min) * 100 + this.min;
        this.currentWidth = tempValue;
        this.newPosition = tempValue;
      }
    }
</script>

<style scoped>
  .slider-runway {
    height: 8px;
    background: #E4E7ED;
    border-radius: 4px;
    cursor: pointer;
    vertical-align: middle;
    position: relative;
    margin :16px 0px;
    display: inline-block;
  }
  .slider-bar{
    position: absolute;
    background: #409EFF;
    height: 8px;
    border-radius: 4px 0px 0px 4px;
    left: 0%;
  }
  .slider-button-wrapper {
    position: absolute;
    width: 36px;
    height: 36px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    line-height: normal;
    top: -15px;
    z-index: 99;
    transform: translateX(-50%);
    -ms-transform: translate(-50%,0);
    -webkit-transform: translateX(-50%);
    -moz-transform: translateX(-50%);
  }
  .slider-button {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #409eff;
    transition: .2s;
    margin: 8px auto;
  }
  .slider-button:hover {
    margin-top: 6px;
    width: 24px;
    height: 24px;
  }
  .tip {
    margin-left: 5px;
    width: 35px;
    border: none;
  }
</style>
