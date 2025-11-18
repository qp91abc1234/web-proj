<script setup lang="ts">
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import type { RouteRecordRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    data: RouteRecordRaw
  }>(),
  {
    data: {} as any
  }
)
</script>

<template>
  <el-sub-menu
    v-if="props.data.children && props.data.meta?.visible !== false"
    :index="props.data.meta?.title || ''"
  >
    <template #title>
      <component
        v-if="props.data.meta?.icon"
        :is="ElementPlusIconsVue[props.data.meta?.icon]"
        class="icon"
      ></component>
      <span>{{ props.data.meta?.title || '' }}</span>
    </template>
    <template v-for="child in props.data.children" :key="child.path">
      <subMenu v-if="child.children" :data="child"></subMenu>
      <el-menu-item v-else-if="child.meta?.visible !== false" :index="child.path">
        <template #title>
          <span>{{ child.meta?.title || '' }}</span>
        </template>
      </el-menu-item>
    </template>
  </el-sub-menu>
  <el-menu-item v-else-if="props.data.meta?.visible !== false" :index="props.data.path">
    <component
      v-if="props.data.meta?.icon"
      :is="ElementPlusIconsVue[props.data.meta?.icon]"
      class="icon"
    ></component>
    <template #title>
      <span>{{ props.data.meta?.title || '' }}</span>
    </template>
  </el-menu-item>
</template>

<style lang="scss" scoped>
.icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-right: 5px;
}
</style>
