<script setup lang="ts">
import { computed } from 'vue'

import Header from './header.vue'
import { useAppStore } from '@/store/modules/appStore'
import Sider, { SIDE_WIDTH, SIDE_COLLAPSED_WIDTH } from './sider/sider.vue'

const appStore = useAppStore()

const translateX = computed(() => {
  if (!appStore.isMobile) {
    return 0
  }
  return appStore.siderCollapsed ? -SIDE_COLLAPSED_WIDTH : 0
})

const marginLeft = computed(() => {
  if (appStore.isMobile) {
    return 0
  }
  return appStore.siderCollapsed ? SIDE_COLLAPSED_WIDTH : SIDE_WIDTH
})
</script>

<template>
  <g-flex class="relative wh-full">
    <g-flex class="right-area wh-full" :style="{ 'margin-left': `${marginLeft}px` }" dir="column">
      <Header />
      <el-scrollbar height="100%">
        <RouterView />
      </el-scrollbar>
    </g-flex>
    <div
      v-if="appStore.isMobile && !appStore.siderCollapsed"
      class="sider-shader"
      :style="{ opacity: appStore.siderCollapsed ? 0 : 1 }"
      @click="appStore.siderCollapsed = true"
    ></div>
    <Sider class="sider" :style="{ transform: `translateX(${translateX}px)` }" />
  </g-flex>
</template>

<style lang="scss" scoped>
.right-area {
  transition: margin-left 0.3s ease-in-out;
}

.sider-shader {
  position: absolute;
  z-index: mixin.$z-index-low;
  width: 100%;
  height: 100%;
  background-color: var(--el-overlay-color-lighter);
  transition: opacity 0.3s ease-in-out;
}

.sider {
  position: absolute;
  z-index: mixin.$z-index-low;
  transition: transform 0.3s ease-in-out;
}
</style>
