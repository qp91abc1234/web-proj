<script setup lang="ts">
import { useRoute } from 'vue-router'

import { useAppStore } from '@/store/modules/appStore'
import { usePermissionStore } from '@/store/modules/permissionStore'

import SubMenu from '@/modules/layout/sider/subMenu.vue'

const route = useRoute()
const permissionStore = usePermissionStore()
const appStore = useAppStore()
</script>
<script lang="ts">
export const SIDE_WIDTH = 200
export const SIDE_COLLAPSED_WIDTH = 64
</script>

<template>
  <g-flex class="sider" dir="column">
    <g-flex class="top" :class="{ 'is-show': !appStore.siderCollapsed }" align="center">
      <g-flex class="icon" justify="center" align="center">Z</g-flex>
      <el-text class="title" type="primary">Zcc's 作品集</el-text>
    </g-flex>
    <el-scrollbar height="100%">
      <el-menu
        class="w-[--side-width] border-r-0!"
        :style="{ '--side-width': `${SIDE_WIDTH}px` }"
        :default-active="route.path"
        :collapse="appStore.siderCollapsed"
        router
      >
        <template v-for="item in permissionStore.menuTree" :key="item.path">
          <SubMenu :data="item"></SubMenu>
        </template>
      </el-menu>
    </el-scrollbar>
  </g-flex>
</template>

<style lang="scss" scoped>
.sider {
  height: 100%;
  user-select: none;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);

  .top {
    height: 60px;
    padding: 0 17px;

    .icon {
      width: 25px;
      height: 25px;
      margin-right: 0;
      font-size: 14px;
      color: var(--el-color-white);
      background-color: var(--el-color-primary);
      border-radius: 5px;
      transition: margin-right 0.3s;
    }

    .title {
      width: 0;
      overflow: hidden;
      font-weight: 600;
      white-space: nowrap;
      transition: width 0.3s;
    }

    &.is-show {
      .icon {
        margin-right: 10px;
      }

      .title {
        width: 80px;
      }
    }
  }
}
</style>
