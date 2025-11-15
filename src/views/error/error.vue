<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const errorType = computed(() => route.meta.title || '404')
const errorTitle = computed(() => {
  return errorType.value === '403' ? '无访问权限' : '页面不存在'
})
const errorDescription = computed(() => {
  return errorType.value === '403'
    ? '抱歉，您没有权限访问此页面'
    : '抱歉，您访问的页面不存在或已被删除'
})

const goHome = () => {
  router.push('/home')
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">{{ errorType }}</div>
      <div class="error-title">{{ errorTitle }}</div>
      <div class="error-description">{{ errorDescription }}</div>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-content {
  padding: 60px 40px;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgb(0 0 0 / 20%);
}

.error-code {
  margin-bottom: 20px;
  font-size: 120px;
  font-weight: bold;
  line-height: 1;
  color: #667eea;
}

.error-title {
  margin-bottom: 12px;
  font-size: 32px;
  font-weight: 600;
  color: #333;
}

.error-description {
  margin-bottom: 32px;
  font-size: 16px;
  color: #666;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>
