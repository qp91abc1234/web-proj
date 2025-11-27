<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'

import Header from './header.vue'
import { useAppStore } from '@/store/modules/appStore'
import Sider, { SIDE_WIDTH, SIDE_COLLAPSED_WIDTH } from './sider/sider.vue'

const appStore = useAppStore()
const route = useRoute()
const scrollbarRef = ref()

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

// 监听路由变化，更新滚动条状态
watch(
  () => route.path,
  () => {
    nextTick(() => {
      scrollbarRef.value?.update()
      scrollbarRef.value?.setScrollTop(0)
    })
  }
)
</script>

<template>
  <g-flex class="relative wh-full">
    <g-flex class="right-area wh-full" :style="{ 'margin-left': `${marginLeft}px` }" dir="column">
      <Header />
      <el-scrollbar ref="scrollbarRef" class="content-scrollbar" height="100%">
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

.content-scrollbar {
  // stylelint-disable-next-line
  :deep(.el-scrollbar__view) {
    height: 100%;
  }
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
