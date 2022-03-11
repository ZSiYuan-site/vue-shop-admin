import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入字体图标
import './assets/fonts/iconfont.css'

// 引入全局样式
import './assets/css/global.css'

// 引入 依赖
import TreeTable from 'vue-table-with-tree-grid'

// 引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 引入富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 引入nprogress包对应的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 引入axios
import axios from 'axios'

// 设置基础路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 添加请求拦截器
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

// 添加响应拦截器
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
// 挂载 $http 到Vue的原型上，后面我们发送请求就可以直接通过 【this.$http.请求方式()】
Vue.prototype.$http = axios

Vue.config.productionTip = false
// 注册富文本编辑器为全局的组件
Vue.use(VueQuillEditor)

Vue.component('tree-table', TreeTable)
Vue.filter('dataFormat', function (originValue) {
  const data = new Date(originValue)

  const year = data.getFullYear()
  // padStart(2, '0') 规定长度为2位 ,不足的话  以0来代替
  const month = (data.getMonth() + 1 + '').padStart(2, '0')
  const day = (data.getDay() + '').padStart(2, '0')
  const hh = (data.getHours() + '').padStart(2, '0')
  const mm = (data.getMinutes() + '').padStart(2, '0')
  const ss = (data.getSeconds() + '').padStart(2, '0')
  return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
