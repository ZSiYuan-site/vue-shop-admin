<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-button type="primary" class="addButton">添加角色</el-button>
      <el-table :data="rolesList" style="width: 100%" stripe border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
              :class="[
                'vcenter',
                'bottom_border',
                index1 === 0 ? 'top_border' : '',
              ]"
            >
              <el-col :span="5">
                <el-tag>{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                  :class="[index2 === 0 ? '' : 'top_border', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag type="success">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"> </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc" width="300">
        </el-table-column>
        <el-table-column label="操作" width="400">
          <template slot-scope="scope">
            <el-button type="primary" size="mini"
              ><i class="el-icon-edit"></i>编辑</el-button
            >
            <el-button type="danger" size="mini"
              ><i class="el-icon-delete"></i>删除</el-button
            >
            <el-button
              type="warning"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              ><i class="el-icon-setting"></i>分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <span>
        <el-tree
          :data="rightList"
          :props="defaultProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defaultKeys"
          ref="treeRef"
        ></el-tree>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="ensureAssignRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 控制树形的默认选中 填入的是节点的id值
      defaultKeys: [],
      // 角色列表对象
      rolesList: [],
      // 控制分配权限对话框的展示与隐藏
      setRightDialogVisible: false,
      // 所有的权限列表
      rightList: [],
      defaultProps: {
        children: 'children',
        label: 'authName',
      },
      // 当前正在分配权限的角色id
      roleId: '',
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: result } = await this.$http.get('/roles')
      // console.log(result.data)
      this.rolesList = result.data
    },
    // 根据id删除权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！！')
      }
      const { data: result } = await this.$http.delete(
        `/roles/${role.id}/rights/${rightId}`
      )
      if (result.meta.status !== 200) {
        return this.$message.error('删除权限失败！！')
      }
      role.children = result.data
      this.$message.success('删除权限成功！！')
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 保存当前正在分配的角色id
      this.roleId = role.id
      this.setRightDialogVisible = true
      // 获取所有权限列表
      const { data: result } = await this.$http.get('rights/tree')
      // console.log(result)

      // 递归获取三级节点id
      this.getLeafKeys(role, this.defaultKeys)

      this.rightList = result.data
    },
    // 通过递归的方式，获取角色权限的三级权限
    getLeafKeys(node, arr) {
      // 通过判断node节点是否有children属性
      // 没有children属性，说明是第三节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    // 设置权限的对话框关闭
    setRightDialogClosed() {
      this.defaultKeys = []
    },
    // 点击确定分配权限
    async ensureAssignRight() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const strKeys = keys.join(',')
      const { data: result } = await this.$http.post(
        `/roles/${this.roleId}/rights`,
        {
          rids: strKeys,
        }
      )
      if (result.meta.status !== 200) {
        return this.$message.error('分配权限失败！！')
      }
      this.$message.success('分配权限成功！！')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
  },
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 20px;
}
.el-table {
  margin-top: 10px;
}
.el-tag {
  margin: 7px;
}
.bottom_border {
  border-bottom: 1px solid #eee;
}
.top_border {
  border-top: 1px solid #eee;
}
// 设置水平垂直居中
.vcenter {
  display: flex;
  align-items: center;
}
</style>
