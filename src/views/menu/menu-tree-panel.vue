<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus, Lock, Folder, ArrowDown } from '@element-plus/icons-vue'
import { updateMenuSort, deleteMenu } from '@/common/api/permission'
import MenuFormDialog from './dialogs/menu-form-dialog.vue'
import { useInject } from './menu-context'
import type { MenuItem } from '@/common/types/permission'
import type Node from 'element-plus/es/components/tree/src/model/node.mjs'

const { menuTree, loading, setCurrentNode, loadMenuTree } = useInject()
const menuFormDialogRef = ref<InstanceType<typeof MenuFormDialog>>()

const handleAllowDrag = (dragNode: any) => {
  const dragNodeData = dragNode.data as MenuItem

  if (dragNodeData.isSystem) {
    return false
  }

  return true
}

const handleAllowDrop = (_dragNode: any, dropNode: any, type: string) => {
  const dropNodeData = dropNode.data as MenuItem

  if (dropNodeData.isSystem) {
    return false
  }

  if (dropNodeData.type === 1 && type === 'inner') {
    return false
  }
  return true
}

// 菜单树拖拽结束
const handleDragEnd = async () => {
  // 构建排序数据
  const items: Array<{ id: number; parentId: number | null; sort: number }> = []

  const traverse = (datas: MenuItem[], parentId: number | null = null) => {
    datas.forEach((data, index) => {
      items.push({
        id: data.id,
        parentId,
        sort: index
      })
      if (data.children && data.children.length > 0) {
        traverse(data.children, data.id)
      }
    })
  }

  traverse(menuTree.value)

  try {
    await updateMenuSort(items)
    ElMessage.success('排序更新成功')
    await loadMenuTree()
  } catch (error: any) {
    ElMessage.error(error.message || '排序更新失败')
    // 重新加载以恢复原状态
    await loadMenuTree()
  }
}

const handleAdd = (node: Node | null, isDir = true, isSibling = false) => {
  let parentId: number | null = null
  let sort = 0
  if (!node) {
    parentId = null
    const lastNode = menuTree.value[menuTree.value.length - 1]
    if (lastNode) {
      sort = lastNode.sort + 1
    }
    menuFormDialogRef.value?.open(parentId, sort, isDir)
  } else if (isSibling) {
    const isRootParent = !node.parent?.parent
    sort = node.data.sort + 1
    if (!isRootParent) {
      parentId = node.parent?.data.id ?? null
    }

    const updateMenuSortFn = async () => {
      const items: Array<{ id: number; parentId: number | null; sort: number }> = []
      const siblings: MenuItem[] = isRootParent
        ? menuTree.value
        : (node.parent?.data?.children ?? [])

      siblings.forEach((child: MenuItem) => {
        if (child.sort >= sort) {
          items.push({ id: child.id, parentId, sort: child.sort + 1 })
        }
      })
      if (items.length > 0) await updateMenuSort(items)
    }

    menuFormDialogRef.value?.open(parentId, sort, isDir, updateMenuSortFn)
  } else {
    parentId = node.data.id ?? null
    if (node.data.children) {
      const lastChild = node.data.children[node.data.children.length - 1]
      if (lastChild) {
        sort = lastChild.sort + 1
      }
    }
    menuFormDialogRef.value?.open(parentId, sort, isDir)
  }
}

// 删除菜单
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该菜单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteMenu(id)
    ElMessage.success('删除成功')
    setCurrentNode(null)
    await loadMenuTree()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}
</script>

<template>
  <el-card class="tree-card">
    <template #header>
      <div class="card-header">
        <span>菜单树</span>
        <div class="header-actions">
          <permission-button
            type="primary"
            :icon="Plus"
            size="small"
            @click="handleAdd(null, true)"
          >
            新建目录
          </permission-button>
          <permission-button
            type="primary"
            :icon="Plus"
            size="small"
            @click="handleAdd(null, false)"
          >
            新建菜单项
          </permission-button>
        </div>
      </div>
    </template>
    <el-tree
      v-loading="loading"
      :data="menuTree"
      node-key="id"
      default-expand-all
      draggable
      :allow-drop="handleAllowDrop"
      :allow-drag="handleAllowDrag"
      @node-click="(data: MenuItem) => setCurrentNode(data)"
      @node-drop="handleDragEnd"
    >
      <template #default="{ node, data }">
        <div class="tree-node">
          <span class="node-label">
            <el-icon v-if="data.type === 0" class="directory-icon" :size="14">
              <Folder />
            </el-icon>
            <span>{{ data.name }}</span>
            <el-icon v-if="data.isSystem" class="system-icon" :size="14">
              <Lock />
            </el-icon>
          </span>
          <span v-if="!data.isSystem">
            <!-- 目录节点：添加目录/菜单项下拉 -->
            <el-dropdown
              @command="
                (cmd: string) => {
                  if (cmd === 'dir-sibling') handleAdd(node, true, true)
                  else if (cmd === 'dir-child') handleAdd(node, true, false)
                  else if (cmd === 'menu-sibling') handleAdd(node, false, true)
                  else handleAdd(node, false, false)
                }
              "
            >
              <permission-button type="primary" link size="small" :icon="Plus" @click.stop>
                添加
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </permission-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <template v-if="data.type === 0">
                    <el-dropdown-item command="dir-sibling">添加同级目录</el-dropdown-item>
                    <el-dropdown-item command="dir-child">添加子级目录</el-dropdown-item>
                    <el-dropdown-item command="menu-sibling">添加同级菜单项</el-dropdown-item>
                    <el-dropdown-item command="menu-child">添加子级菜单项</el-dropdown-item>
                  </template>
                  <template v-else>
                    <el-dropdown-item command="menu-sibling">添加同级菜单项</el-dropdown-item>
                  </template>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <permission-button
              type="danger"
              link
              size="small"
              :icon="Delete"
              @click.stop="handleDelete(data.id)"
            >
              删除
            </permission-button>
          </span>
        </div>
      </template>
    </el-tree>
  </el-card>

  <!-- 菜单表单弹窗 -->
  <MenuFormDialog ref="menuFormDialogRef" @success="loadMenuTree" />
</template>

<style lang="scss" scoped>
.tree-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  // stylelint-disable-next-line selector-class-pattern
  :deep(.el-card__body) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  // stylelint-disable-next-line selector-class-pattern
  :deep(.el-tree) {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .tree-node {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding-right: 8px;

    .node-label {
      display: flex;
      gap: 6px;
      align-items: center;

      .directory-icon {
        flex-shrink: 0;
        color: var(--el-color-primary);
      }

      .system-icon {
        flex-shrink: 0;
        color: var(--el-color-warning);
      }
    }

    // 去掉「添加」下拉触发及按钮的 focus/hover outline
    :deep(.el-button:hover),
    :deep(.el-button:focus) {
      outline: none;
    }
  }
}
</style>
