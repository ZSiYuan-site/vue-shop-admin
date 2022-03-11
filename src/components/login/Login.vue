<template>
  <div class="login_container">
    <!-- 登录表单 -->
    <div class="login_box">
      <el-form
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录表单的数据对象
      loginForm: {
        username: '',
        password: '',
      },
      // 登录表单的数据验证规则对象
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '密码长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    // 重置登录表单
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    // 登录
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return
        // post参数一 ：请求路径
        // 参数二：携带的参数
        const { data: result } = await this.$http.post('/login', this.loginForm)
        if (result.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        // console.log(result)
        // 保存token到sessionStorage
        window.sessionStorage.setItem('token', result.data.token)
        // 跳转到主页
        this.$router.push('/home')
      })
    },
  },
}
</script>

<style lang="less" scoped>
.login_container {
  background: skyblue;
  width: 100%;
  height: 100%;
  .login_box {
    width: 400px;
    height: 300px;
    background: #fff;
    border-radius: 10px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 10px;
    padding-top: 50px;
  }
}
</style>
