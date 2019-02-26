import Vue from 'vue'
import Router from 'vue-router'
import MyDataSource from '@/pages/DataSourceManage/myDataSource'
import DataBaseView from '@/pages/DataSourceView/DataBaseView'
import spaceBaseView from '@/pages/DataSourceView/spaceBaseView'
import NoSqlView from '@/pages/DataSourceView/NoSqlView'
import FileView from '@/pages/DataSourceView/FileView'
import Mydata from '@/pages/DataManage/Mydata'
import MetaDataManage from '@/pages/DataManage/MetaDataManage'
import DataIndex from '@/pages/DataManage/DataIndex'
import FileSystem from '@/pages/FileSystem/main'
import GisServerManage from '@/pages/SystemConfigManage/GisServerManage/main'
import DescGroupManage from '@/pages/SystemConfigManage/DescGroupManage/main'
import DataSpecificationManage from '@/pages/SystemConfigManage/DataSpecificationManage/main'
import DataDirectoryManage from '@/pages/SystemConfigManage/DataDirectoryManage/main'
import ResourceOverview from '@/pages/ResourceOverview/main'
import ResourceSubmitManage from '@/pages/ResourceSubmitManage/main'
import ResourceShareManage from '@/pages/ResourceShareManage/main'
import UpdateReview from '@/pages/UpdateReview/main'
import MyCopy from "@/pages/DataCopy/MyCopy"
import ManualCopy from "@/pages/DataCopy/ManualCopy"
import AutoCopy from "@/pages/DataCopy/AutoCopy"
import OnwershipManage from "@/pages/DataAccredit/OwnershipManage/main"
import PremissionManage from "@/pages/DataAccredit/PremissionManage"
import UnAuthorized from '@/components/UnAuthorized'

Vue.use(Router)

const routerConfig = {
  routes: [
    {
      path: '/FileSpace',
      name: 'FileSpace',
      component: FileSystem,
      meta: {
        title: '我的存储空间'
      }
    },
   /* {
      path: '/resourceOverview',
      name: 'resourceOverview',
      component: ResourceOverview,
      meta: {
        title: '资源预览'
      }
    },*/
    {
      path: '/DataSourceManage',
      name: 'DataSourceManage',
      component: MyDataSource,
      meta: {
        title: '数据源注册'
      }
    },
    {
      path: '/DataSourceView',
      name: 'DataSourceView',
      meta: {
        title: '数据源管理'
      }
    },
    {
      path: '/DataBaseView',
      name: 'DataBaseView',
      component: DataBaseView,
      meta: {
        title: '关系型数据库'
      }
    },
    {
      path: '/spaceSqlView',
      name: 'spaceSqlView',
      component: spaceBaseView,
      meta: {
        title: '空间型数据库'
      }
    },
    /*{
      path: '/nosql',
      name: 'NoSqlView',
      component: NoSqlView,
      meta: {
        title: 'NoSQL数据库'
      }
    },*/
    /*{
      path: '/FileView',
      name: 'FileView',
      component: FileView,
      meta: {
        title: '文件储存型数据库'
      }
    },*/
    {
      path: '/gescGroupManage',
      name: 'gescGroupManage',
      component: DescGroupManage,
      meta: {
        title: '描述组别管理'
      }
    },
    {
      path: '/dataSpecificationManage',
      name: 'dataSpecificationManage',
      component: DataSpecificationManage,
      meta: {
        title: '数据规范管理'
      }
    },
    {
      path: '/DataManage',
      name: 'DataManage',
      meta: {
        title: '数据管理'
      }
    },
    {
      path: '/Mydata',
      name: 'Mydata',
      component: Mydata,
      meta: {
        title: '我的数据'
      }
    },
    {
      path: '/MetaDataManage',
      name: 'MetaDataManage',
      component: MetaDataManage,
      meta: {
        title: '元数据管理'
      }
    },
    {
      path: '/DataAccredit',
      name: 'DataAccredit',
      meta:{
        title:'数据权限'
      }
    },
    {
      path: '/OnwershipManage',
      name: 'OnwershipManage',
      component: OnwershipManage,
      meta:{
        title:'权属管理'
      }
    },
    {
      path: '/PremissionManage',
      name: 'PremissionManage',
      component: PremissionManage,
      meta:{
        title:'权限管理'
      }
    },
    {
      path: '/DataCopy',
      name: 'DataCopy',
      meta:{
        title:'数据备份'
      }
    },
    /*{
      path: '/MyCopy',
      name: 'MyCopy',
      component: MyCopy,
      meta:{
        title:'我的备份'
      }
    },*/
    {
      path: '/ManualCopy',
      name: 'ManualCopy',
      component: ManualCopy,
      meta:{
        title:'手动备份'
      }
    },
    {
      path: '/AutoCopy',
      name: 'AutoCopy',
      component: AutoCopy,
      meta:{
        title:'自动备份'
      }
    },
    {
      path: '/dataDirectoryManage',
      name: 'dataDirectoryManage',
      component: DataDirectoryManage,
      meta: {
        title: '数据目录管理'
      }
    },
    {
      path: '/gisServerManage',
      name: 'gisServerManage',
      component: GisServerManage,
      meta: {
        title: 'GIS服务器管理'
      }
    },

    /*{
      path: '/resourceSubmitManage',
      name: 'resourceSubmitManage',
      component: ResourceSubmitManage,
      meta: {
        title: '资源提交'
      }
    },

    {
      path: '/resourceShareManage',
      name: 'resourceShareManage',
      component: ResourceShareManage,
      meta: {
        title: '资源分享'
      }
    },
    {
      path: '/updateReview',
      name: 'updateReview',
      component: UpdateReview,
      meta: {
        title: '资源审核'
      }
    },*/
    {
      path: '/onlineUpdate',
      name: 'onlineUpdate',
      beforeEnter() {
        window.open('http://192.168.1.193:8010/smartcity/task2/resourceRenewal.html')
      }
    },
    {
      path: '/onlineDrawing',
      name: 'onlineDrawing',
      meta: {
        title: '在线制图'
      },
      beforeEnter() {
        window.open('http://192.168.1.193:8010/smartcity/task2/onlineCartography.html')
      }
    },
    {
      path: '/onlineEditing/:id',
      name: 'onlineEditing',
      beforeEnter() {
        window.open('./api/sys/onlineEditing')
      }
    },
    {
      path: '/SystemConfigManage',
      name: 'systemConfigManage',
      meta: {
        title: '系统配置管理'
      }
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: UnAuthorized
    }
  ]
}

const unlimitedPath = ['/unauthorized']

const router = new Router(routerConfig)
router.initMenuList = function(menuList) {
  this.beforeEach((to, from, next) => {
    var menuCodes = new Array()
    menuList.forEach(menuInfo => {
      menuCodes.push(menuInfo.code)
    })
    // debugger
    //当访问根路由时
    if (to.path == '/') {
      // 跳转到有权限的第一个页面，匹配顺序为routeConfig中配置的先后顺序
      for (var routeInfo of routerConfig.routes) {
        if (menuCodes.indexOf(routeInfo.name) != -1) {
          next(routeInfo.path.replace(':id', routeInfo.name))
          return
        }
      }
    }

    //访问无需授权的路由
    if (unlimitedPath.indexOf(to.path) != -1) {
      next()
      return
    }

    //访问需要授权的页面而当前用户无权访问则跳转到无权访问提示页面
    if (menuCodes.indexOf(to.name) == -1) {
      next('/unauthorized')
      return
    }

    next()
  })
}

export default router
