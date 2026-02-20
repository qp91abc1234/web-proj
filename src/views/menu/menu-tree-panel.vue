<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus, Lock } from '@element-plus/icons-vue'
import { updateMenuSort, deleteMenu } from '@/common/api/permission'
import MenuFormDialog from './dialogs/menu-form-dialog.vue'
import { useInject } from './menu-context'
import type { MenuItem } from '@/common/types/permission'

const { menuTree, loading, setCurrentNode, loadMenuTree } = useInject()
const menuFormDialogRef = ref<InstanceType<typeof MenuFormDialog>>()

const getAddParams = (parentNode?: MenuItem) => {
  let sort = 0
  if (parentNode) {
    const lastChild = parentNode.children[parentNode.children.length - 1]
    if (lastChild) {
      sort = lastChild.sort + 1
    }
  } else {
    const lastNode = menuTree.value[menuTree.value.length - 1]
    if (lastNode) {
      sort = lastNode.sort + 1
    }
  }
  return {
    parentId: parentNode?.id ?? null,
    sort
  }
}

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
const handleDragEnd = async (_dragNode: any, _dropNode: any, dropType: string) => {
  if (dropType === 'none') return

  // 构建排序数据
  const items: Array<{ id: number; parentId?: number; sort: number }> = []

  const traverse = (nodes: MenuItem[], parentId?: number, startSort = 0) => {
    nodes.forEach((node, index) => {
      items.push({
        id: node.id,
        parentId,
        sort: startSort + index
      })
      if (node.children && node.children.length > 0) {
        traverse(node.children, node.id, 0)
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

// 新增目录
const handleAddDirectory = (parentNode?: MenuItem) => {
  const { parentId, sort } = getAddParams(parentNode)
  menuFormDialogRef.value?.open(parentId, sort, 'directory')
}

// 新增菜单项
const handleAddMenuItem = (parentNode?: MenuItem) => {
  const { parentId, sort } = getAddParams(parentNode)
  menuFormDialogRef.value?.open(parentId, sort, 'menu')
}

// 删除菜单
const handleDelete = async (node: MenuItem) => {
  try {
    await ElMessageBox.confirm('确定要删除该菜单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteMenu(node.id)
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
          <permission-button type="primary" :icon="Plus" size="small" @click="handleAddDirectory()">
            新建目录
          </permission-button>
          <permission-button type="primary" :icon="Plus" size="small" @click="handleAddMenuItem()">
            新建菜单项
          </permission-button>
        </div>
      </div>
    </template>
    <el-tree
      v-loading="loading"
      :data="menuTree"
      :props="{ children: 'children', label: 'name' }"
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
            <el-icon v-if="data.isSystem" class="system-icon" :size="14">
              <Lock />
            </el-icon>
            <span>{{ node.label }}</span>
          </span>
          <span v-if="!data.isSystem" class="node-actions">
            <!-- 目录节点：显示添加目录和添加菜单项两个按钮 -->
            <template v-if="!data.compPath || data.compPath === ''">
              <permission-button
                type="primary"
                link
                size="small"
                :icon="Plus"
                @click.stop="handleAddDirectory(data)"
              >
                添加目录
              </permission-button>
              <permission-button
                type="primary"
                link
                size="small"
                :icon="Plus"
                @click.stop="handleAddMenuItem(data)"
              >
                添加菜单项
              </permission-button>
            </template>
            <!-- 菜单项节点：只显示添加菜单项按钮 -->
            <template v-else>
              <permission-button
                type="primary"
                link
                size="small"
                :icon="Plus"
                @click.stop="handleAddMenuItem(data)"
              >
                添加菜单项
              </permission-button>
            </template>
            <permission-button
              type="danger"
              link
              size="small"
              :icon="Delete"
              @click.stop="handleDelete(data)"
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
    padding-right: 8px;

    .node-label {
      display: flex;
      gap: 6px;
      align-items: center;

      .system-icon {
        flex-shrink: 0;
        color: var(--el-color-warning);
      }
    }

    .node-actions {
      display: none;
    }

    &:hover .node-actions {
      display: block;
    }
  }
}
</style>
