<template>
  <div class="nav">
    <my-menu v-for="cfg in menuList"
             @zoom="zoom"
             :config="cfg"
             :key="cfg.name"
             ref="menu"></my-menu>
  </div>
</template>

<script>
import MyMenu from "./common/Menu.vue"
import TreeUtil from "../utils/TreeUtil"
import {mapMutations} from 'vuex'
export default {
  data () {
    return {
      menuList: []
    }
  },
  components: {
    MyMenu: MyMenu
  },
  methods: {
    ...mapMutations(['setMenuList']),
    zoom (menu) {
      for (var i in this.$refs.menu) {
        var vc = this.$refs.menu[i];

        if (vc.id != menu.id && vc.close) {
          vc.close();
        }
      }
    }
  },
  mounted () {
    var datas = new Array();
    var routes = this.$root.router.options.routes;
    var routeNames = new Array();
    var routeTxts = new Array();

    for (var i in routes) {
      var routeName = routes[i].name;
      var routeTxt = routes[i].meta ? routes[i].meta.title : '';
      if (routeName && routeName.length
        && routeName.length > 0) {
        routeNames.push(routeName);
        routeTxts.push(routeTxt);
      }
    }
    //预置构造完整树的默认结点
    datas.push({
      id: "-1",
      name: ""
    });

    datas.push({
      id: "0",
      name: "",
      parentId: "-1"
    });

    // var menuList = this.$root.tools.menuList();
    // for (var i in menuList) {
    //   var data = menuList[i];
    //   var code = data.code;

    //   //只添加在在路由中配置了的菜单数据
    //   if (routeNames.indexOf(code) >= 0) {
    //     let index = routeNames.indexOf(code);
    //     data.name = routeTxts[index] ? routeTxts[index] : data.name;
    //     datas.push(data)
    //   }
    // }
    var menuList = this.$root.tools.menuList();
    for (var i in routeNames) {
      var code = routeNames[i];
      for (var j in menuList) {
        //只添加在在路由中配置了的菜单数据
        if (menuList[j].code === code) {
          const data = menuList[j];
          data.name = routeTxts[i].length > 0 ? routeTxts[i] : data.name;
          datas.push(data)
        }
      }
    }

    this.menuList = TreeUtil(datas, ["code"]).children[0].children;
    this.setMenuList(this.menuList);
  }
}
</script>

<style scoped>
.nav {
  width: 100%;
  padding-top: 5px;
}
</style>
