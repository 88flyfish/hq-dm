// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

//全局区
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './vuex/states'
import VueResource from 'vue-resource'
import ElementUI from 'element-ui'
import '../node_modules/element-ui/lib/theme-default/index.css'
import { funDownload } from './utils/toolbox'

Vue.prototype.$funDownload = funDownload
Vue.config.productionTip = false //用来关闭生产模式下给出的提示（关闭后控制台不会打印警告信息）

Vue.use(VueResource)
Vue.use(ElementUI)
// router.beforeEach((to,from,next)=>{
//     // debugger
// })

Object.assign(Vue.prototype, {
  //弹框类型和弹框内容的封装，在vue文件里，使用 this.$message('弹框内容','弹框类型') 便可调出。弹框类型有 'success','warning','info','error' 四种。
  $message: (msg, type) => {
    if (!store.state.showMessage) {
      store.commit('setShowMessage', true)
      store.commit('setMessageType', type)
      store.commit('setMessageContent', msg)
    } else {
      store.commit('setShowMessage', false)
      setTimeout(() => {
        store.commit('setShowMessage', true)
        store.commit('setMessageType', type)
        store.commit('setMessageContent', msg)
      }, 600)
    }
  },
  //兼容后端的传参：toBool和 toParamStr 方法
  toBool: str => {
    if (str == 'true' || str == '1') {
      return true
    } else if (str == 'false' || str == '0') {
      return false
    } else {
      return false
    }
  },
  toParamStr: bool => {
    return bool ? '1' : '0'
  },
  globalClick: callback => {
    $(document).click(callback)
  }
})

function getUrlParam(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)') //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg) //匹配目标参数
  if (r != null) return unescape(r[2])
  return null //返回参数值
}

Vue.http.interceptors.push((request, next) => {
  next(response => {
    //用于判断响应结果为登陆页面，如果为登陆页面说明未进行登记或session超时
    if (response.bodyText.indexOf('<-LoginPage->') > 0) {
      //跳转到登陆页面
      window.location = './login.html'
      return request.respondWith(response.body)
    }
    return response
  })
})
// 限制输入框的输入类型
Vue.directive('inputLimit', {
  bind(el, binding, vnode, oldVnode) {
    function checkIntOrFloat(value) {
      if (!reg.test(value)) {
        // 对 <iInput>组件里的inputValue状态进行修改，不可以使用 el.value修改
        vnode.child.inputValue = ''
      }
    }

    function checkInt(value) {
      if (!reg.test(value)) {
        vnode.child.inputValue = ''
      }
    }

    var reg = new RegExp(/.*/)
    if (el.attributes.zztype.nodeValue == 'intOrFloat') {
      reg = /^[0-9]+([.]{1}[0-9]+){0,1}$/
      el.addEventListener('blur', function() {
        checkIntOrFloat(el.value)
      })
    } else if (el.attributes.zztype.nodeValue == 'int') {
      reg = /^[0-9]+$/
      el.addEventListener('keyup', function() {
        checkInt(el.value)
      })
    }
  }
})
Vue.directive('focus', {
  bind: function(el, binding) {
    // el是绑定指令的元素
    var value = binding.value // 传递给指令的值
    el.wrong = function() {
      // 错误执行
      //value.methods.call(this, value);
      $(this)
        .children('span')
        .html('错误')
    }
    el.correct = function() {
      // 正确执行
      //value.methods.call(this, value);
      $(this)
        .children('span')
        .html('正确')
    }

    el.getElementsByTagName('input')[0].addEventListener('blur', function() {
      checkout(el.getElementsByTagName('input')[0].value)
    })
    el.getElementsByTagName('input')[0].addEventListener('focus', function() {
      el.getElementsByTagName('input')[0].value = ''
      $(this)
        .next()
        .html('')
    })
    var filter = /\w$/ //初始化为全字符
    if (el.attributes.zztype.nodeValue == 'phone') {
      filter = /^1\d{10}$/
    }
    if (el.attributes.zztype.nodeValue == 'name') {
      filter = /^[\w|\d]{4,16}$/
    }
    if (el.attributes.zztype.nodeValue == 'email') {
      filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
    }
    if (el.attributes.zztype.nodeValue == 'password') {
      filter = /^[\w!@#$%^&*.]{6,16}$/
    }

    function checkout(value) {
      if (!filter.test(value)) {
        el.wrong()
      } else {
        el.correct()
      }
    }
  }
})

var httpHandler = new Vue().$http
Vue.mixin({
  methods: {
    a() {
      console.log(333)
    }
  }
})
//获取当前用户的信息
httpHandler.get('./loginapi/sys/getCurrentUser').then(res => {
  var user = res.body.content

  //获取当前用户的菜单权限列表
  httpHandler.get('./loginapi/sys/getCurrentUserPermissionsTree').then(res => {
    // console.log(1,res.body.content)
    var menuList = res.body.content

    //获取当前用户的按钮操作权限列表
    httpHandler.get('./loginapi/sys/getCurrentUserPermissions').then(res => {
      var permissionList = res.body.content
      var permissions = new Array()

      for (var i in permissionList) {
        permissions[permissionList[i]] = permissionList[i]
      }

      Vue.prototype.$permissionValid = function(code) {
        //不传入权限代码说明不需要验证，直接返回true
        if (code == null || code == '') {
          return true
        }

        if (typeof permissions[code] != 'undefined') {
          return true
        } else {
          return false
        }
      }

      function initSysTools() {
        var inBrowser = typeof window !== 'undefined'
        var UA = inBrowser && window.navigator.userAgent.toLowerCase()
        var isIE = UA && /msie|trident/.test(UA)
        var isIE9 = UA && UA.indexOf('msie 9.0') > 0
        var isEdge = UA && UA.indexOf('edge/') > 0
        var isAndroid = UA && UA.indexOf('android') > 0
        var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA)
        var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge
        var winNum = 1
        return {
          isIE: isIE, //是否是IE浏览器
          isIE9: isIE9, //是否是IE9浏览器
          isEdge: isEdge, //是否是Edge浏览器
          isChrome: isChrome, //是否是Chrome浏览器
          isAndroid: isAndroid,
          isIOS: isIOS,
          currentUser: function() {
            return user
          },
          menuList: function() {
            return menuList
          },
          winNum() {
            return winNum++
          }
        }
      }

      //初始化路由，传入用户的有权限的菜单列表
      router.initMenuList(menuList)
      //初始化Vue根实例
      new Vue({
        el: '#app',
        router,
        store,
        render: h => h(App),
        data: {
          bus: new Vue(), //全局的消息总线，组件内部可以通过this.$root.bus来引用该消息总线
          tools: initSysTools(), //全局的工具方法，组件内部可以通过this.$root.tools来引用
          router: router
        }
      })
    })
  })
})

//样式区
import './common/css/base.css'
import './common/css/app.scss'
import './common/css/step.scss'
import './common/css/nav.scss'
import './common/css/header.scss'

import './common/css/iconfont.css'

import './common/css/organization.scss'
import './common/css/roleManager.scss'
import './common/css/user.scss'

//js区
import './common/js/jquery-layerDrag'
import './common/js/auto-line-number'
