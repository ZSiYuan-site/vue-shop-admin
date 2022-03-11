<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 订单搜索区域 -->
      <el-row>
        <el-col :span="10">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            clearable
          >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="ordersForm" border stripe style="width: 100%">
        <el-table-column
          type="index"
          label="序号"
          width="50px"
        ></el-table-column>
        <el-table-column prop="order_number" label="订单编号">
        </el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="100px">
        </el-table-column>
        <el-table-column prop="is_send" label="是否付款" width="100px">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'"
              >未付款</el-tag
            >
            <el-tag type="danger" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_send"
          label="是否发货"
          width="100px"
        ></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button
              icon="el-icon-edit"
              size="mini"
              type="primary"
              @click="editAddress"
            ></el-button>
            <el-button
              icon="el-icon-location"
              size="mini"
              type="success"
              @click="showProgress"
              >{{ scope.row.order_id }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.orderTotal"
      >
      </el-pagination>
    </el-card>

    <!-- 修改地址的对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editAddressDialogVisible"
      width="50%"
      @close="editAddressDialogClosed"
    >
      <span>
        <el-form
          :model="editAddressForm"
          :rules="editAddressFormRules"
          ref="editAddressFormRef"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="省市区/县" prop="name">
            <el-cascader
              expand-trigger="hover"
              :options="this.cityDate"
              v-model="selectedOptions"
              @change="cascaderChange"
            >
            </el-cascader>
          </el-form-item>

          <el-form-item label="详细地址" prop="address">
            <el-input v-model="editAddressForm.address"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAddressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddressDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 查看物流信息对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%"
    >
      <span>这是一段信息</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityDate from './citydata'
export default {
  data() {
    return {
      // 级联选择器的选中值
      selectedOptions: [],
      // 省市县三级联动数据
      cityDate: cityDate,
      // 修改地址的表单规则对象
      editAddressFormRules: {
        address: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
        ],
      },
      // 修改地址的表单对象
      editAddressForm: {
        address: '',
      },
      // 控制修改地址对话框的显示与隐藏
      editAddressDialogVisible: false,
      // 根据分页  提交的表达请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },
      // 订单数据列表
      ordersForm: [],
      // 订单总数
      orderTotal: 0,
      // 控制物流信息对话框的展示与隐藏
      progressDialogVisible: false,
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    // 点击查看物流信息
    async showProgress() {
      this.progressDialogVisible = true
    },
    // 修改地址对话框关闭的回调函数
    editAddressDialogClosed() {
      this.$refs.editAddressFormRef.resetFields()
    },
    // 级联选择器改变的回调函数
    cascaderChange() {},
    // 点击修改地址按钮
    editAddress() {
      this.editAddressDialogVisible = true
    },
    // 当前的页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },
    // 每页的条数改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    // 获取订单数据列表
    async getOrdersList() {
      const { data: result } = await this.$http.get('/orders', {
        params: this.queryInfo,
      })
      this.ordersForm = result.data.goods
      this.orderTotal = result.data.total
      // console.log(result.data)
    },
  },
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 20px;
}
.el-table {
  margin-top: 20px;
}
.el-pagination {
  margin-top: 10px;
}
.el-cascader {
  width: 100%;
}
</style>