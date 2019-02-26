<template>
  <div class="main_viewport">
    <Message></Message>
    <Headers></Headers>
    <div class="containers">
      <div class="wrap">
        <div class="nav-normal menubar"
             :class="{ 'nav-folded' : navFolded }">
          <Navs></Navs>
        </div>
        <div class="tagsView"
             :class="{'tags-folded':navFolded}">
          <TagsView></TagsView>
        </div>
        <div class="content"
             :class="{ 'expand' : navFolded }">
          <transition name="fade"
                      mode="out-in">
            <!--<keep-alive>-->
            <router-view></router-view>
            <!--</keep-alive>-->
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Navs from "./components/Nav.vue"
import Headers from "./components/Header.vue"
import Message from './components/common/Message'
import TagsView from './components/TagsView'

export default {
  name: 'app',
  data () {
    return {
      navFolded: false
    }
  },
  mounted () {
    var vue = this;

    this.$root.bus.$on("FoldNavBar", function () {
      vue.navFolded = true;
    });

    this.$root.bus.$on("UnfoldNavBar", function () {
      vue.navFolded = false;
    });
  },
  components: {
    TagsView,
    Navs,
    Headers,
    Message
  }
}
</script>
<style lang="less" scoped>
.containers {
  position: relative;
}

.nav-normal {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  overflow: auto;
}

.tagsView {
  position: absolute;
  right: 0;
  top: 0;
  left: 13vw;
  height: 35px;
  border-top: 1px solid #ddd;
  transition: all 0.5s;
}

.tagsView.tags-folded {
  left: 50px;
}

.content {
  position: absolute;
  right: 0;
  top: 35px;
  bottom: 0;
  left: 13vw;
  overflow: hidden;
  transition: all 0.5s;
  -moz-transition: all 0.5s; /* Firefox 4 */
  -webkit-transition: all 0.5s; /* Safari 和 Chrome */
  -o-transition: all 0.5s; /* Opera */
  &.expand {
    left: 50px;
  }
}
</style>
<style>
.main_viewport {
  height: 100%;
}

.containers {
  height: calc(100vh - 60px);
  overflow: auto;
}

.wrap {
  display: table;
  table-layout: fixed;
  height: 100%;
  width: 100%;
}

.menubar {
  vertical-align: top;
  background-color: #32404e;
  display: table-cell;
  overflow: hidden;
}

.content {
  vertical-align: top;
  background-color: #eeeeee;
  display: table-cell;
}

.fade-enter-active,
.fade-leave-active {
  -webkit-transition: opacity 0.2s;
  -moz-transition: opacity 0.2s;
  -ms-transition: opacity 0.2s;
  -o-transition: opacity 0.2s;
  transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
