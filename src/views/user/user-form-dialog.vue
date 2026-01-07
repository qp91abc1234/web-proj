<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { createUser, updateUser } from '@/common/api/user'
import { useInject } from './user-context'
import type { CreateUser, User } from '@/common/types/user'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const userFormRef = ref<FormInstance>()

// 从 Context 注入角色列表
const { roleOptions } = useInject()

// 用户表单
const userForm = reactive({
  id: undefined as number | undefined,
  username: '',
  realName: '',
  email: '',
  phone: '',
  roleIds: [],
  status: 1,
  password: undefined as string | undefined
})

// 重置表单
const resetForm = (user?: User) => {
  if (user) {
    Object.assign(userForm, user)
  } else {
    Object.assign(userForm, {
      id: undefined,
      username: '',
      realName: '',
      email: '',
      phone: '',
      roleIds: [],
      status: 1,
      password: ''
    })
  }
}

// 打开对话框
const open = (user?: User | null) => {
  if (user) {
    // 编辑模式
    dialogTitle.value = '编辑用户'
    resetForm(user)
  } else {
    // 新增模式
    dialogTitle.value = '新增用户'
    resetForm()
  }
  userFormRef.value?.resetFields()
  dialogVisible.value = true
}

// 保存用户
const handleSave = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        if (userForm.id) {
          // 编辑
          await updateUser(userForm.id, userForm)
          ElMessage.success('编辑成功')
        } else {
          // 新增
          await createUser(userForm as CreateUser)
          ElMessage.success('新增成功')
        }
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
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
    <el-form ref="userFormRef" :model="userForm" label-width="100px">
      <el-form-item
        label="用户名"
        prop="username"
        :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]"
      >
        <el-input v-model="userForm.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item
        v-if="!userForm.id"
        label="密码"
        prop="password"
        :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]"
      >
        <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
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
      <el-form-item label="角色" prop="roleIds">
        <el-select v-model="userForm.roleIds" multiple placeholder="请选择角色" style="width: 100%">
          <el-option
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="userForm.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <permission-button @click="handleCancel">取消</permission-button>
      <permission-button type="primary" @click="handleSave(userFormRef)">确定</permission-button>
    </template>
  </el-dialog>
</template>
