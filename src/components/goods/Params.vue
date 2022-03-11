<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-alert
          show-icon
          title="注意：只允许为第三级分类设置相关的参数！"
          type="warning"
          :closable="false"
        >
        </el-alert>
      </el-row>
      <el-row class="chooseCatgory">
        <span>选择商品分类:</span>
        <el-cascader
          expand-trigger="hover"
          :options="allCategoryList"
          v-model="selectedKeys"
          :props="cascaderProps"
          @change="categoryChange"
          clearable
        ></el-cascader>
      </el-row>
      <el-row>
        <el-tabs v-model="activeName" @tab-click="handleTabsClick">
          <el-tab-pane label="动态属性" name="many">
            <el-button
              type="primary"
              :disabled="isBtnDisabled"
              @click="addPropsOrParams"
              >添加参数</el-button
            >
            <el-table :data="manyData" border stripe>
              <!-- 动态参数展开列 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag
                    v-for="(item, index) in scope.row.attr_vals"
                    :key="index"
                    closable
                    @close="tagRemove(index, scope.row)"
                    >{{ item }}</el-tag
                  >
                  <!-- 动态编辑标签 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                    >+ New Tag</el-button
                  >
                </template>
              </el-table-column>
              <el-table-column
                type="index"
                label="序号"
                width="50px"
              ></el-table-column>
              <el-table-column
                label="参数名称"
                prop="attr_name"
              ></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button
                    type="primary"
                    size="mini"
                    @click="editParams(scope.row.attr_id)"
                  >
                    <i class="el-icon-edit"></i>
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    size="mini"
                    @click="deleteParams(scope.row.attr_id)"
                  >
                    <i class="el-icon-delete"></i>
                    删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
            <el-button
              type="primary"
              :disabled="isBtnDisabled"
              @click="addPropsOrParams"
              >添加属性</el-button
            >
            <el-table :data="onlyData" border stripe>
              <!-- 静态属性展开列 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag
                    v-for="(item, index) in scope.row.attr_vals"
                    :key="index"
                    closable
                    @close="tagRemove(index, scope.row)"
                    >{{ item }}</el-tag
                  >
                  <!-- 动态编辑标签 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                    >+ New Tag</el-button
                  >
                </template>
              </el-table-column>
              <el-table-column
                type="index"
                label="序号"
                width="50px"
              ></el-table-column>
              <el-table-column
                label="参数名称"
                prop="attr_name"
              ></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button
                    type="primary"
                    size="mini"
                    @click="editParams(scope.row.attr_id)"
                  >
                    <i class="el-icon-edit"></i>
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    size="mini"
                    @click="deleteParams(scope.row.attr_id)"
                  >
                    <i class="el-icon-delete"></i>
                    删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-row>
    </el-card>

    <!-- 添加属性或者参数的对话框 -->
    <el-dialog
      :title="'添加' + addPropsOrParamsDialogText"
      :visible.sync="addPropsOrParamsDialogVisible"
      width="50%"
      @close="addPropsOrParamsDialogClosed"
    >
      <span>
        <el-form
          class="demo-ruleForm"
          :model="addPropsOrParamsForm"
          :rules="addPropsOrParamsFormRules"
          label-width="100px"
          ref="addPropsOrParamsFormRef"
        >
          <el-form-item :label="addPropsOrParamsDialogText" prop="attr_name">
            <el-input v-model="addPropsOrParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addPropsOrParamsDialogVisible = false"
          >取 消</el-button
        >
        <el-button type="primary" @click="submitAddPropsOrParams"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 编辑参数的对话框 -->
    <el-dialog
      title="编辑参数"
      :visible.sync="editPropsOrParamsDialogVisible"
      width="50%"
      @close="editPropsOrParamsDialogClosed"
    >
      <span>
        <el-form
          class="demo-ruleForm"
          :model="editPropsOrParamsForm"
          :rules="editPropsOrParamsFormRules"
          label-width="100px"
          ref="editPropsOrParamsFormRef"
        >
          <el-form-item label="参数名称" prop="attr_name">
            <el-input v-model="editPropsOrParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editPropsOrParamsDialogVisible = false"
          >取 消</el-button
        >
        <el-button type="primary" @click="submitEditParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 控制编辑参数对话框的显示与隐藏
      editPropsOrParamsDialogVisible: false,
      //  编辑参数的表单数据对象
      editPropsOrParamsForm: {
        attr_name: '',
      },
      // 编辑参数的表单规则对象
      editPropsOrParamsFormRules: {
        attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }],
      },
      // 添加动态参数或者静态属性的表单对象
      addPropsOrParamsForm: {
        attr_name: '',
      },
      //  添加动态参数或者静态属性的表单规则对象
      addPropsOrParamsFormRules: {
        attr_name: [{ required: true, message: '请输入参数', trigger: 'blur' }],
      },
      // 控制添加属性或参数 对话框的展示与隐藏
      addPropsOrParamsDialogVisible: false,
      // tabs标签页的当前激活项
      activeName: 'many',
      // 级联选择器选中的id值
      selectedKeys: [],
      // 所有商品分类数据
      allCategoryList: [],
      // 级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 动态属性数组
      manyData: [],
      // 静态属性数组
      onlyData: [],
    }
  },
  created() {
    this.getAllCategoryList()
  },
  methods: {
    // 标签移除
    tagRemove(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveParams(row)
    },
    // 发送请求,保存参数都数据库
    async saveParams(row) {
      const { data: result } = await this.$http.put(
        `/categories/${this.categoryId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          // 将数组转为字符串,并且通过 空格 进行拼接
          attr_vals: row.attr_vals.join(' '),
        }
      )
      if (result.meta.status !== 200) {
        return this.$message.error('添加参数失败!!')
      }
      this.$message.success('添加参数成功!!')
      // console.log(result)
    },
    // 展示文本框的回调函数
    showInput(row) {
      row.inputVisible = true
      // 页面重新渲染后调用
      // 让文本框自动获得焦点
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 动态编辑标签 失焦或着enter键抬起的回调函数
    handleInputConfirm(row) {
      // console.log(row)
      if (row.inputValue.trim().length === 0) {
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      row.inputValue = ''
      this.saveParams(row)
    },
    // 删除参数
    async deleteParams(attrId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除参数')
      }
      const { data: result } = await this.$http.delete(
        `/categories/${this.categoryId}/attributes/${attrId}`
      )
      console.log(result)
      // console.log(confirmResult)
      if (result.meta.status !== 200) {
        return this.$message.error('删除参数失败！！')
      }
      this.$message.success('删除参数成功！！')
      this.getParamsData()
      // console.log(result)
    },
    //  提交修改参数
    submitEditParams() {
      this.$refs.editPropsOrParamsFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: result } = await this.$http.put(
          `/categories/${this.categoryId}/attributes/${this.editPropsOrParamsForm.attr_id}`,
          {
            attr_name: this.editPropsOrParamsForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (result.meta.status !== 200) {
          return this.$message.error('更新参数失败！！')
        }
        this.$message.success('跟新参数成功！！')
        this.getParamsData()
        this.editPropsOrParamsDialogVisible = false
      })
    },
    // 编辑参数对话框关闭
    editPropsOrParamsDialogClosed() {
      this.$refs.editPropsOrParamsFormRef.resetFields()
    },
    //   tabs标签页发生改变
    handleTabsClick() {
      this.getParamsData()
      // console.log(this.activeName)
    },
    // 请求获取参数列表，因为级联选择器发生改变的时候要调用，
    // tabs标签页发生改变的时候也要调用，所以抽离出来
    async getParamsData() {
      // 没有选中三级分类，直接返回
      if (this.selectedKeys.length !== 3) {
        this.manyData = []
        this.onlyData = []
        return
      }
      // 证明选中了三级分类，根据不同的参数面板，获取对应的参数
      const { data: result } = await this.$http.get(
        `categories/${this.categoryId}/attributes`,
        {
          params: {
            sel: this.activeName,
          },
        }
      )
      if (result.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }

      // 通过空格切割attr_vals ，切为数组,(不明白为什么一定要放在这个位子,放在下面的会出现bug)
      result.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 为每一行添加单独的属性
        // 文本框的双向数据绑定
        item.inputValue = ''
        // 文本框是否的展示与隐藏
        item.inputVisible = false
      })

      // 判断当前激活的tabs标签页是动态属性还是静态属性
      // 当前为动态属性
      if (this.activeName === 'many') {
        // 保存到data中
        this.manyData = result.data
      } else {
        // 为静态属性，也保存到data中
        this.onlyData = result.data
      }

      // console.log(result)
    },
    //  级联选择器发生改变
    categoryChange() {
      this.getParamsData()
    },
    // 获取所有的商品分类
    async getAllCategoryList() {
      const { data: result } = await this.$http.get('/categories')
      if (result.meta.status !== 200) {
        return this.$message.error('获取所有商品分类数据列表失败！！')
      }
      this.allCategoryList = result.data
      // console.log(result.data)
    },
    // 点击添加属性或者参数
    addPropsOrParams() {
      this.addPropsOrParamsDialogVisible = true
    },
    // 添加动态参数或者静态属性的对话框关闭
    addPropsOrParamsDialogClosed() {
      this.$refs.addPropsOrParamsFormRef.resetFields()
    },
    // 提交添加动态参数或者静态属性
    submitAddPropsOrParams() {
      this.$refs.addPropsOrParamsFormRef.validate(async (valid) => {
        if (!valid) return
        // console.log(this.addPropsOrParamsForm.attr_name)
        const { data: result } = await this.$http.post(
          `/categories/${this.categoryId}/attributes`,
          {
            attr_name: this.addPropsOrParamsForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        // console.log(result)
        if (result.meta.status !== 201) {
          return this.$message.error('添加失败！！')
        }
        this.$message.success('添加成功！！')
        this.getParamsData()
        this.addPropsOrParamsDialogVisible = false
        console.log(result)
      })
    },
    // 点击编辑按钮,编辑参数
    async editParams(attrId) {
      this.editPropsOrParamsDialogVisible = true
      const { data: result } = await this.$http.get(
        `/categories/${this.categoryId}/attributes/${attrId}`,
        {
          params: {
            attr_sel: this.activeName,
          },
        }
      )
      if (result.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！！')
      }
      this.editPropsOrParamsForm.attr_name = result.data.attr_name
      this.editPropsOrParamsForm = result.data
      // console.log(result.data)
    },
  },
  computed: {
    // 根据级联选择器的长度 判断按钮是否可点击
    isBtnDisabled() {
      //   如果级联选择器数组的长度为3，则说明已经选了三级商品分类，此时返回fasle（按钮可以点击）
      if (this.selectedKeys.length === 3) {
        return false
      } else {
        return true
      }
    },
    // 级联选择器所选中的分类id
    categoryId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[this.selectedKeys.length - 1]
      } else {
        return null
      }
    },
    // 动态变换对话框的文本
    addPropsOrParamsDialogText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
  },
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 20px;
}
.el-cascader {
  margin-left: 10px;
}
.chooseCatgory {
  margin: 15px 0;
}
.el-table {
  margin-top: 10px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>