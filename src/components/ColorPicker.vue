<template>
  <div class="colorPicker">
    <div class="colorBtn"
         @click="showColorList">
      <span>换肤</span>
      <i class="icon-keyboard_arrow_down">

      </i>
    </div>
    <ul class="colorList">
      <li v-for="(color,index) in colorList"
          :style="{backgroundColor:color}"
          @click="skinPeeler(color,index)">
        <i class="icon-checkmark"
           v-if="index==activeIndex"></i>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "ColorPicker",
  // computed:{
  //   oldColor(){
  //     return this.colorList[this.activeIndex]
  //   }
  // },
  data () {
    return {
      colorList: ['#20a0ff', '#35baf6', '#001f3f', '#0074D9', '#39CCCC', '#3D9970', '#2ECC40', '#FF851B', '#85144B', '#B10DC9', '#000000'],
      activeIndex: localStorage.getItem('activeIndex') ? localStorage.getItem('activeIndex') : 0,
      oldColor: '#20a0ff',
      newColor: localStorage.getItem('newColor') ? localStorage.getItem('newColor') : '#20a0ff'
    }
  },
  mounted () {
    if (this.newColor != '') {
      this.skinPeeler(this.newColor, this.activeIndex);
    }
  },
  methods: {
    getThemeCluster (theme) {
      const tintColor = (color, tint) => {
        let red = parseInt(color.slice(0, 2), 16)
        let green = parseInt(color.slice(2, 4), 16)
        let blue = parseInt(color.slice(4, 6), 16)

        if (tint === 0) { // when primary color is in its rgb space
          return [red, green, blue].join(',')
        } else {
          red += Math.round(tint * (255 - red))
          green += Math.round(tint * (255 - green))
          blue += Math.round(tint * (255 - blue))

          red = red.toString(16)
          green = green.toString(16)
          blue = blue.toString(16)

          return `#${red}${green}${blue}`
        }
      }

      const shadeColor = (color, shade) => {
        let red = parseInt(color.slice(0, 2), 16)
        let green = parseInt(color.slice(2, 4), 16)
        let blue = parseInt(color.slice(4, 6), 16)

        red = Math.round((1 - shade) * red)
        green = Math.round((1 - shade) * green)
        blue = Math.round((1 - shade) * blue)

        red = red.toString(16)
        green = green.toString(16)
        blue = blue.toString(16)

        return `#${red}${green}${blue}`
      }

      const clusters = [theme]
      for (let i = 0; i <= 9; i++) {
        clusters.push(tintColor(theme, Number((i / 10).toFixed(2))))
      }
      clusters.push(shadeColor(theme, 0.1))
      return clusters
    },
    updateStyle (style, oldCluster, newCluster) {
      let newStyle = style
      oldCluster.forEach((color, index) => {
        newStyle = newStyle.replace(new RegExp(color, 'ig'), newCluster[index])
      })
      return newStyle
    },
    skinPeeler (val, index) {
      this.activeIndex = index;
      localStorage.setItem('activeIndex', index);
      localStorage.setItem('newColor', val);
      var oldVal = this.oldColor;
      const themeCluster = this.getThemeCluster(val.replace('#', ''))
      const originalCluster = this.getThemeCluster(oldVal.replace('#', ''))

      const styles = [].slice.call(document.querySelectorAll('style'))
        .filter(style => {
          const text = style.innerText
          return new RegExp(oldVal, 'i').test(text)
        })
      styles.forEach(style => {
        const { innerText } = style
        if (typeof innerText !== 'string') return
        style.innerText = this.updateStyle(innerText, originalCluster, themeCluster)
      })
      this.oldColor = this.colorList[this.activeIndex];

      $('.colorList').slideUp(200);
    },
    showColorList () {
      $('.colorList').slideToggle(200);
    }
  }
}
</script>

<style lang="less" scoped>
.colorPicker {
  width: 60px;
  height: 24px;
  border-radius: 4px;
  text-align: center;
  background: #20a0ff;
  position: relative;
  .colorBtn {
    cursor: pointer;
    width: 100%;
    height: 100%;
    & > span {
      color: #fff;
      line-height: 24px;
      font-size: 12px;
    }
    & > i {
      font-size: 20px;
      color: #fff;
      line-height: 24px;
      vertical-align: middle;
    }
  }
  & > .colorList {
    display: none;
    position: absolute;
    z-index: 100;
    right: 0;
    top: 24px;
    width: 60px;
    padding: 0 2px;
    background-color: #fff;
    li {
      width: 100%;
      height: 16px;
      margin-top: 6px;
      text-align: center;
      cursor: pointer;
      i {
        line-height: 16px;
        color: #fff;
      }
    }
  }
}
</style>
