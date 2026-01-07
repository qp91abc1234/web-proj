<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { createRole, updateRole } from '@/common/api/role'
import type { Role } from '@/common/types/role'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const roleFormRef = ref<FormInstance>()

// 角色表单
const roleForm = reactive({
  id: undefined as number | undefined,
  name: '',
  status: 1
})

// 重置表单
const resetForm = (role?: Role | null) => {
  if (role) {
    Object.assign(roleForm, role)
  } else {
    Object.assign(roleForm, {
      id: undefined,
      name: '',
      status: 1
    })
  }
}

// 打开对话框
const open = (role?: Role | null) => {
  if (role) {
    // 编辑模式
    dialogTitle.value = '编辑角色'
    resetForm(role)
  } else {
    // 新增模式
    dialogTitle.value = '新增角色'
    resetForm()
  }

  roleFormRef.value?.resetFields()
  dialogVisible.value = true
}

// 保存角色
const handleSave = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        if (roleForm.id) {
          // 编辑
          await updateRole(roleForm.id, roleForm)
          ElMessage.success('编辑成功')
        } else {
          // 新增
          await createRole(roleForm)
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
    <el-form ref="roleFormRef" :model="roleForm" label-width="100px">
      <el-form-item
        label="角色名称"
        prop="name"
        :rules="[{ required: true, message: '请输入角色名称', trigger: 'blur' }]"
      >
        <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="roleForm.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <permission-button @click="handleCancel">取消</permission-button>
      <permission-button type="primary" @click="handleSave(roleFormRef)">确定</permission-button>
    </template>
  </el-dialog>
</template>
