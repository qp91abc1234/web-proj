<script setup lang="ts">
import { zhCn } from 'element-plus/es/locales.mjs'
import { useResponseImage } from '@/components/responsive-image/use-response-image'
const { setupResponseImage } = useResponseImage()

setupResponseImage(
  import.meta.env.DEV
    ? undefined
    : {
        cdnBase: 'https://md-pic-lib.oss-cn-hangzhou.aliyuncs.com',
        formats: ['avif', 'webp'],
        retinas: [1, 2],
        getImageUrl(src, format, scale) {
          return `${src}?x-oss-process=image/format,${format}/resize,p_${Math.round(scale * 100)}`
        }
      }
)
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

::-webkit-scrollbar {
  display: none;
}
</style>
