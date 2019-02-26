<template>
  <div class="tags-view-container">
    <scroll-pane class='tags-view-wrapper'
                 ref='scrollPane'>
      <router-link ref='tag'
                   class="tags-view-item"
                   :class="isActive(tag)?'active':''"
                   v-for="tag in Array.from(visitedViews)"
                   :to="tag"
                   :key="tag.path"
                   tag="LI">
        {{tag.meta.title}}
        <span class='icon-guanbi5'
              @click.prevent.stop='closeSelectedTag(tag)'></span>
      </router-link>
      <MouseRightMenu :config="MouseRightConfig"
                      @change="getTagIndex"></MouseRightMenu>
    </scroll-pane>
  </div>
</template>

<script>
import ScrollPane from './ScrollPane'
import MouseRightMenu from './MouseRightMenu'

export default {
  name: "TagsView",
  components: {
    ScrollPane
  },
  watch: {
    '$route' (to, from) {
      let route = this.$route;
      this.addViewTags(route)
      this.moveToCurrentTag()
    }
  },
  methods: {
    getTagIndex (index) {
      this.mouseRightIndex = index;
    },
    closeSelectedTag (route) {
      var nextRoute = {};
      this.visitedViews.forEach((item, index) => {
        if (this.isActive(route)) {
          if (item.path == route.path) {
            if (index < this.visitedViews.length - 1) {
              nextRoute = this.visitedViews[index + 1];
            } else {
              if (index > 0) {
                nextRoute = this.visitedViews[index - 1];
              } else {
                //   回到路由配置的第一个路由地址
                nextRoute = this.$root.router.options.routes[0]
              }
            }
            this.$router.push(nextRoute);
          }
        }
        if (item.path == route.path) {
          this.visitedViews.splice(index, 1);
        }
      })
    },
    isActive (route) {
      return route.path === this.$route.path
    },
    addViewTags (route) {
      if (this.visitedViews.some(v => v.path === route.path)) return
      this.visitedViews.push(Object.assign({}, route, { title: route.meta.title }))
    },
    moveToCurrentTag () {
      const tags = this.$refs.tag
      this.$nextTick(() => {
        for (const tag of tags) {
          if (tag.to.path === this.$route.path) {
            this.$refs.scrollPane.moveToTarget(tag.$el)
            break
          }
        }
      })
    }
  },
  data () {
    const _this = this;
    return {
      mouseRightIndex: 0,
      visitedViews: [],
      MouseRightConfig: [{
        icon: '',
        title: '关闭该页',
        callback: function () {
          var index = _this.mouseRightIndex;
          var targetRoute = _this.visitedViews[index];
          if (!_this.isActive(targetRoute)) {
            _this.visitedViews.splice(index, 1);
          } else {
            var nextRoute = {};
            if (index < _this.visitedViews.length - 1) {
              nextRoute = _this.visitedViews[index + 1];
            } else {
              if (index > 0) {
                nextRoute = _this.visitedViews[index - 1];
              } else {
                nextRoute = _this.$root.router.options.routes[0]
              }
            }
            _this.$router.push(nextRoute);
            _this.visitedViews.splice(index, 1);
          }
        }
      }, {
        icon: '',
        title: '关闭其他页',
        callback: function () {
          var index = _this.mouseRightIndex;
          var targetRoute = _this.visitedViews[index];
          _this.visitedViews = [targetRoute];
          _this.$router.push(_this.visitedViews[0])
        }
      }, {
        icon: '',
        title: '关闭所有页',
        callback: function () {
          _this.visitedViews = [_this.$root.router.options.routes[0]];
          _this.$router.push(_this.visitedViews[0])
        }
      }]
    }
  },
  mounted () {
    if (this.visitedViews.length == 0) {
      this.visitedViews.push(Object.assign({}, this.$route, { title: this.$route.meta.title }))
    }
  },
  components: {
    ScrollPane,
    MouseRightMenu
  }
}
</script>

<style lang="less" scoped>
// [class^="icon-"], [class*=" icon-"] {
//   /* use !important to prevent issues with browser extensions that change fonts */
//   font-family: 'iconfont' !important;
//   speak: none;
//   font-style: normal;
//   font-weight: normal;
//   font-variant: normal;
//   text-transform: none;
//   line-height: 1;

//   /* Better Font Rendering =========== */
//   -webkit-font-smoothing: antialiased;
//   -moz-osx-font-smoothing: grayscale;
// }
.tags-view-container {
  .tags-view-wrapper {
    background: #fff;
    height: 34px;
    border-bottom: 1px solid #d8dce5;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
    .tags-view-item {
      cursor: pointer;
      border: 1px solid #d8dce5;
      display: inline-block;
      position: relative;
      height: 26px;
      line-height: 26px;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      &:first-of-type {
        margin-left: 15px;
      }
      &.active {
        background-color: #20a0ff;
        border-color: #20a0ff;
        color: #fff;
        &::before {
          content: "";
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
      .icon-guanbi5 {
        cursor: pointer;
        display: inline-block;
        margin-left: 3px;
        width: 16px;
        height: 16px;
        font-size: 10px;
        line-height: 16px;
        border-radius: 50%;
        text-align: center;
        transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
        transform-origin: 100% 50%;
        &:before {
          transform: scale(0.8);
          display: inline-block;
          content: "\E624";
        }
        &:hover {
          background-color: #b4bccc;
          color: #fff;
        }
      }
    }
  }
}
</style>
