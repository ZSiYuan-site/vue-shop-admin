import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../components/login/Login.vue'
import Home from '../components/home/Home.vue'
import Welcome from '../components/welcome/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/powder/Rights.vue'
import Roles from '../components/powder/Roles.vue'
import Category from '../components/goods/Category.vue'
import Params from '../components/goods/Params.vue'
import List from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'
Vue.use(VueRouter)

const routes = [{
  path: '/',
  redirect: '/login'
}, {
  path: '/login',
  component: Login
}, {
  path: '/home',
  component: Home,
  redirect: '/welcome',
  children: [{
      path: '/welcome',
      component: Welcome
    },
    {
      path: '/users',
      component: Users
    },
    {
      path: '/rights',
      component: Rights
    },
    {
      path: '/roles',
      component: Roles
    },
    {
      path: '/categories',
      component: Category
    },
    {
      path: '/params',
      component: Params
    },
    {
      path: '/goods',
      component: List
    },
    {
      path: '/goods/add',
      component: Add
    },
    {
      path: '/orders',
      component: Order
    },
    {
      path: '/reports',
      component: Report
    }
  ]
}]

const router = new VueRouter({
  routes
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  // 如果直接访问登录页面，则直接放行
  if (to.path === '/login') return next()
  // 从本地读取token
  const tokenSrtr = window.sessionStorage.getItem('token')
  // 本地没有token，强制跳转到登录页面
  if (!tokenSrtr) return next('/login')
  // 有token,放行
  next()
})

export default router
