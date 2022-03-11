<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-button type="primary" @click="addCategory">添加分类</el-button>
      </el-row>
      <tree-table
        :data="goodsCategoryList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border
        class="tree_table"
      >
        <!-- 是否有效 列 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-error"
            v-if="scope.row.cat_deleted"
            style="color: red"
          ></i>
          <i class="el-icon-success" v-else style="color: lightgreen"></i>
        </template>
        <!-- 排序 列 -->
        <template slot="order" slot-scope="scope">
          <el-button
            type="primary"
            plain
            v-if="scope.row.cat_level === 0"
            size="mini"
            >一级</el-button
          >
          <el-button
            type="success"
            plain
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-button
          >
          <el-button type="warning" plain size="mini" v-else>三级</el-button>
        </template>
        <!-- 操作 列 -->
        <template slot="option" slot-scope="scope">
          <el-button type="primary" size="mini">
            <i class="el-icon-edit"></i>编辑{{
              scope.row.cat_deleted
            }}</el-button
          >
          <el-button type="danger" size="mini"
            ><i class="el-icon-delete"></i>删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        layout="total, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCategoryDialogVisible"
      width="50%"
      @close="addCategoryDialogClosed"
    >
      <span>
        <el-form
          :model="addCategoryForm"
          :rules="addCategoryFormRules"
          label-width="100px"
          class="demo-ruleForm"
          ref="addCategoryFormRef"
        >
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="addCategoryForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类:">
            <el-cascader
              expand-trigger="hover"
              :options="parentCategoryList"
              v-model="selectedKeys"
              :props="cascaderProps"
              @change="parentChanged"
              change-on-select
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 级联选择器 选中的id值
      selectedKeys: [],
      // 父级分类数据列表
      parentCategoryList: [],
      // 级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 添加分类表单的数据对象
      addCategoryFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
      // 添加分类表单的数据对象
      addCategoryForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0,
      },
      // 控制添加分类对话框的显示与隐藏
      addCategoryDialogVisible: false,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          //   自定义模板列
          type: 'template',
          //   指定模板列的名称
          template: 'isok',
        },
        {
          label: '排序',
          type: 'template',
          template: 'order',
        },
        { label: '操作', type: 'template', template: 'option' },
      ],
      // 查询条件
      queryInfo: {
        type: 3,
        // 当前的页码值
        pagenum: 1,
        // 每页显示的条数
        pagesize: 5,
      },
      //   商品分类数据列表
      goodsCategoryList: [],
      // 分类的总数
      total: 0,
    }
  },
  created() {
    this.getGoodsCategoryList()
  },
  methods: {
    // 点击添加分类
    addCategory() {
      this.addCategoryDialogVisible = true
      this.getParentCategory()
    },
    //   获取所有商品分类数据列表
    async getGoodsCategoryList() {
      const { data: result } = await this.$http.get('/categories', {
        params: this.queryInfo,
      })
      if (result.meta.status !== 200) {
        return this.$message.error('获取分类数据失败！！')
      }
      // console.log(result.data)
      this.goodsCategoryList = result.data.result
      this.total = result.data.total
    },
    // 每页条数改变
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getGoodsCategoryList()
    },
    // 改变当前页码
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getGoodsCategoryList()
    },
    // 获取所有的父级分类
    async getParentCategory() {
      const { data: result } = await this.$http.get('/categories', {
        params: { type: 2 },
      })
      if (result.meta.status !== 200) {
        return this.$message.error('获取父级分类失败！！')
      }
      this.parentCategoryList = result.data
      // console.log(result.data)
    },
    // 级联选择器的选择发生改变
    parentChanged() {
      // 如果选中的数组对象的长度大于0，说明有父id，否则，父id就是0
      if (this.selectedKeys.length > 0) {
        this.addCategoryForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1]
        this.addCategoryForm.cat_level = this.selectedKeys.length
      } else {
        // 选中的数组对象的长度等于0，说明没有选中父级分类，父级id设置为0
        this.addCategoryForm.cat_pid = 0
        this.addCategoryForm.cat_level = 0
      }
    },
    // 点击确定添加分类
    submitAddCategory() {
      this.$refs.addCategoryFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: result } = await this.$http.post(
          '/categories',
          this.addCategoryForm
        )
        // console.log(result)
        if (result.meta.status !== 201) {
          return this.$message.error('添加分类失败！！')
        }
        this.getGoodsCategoryList()
        this.$message.success('添加分类成功！！')
        this.addCategoryDialogVisible = false
      })
    },
    // 添加分类对话框关闭
    addCategoryDialogClosed() {
      // 重置添加分类的表单数据
      this.$refs.addCategoryFormRef.resetFields()
      this.addCategoryForm.cat_pid = 0
      this.addCategoryForm.cat_level = 0
      this.selectedKeys = []
    },
  },
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 20px;
}
.tree_table {
  margin-top: 20px;
}
.el-pagination {
  margin-top: 20px;
}
.el-cascader {
  width: 100%;
}
</style>