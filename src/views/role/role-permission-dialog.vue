<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { TransferKey } from 'element-plus'
import { ElMessage } from 'element-plus'
import { getRolePermissions, assignRolePermissions } from '@/common/api/role'
import { useInject } from './role-context'
import type { Role, RolePermission } from '@/common/types/role'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const dialogVisible = ref(false)
const menuTreeRef = ref()
const currentRoleId = ref<number>(0)
const isSystem = ref<boolean>(false)
const activeTab = ref('menu') // 默认显示菜单权限标签页

// 从 Context 注入菜单树和API权限列表
const { menuTree, allApiPermissions, loadingApiPermissions } = useInject()

// 权限配置表单（包含菜单ID和API权限ID）
const permissionForm = reactive<RolePermission>({
  menuIds: [],
  apiPermissionIds: []
})

// 初始权限数据（用于比对是否有更改）
const initialPermissions = ref<RolePermission>({
  menuIds: [],
  apiPermissionIds: []
})

// 比对两个权限对象是否相同
const isPermissionsEqual = (perm1: RolePermission, perm2: RolePermission): boolean => {
  // 比对菜单ID数组（需要排序后比较）
  const menuIds1 = [...(perm1.menuIds || [])].sort((a, b) => a - b)
  const menuIds2 = [...(perm2.menuIds || [])].sort((a, b) => a - b)
  if (menuIds1.length !== menuIds2.length) {
    return false
  }
  if (menuIds1.some((id, index) => id !== menuIds2[index])) {
    return false
  }

  // 比对API权限ID数组（需要排序后比较）
  const apiIds1 = [...(perm1.apiPermissionIds || [])].sort((a, b) => a - b)
  const apiIds2 = [...(perm2.apiPermissionIds || [])].sort((a, b) => a - b)
  if (apiIds1.length !== apiIds2.length) {
    return false
  }
  if (apiIds1.some((id, index) => id !== apiIds2[index])) {
    return false
  }

  return true
}

// 打开对话框
const open = async (role: Role, defaultTab: 'menu' | 'api' = 'menu') => {
  currentRoleId.value = role.id
  isSystem.value = role.isSystem
  activeTab.value = defaultTab
  dialogVisible.value = true

  // 加载角色权限
  try {
    const permissions = await getRolePermissions(role.id)
    permissionForm.menuIds = permissions.menuIds || []
    permissionForm.apiPermissionIds = permissions.apiPermissionIds || []

    // 保存初始权限数据（深拷贝）
    initialPermissions.value = {
      menuIds: [...(permissions.menuIds || [])],
      apiPermissionIds: [...(permissions.apiPermissionIds || [])]
    }

    // 设置菜单树选中状态
    if (menuTreeRef.value) {
      permissionForm.menuIds.forEach((id) => {
        menuTreeRef.value.setChecked(id, true)
      })
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载权限失败')
  }
}

// 菜单树节点选中变化
const handleMenuTreeCheck = () => {
  const checkedKeys = menuTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys()
  permissionForm.menuIds = [...checkedKeys, ...halfCheckedKeys]
}

// API权限穿梭框变化处理
const handleApiPermissionChange = (value: TransferKey[]) => {
  // 将 TransferKey[] 转换为 number[]
  const ids = value.map((key) => Number(key))
  permissionForm.apiPermissionIds = ids
}

// 保存权限配置
const handleSave = async () => {
  if (isPermissionsEqual(permissionForm, initialPermissions.value)) {
    // 没有更改，直接关闭
    handleCancel()
    return
  }

  // 有更改，执行保存
  try {
    await assignRolePermissions(currentRoleId.value, permissionForm)
    ElMessage.success('权限配置成功')
    handleCancel()
    emit('success')
  } catch (error: any) {
    ElMessage.error(error.message || '保存权限失败')
  }
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
  permissionForm.menuIds = []
  permissionForm.apiPermissionIds = []
  currentRoleId.value = 0
  activeTab.value = 'menu'
}

// 暴露方法给父组件
defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="dialogVisible" title="角色权限配置" width="800px">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="菜单权限" name="menu">
        <el-scrollbar class="permission-tree" max-height="500px">
          <el-tree
            ref="menuTreeRef"
            :data="menuTree"
            :props="{ children: 'children', label: 'name' }"
            show-checkbox
            node-key="id"
            default-expand-all
            @check="handleMenuTreeCheck"
          />
        </el-scrollbar>
      </el-tab-pane>
      <el-tab-pane label="API权限" name="api">
        <div class="api-permission-container">
          <el-transfer
            style="max-height: 500px"
            v-model="permissionForm.apiPermissionIds"
            :data="allApiPermissions"
            :props="{ key: 'id', label: 'desc' }"
            :titles="['可选API权限', '已选API权限']"
            :loading="loadingApiPermissions"
            filterable
            filter-placeholder="搜索API权限"
            @change="handleApiPermissionChange"
          >
            <template #default="{ option }">
              <div class="transfer-item">
                <el-tag
                  :type="
                    option.method === 'GET'
                      ? 'success'
                      : option.method === 'POST'
                        ? 'primary'
                        : option.method === 'PUT'
                          ? 'warning'
                          : 'danger'
                  "
                  size="small"
                  style="margin-right: 8px"
                >
                  {{ option.method }}
                </el-tag>
                <span style="margin-right: 8px">{{ option.path }}</span>
                <span style="color: #909399">{{ option.desc }}</span>
              </div>
            </template>
          </el-transfer>
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <permission-button @click="handleCancel">取消</permission-button>
      <permission-button :disabled="isSystem" type="primary" @click="handleSave"
        >确定</permission-button
      >
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.permission-tree {
  padding: 20px;
}

.api-permission-container {
  min-height: 500px;
  padding: 20px;

  // stylelint-disable-next-line selector-class-pattern
  :deep(.el-transfer) {
    display: flex;
    flex-direction: row;
    height: 100%;

    // stylelint-disable-next-line selector-class-pattern
    .el-transfer-panel {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;

      // stylelint-disable-next-line selector-class-pattern
      .el-transfer-panel__body {
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
    }
  }
}

.transfer-item {
  display: flex;
  align-items: center;
}
</style>
