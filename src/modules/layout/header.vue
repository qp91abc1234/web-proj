<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed, nextTick } from 'vue'
import { Fold, Moon, Sunny, Expand, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

import { useAppStore } from '@/store/modules/appStore'
import { usePermissionStore } from '@/store/modules/permissionStore'

import { setCssVar } from '@/common/utils/css'

import type { ITab } from '@/store/modules/hooks/useTabs'
import type { ElDropdown, ElScrollbar } from 'element-plus'

type RightClickData = {
  clientX: string
  clientY: string
  tab: ITab
}

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const dropdownRef = ref<InstanceType<typeof ElDropdown>>()
const scrollLeft = ref(0)
const scrollOffset = ref(50)
const rightClickData = ref<RightClickData>({} as RightClickData)

const breadcrumbList = computed(() => {
  return route.path
    .split('/')
    .slice(1)
    .map((path) => {
      return permissionStore.routeMap[path]
    })
})

function handleClickDarkSwitch({ clientX, clientY }: PointerEvent) {
  const maxRadius = Math.hypot(
    Math.max(clientX, window.innerWidth - clientX),
    Math.max(clientY, window.innerHeight - clientY)
  )
  setCssVar('--v3-theme-x', `${clientX}px`)
  setCssVar('--v3-theme-y', `${clientY}px`)
  setCssVar('--v3-theme-r', `${maxRadius}px`)

  const handler = () => {
    appStore.themeCfg.darkMode = !appStore.themeCfg.darkMode
  }

  if (document.startViewTransition) {
    document.startViewTransition(handler)
  } else {
    handler()
  }
}

function handleRightClick(tab: ITab, { clientX, clientY }: MouseEvent) {
  rightClickData.value = {
    clientX: `${clientX}px`,
    clientY: `${clientY}px`,
    tab
  }
  nextTick(() => {
    dropdownRef.value?.handleOpen()
  })
}
</script>

<template>
  <g-flex class="header" dir="column">
    <g-flex justify="space-between" align="center">
      <g-flex align="center">
        <el-icon
          class="cursor-pointer"
          :size="20"
          @click="appStore.siderCollapsed = !appStore.siderCollapsed"
        >
          <Expand v-if="appStore.siderCollapsed" />
          <Fold v-else />
        </el-icon>
        <el-breadcrumb class="ml-10px" :separator-icon="ArrowRight">
          <el-breadcrumb-item
            v-for="item in breadcrumbList"
            :key="item.jumpPath"
            :to="{ path: item.jumpPath }"
          >
            {{ item.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </g-flex>
      <g-flex align="center">
        <el-switch
          class="dark-switch"
          :model-value="!appStore.themeCfg.darkMode"
          :active-action-icon="Sunny"
          :inactive-action-icon="Moon"
          @click="handleClickDarkSwitch"
        />
      </g-flex>
    </g-flex>
    <g-flex class="-my-10px" align="center">
      <el-button text @click="scrollbarRef?.setScrollLeft(scrollLeft - scrollOffset)">
        <el-icon>
          <ArrowLeft />
        </el-icon>
      </el-button>
      <el-scrollbar
        ref="scrollbarRef"
        class="mx-5px w-full py-10px h-auto!"
        @scroll="({ scrollLeft: val }) => (scrollLeft = val)"
      >
        <g-flex align="center">
          <el-tag
            v-for="tab in appStore.tabs"
            :key="tab.path"
            class="mr-5px cursor-pointer select-none"
            :effect="tab.path === route.path ? 'dark' : 'light'"
            :color="tab.path === route.path ? '' : 'transparent'"
            closable
            disable-transitions
            @click="appStore.openTab(tab)"
            @close="appStore.closeTab(tab)"
            @click.right.prevent="handleRightClick(tab, $event)"
          >
            {{ tab.title }}
          </el-tag>
        </g-flex>
      </el-scrollbar>
      <el-button text @click="scrollbarRef?.setScrollLeft(scrollLeft + scrollOffset)">
        <el-icon>
          <ArrowRight />
        </el-icon>
      </el-button>
    </g-flex>
  </g-flex>
  <el-dropdown
    v-if="rightClickData.clientX"
    ref="dropdownRef"
    class="fixed!"
    :style="{
      left: rightClickData.clientX,
      top: rightClickData.clientY
    }"
    trigger="contextmenu"
  >
    <g-flex></g-flex>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="appStore.closeRightTabs(rightClickData.tab)">
          关闭右侧</el-dropdown-item
        >
        <el-dropdown-item @click="appStore.closeOtherTabs(rightClickData.tab)">
          关闭其他</el-dropdown-item
        >
        <el-dropdown-item @click="appStore.closeAllTabs()">关闭所有</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="scss" scoped>
.header {
  padding: 10px;
  border-bottom: 1px solid var(--el-border-color);
}
</style>

<style lang="scss">
::view-transition-old(root) {
  mix-blend-mode: normal;
  animation: none;
}

::view-transition-new(root) {
  mix-blend-mode: normal;
  animation: 0.5s ease-in clip-animation;
}

@keyframes clip-animation {
  from {
    clip-path: circle(0 at var(--v3-theme-x) var(--v3-theme-y));
  }

  to {
    clip-path: circle(var(--v3-theme-r) at var(--v3-theme-x) var(--v3-theme-y));
  }
}
</style>
