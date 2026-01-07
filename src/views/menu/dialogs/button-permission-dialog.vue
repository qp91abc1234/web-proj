<script setup lang="ts">
import { ref, reactive } from 'vue'
import { type FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { ButtonPermission } from '@/common/types/permission'
import { createButtonPermission, updateButtonPermission } from '@/common/api/permission'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const dialogVisible = ref(false)
const dialogTitle = ref('新增按钮权限')
const formRef = ref<FormInstance>()
const editingItem = ref<ButtonPermission>()
const loading = ref(false)

// 按钮权限表单
const form = reactive({
  id: undefined as number | undefined,
  code: '',
  name: '',
  status: 1,
  menuId: 0
})

// 重置表单
const resetForm = (menuId: number, data?: ButtonPermission) => {
  if (data) {
    Object.assign(form, data)
  } else {
    Object.assign(form, {
      id: undefined,
      code: '',
      name: '',
      status: 1,
      menuId: menuId
    })
  }
}

// 打开对话框
const open = (menuId: number, data?: ButtonPermission) => {
  editingItem.value = data

  if (data) {
    // 编辑模式
    dialogTitle.value = '编辑按钮权限'
    resetForm(menuId, data)
  } else {
    // 新增模式
    dialogTitle.value = '新增按钮权限'
    resetForm(menuId)
  }
  formRef.value?.resetFields()
  dialogVisible.value = true
}

// 保存
const handleSave = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 第一步：创建或更新按钮权限实体
        if (editingItem.value) {
          // 编辑模式：更新按钮权限实体（ID 不变，菜单关联关系不变）
          await updateButtonPermission(form.menuId, form)
        } else {
          // 新增模式：创建按钮权限实体（需要传递 menuId）
          await createButtonPermission(form)
        }

        ElMessage.success(editingItem.value ? '按钮权限更新成功' : '按钮权限添加成功')
        dialogVisible.value = false
        emit('success')
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        loading.value = false
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
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
    <el-form ref="formRef" :model="form" label-width="100px">
      <el-form-item
        label="权限Code"
        prop="code"
        :rules="[{ required: true, message: '请输入权限Code', trigger: 'blur' }]"
      >
        <el-input v-model="form.code" placeholder="如：user:add" />
      </el-form-item>
      <el-form-item
        label="权限名称"
        prop="name"
        :rules="[{ required: true, message: '请输入权限名称', trigger: 'blur' }]"
      >
        <el-input v-model="form.name" placeholder="如：新增用户" />
      </el-form-item>
      <el-form-item label="是否启用">
        <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>

    <template #footer>
      <permission-button @click="handleCancel">取消</permission-button>
      <permission-button type="primary" :loading="loading" @click="handleSave(formRef)"
        >确定</permission-button
      >
    </template>
  </el-dialog>
</template>
