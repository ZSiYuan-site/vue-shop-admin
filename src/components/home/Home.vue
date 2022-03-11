<template>
  <el-container class="home_container">
    <!-- 头部 -->
    <el-header>
      <div>电商管理系统</div>
      <el-button type="primary" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 左侧侧边栏 -->
      <el-aside :width="isCollapse ? '60px' : '200px'">
        <!-- 切换的按钮 -->
        <div @click="toggleCollapse" class="toggleButton">
          <span>| | |</span>
        </div>
        <!-- 左侧菜单栏 -->
        <el-menu
          background-color="green"
          text-color="#fff"
          unique-opened
          active-text-color="skyblue"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 下面的index只接收字符窜 index控制展开与关闭 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 中间主体区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 当前激活的菜单路径
      activePath: '',
      // 控制侧边栏是否展开
      isCollapse: true,
      // 左侧的菜单列表
      menuList: [],
      // 字体图标对象
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao',
      },
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出登录
    logout() {
      // 清除token
      window.sessionStorage.clear('token')
      // 跳转到登录页面
      this.$router.push('/login')
    },
    // 获取左侧菜单
    async getMenuList() {
      const { data: result } = await this.$http.get('/menus')
      if (result.meta.status !== 200) {
        return this.$message.error(result.meta.msg)
      }
      this.menuList = result.data
      // console.log(this.menuList)
    },
    // 点击切换折叠
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 点击二级菜单,保存当前激活的二级菜单项
    saveNavState(activePath) {
      // 将当前激活的路径保存到sessionStorage中
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
  },
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;
}
.el-header {
  background: red;
  display: flex;
  align-items: center;
  font-size: 20px;
  justify-content: space-between;
}
.el-aside {
  background: green;
}
.el-main {
  background: #eaedf1;
}
.iconfont {
  margin-right: 8px;
}
.toggleButton {
  height: 30px;
  color: #fff;
  text-align: center;
  line-height: 30px;
  > span {
    width: 30px;
    height: 30px;
  }
}
</style>
