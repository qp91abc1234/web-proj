<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, User } from '@element-plus/icons-vue'
import { type FormRules, type FormInstance, ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/userStore'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: import.meta.env.VITE_DEFAULT_USERNAME || '',
  password: import.meta.env.VITE_DEFAULT_PASSWORD || ''
})

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
})

const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login({ username: loginForm.username, password: loginForm.password })
        ElMessage.success('登录成功')
        router.replace('/home')
      } catch {
        ElMessage.error('登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-left">
        <div class="login-title">
          <h1>Vue3 管理系统</h1>
          <p>现代化后台管理解决方案</p>
        </div>
        <div class="login-features">
          <div class="feature-item">
            <el-icon :size="24" color="#409eff"><Check /></el-icon>
            <span>Vue3 + TypeScript</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24" color="#67c23a"><Check /></el-icon>
            <span>Element Plus UI</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24" color="#e6a23c"><Check /></el-icon>
            <span>Pinia 状态管理</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24" color="#f56c6c"><Check /></el-icon>
            <span>完整的权限系统</span>
          </div>
        </div>
      </div>

      <div class="login-right">
        <el-card class="login-card">
          <div class="card-header">
            <h2>欢迎登录</h2>
            <p>请输入您的账号和密码</p>
          </div>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="rules"
            size="large"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                :prefix-icon="User"
                clearable
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin(loginFormRef)"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                class="login-button"
                @click="handleLogin(loginFormRef)"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  display: flex;
  width: 900px;
  min-height: 500px;
  overflow: hidden;
  background: var(--el-bg-color);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgb(0 0 0 / 30%);
}

.login-left {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-title {
    margin-bottom: 60px;
    color: white;

    h1 {
      margin: 0 0 12px;
      font-size: 36px;
    }

    p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
  }

  .login-features {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .feature-item {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 12px;
      color: white;
      background: rgb(255 255 255 / 20%);
      border-radius: 8px;

      span {
        font-size: 14px;
      }
    }
  }
}

.login-right {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 100%;

  .card-header {
    margin-bottom: 32px;
    text-align: center;

    h2 {
      margin: 0 0 8px;
      font-size: 24px;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 0;
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }

  .login-form {
    .form-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .login-button {
      width: 100%;
    }

    .tips {
      width: 100%;
      text-align: center;
    }
  }
}

@media (width <= 768px) {
  .login-box {
    flex-direction: column;
    width: 90%;
    max-width: 400px;
  }

  .login-left {
    padding: 40px 30px;

    .login-title h1 {
      font-size: 28px;
    }

    .login-features {
      display: none;
    }
  }

  .login-right {
    padding: 20px;
  }
}
</style>
