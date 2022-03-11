<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索与添加商品区域 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            clearable
            v-model="queryParams.query"
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="goodsList" border stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="50px">
        </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="100">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100">
        </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="150">
          <template slot-scope="scope">
            {{ scope.row.add_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary" size="mini">
            </el-button>
            <el-button
              icon="el-icon-delete"
              type="danger"
              size="mini"
              @click="deleteShops(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="goodsTotal"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品总数
      goodsTotal: 0,
      // 获取商品列表的请求参数
      queryParams: {
        // 查询参数
        query: '',
        // 当前的页码
        pagenum: 1,
        // 每页显示的条数
        pagesize: 5,
      },
      // 商品列表
      goodsList: [],
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 跳转到添加商品页面
    goAddPage() {
      this.$router.push('/goods/add')
    },
    // 删除商品
    async deleteShops(goodsId) {
      console.log(goodsId)
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除')
      }
      const { data: result } = await this.$http.delete(`/goods/${goodsId}`)
      if (result.meta.status !== 200) {
        return this.$message.error('删除商品失败！！')
      }
      console.log(result)
      this.$message.success('删除商品成功！！')
      this.getGoodsList()
    },

    // 每页条数改变
    handleSizeChange(newPageSize) {
      this.queryParams.pagesize = newPageSize
      this.getGoodsList()
    },
    // 当前页码
    handleCurrentChange(newPageNum) {
      this.queryParams.pagenum = newPageNum
      this.getGoodsList()
    },
    // 获取所有的商品列表数据
    async getGoodsList() {
      const { data: result } = await this.$http.get('/goods', {
        params: this.queryParams,
      })
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败!!')
      }
      this.goodsList = result.data.goods
      // console.log(result)
      this.goodsTotal = result.data.total
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
</style>