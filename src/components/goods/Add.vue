<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-alert
          title="添加商品的信息"
          type="info"
          show-icon
          center
          :closable="false"
        >
        </el-alert
      ></el-row>
      <el-steps :active="active - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        label-width="100px"
        class="demo-ruleForm"
        label-position="top"
        :model="addGoodsCategoryForm"
        :rules="addGoodsCategoryFormRules"
        ref="addGoodsCategoryFormRef"
      >
        <el-tabs
          tab-position="left"
          v-model="active"
          :before-leave="beforeChangeTags"
          @tab-click="tagClick"
        >
          <el-tab-pane label="基本信息">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsCategoryForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsCategoryForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsCategoryForm.goods_weight"> </el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="addGoodsCategoryForm.goods_number"
                type="number"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_number">
              <el-cascader
                expand-trigger="hover"
                :options="goodsCatgoryOptions"
                @change="goodsCategoryChange"
                :props="cascaderProps"
                v-model="addGoodsCategoryForm.goods_cat"
              >
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数">
            <el-form-item
              v-for="(item, index1) in manyData"
              :key="index1"
              :label="item.attr_name"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="param"
                  v-for="(param, index2) in item.attr_vals"
                  :key="index2"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="uploadObj"
              :on-success="uploadSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容">
            <quill-editor
              v-model="addGoodsCategoryForm.goods_introduce"
            ></quill-editor>
            <el-button type="primary" class="addGoodsBtn" @click="addGoods"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 上传图片的请求头对象
      uploadObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      // 图片上传的后台服务器url地址,upload组件不会走axios，所有不会添加请求体，它有自己的添加请求头的钩子函数
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 级联选择器 商品分类
      goodsCatgoryOptions: [],
      // 添加商品表单规则对象
      addGoodsCategoryFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品分类', trigger: 'blur' },
        ],
      },
      // 添加商品表单
      addGoodsCategoryForm: {
        goods_name: '',
        goods_price: '0',
        goods_weight: '0',
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: [],
      },
      // 当前激活的步骤的索引
      active: 0,
      // 动态参数对象
      manyData: [],
      // 静态属性
      onlyData: [],
    }
  },
  created() {
    this.getGoodsCategoryList()
  },
  methods: {
    // 点击添加商品
    addGoods() {
      this.$refs.addGoodsCategoryFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请添加必填项')
        }
        // console.log(this.addGoodsCategoryForm)
        const newAddGoodsCategoryForm = _.cloneDeep(this.addGoodsCategoryForm)
        newAddGoodsCategoryForm.goods_cat =
          newAddGoodsCategoryForm.goods_cat.join(',')
        // 处理动态参数
        this.manyData.forEach((item) => {
          const manyAttrsObj = {
            attr_id: item.attr_id,
            // 将数组转为字符串， 并且之间用 空格来连接
            attr_value: item.attr_vals.join(' '),
          }
          this.addGoodsCategoryForm.attrs.push(manyAttrsObj)
        })

        // 处理静态属性
        this.onlyData.forEach((item) => {
          const onlyAttrsObj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          this.addGoodsCategoryForm.attrs.push(onlyAttrsObj)
        })
        newAddGoodsCategoryForm.attrs = this.addGoodsCategoryForm.attrs
        // console.log(newAddGoodsCategoryForm)
        // 页面填写的商品名称必须是唯一的，不然会报错
        const { data: result } = await this.$http.post(
          '/goods',
          newAddGoodsCategoryForm
        )
        if (result.meta.status !== 201) {
          return this.$message.error('添加商品失败！！')
        }
        this.$message.success('添加商品成功！！')
        this.$router.push('/goods')
      })
    },
    // 图片上传成功的钩子
    uploadSuccess(response) {
      if (response.meta.status !== 200) {
        return this.$message.error('上传图片失败！！')
      }
      this.$message.success('上传图片成功！！')
      // 将tmp_path封装成对象，并且push到添加商品表单的pics中
      const picsObj = {
        pic: response.data.tmp_path,
      }
      this.addGoodsCategoryForm.pics.push(picsObj)
      // console.log('表单中的数据')
      // console.log(this.addGoodsCategoryForm)
    },
    // 移除图片的处理函数
    handleRemove(file) {
      // 1.取到对应图片的临时路径
      const picPath = file.response.data.tmp_path
      // 2.使用findIndex找到其对应的在添加商品表单中的索引位置
      const index = this.addGoodsCategoryForm.pics.findIndex((item) => {
        return picPath === item.pic
      })
      // 3.使用slice删除临时路径
      this.addGoodsCategoryForm.pics.splice(index, 1)
      // console.log(this.addGoodsCategoryForm)
    },
    // 点击图片预览的处理函数
    handlePreview() {},
    // tag标签页被点击
    async tagClick() {
      // this.active为1 说明选中的商品参数 面板
      if (this.active === '1') {
        // 获取对应的动态参数列表
        const { data: manyResult } = await this.$http.get(
          `/categories/${this.categoryId}/attributes`,
          {
            params: {
              sel: 'many',
            },
          }
        )
        manyResult.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyData = manyResult.data
        // console.log(manyResult.data)
      } else if (this.active === '2') {
        // this.active为2 说明选中的商品属性 面板
        const { data: onlyResult } = await this.$http.get(
          `/categories/${this.categoryId}}/attributes`,
          {
            params: {
              sel: 'only',
            },
          }
        )
        if (onlyResult.meta.status !== 200) {
          return this.$message.error('获取商品属性失败！！')
        }
        this.onlyData = onlyResult.data
        // console.log(onlyResult.data)
      }
    },
    // tags标签页 改变之前的回调函数
    beforeChangeTags(activeName, oldActiveName) {
      if (
        oldActiveName === '0' &&
        this.addGoodsCategoryForm.goods_cat.length !== 3
      ) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    //   级联选择器 改变
    goodsCategoryChange() {
      // 只允许级联选择器 选中第三级
      if (this.addGoodsCategoryForm.goods_cat.length !== 3) {
        this.addGoodsCategoryForm.goods_cat = []
      }
    },
    //   获取商品分类数据列表
    async getGoodsCategoryList() {
      const { data: result } = await this.$http.get('/categories')
      if (result.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！！')
      }
      this.goodsCatgoryOptions = result.data
      // console.log(result)
    },
    next() {
      if (this.active++ > 2) this.active = 0
    },
  },
  computed: {
    categoryId() {
      if (this.addGoodsCategoryForm.goods_cat.length === 3) {
        return this.addGoodsCategoryForm.goods_cat[2]
      } else {
        return null
      }
    },
  },
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 20px;
}
.el-steps {
  margin-top: 20px;
}
.el-tabs {
  margin-top: 20px;
}
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.addGoodsBtn {
  margin-top: 15px;
}
</style>