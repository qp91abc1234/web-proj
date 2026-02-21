<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { createMenu } from '@/common/api/permission'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const menuFormRef = ref<FormInstance>()
let updateMenuSortFn: () => void

// 菜单表单
const menuForm = reactive({
  path: '',
  name: '',
  icon: '',
  compPath: '',
  type: 1,
  parentId: null as number | null,
  sort: 0,
  visible: true,
  status: 1
})

// 重置表单
const resetForm = () => {
  Object.assign(menuForm, {
    path: '',
    name: '',
    icon: '',
    compPath: '',
    type: 1,
    parentId: null,
    sort: 0,
    visible: true,
    status: 1
  })
}

// 打开对话框
const open = (
  parentId: number | null,
  sort: number,
  isDir: boolean,
  updateMenuSort?: () => void
) => {
  dialogTitle.value = isDir ? '新建目录' : '新建菜单项'
  resetForm()
  menuForm.parentId = parentId
  menuForm.sort = sort
  // 目录不需要组件路径
  if (isDir) {
    menuForm.type = 0
  } else {
    menuForm.type = 1
  }
  if (updateMenuSort) {
    updateMenuSortFn = updateMenuSort
  }

  menuFormRef.value?.resetFields()
  dialogVisible.value = true
}

// 保存菜单
const handleSave = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        if (updateMenuSortFn) {
          await updateMenuSortFn()
        }
        await createMenu(menuForm)
        ElMessage.success('新增成功')
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
    <el-form ref="menuFormRef" :model="menuForm" label-width="100px">
      <el-form-item
        label="菜单路径"
        prop="path"
        :rules="[{ required: true, message: '请输入菜单路径', trigger: 'blur' }]"
      >
        <el-input v-model="menuForm.path" placeholder="请输入菜单路径，如：user" />
      </el-form-item>
      <el-form-item
        label="菜单名称"
        prop="name"
        :rules="[{ required: true, message: '请输入菜单名称', trigger: 'blur' }]"
      >
        <el-input v-model="menuForm.name" placeholder="请输入菜单名称" />
      </el-form-item>
      <el-form-item label="图标">
        <el-input v-model="menuForm.icon" placeholder="请输入图标名称，如：User" />
      </el-form-item>
      <!-- 组件路径：新建菜单项时显示且必填，新建目录时不显示，编辑时根据类型显示 -->
      <el-form-item
        v-if="menuForm.type === 1"
        label="组件路径"
        prop="compPath"
        :rules="[{ required: true, message: '请输入组件路径', trigger: 'blur' }]"
      >
        <el-input
          v-model="menuForm.compPath"
          placeholder="请输入组件路径，如：/src/views/user/user.vue"
        />
      </el-form-item>
      <el-form-item label="是否显示">
        <el-switch v-model="menuForm.visible" :active-value="true" :inactive-value="false" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="menuForm.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <permission-button @click="handleCancel">取消</permission-button>
      <permission-button type="primary" @click="handleSave(menuFormRef)">确定</permission-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.form-tip {
  margin-top: 4px;
}

.dialog-footer-tip {
  margin-bottom: 10px;
}
</style>
