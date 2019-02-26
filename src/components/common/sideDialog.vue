<template>

</template>
<script>
  export default {
    name: 'Dialog',
    props: {

    },
    data() {
      return {

      }
    },
    methods: {
      createMenuItem(id, name, callback,item) {
        // 创建菜单项
        var menuItem = document.createElement("div");
        menuItem.setAttribute("class", "web-context-menu-item");
        menuItem.setAttribute("id", id);
        // 菜单项中的span，菜单名
        var span = document.createElement("span");
        span.setAttribute("class", "menu-item-name");
        span.innerText = name;
        if (callback && typeof callback === 'function') {
          span.addEventListener("click", callback);
        }
        // 创建小箭头
        var i = document.createElement("i");
        i.innerText = "▲";
        span.appendChild(i);
        // 创建下一层菜单的容器
        var subContainer = document.createElement("div");
        subContainer.setAttribute("class", "web-context-menu-items "+item);
        // subContainer.setAttribute("class", item);

        menuItem.appendChild(span);
        menuItem.appendChild(subContainer);
        return menuItem;
      },
      // 创建菜单项之间的分隔线条
      createLine() {
        var line = document.createElement("div");
        line.setAttribute("class", "menu-item-line");
        return line;
      },
      createMenu(index, menuArr,item) {
        // 创建菜单层
        var _this = this;
        var menu = document.createElement("div");
        menu.setAttribute("class", "web-context-menu");
        menu.setAttribute("id", "web-context-menu-" + index);
        document.querySelector("body").appendChild(menu);
        // 创建菜单项容器
        var menuItemsContainer = document.createElement("div");
        menuItemsContainer.setAttribute("class", "web-context-menu-items");
        menu.appendChild(menuItemsContainer);

        // 遍历菜单项
        for (var i = 0; i < menuArr.length; i++) {
          var menuItem = menuArr[i];
          var parent = menuItem.parent;
          // 创建菜单项
          var oneMenu = _this.createMenuItem(menuItem.id, menuItem.name, menuItem.callback,item);
          if (!parent) {
            menuItemsContainer.appendChild(oneMenu);
            menuItemsContainer.appendChild(_this.createLine());
          } else {
            var parentNode = document.querySelector("#" + parent + " ."+item);
            parentNode.appendChild(oneMenu);
            parentNode.appendChild(_this.createLine());
          }
        }
        // 遍历菜单项去掉没有子菜单的菜单项的小箭头
        var allContainer = menu.querySelectorAll(".web-context-menu-items");
        for (var i = 0; i < allContainer.length; i++) {
          var oneContainer = allContainer[i];
          if (!oneContainer.hasChildNodes()) {
            var iTag = oneContainer.parentElement.querySelector("i")
            iTag.parentElement.removeChild(iTag);
          }
        }
      },
      showMenu(event, menu) {
        menu.style.left = event.clientX + "px";
        menu.style.top = event.clientY + "px";
        menu.style.display = "block";
      },
      /**
	 * 绑定菜单
	 * @param {DOMObject} obj DOM对象
	 * @param {Array} menuArr 菜单数组
	 * @param {String} string  父级传给子组件用于区分相同子组件的字段
	 */
      contextMenu(obj, menuArr,item) {
        console.log(33)
        var _this = this;
        // debugger
        obj.oncontextmenu = function (event) {
          var index = 0;
          // debugger
          var dataMenuIndex = obj.getAttribute("data-menu-index");
          // 获取obj绑定的菜单索引
          if (dataMenuIndex) {
            index = dataMenuIndex;
          } else {
            // else还没有绑定菜单，以当前页面的菜单数量为索引
            var allMenu = document.querySelectorAll(".web-context-menu");
            if (allMenu && allMenu.length) {
              index = allMenu.length;
            }
            obj.setAttribute("data-menu-index", index); // 绑定索引
          }
          // debugger
          var menu = document.querySelector("#web-context-menu-" + index);
          if (!menu || menu.length < 1) {
            _this.createMenu(index, menuArr,item);
            menu = document.querySelector("#web-context-menu-" + index);
          }
          _this.showMenu(event, menu);
          document.addEventListener("click", function () {
            menu.style.display = "none";
          });
          menu.addEventListener("mouseleave", function (e) {
            menu.style.display = "none";
          });
          return false;
        };
        return false;
      }
    },
    created() {
      
    }
  }

</script>
<style >
  .web-context-menu {
    margin: 0;
    padding: 0;
    display: none;
    font-size: 14px;
    width: 180px;
    position: fixed;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, .6);
    background: #fff;
  }

  .web-context-menu * {
    margin: 0;
    padding: 0;
    font-style: normal;
  }

  .web-context-menu-items {}

  .web-context-menu-items .menu-item-line {
    border-bottom: 1px solid #efefef;
    width: 93.5%;
    margin: 0 auto;
  }

  .web-context-menu-items .menu-item-line:last-child {
    display: none;
  }

  .web-context-menu-items .web-context-menu-item {
    position: relative;
  }

  .web-context-menu-items .web-context-menu-item:last-child {
    border: 0;
  }

  .web-context-menu-items .web-context-menu-item .menu-item-name {
    display: block;
    cursor: pointer;
    padding: 7px 10px;
  }

  .web-context-menu-items .web-context-menu-item:hover .menu-item-name {
    background: rgba(0, 0, 0, .01);
  }

  .web-context-menu-items .web-context-menu-item>.web-context-menu-items {
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(102, 175, 233, .6);
    background: #fff;
  }

  .web-context-menu-items .web-context-menu-item:hover>.web-context-menu-items {
    display: block;
  }

  .web-context-menu-items .web-context-menu-item .menu-item-name>i {
    display: inline-block;
    transform: rotate(90deg);
    float: right;
    margin-right: 5px;
    color: #aaa;
  }

  .web-context-menu-items .web-context-menu-item>.web-context-menu-items {
    position: absolute;
    right: -180px;
    top: 0;
    width: 180px;
    display: none;
  }

</style>
