<script setup lang="ts">
import { zhCn } from 'element-plus/es/locales.mjs'
import { useResponseImage } from '@/components/responsive-image/use-response-image'

const { setupResponseImage } = useResponseImage()

setupResponseImage({
  disabled: !!import.meta.env.DEV,
  formats: ['avif', 'webp'],
  retinas: [1, 2, 3],
  getImageUrl: (src: string, format: string, scale: number) => {
    return `${src}?x-oss-process=image/format,${format}/resize,p_${Math.round(scale * 100)}`
  }
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <RouterView></RouterView>
  </el-config-provider>
</template>

<style lang="scss">
#app {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: var(--el-bg-color);
}
</style>
