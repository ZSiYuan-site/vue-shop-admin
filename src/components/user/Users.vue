<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索与添加用户区域 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input
            v-model="queryInfo.query"
            placeholder="请输入内容"
            class="input-with-select"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUser">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" style="width: 100%" stripe border>
        <el-table-column type="index" label="序号" width="50">
        </el-table-column>
        <el-table-column prop="username" label="姓名" width="150">
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180">
        </el-table-column>
        <el-table-column prop="mobile" label="电话" width="180">
        </el-table-column>
        <el-table-column prop="role_name" label="角色" width="180">
        </el-table-column>
        <el-table-column prop="mg_state" label="状态" width="180">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="editUser(scope.row.id)"
              ><i class="el-icon-edit"></i
            ></el-button>
            <el-button
              type="danger"
              size="mini"
              @click="deleteUser(scope.row.id)"
              ><i class="el-icon-delete"></i
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
            >
              <el-button
                type="warning"
                size="mini"
                @click="assignRole(scope.row)"
                ><i class="el-icon-setting"></i
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 5]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalUsers"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addUserDialogVisible"
      width="50%"
      @close="addUserDialogClosed"
    >
      <span>
        <el-form
          :model="addUserForm"
          ref="addUserFormRef"
          label-width="80px"
          :rules="addUserRules"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addUserForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sumbitAddUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editUserDialogVisible"
      width="50%"
    >
      <span>
        <el-form
          :model="editUserForm"
          :rules="editUserRules"
          label-width="100px"
          class="demo-ruleForm"
          ref="editUserFormRef"
        >
          <el-form-item label="用户名">
            <el-input
              :disabled="true"
              v-model="editUserForm.username"
            ></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditUserForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="assignRoleDialogVisible"
      width="50%"
      @close="assignRoleDialogClosed"
    >
      <div>
        <div>当前的用户 : {{ this.roleInfo.username }}</div>
        <br />
        <div>当前的角色 : {{ this.roleInfo.role_name }}</div>
        <br />
        <div>
          分配新角色 :
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in allRolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义邮箱验证规则
    var checkEmail = (rule, value, callback) => {
      // 邮箱验证规则正则表达式
      const emailReg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/
      if (emailReg.test(value)) return callback()
      callback(new Error('请输入合法邮箱'))
    }
    var checkMobile = (rule, value, callback) => {
      // 手机验证规则正则表达式
      const mobileReg =
        /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/
      if (mobileReg.test(value)) return callback()
      callback(new Error('请输入合法手机号'))
    }
    return {
      // 当前选中的角色
      selectedRoleId: '',
      // 所有角色列表
      allRolesList: [],
      // 控制分配角色对话框的展示与隐藏
      assignRoleDialogVisible: false,
      // 修改用户的表单数据对象
      editUserForm: {
        id: '',
        username: '',
        email: '',
        mobile: '',
      },
      // 修改用户的表单验证对象
      editUserRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      // 控制修改用户对话框的展示与隐藏
      editUserDialogVisible: false,
      // 添加用户的验证规则对象
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 10,
            message: '长度在 6 到 10 个字符',
            trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      // 添加用户所需的参数对象
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      // 用户列表的参数对象
      queryInfo: {
        // 查询参数
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 1,
      },
      // 总用户数
      totalUsers: 0,
      // 用户列表
      userList: [],
      // 添加用户对话框的显示与隐藏
      addUserDialogVisible: false,
      // 当前正在分配的角色的所有信息
      roleInfo: {},
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    //   获取用户列表数据
    async getUserList() {
      const { data: result } = await this.$http.get('/users', {
        params: this.queryInfo,
      })
      if (result.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！！')
      }
      console.log(result)
      this.userList = result.data.users
      this.totalUsers = result.data.total
      // console.log(result)
    },
    // 每页的条数
    handleSizeChange(newPagesize) {
      this.queryInfo.pagesize = newPagesize
      this.getUserList()
    },
    // 当前页
    handleCurrentChange(newPagenum) {
      this.queryInfo.pagenum = newPagenum
      this.getUserList()
    },
    // 用户状态改变
    async userStateChange(userInfo) {
      const { data: result } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (result.meta.status !== 200) {
        // 既然修改用户状态失败了，但是页面还是会更改的，所以要重置回去
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败！！')
      }
      this.$message.success('更新用户成功！！')
    },
    // 点击添加用户
    addUser() {
      this.addUserDialogVisible = true
    },
    // 添加用户对话框 关闭
    addUserDialogClosed() {
      // 重置添加用户表单
      this.$refs.addUserFormRef.resetFields()
    },
    // 点击确认添加用户
    sumbitAddUser() {
      // 进行表单全验证
      this.$refs.addUserFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: result } = await this.$http.post(
          '/users',
          this.addUserForm
        )
        // console.log(result)
        if (result.meta.status !== 201) {
          return this.$message.error('创建用户失败，请重试！！')
        }
        this.$message.success('创建用户成功！！')
        this.addUserDialogVisible = false
        this.getUserList()
      })
    },
    // 修改用户
    async editUser(id) {
      this.editUserDialogVisible = true
      const { data: result } = await this.$http.get(`/users/${id}`)
      // console.log(result)
      if (result.meta.status !== 200) {
        return this.$message.error('查询用户失败，请重试！！')
      }
      this.editUserForm = result.data
    },
    // 提交修改用户表单数据
    submitEditUserForm() {
      this.$refs.editUserFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: result } = await this.$http.put(
          `/users/${this.editUserForm.id}`,
          {
            email: this.editUserForm.email,
            mobile: this.editUserForm.mobile,
          }
        )
        if (result.meta.status !== 200) {
          return this.$message.error('修改用户失败！！')
        }
        this.$message.success('修改用户成功！！')
        this.editUserDialogVisible = false
        this.getUserList()
        // console.log(result)
      })
    },
    // 点击删除用户的回调函数
    async deleteUser(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！！')
      }
      const { data: result } = await this.$http.delete(`users/${id}`)
      if (result.meta.status !== 200) {
        return this.$message.error('删除用户失败！！')
      }
      this.getUserList()
      this.$message.success('删除用户成功！！')
      console.log(result)
    },
    // 点击分配角色按钮
    assignRole(roleInfo) {
      this.assignRoleDialogVisible = true
      this.getAllRolesList()
      this.roleInfo = roleInfo
      // console.log(roleInfo)
    },
    // 获取所有的角色列表
    async getAllRolesList() {
      const { data: result } = await this.$http.get('/roles')
      this.allRolesList = result.data
      // console.log(result.data)
    },
    // 点击确定按钮，分配角色
    async saveRoleInfo() {
      console.log(this.selectedRoleId)
      const { data: result } = await this.$http.put(
        `/users/${this.roleInfo.id}/role`,
        { rid: this.selectedRoleId }
      )
      if (result.meta.status !== 200) {
        return this.$message.error('设置用户新角色失败！！')
      }
      this.getUserList()
      this.$message.success('设置用户新角色成功！！')
      this.assignRoleDialogVisible = false
      console.log(result)
    },
    // 分配用户角色对话框关闭
    assignRoleDialogClosed() {
      this.selectedRoleId = ''
      this.roleInfo = {}
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
</style>