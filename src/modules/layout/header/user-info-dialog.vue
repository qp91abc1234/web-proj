<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { updateUser } from '@/common/api/user'
import { useUserStore } from '@/store/modules/user-store'
import type { User } from '@/common/types/user'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const userStore = useUserStore()

const dialogVisible = ref(false)
const isSystem = ref(false)
const userFormRef = ref<FormInstance>()

// 用户表单
const userForm = reactive({
  id: undefined as number | undefined,
  username: '',
  realName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// 重置表单
const resetForm = (user: User) => {
  isSystem.value = user.isSystem
  Object.assign(userForm, user, {
    password: '',
    confirmPassword: ''
  })
}

// 打开对话框
const open = () => {
  if (!userStore.userInfo) return
  resetForm(userStore.userInfo)

  userFormRef.value?.resetFields()
  dialogVisible.value = true
}

// 验证密码确认
const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value && value !== userForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 保存用户信息
const handleSave = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        if (!userForm.id) {
          ElMessage.error('用户ID不存在')
          return
        }

        // 构建更新数据（如果密码为空，则不更新密码）
        const updateData: any = {
          realName: userForm.realName,
          email: userForm.email,
          phone: userForm.phone
        }

        // 如果填写了密码，则更新密码
        if (userForm.password) {
          updateData.password = userForm.password
        }

        userStore.userInfo = await updateUser(userForm.id, updateData)
        ElMessage.success('保存成功')

        dialogVisible.value = false
        emit('success')
      } catch (error: any) {
        ElMessage.error(error.message || '保存失败')
      }
    }
  })
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
}

// 暴露方法给父组件
defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="dialogVisible" title="用户信息" width="500px">
    <el-form :disabled="isSystem" ref="userFormRef" :model="userForm" label-width="100px">
      <el-form-item label="用户名">
        <el-input v-model="userForm.username" disabled />
      </el-form-item>
      <el-form-item
        label="真实姓名"
        prop="realName"
        :rules="[{ required: true, message: '请输入真实姓名', trigger: 'blur' }]"
      >
        <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
      </el-form-item>
      <el-form-item
        label="邮箱"
        prop="email"
        :rules="[
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ]"
      >
        <el-input v-model="userForm.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item
        label="手机号"
        prop="phone"
        :rules="[
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入正确的手机号',
            trigger: 'blur'
          }
        ]"
      >
        <el-input v-model="userForm.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item
        v-if="!isSystem"
        label="新密码"
        prop="password"
        :rules="[
          {
            min: 6,
            max: 20,
            message: '密码长度为6-20个字符',
            trigger: 'blur'
          }
        ]"
      >
        <el-input
          v-model="userForm.password"
          type="password"
          placeholder="留空则不修改密码"
          show-password
        />
      </el-form-item>
      <el-form-item
        v-if="userForm.password"
        label="确认密码"
        prop="confirmPassword"
        :rules="[
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]"
      >
        <el-input
          v-model="userForm.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <permission-button @click="handleCancel">取消</permission-button>
      <permission-button :disabled="isSystem" type="primary" @click="handleSave(userFormRef)"
        >确定</permission-button
      >
    </template>
  </el-dialog>
</template>
