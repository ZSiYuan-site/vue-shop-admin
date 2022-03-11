<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-table :data="rightsList" style="width: 100%" stripe border>
        <el-table-column type="index" label="序号" width="50">
        </el-table-column>
        <el-table-column prop="authName" label="权限名称" width="180">
        </el-table-column>
        <el-table-column prop="path" label="路径" width="180">
        </el-table-column>
        <el-table-column prop="level" label="权限等级">
          <el-button type="primary" plain size="mini">一级</el-button>
          <el-button type="success" plain size="mini">二级</el-button>
          <el-button type="warning" plain size="mini">三级</el-button>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 权限列表
      rightsList: [],
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      const { data: result } = await this.$http.get('rights/list')
      console.log(result)
      this.rightsList = result.data
    },
  },
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 10px;
}
</style>